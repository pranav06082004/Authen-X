import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are a careful digital-image forensics analyst for AuthenX. Your job is to judge whether an uploaded IMAGE shows signs of digital manipulation (doctoring, splicing, cloning, generated/AI content or heavy retouching) or looks AUTHENTIC, or is UNCERTAIN.

CORE RULES
1. Judge only what is visible in the image itself. Look for: lighting and shadow direction/colour mismatches, perspective and scale inconsistencies between elements, cloning/repeating texture patterns, warped or smudged edges around subjects, unnatural skin or object surfaces, inconsistent noise/grain or compression artefacts between regions, mismatched depth-of-field, text or logos that look pasted, and anything that looks AI-generated.
2. Absence of forensic artefacts is NOT proof of authenticity — sophisticated edits and AI-generated images can leave no visible trace. Be calibrated, not confident.
3. The file metadata summary (if any) was extracted programmatically by AuthenX from the actual file. Treat it as ground truth. Its absence is a WEAK signal only: social networks, messengers and screenshots routinely strip all metadata. Never treat "no metadata" alone as evidence of manipulation.
4. You have NO live web access. Never invent sources, reverse-image-search results, or fact-check findings. If you cannot tell, say UNCERTAIN.
5. Most ordinary, natural photos without visible anomalies deserve AUTHENTIC only with moderate confidence, and anything ambiguous deserves UNCERTAIN.

CONFIDENCE CALIBRATION (0-100)
- 85-95: only when anomalies are clear, multiple and mutually reinforcing (e.g. obvious splicing seams plus inconsistent shadows).
- 65-84: several notable indicators, but no independent verification.
- 40-64: mixed or weak signals -> normally UNCERTAIN.
- 0-39: almost no basis to judge -> UNCERTAIN.
Never exceed 95. Never exceed 80 for judgments you cannot independently verify.

OUTPUT
Return ONLY a JSON object with exactly these keys:
{
  "verdict": "AUTHENTIC" | "LIKELY_MANIPULATED" | "UNCERTAIN",
  "confidence": number,
  "summary": string,               // 1-2 plain sentences a non-expert understands
  "findings": [                    // 2-4 items
    { "title": string, "detail": string, "impact": "supports_authentic" | "supports_manipulated" | "unclear" }
  ],
  "metadataObservations": string[], // what the file metadata does or does not tell us, honestly; may be empty
  "limitations": string,           // what you could not check and why
  "finalVerdict": string           // short, direct, simple-language conclusion for a normal user
}
No markdown, no extra text.`;

// ---------- Minimal EXIF extraction (ground truth for the model) ----------

function parseTiff(t: Uint8Array): Record<string, string> | null {
  if (t.length < 8) return null;
  const le = t[0] === 0x49 && t[1] === 0x49;
  const be = t[0] === 0x4d && t[1] === 0x4d;
  if (!le && !be) return null;
  const rd16 = (o: number) => (le ? t[o] | (t[o + 1] << 8) : (t[o] << 8) | t[o + 1]);
  const rd32 = (o: number) =>
    le
      ? (t[o] | (t[o + 1] << 8) | (t[o + 2] << 16) | (t[o + 3] << 24)) >>> 0
      : ((t[o] << 24) | (t[o + 1] << 16) | (t[o + 2] << 8) | t[o + 3]) >>> 0;
  const out: Record<string, string> = {};
  const sizes: Record<number, number> = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1, 9: 4, 10: 8 };

  const readIfd = (start: number, depth: number) => {
    if (depth > 2 || start + 2 > t.length) return;
    const count = rd16(start);
    let exifIfd = -1, gpsIfd = -1;
    for (let i = 0; i < count && i < 512; i++) {
      const e = start + 2 + i * 12;
      if (e + 12 > t.length) return;
      const tag = rd16(e), type = rd16(e + 2), n = rd32(e + 4);
      const size = (sizes[type] ?? 1) * n;
      const valOff = size <= 4 ? e + 8 : rd32(e + 8);
      const ascii = () => {
        let s = '';
        for (let j = 0; j < n - 1 && valOff + j < t.length; j++) {
          const c = t[valOff + j];
          if (c >= 32 && c < 127) s += String.fromCharCode(c);
        }
        return s;
      };
      switch (tag) {
        case 0x010f: out.make = ascii(); break;
        case 0x0110: out.model = ascii(); break;
        case 0x0131: out.software = ascii(); break;
        case 0x0132: out.modified = ascii(); break;
        case 0x9003: out.original = ascii(); break;
        case 0x8769: exifIfd = rd32(e + 8); break;
        case 0x8825: gpsIfd = rd32(e + 8); break;
      }
    }
    if (exifIfd > 0) readIfd(exifIfd, depth + 1);
    if (gpsIfd > 0) out.gps = 'present';
  };

  const ifd0 = rd32(4);
  readIfd(ifd0, 0);
  return Object.keys(out).length ? out : null;
}

function parseJpegExif(bytes: Uint8Array): Record<string, string> | null {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  let offset = 2;
  while (offset < bytes.length - 4) {
    if (bytes[offset] !== 0xff) break;
    const marker = bytes[offset + 1];
    if (marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) { offset += 2; continue; }
    if (marker === 0xda) break; // start of scan data
    const size = (bytes[offset + 2] << 8) | bytes[offset + 3];
    if (size < 2) break;
    if (marker === 0xe1) {
      const seg = bytes.subarray(offset + 4, Math.min(offset + 2 + size, bytes.length));
      if (seg.length > 6 && seg[0] === 0x45 && seg[1] === 0x78 && seg[2] === 0x69 && seg[3] === 0x66 && seg[4] === 0 && seg[5] === 0) {
        const exif = parseTiff(seg.subarray(6));
        if (exif) return exif;
      }
    }
    offset += 2 + size;
  }
  return null;
}

function parsePngMetadata(bytes: Uint8Array): Record<string, string> | null {
  const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  for (let i = 0; i < 8; i++) if (bytes[i] !== sig[i]) return null;
  const out: Record<string, string> = {};
  const dec = new TextDecoder();
  let offset = 8;
  while (offset + 8 <= bytes.length) {
    const len = ((bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3]) >>> 0;
    const type = dec.decode(bytes.subarray(offset + 4, offset + 8));
    if (len > 50_000_000) break;
    const data = bytes.subarray(offset + 8, Math.min(offset + 8 + len, bytes.length));
    if (type === 'tEXt' || type === 'iTXt') {
      const text = dec.decode(data);
      const eq = text.indexOf('\0');
      if (eq > 0) out[text.slice(0, eq).toLowerCase()] = text.slice(eq + 1).replace(/\0/g, ' ').slice(0, 200);
    }
    if (type === 'IEND') break;
    offset += 12 + len;
  }
  return Object.keys(out).length ? out : null;
}

function summarizeMetadata(meta: Record<string, string> | null, mime: string): string {
  if (!meta) {
    return `No ${mime === 'image/png' ? 'PNG text chunks or' : ''} EXIF metadata could be read from the file. This is common: social platforms, messengers and screenshots strip metadata. Absence of metadata is a weak signal only and must NOT by itself push the verdict toward manipulated or authentic.`;
  }
  const parts: string[] = [];
  if (meta.software) parts.push(`Editing software tag: "${meta.software}"`);
  if (meta.make || meta.model) parts.push(`Camera: ${meta.make ?? ''} ${meta.model ?? ''}`.trim());
  if (meta.original) parts.push(`Original capture date: ${meta.original}`);
  if (meta.modified) parts.push(`Last modified date: ${meta.modified}`);
  if (meta.gps) parts.push('GPS coordinates are present in the file');
  for (const [k, v] of Object.entries(meta)) {
    if (!['software', 'make', 'model', 'modified', 'original', 'gps'].includes(k) && v && v.length < 100) {
      parts.push(`${k}: ${v}`);
    }
  }
  return parts.length
    ? `Metadata extracted from the file (ground truth): ${parts.join('; ')}.`
    : 'The file carries metadata but no camera or software tags were found. Treat neutrally.';
}

// ---------- Image fetching ----------

async function fetchImage(url: string): Promise<{ bytes: Uint8Array; mime: string } | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AuthenX/1.0)' },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const mime = res.headers.get('content-type')?.split(';')[0] || '';
    const buf = new Uint8Array(await res.arrayBuffer());
    if (buf.length === 0) return null;
    return { bytes: buf, mime: mime.startsWith('image/') ? mime : 'image/jpeg' };
  } catch (_e) {
    return null;
  }
}

function clampConfidence(verdict: string, raw: unknown): number {
  let c = typeof raw === 'number' && isFinite(raw) ? raw : 50;
  c = Math.max(0, Math.min(95, Math.round(c)));
  if (verdict === 'UNCERTAIN') c = Math.min(c, 70);
  return c;
}

// ---------- SSE consumption of /v1/responses ----------

async function readResponsesStream(res: Response): Promise<string> {
  const reader = res.body?.getReader();
  if (!reader) throw new Error('Empty response from AI gateway');
  const decoder = new TextDecoder();
  let buffer = '';
  let text = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === '[DONE]') continue;
      try {
        const evt = JSON.parse(payload);
        if (evt.type === 'response.output_text.delta' && typeof evt.delta === 'string') {
          text += evt.delta;
        } else if (evt.type === 'response.completed' && evt.response) {
          const out = evt.response.output;
          if (Array.isArray(out)) {
            const msg = out.find((o: any) => o.type === 'message');
            const content = msg?.content;
            if (Array.isArray(content)) {
              const joined = content.map((c: any) => c.text ?? '').join('');
              if (joined.trim()) text = joined;
            }
          }
        }
      } catch (_e) { /* ignore malformed SSE lines */ }
    }
  }
  return text;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, context } = await req.json();

    if (!imageUrl || !String(imageUrl).trim() || !/^https?:\/\//i.test(String(imageUrl))) {
      return new Response(
        JSON.stringify({ error: 'A valid image URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const image = await fetchImage(String(imageUrl));
    if (!image) {
      return new Response(
        JSON.stringify({ error: 'Could not read the uploaded image. Please re-upload and try again.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Ground-truth metadata extraction (real forensics signal, not model guesswork)
    const meta =
      image.mime === 'image/png' ? parsePngMetadata(image.bytes) ?? parseJpegExif(image.bytes) : parseJpegExif(image.bytes);
    const metadataSummary = summarizeMetadata(meta, image.mime);

    const userPrompt = `${context && String(context).trim() ? `Context provided by the user about this image:\n${String(context).trim()}\n\n` : ''}Analyse this image for signs of digital manipulation or AI generation.\n\nFile metadata summary:\n${metadataSummary}\n\nFile type: ${image.mime}, size: ${Math.round(image.bytes.length / 1024)} KB.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Lovable-AIG-SDK': 'fetch',
      },
      body: JSON.stringify({
        model: 'openai/gpt-6-astra',
        stream: true,
        store: false,
        reasoning: { effort: 'medium', summary: 'auto' },
        text: {
          format: {
            type: 'json_schema',
            name: 'image_forensics_result',
            strict: true,
            schema: {
              type: 'object',
              additionalProperties: false,
              required: ['verdict', 'confidence', 'summary', 'findings', 'metadataObservations', 'limitations', 'finalVerdict'],
              properties: {
                verdict: { type: 'string', enum: ['AUTHENTIC', 'LIKELY_MANIPULATED', 'UNCERTAIN'] },
                confidence: { type: 'number' },
                summary: { type: 'string' },
                findings: {
                  type: 'array',
                  items: {
                    type: 'object',
                    additionalProperties: false,
                    required: ['title', 'detail', 'impact'],
                    properties: {
                      title: { type: 'string' },
                      detail: { type: 'string' },
                      impact: { type: 'string', enum: ['supports_authentic', 'supports_manipulated', 'unclear'] },
                    },
                  },
                },
                metadataObservations: { type: 'array', items: { type: 'string' } },
                limitations: { type: 'string' },
                finalVerdict: { type: 'string' },
              },
            },
          },
        },
        input: [
          {
            role: 'user',
            content: [
              { type: 'input_text', text: userPrompt },
              { type: 'input_image', image_url: String(imageUrl) },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error('AI gateway error', response.status, body);
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add more credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const text = await readResponsesStream(response);
    let ai: any;
    try {
      ai = JSON.parse(text);
    } catch (_e) {
      throw new Error('Could not read the analysis result. Please try again.');
    }

    const verdict = ['AUTHENTIC', 'LIKELY_MANIPULATED', 'UNCERTAIN'].includes(ai.verdict) ? ai.verdict : 'UNCERTAIN';
    const result = {
      kind: 'media' as const,
      verdict,
      confidence: clampConfidence(verdict, ai.confidence),
      summary: typeof ai.summary === 'string' ? ai.summary : '',
      findings: Array.isArray(ai.findings) ? ai.findings.slice(0, 4) : [],
      metadataObservations: Array.isArray(ai.metadataObservations) ? ai.metadataObservations.slice(0, 6) : [],
      limitations: typeof ai.limitations === 'string'
        ? ai.limitations
        : 'This analysis is based only on the image pixels and file metadata. No reverse image search or external source was consulted.',
      finalVerdict: typeof ai.finalVerdict === 'string' ? ai.finalVerdict : '',
      hasMetadata: !!meta,
    };

    // Persist for the signed-in user (best effort)
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
        { auth: { autoRefreshToken: false, persistSession: false } }
      );
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        const { error: insertError } = await supabase.from('analyses').insert({
          user_id: user.id,
          input_text: context ? String(context).trim() || null : null,
          input_url: String(imageUrl),
          result: result.verdict,
          confidence: result.confidence,
          key_phrases: result.findings.map((f: any) => f.title).filter(Boolean).slice(0, 4),
        });
        if (insertError) console.error('Error saving analysis:', insertError);
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-media function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
