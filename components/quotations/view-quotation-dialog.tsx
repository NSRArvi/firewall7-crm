"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  useSendQuotationEmail,
  type Quotation,
} from "@/hooks/use-quotations";
import { downloadQuotationPdf } from "@/lib/quotation-pdf";
import { FileDown, Mail } from "lucide-react";

interface ViewQuotationDialogProps {
  quotation: Quotation | null;
  canEdit: boolean;
  onClose: () => void;
}

export function ViewQuotationDialog({
  quotation,
  canEdit,
  onClose,
}: ViewQuotationDialogProps) {
  const sendEmail = useSendQuotationEmail();

  if (!quotation) return null;

  const taxAmount =
    Number(quotation.subtotal) * (Number(quotation.tax_rate) / 100);

  return (
    <Dialog open={Boolean(quotation)} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto space-y-4">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2 pr-6">
            <DialogTitle>{quotation.quote_number}</DialogTitle>
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-[#f97316]/15 text-[#f97316] capitalize">
              {quotation.status}
            </span>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs p-3 rounded bg-slate-50 dark:bg-slate-800/60">
          <div>
            <p className="text-slate-500">Client</p>
            <p className="font-semibold mt-0.5">
              {quotation.client?.company_name ?? "—"}
            </p>
            <p className="text-slate-500">{quotation.client?.email ?? ""}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-slate-500">Valid Until</p>
            <p className="font-semibold mt-0.5">
              {quotation.valid_until || "—"}
            </p>
          </div>
        </div>

        <div className="rounded border border-slate-200 dark:border-slate-800 overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300">
              <tr>
                <th className="text-left px-3 py-2 font-semibold">Description</th>
                <th className="text-right px-3 py-2 font-semibold">Qty</th>
                <th className="text-right px-3 py-2 font-semibold">Price</th>
                <th className="text-right px-3 py-2 font-semibold">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {(quotation.items ?? []).map((item, idx) => (
                <tr key={item.id ?? idx}>
                  <td className="px-3 py-2">{item.description}</td>
                  <td className="px-3 py-2 text-right">{item.quantity}</td>
                  <td className="px-3 py-2 text-right">
                    ${Number(item.unit_price).toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-right font-medium">
                    ${Number(item.total).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-1 text-xs ml-auto max-w-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Subtotal</span>
            <span>${Number(quotation.subtotal).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">
              Tax ({Number(quotation.tax_rate)}%)
            </span>
            <span>${taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Discount</span>
            <span>-${Number(quotation.discount_amount).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold pt-1.5 border-t border-slate-200 dark:border-slate-800">
            <span>Total</span>
            <span className="text-[#f97316]">
              ${Number(quotation.total).toFixed(2)}
            </span>
          </div>
        </div>

        {quotation.notes && (
          <div className="text-xs text-slate-500 p-3 rounded bg-slate-50 dark:bg-slate-800/60">
            <span className="font-semibold">Notes:</span> {quotation.notes}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => downloadQuotationPdf(quotation)}
          >
            <FileDown className="h-3.5 w-3.5" />
            <span>Download PDF</span>
          </Button>
          {canEdit && (
            <Button
              type="button"
              size="sm"
              disabled={sendEmail.isPending}
              onClick={async () => {
                await sendEmail.mutateAsync(quotation.id);
                onClose();
              }}
            >
              <Mail className="h-3.5 w-3.5" />
              <span>
                {sendEmail.isPending ? "Sending..." : "Send Email"}
              </span>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
