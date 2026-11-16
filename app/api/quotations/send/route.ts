import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { quotationId } = await request.json();
    if (!quotationId) {
      return NextResponse.json(
        { error: "quotationId is required" },
        { status: 400 }
      );
    }

    const { data: q, error: fetchError } = await supabase
      .from("quotations")
      .select(
        "*, client:clients(company_name, contact_name, email), items:quotation_items(*)"
      )
      .eq("id", quotationId)
      .single();

    if (fetchError || !q) {
      return NextResponse.json(
        { error: "Quotation not found" },
        { status: 404 }
      );
    }

    const clientEmail = q.client?.email;
    if (!clientEmail) {
      return NextResponse.json(
        { error: "Client email address is missing" },
        { status: 400 }
      );
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      return NextResponse.json(
        {
          error:
            "Email service not configured. Add RESEND_API_KEY (and optional EMAIL_FROM) to .env.local.",
        },
        { status: 400 }
      );
    }

    const fromAddress =
      process.env.EMAIL_FROM || "Firewall 7 <onboarding@resend.dev>";

    const itemRows = (q.items ?? [])
      .map(
        (item: {
          description: string;
          quantity: number;
          unit_price: number;
          total: number;
        }) =>
          `<tr>
            <td style="padding:8px;border-bottom:1px solid #e2e8f0;">${item.description}</td>
            <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;">${item.quantity}</td>
            <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;">$${Number(item.unit_price).toFixed(2)}</td>
            <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;">$${Number(item.total).toFixed(2)}</td>
          </tr>`
      )
      .join("");

    const html = `
      <div style="font-family:system-ui,sans-serif;max-width:640px;margin:0 auto;color:#0f172a;">
        <h2 style="color:#f97316;">Firewall 7 — Quotation ${q.quote_number}</h2>
        <p>Dear ${q.client?.contact_name ?? "Client"},</p>
        <p>Please find your quotation details below:</p>
        <table style="width:100%;border-collapse:collapse;font-size:13px;margin:16px 0;">
          <thead>
            <tr style="background:#f8fafc;">
              <th style="text-align:left;padding:8px;border-bottom:1px solid #cbd5e1;">Description</th>
              <th style="text-align:right;padding:8px;border-bottom:1px solid #cbd5e1;">Qty</th>
              <th style="text-align:right;padding:8px;border-bottom:1px solid #cbd5e1;">Unit Price</th>
              <th style="text-align:right;padding:8px;border-bottom:1px solid #cbd5e1;">Total</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>
        <p style="font-size:15px;font-weight:700;text-align:right;">Total: $${Number(q.total).toFixed(2)}</p>
        ${q.valid_until ? `<p style="font-size:12px;color:#64748b;">Valid until: ${q.valid_until}</p>` : ""}
        ${q.notes ? `<p style="font-size:12px;color:#475569;">Notes: ${q.notes}</p>` : ""}
      </div>
    `;

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [clientEmail],
        subject: `Quotation ${q.quote_number} from Firewall 7`,
        html,
      }),
    });

    if (!emailRes.ok) {
      const errBody = await emailRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: errBody.message || "Failed to send email via Resend" },
        { status: 500 }
      );
    }

    if (q.status === "draft") {
      await supabase
        .from("quotations")
        .update({ status: "sent", updated_at: new Date().toISOString() })
        .eq("id", q.id);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Invalid request payload";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
