import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const { name, email, company, type, useCase } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
    }

    const typeLabels: Record<string, string> = {
      investor:   "Investor / VC",
      enterprise: "Enterprise buyer",
      researcher: "AI researcher",
      gamedev:    "Game developer",
      political:  "Political / polling",
      other:      "Other",
    };

    await resend.emails.send({
      from:    "Lewis Access Request <noreply@lewis.works>",
      to:      ["hi@swarmgram.com"],
      replyTo: email,
      subject: `[Lewis Access Request] ${name}${company ? ` — ${company}` : ""}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; color: #1a1a2e;">
          <h2 style="color: #6366f1; margin-bottom: 4px;">New Access Request</h2>
          <p style="color: #64748b; margin-top: 0;">Submitted via lewis.works</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #64748b; width: 120px;"><strong>Name</strong></td><td style="padding: 8px 0;">${name}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;"><strong>Email</strong></td><td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #6366f1;">${email}</a></td></tr>
            ${company ? `<tr><td style="padding: 8px 0; color: #64748b;"><strong>Company</strong></td><td style="padding: 8px 0;">${company}</td></tr>` : ""}
            <tr><td style="padding: 8px 0; color: #64748b;"><strong>Type</strong></td><td style="padding: 8px 0;">${typeLabels[type] || type || "Not specified"}</td></tr>
            ${useCase ? `<tr><td style="padding: 8px 0; color: #64748b; vertical-align: top;"><strong>Use case</strong></td><td style="padding: 8px 0;">${useCase}</td></tr>` : ""}
          </table>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
          <p style="color: #94a3b8; font-size: 12px;">Reply directly to this email to respond to ${name}.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json({ error: "Failed to send. Please email hi@swarmgram.com directly." }, { status: 500 });
  }
}
