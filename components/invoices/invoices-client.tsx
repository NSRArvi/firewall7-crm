"use client";

import React, { useState } from "react";
import { CrmShell } from "@/components/layout/crm-shell";
import {
  useInvoices,
  useUpdateInvoiceStatus,
  useDeleteInvoice,
  type Invoice,
  type InvoiceStatus,
} from "@/hooks/use-invoices";
import { usePermissions } from "@/hooks/use-permissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { CreateInvoiceDialog } from "./create-invoice-dialog";
import { RecordPaymentDialog } from "./record-payment-dialog";
import { downloadInvoicePdf } from "@/lib/invoice-pdf";
import { DollarSign, FileDown, Plus, Search, Trash2 } from "lucide-react";

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: "All", value: "all" },
  { label: "Unpaid", value: "unpaid" },
  { label: "Partially Paid", value: "partially_paid" },
  { label: "Paid", value: "paid" },
  { label: "Overdue", value: "overdue" },
  { label: "Cancelled", value: "cancelled" },
];

export function InvoicesClient() {
  const { can } = usePermissions();
  const canCreate = can("invoices", "create");
  const canEdit = can("invoices", "edit");
  const canDelete = can("invoices", "delete");

  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState<Invoice | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Invoice | null>(null);

  const { data: invoices = [], isLoading, error } = useInvoices(statusFilter);
  const updateStatus = useUpdateInvoiceStatus();
  const deleteInvoice = useDeleteInvoice();

  const today = new Date().toISOString().slice(0, 10);

  const filtered = invoices.filter((inv) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      inv.invoice_number.toLowerCase().includes(q) ||
      (inv.client?.company_name ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <CrmShell>
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Invoices & Payments
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Generate client invoices, track payments, monitor overdue balances, and export PDFs.
            </p>
          </div>
          {canCreate && (
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4" />
              <span>New Invoice</span>
            </Button>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3.5 py-1.5 rounded text-xs font-medium transition-all cursor-pointer ${
                  statusFilter === f.value
                    ? "bg-[#f97316] text-white shadow-sm shadow-orange-500/25"
                    : "liquid-glass-pill text-slate-700 dark:text-slate-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search invoices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>
        </div>

        <div className="liquid-glass rounded p-5">
          {isLoading ? (
            <p className="text-sm text-slate-500 py-8 text-center">
              Loading invoices...
            </p>
          ) : error ? (
            <p className="text-sm text-red-500 py-8 text-center">
              Could not load invoices. Make sure you ran{" "}
              <code className="font-mono">0009_invoices_payments_rls.sql</code>.
            </p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">
              No invoices found.
            </p>
          ) : (
            <div className="space-y-3">
              {filtered.map((inv) => {
                const isPastDue =
                  inv.due_date < today &&
                  inv.status !== "paid" &&
                  inv.status !== "cancelled";
                const balance = Math.max(
                  0,
                  Number(inv.total) - Number(inv.amount_paid)
                );

                return (
                  <div
                    key={inv.id}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded bg-white/50 dark:bg-slate-800/40 border border-white/40 dark:border-white/10"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-sm text-slate-900 dark:text-white">
                          {inv.invoice_number}
                        </p>
                        <span className="text-xs text-slate-500">
                          · {inv.client?.company_name ?? "Client"}
                        </span>
                        {inv.status === "partially_paid" && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                            Paid ${Number(inv.amount_paid).toLocaleString()} of $
                            {Number(inv.total).toLocaleString()}
                          </span>
                        )}
                        {isPastDue && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-500/15 text-red-600">
                            Overdue
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Total:{" "}
                        <span className="font-semibold text-slate-900 dark:text-white">
                          ${Number(inv.total).toLocaleString()}
                        </span>{" "}
                        · Paid: ${Number(inv.amount_paid).toLocaleString()} · Due:{" "}
                        <span className="font-semibold text-[#f97316]">
                          ${balance.toLocaleString()}
                        </span>{" "}
                        · Due {inv.due_date}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {canEdit ? (
                        <Select
                          value={inv.status}
                          onValueChange={(val) =>
                            updateStatus.mutate({
                              id: inv.id,
                              status: val as InvoiceStatus,
                            })
                          }
                        >
                          <SelectTrigger className="w-[135px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_FILTERS.filter((s) => s.value !== "all").map(
                              (s) => (
                                <SelectItem key={s.value} value={s.value}>
                                  {s.label}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="px-3 py-1 rounded text-xs font-semibold bg-[#f97316]/15 text-[#f97316] capitalize">
                          {inv.status.replace("_", " ")}
                        </span>
                      )}

                      {canEdit && inv.status !== "paid" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPaymentTarget(inv)}
                        >
                          <DollarSign className="h-3.5 w-3.5" />
                          <span>Payment</span>
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadInvoicePdf(inv)}
                      >
                        <FileDown className="h-3.5 w-3.5" />
                        <span>PDF</span>
                      </Button>

                      {canDelete && (
                        <button
                          onClick={() => setDeleteTarget(inv)}
                          className="p-1.5 rounded text-red-500 hover:bg-red-500/10 cursor-pointer"
                          aria-label="Delete invoice"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <CreateInvoiceDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
      />

      <RecordPaymentDialog
        invoice={paymentTarget}
        onClose={() => setPaymentTarget(null)}
      />

      <ConfirmDeleteModal
        open={Boolean(deleteTarget)}
        title="Delete Invoice"
        description={`Are you sure you want to delete "${deleteTarget?.invoice_number ?? ""}"?`}
        isPending={deleteInvoice.isPending}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteInvoice.mutateAsync(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </CrmShell>
  );
}
