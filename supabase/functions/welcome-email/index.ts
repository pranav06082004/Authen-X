import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  name: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name }: WelcomeEmailRequest = await req.json();

    console.log("Sending welcome email to:", email);

    const emailResponse = await resend.emails.send({
      from: "AuthenX <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to AuthenX - Start Verifying News Today!",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f5f5f5;
              }
              .container {
                background: white;
                border-radius: 12px;
                padding: 40px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
              }
              .logo {
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
                border-radius: 12px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 16px;
              }
              h1 {
                color: #1a1a1a;
                font-size: 28px;
                margin: 0 0 8px 0;
              }
              .subtitle {
                color: #666;
                font-size: 16px;
              }
              .content {
                margin: 30px 0;
              }
              .feature {
                display: flex;
                align-items: start;
                margin: 20px 0;
                padding: 16px;
                background: #f8f9fa;
                border-radius: 8px;
              }
              .feature-icon {
                width: 32px;
                height: 32px;
                background: #3b82f6;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 12px;
                flex-shrink: 0;
              }
              .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
                color: white;
                padding: 14px 32px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 600;
                margin: 20px 0;
                text-align: center;
              }
              .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e5e5e5;
                color: #666;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <h1>Welcome to AuthenX, ${name}! 🎉</h1>
                <p class="subtitle">Your journey to verified news starts here</p>
              </div>

              <div class="content">
                <p>Hi ${name},</p>
                <p>Thank you for joining AuthenX! We're excited to have you on board in the fight against misinformation.</p>

                <div class="feature">
                  <div class="feature-icon">✓</div>
                  <div>
                    <strong>AI-Powered Analysis</strong><br>
                    Our advanced algorithms analyze news content to detect fake news with high accuracy.
                  </div>
                </div>

                <div class="feature">
                  <div class="feature-icon">🛡️</div>
                  <div>
                    <strong>Real-Time Verification</strong><br>
                    Get instant results with confidence scores and detailed breakdowns.
                  </div>
                </div>

                <div class="feature">
                  <div class="feature-icon">📊</div>
                  <div>
                    <strong>Track Your History</strong><br>
                    Access all your past analyses and build your fact-checking knowledge.
                  </div>
                </div>

                <div style="text-align: center;">
                  <a href="${Deno.env.get("SUPABASE_URL")?.replace('/functions', '')}/dashboard" class="cta-button">
                    Start Analyzing News
                  </a>
                </div>

                <p style="margin-top: 30px;">
                  <strong>Quick Start Tips:</strong>
                </p>
                <ul>
                  <li>Paste news article text directly into the analyzer</li>
                  <li>Or submit a URL for automatic content extraction</li>
                  <li>Review the confidence score and key findings</li>
                  <li>Check your analysis history anytime in your dashboard</li>
                </ul>
              </div>

              <div class="footer">
                <p>Need help? Reply to this email or visit our support center.</p>
                <p>
                  <a href="#" style="color: #3b82f6; text-decoration: none;">Privacy Policy</a> •
                  <a href="#" style="color: #3b82f6; text-decoration: none;">Terms of Service</a> •
                  <a href="#" style="color: #3b82f6; text-decoration: none;">Unsubscribe</a>
                </p>
                <p style="margin-top: 20px; color: #999; font-size: 12px;">
                  © 2024 AuthenX. All rights reserved.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in welcome-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);