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
import { useClients } from "@/hooks/use-clients";
import { useQuotations } from "@/hooks/use-quotations";
import { useCreateInvoice } from "@/hooks/use-invoices";

interface CreateInvoiceDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateInvoiceDialog({ open, onClose }: CreateInvoiceDialogProps) {
  const { data: clients = [] } = useClients();
  const { data: quotations = [] } = useQuotations();
  const createInvoice = useCreateInvoice();

  const [clientId, setClientId] = useState("");
  const [quotationId, setQuotationId] = useState("none");
  const [subtotal, setSubtotal] = useState("0");
  const [taxRate, setTaxRate] = useState("10");
  const [discount, setDiscount] = useState("0");
  const [dueDate, setDueDate] = useState("");

  const subNum = Number(subtotal) || 0;
  const taxNum = Number(taxRate) || 0;
  const discNum = Number(discount) || 0;
  const grandTotal = Math.max(0, subNum + subNum * (taxNum / 100) - discNum);

  const handleQuotationSelect = (val: string) => {
    setQuotationId(val);
    if (val === "none") return;
    const q = quotations.find((item) => item.id === val);
    if (q) {
      setClientId(q.client_id);
      setSubtotal(String(q.subtotal));
      setTaxRate(String(q.tax_rate));
      setDiscount(String(q.discount_amount));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !dueDate) return;

    await createInvoice.mutateAsync({
      client_id: clientId,
      quotation_id: quotationId === "none" ? null : quotationId,
      subtotal: subNum,
      tax_rate: taxNum,
      discount_amount: discNum,
      due_date: dueDate,
    });

    setClientId("");
    setQuotationId("none");
    setSubtotal("0");
    setTaxRate("10");
    setDiscount("0");
    setDueDate("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-lg space-y-4">
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          {quotations.length > 0 && (
            <div className="space-y-1">
              <Label>Import from Quotation (optional)</Label>
              <Select value={quotationId} onValueChange={handleQuotationSelect}>
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue placeholder="Select Quotation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Manual Invoice)</SelectItem>
                  {quotations.map((q) => (
                    <SelectItem key={q.id} value={q.id}>
                      {q.quote_number} — {q.client?.company_name ?? "Client"} ($
                      {Number(q.total).toLocaleString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Client *</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue placeholder="Select Client *" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Due Date *</Label>
              <DatePicker
                value={dueDate}
                onChange={setDueDate}
                placeholder="Pick due date"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label>Subtotal ($) *</Label>
              <Input
                required
                type="number"
                min={0}
                step="0.01"
                value={subtotal}
                onChange={(e) => setSubtotal(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Tax (%)</Label>
              <Input
                type="number"
                min={0}
                step="0.1"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Discount ($)</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="text-sm font-semibold">
              Total:{" "}
              <span className="text-[#f97316]">
                ${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!clientId || !dueDate || createInvoice.isPending}
              >
                {createInvoice.isPending ? "Saving..." : "Create Invoice"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
