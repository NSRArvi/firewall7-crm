"use client";

import React, { useEffect, useState } from "react";
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
import {
  useCreateQuotation,
  useUpdateQuotation,
  type Quotation,
  type QuotationItem,
} from "@/hooks/use-quotations";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2 } from "lucide-react";

interface CreateQuotationDialogProps {
  open: boolean;
  quotation?: Quotation | null;
  onClose: () => void;
}

export function CreateQuotationDialog({
  open,
  quotation,
  onClose,
}: CreateQuotationDialogProps) {
  const { data: clients = [] } = useClients();
  const createQuotation = useCreateQuotation();
  const updateQuotation = useUpdateQuotation();

  const { data: services = [] } = useQuery<
    { id: string; name: string; base_price: number }[]
  >({
    queryKey: ["services-basic"],
    queryFn: async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("services")
        .select("id, name, base_price")
        .eq("is_active", true)
        .order("name");
      return data ?? [];
    },
  });

  const [clientId, setClientId] = useState("");
  const [taxRate, setTaxRate] = useState("10");
  const [discount, setDiscount] = useState("0");
  const [validUntil, setValidUntil] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<QuotationItem[]>([
    { service_id: null, description: "", quantity: 1, unit_price: 0, total: 0 },
  ]);

  useEffect(() => {
    if (quotation) {
      setClientId(quotation.client_id);
      setTaxRate(String(quotation.tax_rate));
      setDiscount(String(quotation.discount_amount));
      setValidUntil(quotation.valid_until ?? "");
      setNotes(quotation.notes ?? "");
      setItems(
        quotation.items && quotation.items.length > 0
          ? quotation.items.map((i) => ({
              service_id: i.service_id,
              description: i.description,
              quantity: i.quantity,
              unit_price: Number(i.unit_price),
              total: Number(i.total),
            }))
          : [{ service_id: null, description: "", quantity: 1, unit_price: 0, total: 0 }]
      );
    } else {
      setClientId("");
      setTaxRate("10");
      setDiscount("0");
      setValidUntil("");
      setNotes("");
      setItems([
        { service_id: null, description: "", quantity: 1, unit_price: 0, total: 0 },
      ]);
    }
  }, [quotation, open]);

  const subtotal = items.reduce(
    (sum, i) => sum + i.quantity * i.unit_price,
    0
  );
  const taxNum = Number(taxRate) || 0;
  const discountNum = Number(discount) || 0;
  const grandTotal = Math.max(
    0,
    subtotal + subtotal * (taxNum / 100) - discountNum
  );

  const updateItem = (idx: number, patch: Partial<QuotationItem>) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== idx) return item;
        const next = { ...item, ...patch };
        next.total = next.quantity * next.unit_price;
        return next;
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || items.length === 0) return;

    if (quotation) {
      await updateQuotation.mutateAsync({
        id: quotation.id,
        client_id: clientId,
        tax_rate: taxNum,
        discount_amount: discountNum,
        valid_until: validUntil || null,
        notes: notes || null,
        items,
      });
    } else {
      await createQuotation.mutateAsync({
        client_id: clientId,
        tax_rate: taxNum,
        discount_amount: discountNum,
        valid_until: validUntil || null,
        notes: notes || null,
        items,
      });
    }

    onClose();
  };

  const isPending = createQuotation.isPending || updateQuotation.isPending;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto space-y-4">
        <DialogHeader>
          <DialogTitle>
            {quotation ? `Edit ${quotation.quote_number}` : "Create Quotation"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              <Label>Valid Until</Label>
              <DatePicker
                value={validUntil}
                onChange={setValidUntil}
                placeholder="Pick expiry date"
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Line Items</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setItems((prev) => [
                    ...prev,
                    {
                      service_id: null,
                      description: "",
                      quantity: 1,
                      unit_price: 0,
                      total: 0,
                    },
                  ])
                }
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Item</span>
              </Button>
            </div>

            <div className="space-y-2">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded border border-slate-200 dark:border-slate-800 space-y-2"
                >
                  {services.length > 0 && (
                    <Select
                      value={item.service_id ?? "custom"}
                      onValueChange={(val) => {
                        if (val === "custom") {
                          updateItem(idx, { service_id: null });
                        } else {
                          const svc = services.find((s) => s.id === val);
                          if (svc) {
                            updateItem(idx, {
                              service_id: svc.id,
                              description: svc.name,
                              unit_price: Number(svc.base_price),
                            });
                          }
                        }
                      }}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Select from Service Catalog (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="custom">Custom Line Item</SelectItem>
                        {services.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name} (${Number(s.base_price).toLocaleString()})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                    <Input
                      required
                      placeholder="Description *"
                      value={item.description}
                      onChange={(e) =>
                        updateItem(idx, { description: e.target.value })
                      }
                      className="sm:col-span-6 h-9 text-xs"
                    />
                    <Input
                      required
                      type="number"
                      min={1}
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(idx, {
                          quantity: Math.max(1, Number(e.target.value)),
                        })
                      }
                      className="sm:col-span-2 h-9 text-xs"
                    />
                    <Input
                      required
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="Price"
                      value={item.unit_price}
                      onChange={(e) =>
                        updateItem(idx, {
                          unit_price: Math.max(0, Number(e.target.value)),
                        })
                      }
                      className="sm:col-span-3 h-9 text-xs"
                    />
                    <button
                      type="button"
                      disabled={items.length === 1}
                      onClick={() =>
                        setItems((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="sm:col-span-1 p-1.5 rounded text-red-500 hover:bg-red-500/10 disabled:opacity-30 cursor-pointer"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Tax Rate (%)</Label>
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

          <div className="space-y-1">
            <Label>Notes</Label>
            <Input
              placeholder="Payment terms or proposal notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
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
              <Button type="submit" disabled={!clientId || isPending}>
                {isPending ? "Saving..." : quotation ? "Save Changes" : "Save Quotation"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
