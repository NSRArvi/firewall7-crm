"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRecordPayment, type Invoice } from "@/hooks/use-invoices";

interface RecordPaymentDialogProps {
  invoice: Invoice | null;
  onClose: () => void;
}

export function RecordPaymentDialog({
  invoice,
  onClose,
}: RecordPaymentDialogProps) {
  const recordPayment = useRecordPayment();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bank_transfer");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [reference, setReference] = useState("");

  if (!invoice) return null;

  const balanceDue = Math.max(
    0,
    Number(invoice.total) - Number(invoice.amount_paid)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(amount);
    if (!num || num <= 0) return;

    await recordPayment.mutateAsync({
      invoice,
      amount: num,
      payment_method: method,
      payment_date: paymentDate,
      reference_number: reference || null,
    });

    setAmount("");
    setReference("");
    onClose();
  };

  return (
    <Dialog open={Boolean(invoice)} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-md space-y-4">
        <DialogHeader>
          <DialogTitle>Record Payment — {invoice.invoice_number}</DialogTitle>
        </DialogHeader>

        <div className="p-3 rounded bg-slate-50 dark:bg-slate-800/60 text-xs flex justify-between">
          <span>
            Total: <strong>${Number(invoice.total).toFixed(2)}</strong>
          </span>
          <span>
            Paid: <strong>${Number(invoice.amount_paid).toFixed(2)}</strong>
          </span>
          <span className="text-[#f97316]">
            Due: <strong>${balanceDue.toFixed(2)}</strong>
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Amount ($) *</Label>
              <Input
                required
                type="number"
                min={0.01}
                step="0.01"
                placeholder={balanceDue.toFixed(2)}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Payment Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Payment Date *</Label>
              <DatePicker value={paymentDate} onChange={setPaymentDate} />
            </div>
            <div className="space-y-1">
              <Label>Reference #</Label>
              <Input
                placeholder="TXN-12345"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={recordPayment.isPending}>
              {recordPayment.isPending ? "Saving..." : "Record Payment"}
            </Button>
          </div>
        </form>

        {(invoice.payments ?? []).length > 0 && (
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <p className="text-xs font-semibold">Previous Payments</p>
            <div className="space-y-1.5 max-h-36 overflow-y-auto text-xs">
              {invoice.payments?.map((p) => (
                <div
                  key={p.id}
                  className="flex justify-between p-2 rounded bg-slate-50 dark:bg-slate-800/60"
                >
                  <span>
                    {p.payment_date} · {p.payment_method.replace("_", " ")}
                  </span>
                  <span className="font-semibold">
                    ${Number(p.amount).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
