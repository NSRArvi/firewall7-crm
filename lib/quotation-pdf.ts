import type { Quotation } from "@/hooks/use-quotations";

export function downloadQuotationPdf(q: Quotation) {
  const win = window.open("", "_blank", "width=850,height=950");
  if (!win) return;

  const rows = (q.items ?? [])
    .map(
      (item, idx) => `
      <tr>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;">${idx + 1}</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;">${item.description}</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;">${item.quantity}</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;">$${Number(item.unit_price).toFixed(2)}</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;">$${Number(item.total).toFixed(2)}</td>
      </tr>
    `
    )
    .join("");

  const taxAmount = Number(q.subtotal) * (Number(q.tax_rate) / 100);

  win.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>${q.quote_number} - Firewall 7 Quotation</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; color: #0f172a; padding: 40px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #f97316; padding-bottom: 20px; margin-bottom: 24px; }
          .brand { font-size: 22px; font-weight: 800; }
          .brand span { color: #f97316; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
          th { background: #f8fafc; text-align: left; padding: 10px; border-bottom: 1px solid #cbd5e1; }
          .totals { margin-top: 24px; margin-left: auto; width: 280px; font-size: 13px; }
          .totals div { display: flex; justify-content: space-between; padding: 6px 0; }
          .grand { font-size: 16px; font-weight: 700; border-top: 2px solid #0f172a; padding-top: 8px; margin-top: 4px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">FIREWALL <span>7</span></div>
            <p style="font-size:12px;color:#64748b;margin:4px 0 0;">Cybersecurity & Business Solutions</p>
          </div>
          <div style="text-align:right;">
            <div style="font-size:18px;font-weight:700;">QUOTATION</div>
            <div style="font-size:13px;color:#64748b;">${q.quote_number}</div>
            <div style="font-size:12px;color:#64748b;">Date: ${new Date(q.created_at).toLocaleDateString()}</div>
            ${q.valid_until ? `<div style="font-size:12px;color:#64748b;">Valid Until: ${q.valid_until}</div>` : ""}
          </div>
        </div>

        <div style="margin-bottom:20px;font-size:13px;">
          <strong>Prepared For:</strong><br/>
          ${q.client?.company_name ?? "Client"}<br/>
          ${q.client?.contact_name ?? ""}<br/>
          ${q.client?.email ?? ""}
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Description</th>
              <th style="text-align:right;">Qty</th>
              <th style="text-align:right;">Unit Price</th>
              <th style="text-align:right;">Total</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>

        <div class="totals">
          <div><span>Subtotal</span><span>$${Number(q.subtotal).toFixed(2)}</span></div>
          <div><span>Tax (${Number(q.tax_rate)}%)</span><span>$${taxAmount.toFixed(2)}</span></div>
          <div><span>Discount</span><span>-$${Number(q.discount_amount).toFixed(2)}</span></div>
          <div class="grand"><span>Total</span><span>$${Number(q.total).toFixed(2)}</span></div>
        </div>

        ${q.notes ? `<div style="margin-top:32px;font-size:12px;color:#475569;"><strong>Notes:</strong><br/>${q.notes}</div>` : ""}

        <script>
          window.onload = () => { window.print(); };
        </script>
      </body>
    </html>
  `);
  win.document.close();
}
