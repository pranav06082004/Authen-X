import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { GatewayError, generateChatCompletion } from 'npm:@lovable.dev/ai-gateway@0.1.11';
import { isTimeSensitiveNews, normalizeNewsAnalysis } from './analysis.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are a careful, evidence-first misinformation analyst. Classify a news claim as REAL, FAKE, or UNCERTAIN.

IMPORTANT LIMITATION: You do not have live web search or access to current news in this request. Your general knowledge may be outdated. Never say or imply that you checked current sources, and never invent citations, source names, URLs, quotes, dates, or reports.

RULES
1. Judge factual claims, not style. Tone, grammar, capitalization, and clickbait wording are weak signals only and must never decide a FAKE verdict.
2. Use UNCERTAIN for recent, time-sensitive, niche, or otherwise unverified claims. In particular, do not reject a death, resignation, arrest, election, appointment, injury, or other recent event just because it conflicts with your stored knowledge.
3. A death report or other current event cannot be called false merely because older biographical information says the person was alive. State that it needs current verification.
4. Never invent evidence. Keep verifiedFacts empty unless the fact is stable and genuinely known; describe the absence of live sources in limitations.
5. Keep confidence calibrated: 85-95 only for established facts or clear contradictions in stable facts; never exceed 80 for claims not live-verified; UNCERTAIN confidence must not exceed 70.

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
  "finalVerdict": string
}
No markdown or extra text.`;

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
        if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return errorResponse('Please provide a valid article URL', 400);
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
      ? 'TIME-SENSITIVE CLAIM SAFETY: This input includes a recent or changeable event. You have no live sources. Return UNCERTAIN, use confidence 45 or lower, mark the claim unverifiable, and clearly say current independent reporting is needed. Do not call the claim false based on outdated knowledge.\n\n'
      : ''}Assess the factual credibility of this news content.\n\n---\n${content || '(no readable article content available)'}\n---`;

    const response = await generateChatCompletion({
      model: 'google/gemini-3.5-flash',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
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

    const result = normalizeNewsAnalysis(ai, `${content}\n${url}`);

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