import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, url } = await req.json();

    if (!text && !url) {
      return new Response(
        JSON.stringify({ error: 'Either text or url is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get LOVABLE_API_KEY from environment
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Analyze content using Lovable AI
    const systemPrompt = `You are a fake news detection AI. Analyze the given news content and determine if it's REAL, FAKE, or UNCERTAIN.
    
Respond with a JSON object containing:
- verdict: "REAL" | "FAKE" | "UNCERTAIN"
- confidence: A number between 0 and 100
- keyPhrases: Array of strings highlighting important phrases that influenced your decision
- reasoning: Brief explanation of your analysis

Consider factors like:
- Source credibility
- Writing style and tone
- Verifiable facts
- Logical consistency
- Emotional manipulation
- Sensationalism`;

    const userPrompt = url 
      ? `Analyze this news URL for credibility: ${url}\n\nNote: Fetch and analyze the content from this URL.`
      : `Analyze this news text for credibility:\n\n${text}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
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

    const aiData = await response.json();
    const aiResult = JSON.parse(aiData.choices[0].message.content);

    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    // Save analysis to database
    const { error: insertError } = await supabase
      .from('analyses')
      .insert({
        user_id: user.id,
        input_text: text || null,
        input_url: url || null,
        result: aiResult.verdict,
        confidence: aiResult.confidence,
        key_phrases: aiResult.keyPhrases || [],
      });

    if (insertError) {
      console.error('Error saving analysis:', insertError);
    }

    return new Response(
      JSON.stringify({
        verdict: aiResult.verdict,
        confidence: aiResult.confidence,
        keyPhrases: aiResult.keyPhrases || [],
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-news function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});