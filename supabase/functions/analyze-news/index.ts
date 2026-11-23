import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { GatewayError, generateChatCompletion } from 'npm:@lovable.dev/ai-gateway@0.1.13';
import { isTimeSensitiveNews, normalizeNewsAnalysis, type SourceReference } from './analysis.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are a careful, evidence-first misinformation analyst. Classify a news claim as REAL, FAKE, or UNCERTAIN.

Use the built-in Google Search tool for claims that need current information. Your general knowledge may be outdated. Never invent citations, source names, URLs, quotes, dates, or reports.

RULES
1. Judge factual claims, not style. Tone, grammar, capitalization, and clickbait wording are weak signals only and must never decide a FAKE verdict.
2. For recent, time-sensitive, niche, or changeable claims, search current reporting. A death report or other current event cannot be called false merely because older knowledge says the person was alive.
3. Mark a current claim as corroborated only when at least two independent, reputable publishers report the same central fact and their publication dates support the timing. Distinct URLs on one publisher are not independent sources.
4. Return 2-6 direct article citations in the sources field, each with the exact article title, direct URL, and publication date (ISO date when known). Use only URLs actually returned by search; never make up a plausible URL. If search gives no usable articles, return an empty sources array and searchAssessment set to "insufficient".
5. Never claim a source says something unless its search result supports it. For conflicting, stale, thin, or unclear search evidence, use UNCERTAIN and explain the gap.
6. Keep confidence calibrated: 85-95 only for established facts or clear contradictions; current-event results require corroboration; UNCERTAIN confidence must not exceed 70.

Return ONLY a JSON object with exactly these keys:
{
  "verdict": "REAL" | "FAKE" | "UNCERTAIN",
  "confidence": number,
  "summary": string,
  "reasons": [{ "title": string, "detail": string, "impact": "supports_real" | "supports_fake" | "unclear" }],
  "claims": [{ "claim": string, "status": "credible" | "suspicious" | "misleading" | "unverifiable", "note": string }],
  "evidence": { "verifiedFacts": string[], "assumptions": string[], "limitations": string },
  "keyPhrases": string[],
  "styleSignals": string[],
  "finalVerdict": string,
  "searchAssessment": "corroborated" | "conflicting" | "insufficient",
  "sources": [{ "title": string, "url": string, "publishedAt": string | null }]
}
No markdown or extra text.`;

async function fetchArticle(url: string): Promise<string | null> {
  let current = isPublicArticleUrl(url);
  if (!current) return null;

  try {
    for (let redirects = 0; redirects <= 4; redirects += 1) {
      const response = await fetch(current.toString(), {
        redirect: 'manual',
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AuthenX/1.0)', 'Range': 'bytes=0-511999' },
        signal: AbortSignal.timeout(12000),
      });
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        await response.body?.cancel();
        if (!location) return null;
        current = isPublicArticleUrl(new URL(location, current).toString());
        if (!current) return null;
        continue;
      }
      if (!response.ok || !response.headers.get('content-type')?.toLowerCase().includes('text/html')) {
        await response.body?.cancel();
        return null;
      }
      const html = await readHtmlSnippet(response);
      const text = html
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      return text.slice(0, 12000) || null;
    }
    return null;
  } catch {
    return null;
  }
}

function errorResponse(message: string, status = 500) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function isPublicArticleUrl(value: string): URL | null {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, '');
    if (url.protocol !== 'https:' || (url.port && url.port !== '443')) return null;
    if (!hostname || hostname === 'localhost' || hostname.endsWith('.local') || hostname.endsWith('.internal')) return null;
    if (/^(127\.|10\.|192\.168\.|169\.254\.|0\.)/.test(hostname)) return null;
    const private172 = /^172\.(\d+)\./.exec(hostname);
    if (private172 && Number(private172[1]) >= 16 && Number(private172[1]) <= 31) return null;
    if (hostname.includes(':') || /^\d+(\.\d+){3}$/.test(hostname)) return null;
    return url;
  } catch {
    return null;
  }
}

async function readHtmlSnippet(response: Response): Promise<string> {
  if (!response.body) return '';
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let output = '';
  let bytesRead = 0;
  while (bytesRead < 512_000) {
    const { value, done } = await reader.read();
    if (done || !value) break;
    const remaining = 512_000 - bytesRead;
    const chunk = value.subarray(0, remaining);
    bytesRead += chunk.byteLength;
    output += decoder.decode(chunk, { stream: true });
    if (chunk.byteLength < value.byteLength) break;
  }
  await reader.cancel().catch(() => undefined);
  return output;
}

function sourceTitleMatches(articleTitle: string, pageTitle: string): boolean {
  const ignored = new Set(['about', 'after', 'amid', 'from', 'have', 'into', 'more', 'over', 'says', 'that', 'this', 'with', 'what', 'when', 'where', 'which', 'while', 'will', 'your']);
  const tokens = (value: string) => new Set(value.toLowerCase().match(/[a-z0-9]{3,}/g)?.filter((word) => !ignored.has(word)) ?? []);
  const expected = tokens(articleTitle);
  const actual = tokens(pageTitle);
  if (expected.size < 3 || actual.size < 3) return false;
  const overlap = [...expected].filter((word) => actual.has(word)).length;
  return overlap / Math.min(expected.size, actual.size) >= 0.55;
}

async function verifyArticleLink(source: SourceReference): Promise<SourceReference | null> {
  let current = isPublicArticleUrl(source.url);
  if (!current) return null;

  try {
    for (let redirects = 0; redirects <= 4; redirects += 1) {
      const response = await fetch(current.toString(), {
        method: 'GET',
        redirect: 'manual',
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AuthenX-NewsVerifier/1.0)', 'Range': 'bytes=0-511999' },
        signal: AbortSignal.timeout(6000),
      });
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        await response.body?.cancel();
        if (!location) return null;
        current = isPublicArticleUrl(new URL(location, current).toString());
        if (!current) return null;
        continue;
      }
      if (!response.ok || !response.headers.get('content-type')?.toLowerCase().includes('text/html')) {
        await response.body?.cancel();
        return null;
      }

      const html = await readHtmlSnippet(response);
      const titleMatch = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
      const title = titleMatch?.[1]
        ?.replace(/&amp;/gi, '&').replace(/&#39;|&apos;/gi, "'").replace(/&quot;/gi, '"').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      if (!title || title.length < 8 || !sourceTitleMatches(source.title, title)) return null;

      const publishedMatch = /<meta[^>]+(?:property|name)=["'](?:article:published_time|datePublished|pubdate|publishdate)["'][^>]+content=["']([^"']+)["']/i.exec(html)
        ?? /<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:article:published_time|datePublished|pubdate|publishdate)["']/i.exec(html)
        ?? /"datePublished"\s*:\s*"([^"]+)"/i.exec(html)
        ?? /<time[^>]+datetime=["']([^"']+)["']/i.exec(html);
      const publishedAt = publishedMatch?.[1] ?? source.publishedAt;
      if (source.publishedAt && publishedAt) {
        const sourceDay = new Date(source.publishedAt).toISOString().slice(0, 10);
        const pageDay = new Date(publishedAt).toISOString().slice(0, 10);
        if (sourceDay !== pageDay) return null;
      }

      return { ...source, url: current.toString(), title, publishedAt: publishedAt ?? null };
    }
  } catch {
    return null;
  }

  return null;
}

async function verifyArticleLinks(value: unknown): Promise<SourceReference[]> {
  if (!Array.isArray(value)) return [];
  const candidates = value.slice(0, 8).flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const source = item as Record<string, unknown>;
    if (typeof source.url !== 'string' || typeof source.title !== 'string') return [];
    return [{ title: source.title, url: source.url, publishedAt: typeof source.publishedAt === 'string' ? source.publishedAt : null }];
  });
  const verified = await Promise.all(candidates.map(verifyArticleLink));
  return verified.filter((source): source is SourceReference => source !== null);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return errorResponse('Method not allowed', 405);

  try {
    const body = await req.json();
    const text = typeof body?.text === 'string' ? body.text.trim().slice(0, 20000) : '';
    const url = typeof body?.url === 'string' ? body.url.trim() : '';

    if (!text && !url) return errorResponse('Either text or url is required', 400);
    if (url) {
      try {
        const parsed = new URL(url);
        if (!isPublicArticleUrl(parsed.toString())) return errorResponse('Please provide a public HTTPS article URL', 400);
      } catch {
        return errorResponse('Please provide a valid article URL', 400);
      }
    }

    let sourceNote = '';
    let content = text;
    if (url) {
      const fetched = await fetchArticle(url);
      if (fetched) {
        sourceNote = `The user supplied this article URL (${url}); its text is included below. Reading this single page is not independent confirmation of the claims.`;
        content = `${fetched}${content ? `\n\nUser-provided context:\n${content}` : ''}`;
      } else {
        sourceNote = `The page at ${url} could not be fetched. You have not seen its content; do not guess what it says.`;
      }
    }

    const timeSensitive = isTimeSensitiveNews(`${content}\n${url}`);
    const userPrompt = `${sourceNote ? `${sourceNote}\n\n` : ''}${timeSensitive
      ? 'TIME-SENSITIVE CLAIM SAFETY: Search current reporting before judging this claim. Never call it false because it conflicts with older knowledge. If fewer than two independent, recent article results support the same conclusion, return UNCERTAIN, use confidence 45 or lower, and explain what could not be confirmed.\n\n'
      : ''}Assess the factual credibility of this news content.\n\n---\n${content || '(no readable article content available)'}\n---`;

    const response = await generateChatCompletion({
      model: 'google/gemini-3.5-flash',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      tools: [{ type: 'google_search' }],
      response_format: { type: 'json_object' },
    });

    const messageContent = response.choices[0]?.message.content;
    if (!messageContent) return errorResponse('The analysis service returned an empty result. Please try again.', 502);

    let ai: unknown;
    try {
      ai = JSON.parse(messageContent);
    } catch {
      return errorResponse('Could not read the analysis result. Please try again.', 502);
    }

    const verifiedSources = await verifyArticleLinks(ai && typeof ai === 'object' ? (ai as Record<string, unknown>).sources : undefined);
    const normalizedAi = ai && typeof ai === 'object'
      ? { ...(ai as Record<string, unknown>), sources: verifiedSources }
      : { sources: [] };
    const result = normalizeNewsAnalysis(normalizedAi, `${content}\n${url}`);

    // Save only a user-scoped summary; the raw article is never sent to the client as a citation.
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
        { auth: { autoRefreshToken: false, persistSession: false } },
      );
      const token = authHeader.replace(/^Bearer\s+/i, '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        const { error: insertError } = await supabase.from('analyses').insert({
          user_id: user.id,
          input_text: text || null,
          input_url: url || null,
          result: result.verdict,
          confidence: result.confidence,
          key_phrases: result.keyPhrases,
        });
        if (insertError) console.error('Error saving analysis:', insertError);
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-news function:', error);
    if (error instanceof GatewayError) {
      if (error.httpStatus === 429) return errorResponse('The analysis service is busy. Please wait a moment before trying again.', 429);
      if (error.httpStatus === 402) return errorResponse('AI credits are unavailable right now. Please contact the site owner.', 402);
      if (error.httpStatus === 401 || error.httpStatus === 403) return errorResponse('The analysis service is not configured correctly. Please contact the site owner.', 502);
      return errorResponse('The analysis service could not complete this request. Please try again later.', 502);
    }
    return errorResponse('We could not analyze this content right now. Please try again later.');
  }
});