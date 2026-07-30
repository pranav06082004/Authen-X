import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are a careful, evidence-first misinformation analyst. Your job is to judge whether a piece of news content is likely REAL, likely FAKE, or UNCERTAIN.

CORE RULES
1. Judge claims, not style. Emotional wording, capitalisation, grammar mistakes, clickbait tone or poor writing are WEAK supporting signals only. They must NEVER be the main reason for a FAKE verdict. Real reporting is often badly written; disinformation is often well written.
2. Base the verdict primarily on the verifiability, plausibility, internal consistency and specificity of the factual claims (who, what, where, when, numbers, named sources, official bodies).
3. You have NO live web access in this request. You may only use the provided text plus your own general knowledge, which has a training cutoff and may be outdated. Say this plainly. Never state that a claim was "verified" by a source you did not actually consult.
4. NEVER invent sources, URLs, quotes, statistics, fact-check articles, dates or organisations. If you have no evidence, say you have none.
5. Be calibrated, not confident. Use UNCERTAIN whenever the claims are recent, niche, unverifiable from the text, or you simply do not know. Most single pieces of text without external verification deserve UNCERTAIN.

CONFIDENCE CALIBRATION (0-100)
- 85-95: only when the content matches very well-established public knowledge, or contains claims that are impossible/contradicted by well-established facts.
- 65-84: strong indicators one way, but no independent verification.
- 40-64: mixed or weak signals -> normally UNCERTAIN.
- 0-39: almost no basis to judge -> UNCERTAIN.
Never exceed 95. Never exceed 80 for events you cannot verify from your own knowledge.

OUTPUT
Return ONLY a JSON object with exactly these keys:
{
  "verdict": "REAL" | "FAKE" | "UNCERTAIN",
  "confidence": number,
  "summary": string,              // 1-2 plain sentences a non-expert understands
  "reasons": [                    // 2-4 items
    { "title": string, "detail": string, "impact": "supports_real" | "supports_fake" | "unclear" }
  ],
  "claims": [                     // the most important factual claims found in the input, up to 5
    { "claim": string, "status": "credible" | "suspicious" | "misleading" | "unverifiable", "note": string }
  ],
  "evidence": {
    "verifiedFacts": string[],    // things you actually know to be true; empty array if none
    "assumptions": string[],      // inferences you made; be honest
    "limitations": string         // what you could not check and why
  },
  "keyPhrases": string[],         // up to 6 short phrases from the input that drove the analysis
  "styleSignals": string[],       // weak stylistic observations, explicitly secondary; may be empty
  "finalVerdict": string          // short, direct, simple-language conclusion for a normal user
}
No markdown, no extra text.`;

async function fetchArticle(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AuthenX/1.0)' },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return text.slice(0, 12000) || null;
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, url } = await req.json();

    if ((!text || !String(text).trim()) && (!url || !String(url).trim())) {
      return new Response(
        JSON.stringify({ error: 'Either text or url is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    let sourceNote = '';
    let content = String(text ?? '').trim();

    if (url) {
      const fetched = await fetchArticle(String(url));
      if (fetched) {
        sourceNote = `The following text was fetched from the URL ${url}. Treat the domain as a weak signal only.`;
        content = `${fetched}${content ? `\n\nUser-provided context:\n${content}` : ''}`;
      } else {
        sourceNote = `The page at ${url} could NOT be fetched, so you have not seen its content. Do not guess what it says. Unless the user also provided text, the correct verdict is UNCERTAIN with low confidence.`;
      }
    }

    const userPrompt = `${sourceNote ? sourceNote + '\n\n' : ''}Analyse the following news content (headline and body) for factual credibility.\n\n---\n${content || '(no readable content available)'}\n---`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
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
      const body = await response.text();
      console.error('AI gateway error', response.status, body);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    let ai: any;
    try {
      ai = JSON.parse(aiData.choices[0].message.content);
    } catch (_e) {
      throw new Error('Could not read the analysis result. Please try again.');
    }

    const verdict = ['REAL', 'FAKE', 'UNCERTAIN'].includes(ai.verdict) ? ai.verdict : 'UNCERTAIN';
    const result = {
      verdict,
      confidence: clampConfidence(verdict, ai.confidence),
      summary: typeof ai.summary === 'string' ? ai.summary : '',
      reasons: Array.isArray(ai.reasons) ? ai.reasons.slice(0, 4) : [],
      claims: Array.isArray(ai.claims) ? ai.claims.slice(0, 5) : [],
      evidence: {
        verifiedFacts: Array.isArray(ai.evidence?.verifiedFacts) ? ai.evidence.verifiedFacts : [],
        assumptions: Array.isArray(ai.evidence?.assumptions) ? ai.evidence.assumptions : [],
        limitations: typeof ai.evidence?.limitations === 'string'
          ? ai.evidence.limitations
          : 'This analysis is based only on the text provided and the model\'s general knowledge. No live sources were consulted.',
      },
      keyPhrases: Array.isArray(ai.keyPhrases) ? ai.keyPhrases.slice(0, 6) : [],
      styleSignals: Array.isArray(ai.styleSignals) ? ai.styleSignals.slice(0, 4) : [],
      finalVerdict: typeof ai.finalVerdict === 'string' ? ai.finalVerdict : '',
      liveSourcesUsed: false,
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
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
