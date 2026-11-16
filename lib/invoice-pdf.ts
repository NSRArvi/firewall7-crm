import type { Invoice } from "@/hooks/use-invoices";

export function downloadInvoicePdf(inv: Invoice) {
  const win = window.open("", "_blank", "width=850,height=950");
  if (!win) return;

  const taxAmount = Number(inv.subtotal) * (Number(inv.tax_rate) / 100);
  const balanceDue = Math.max(0, Number(inv.total) - Number(inv.amount_paid));

  const paymentRows = (inv.payments ?? [])
    .map(
      (p) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;">${p.payment_date}</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-transform:capitalize;">${p.payment_method.replace("_", " ")}</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;">${p.reference_number ?? "—"}</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;">$${Number(p.amount).toFixed(2)}</td>
      </tr>
    `
    )
    .join("");

  win.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>${inv.invoice_number} - Firewall 7 Invoice</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; color: #0f172a; padding: 40px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #f97316; padding-bottom: 20px; margin-bottom: 24px; }
          .brand { font-size: 22px; font-weight: 800; }
          .brand span { color: #f97316; }
          .totals { margin-top: 20px; width: 300px; margin-left: auto; font-size: 13px; }
          .totals div { display: flex; justify-content: space-between; padding: 6px 0; }
          .grand { font-size: 16px; font-weight: 700; border-top: 2px solid #0f172a; padding-top: 8px; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
          th { background: #f8fafc; text-align: left; padding: 8px; border-bottom: 1px solid #cbd5e1; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">FIREWALL <span>7</span></div>
            <p style="font-size:12px;color:#64748b;margin:4px 0 0;">Cybersecurity & Business Solutions</p>
          </div>
          <div style="text-align:right;">
            <div style="font-size:18px;font-weight:700;">INVOICE</div>
            <div style="font-size:13px;color:#64748b;">${inv.invoice_number}</div>
            <div style="font-size:12px;color:#64748b;">Due Date: ${inv.due_date}</div>
            <div style="font-size:12px;color:#f97316;font-weight:600;text-transform:uppercase;">${inv.status.replace("_", " ")}</div>
          </div>
        </div>

        <div style="margin-bottom:24px;font-size:13px;">
          <strong>Billed To:</strong><br/>
          ${inv.client?.company_name ?? "Client"}<br/>
          ${inv.client?.contact_name ?? ""}<br/>
          ${inv.client?.email ?? ""}
          ${inv.quotation?.quote_number ? `<br/><span style="color:#64748b;">Ref Quotation: ${inv.quotation.quote_number}</span>` : ""}
        </div>

        <div class="totals">
          <div><span>Subtotal</span><span>$${Number(inv.subtotal).toFixed(2)}</span></div>
          <div><span>Tax (${Number(inv.tax_rate)}%)</span><span>$${taxAmount.toFixed(2)}</span></div>
          <div><span>Discount</span><span>-$${Number(inv.discount_amount).toFixed(2)}</span></div>
          <div class="grand"><span>Total</span><span>$${Number(inv.total).toFixed(2)}</span></div>
          <div><span>Amount Paid</span><span>$${Number(inv.amount_paid).toFixed(2)}</span></div>
          <div style="font-weight:700;color:#f97316;"><span>Balance Due</span><span>$${balanceDue.toFixed(2)}</span></div>
        </div>

        ${
          (inv.payments ?? []).length > 0
            ? `<h3 style="margin-top:32px;font-size:14px;">Payment History</h3>
               <table>
                 <thead>
                   <tr>
                     <th>Date</th>
                     <th>Method</th>
                     <th>Reference</th>
                     <th style="text-align:right;">Amount</th>
                   </tr>
                 </thead>
                 <tbody>${paymentRows}</tbody>
               </table>`
            : ""
        }

        <script>
          window.onload = () => { window.print(); };
        </script>
      </body>
    </html>
  `);
  win.document.close();
}
