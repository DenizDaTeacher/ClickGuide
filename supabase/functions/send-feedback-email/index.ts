import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface FeedbackEmailRequest {
  feedbackId: string;
  tenantId: string;
  workflowName: string;
  checklistResponses: Array<{
    id: string;
    question: string;
    answer: boolean;
  }>;
  scaleResponses?: Array<{
    id: string;
    question: string;
    rating: number;
    notes?: string;
  }>;
  notes: string | null;
  overallRating: number | null;
  callDuration: number | null;
  stepsCompleted: number;
  stepsTotal: number;
  recipientEmails: string[];
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const data: FeedbackEmailRequest = await req.json();
    
    if (!data.recipientEmails || data.recipientEmails.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: "No recipients configured" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const ratingStars = data.overallRating 
      ? "⭐".repeat(data.overallRating) + "☆".repeat(5 - data.overallRating)
      : "Keine Bewertung";

    const checklistHtml = data.checklistResponses.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">
          ${item.answer ? "✅" : "❌"} ${item.question}
        </td>
      </tr>
    `).join("");

    const scaleHtml = data.scaleResponses && data.scaleResponses.length > 0
      ? data.scaleResponses.map(item => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">
            <strong>${item.question}</strong><br>
            ${"⭐".repeat(item.rating)}${"☆".repeat(5 - item.rating)}
            ${item.notes ? `<br><em style="color: #666; font-size: 12px;">${item.notes}</em>` : ""}
          </td>
        </tr>
      `).join("")
      : "";

    const durationFormatted = data.callDuration 
      ? `${Math.floor(data.callDuration / 60)}:${(data.callDuration % 60).toString().padStart(2, '0')} min`
      : "Unbekannt";

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Call Feedback Report</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #1a1a1a; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
          📞 Call Feedback Report
        </h1>
        
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 5px 0;"><strong>Workflow:</strong> ${data.workflowName}</p>
          <p style="margin: 5px 0;"><strong>Tenant:</strong> ${data.tenantId}</p>
          <p style="margin: 5px 0;"><strong>Dauer:</strong> ${durationFormatted}</p>
          <p style="margin: 5px 0;"><strong>Schritte:</strong> ${data.stepsCompleted}/${data.stepsTotal}</p>
          <p style="margin: 5px 0;"><strong>Gesamtbewertung:</strong> ${ratingStars}</p>
        </div>

        <h2 style="color: #374151;">Checkliste</h2>
        <table style="width: 100%; border-collapse: collapse;">
          ${checklistHtml}
        </table>

        ${scaleHtml ? `
          <h2 style="color: #374151; margin-top: 20px;">Selbsteinschätzung</h2>
          <table style="width: 100%; border-collapse: collapse;">
            ${scaleHtml}
          </table>
        ` : ""}

        ${data.notes ? `
          <h2 style="color: #374151; margin-top: 20px;">Notizen</h2>
          <div style="background: #fefce8; padding: 15px; border-radius: 8px; border-left: 4px solid #eab308;">
            <p style="margin: 0; white-space: pre-wrap;">${data.notes}</p>
          </div>
        ` : ""}

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">
          Automatisch generiert am ${new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" })}
        </p>
      </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Call Feedback <noreply@ccone.de>",
      to: data.recipientEmails,
      subject: `📞 Call Feedback: ${data.workflowName} - ${ratingStars}`,
      html: emailHtml,
    });

    const resendError = (emailResponse as any)?.error;
    if (resendError) {
      console.error("Resend returned error:", resendError);
      return new Response(
        JSON.stringify({
          success: false,
          error: typeof resendError === "string" ? resendError : (resendError?.message ?? "Resend error"),
        }),
        { status: 502, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    if (!emailResponse?.data?.id) {
      console.error("Resend returned no email id:", emailResponse);
      return new Response(
        JSON.stringify({ success: false, error: "Email could not be sent (no id returned)" }),
        { status: 502, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    console.log("Email sent successfully:", emailResponse);

    // Update feedback record with email_sent_at
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: updateError } = await supabase
      .from("call_feedback")
      .update({ email_sent_at: new Date().toISOString() })
      .eq("id", data.feedbackId);

    if (updateError) {
      console.error("Failed to update call_feedback.email_sent_at:", updateError);
    }

    return new Response(
      JSON.stringify({ success: true, emailId: emailResponse.data.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-feedback-email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
