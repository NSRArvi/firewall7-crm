"use client";

import React, { useState } from "react";
import { CrmShell } from "@/components/layout/crm-shell";
import {
  useQuotations,
  useUpdateQuotationStatus,
  useDeleteQuotation,
  type Quotation,
  type QuotationStatus,
} from "@/hooks/use-quotations";
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
import { CreateQuotationDialog } from "./create-quotation-dialog";
import { ViewQuotationDialog } from "./view-quotation-dialog";
import { downloadQuotationPdf } from "@/lib/quotation-pdf";
import { Eye, FileDown, Mail, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useSendQuotationEmail } from "@/hooks/use-quotations";

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Sent", value: "sent" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "Expired", value: "expired" },
];

export function QuotationsClient() {
  const { can } = usePermissions();
  const canCreate = can("quotations", "create");
  const canEdit = can("quotations", "edit");
  const canDelete = can("quotations", "delete");

  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(
    null
  );
  const [viewingQuotation, setViewingQuotation] = useState<Quotation | null>(
    null
  );
  const [deleteTarget, setDeleteTarget] = useState<Quotation | null>(null);

  const { data: quotations = [], isLoading, error } = useQuotations(statusFilter);
  const updateStatus = useUpdateQuotationStatus();
  const deleteQuotation = useDeleteQuotation();
  const sendEmail = useSendQuotationEmail();

  const filtered = quotations.filter((q) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      q.quote_number.toLowerCase().includes(term) ||
      (q.client?.company_name ?? "").toLowerCase().includes(term)
    );
  });

  return (
    <CrmShell>
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Quotations
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Prepare client proposals, configure pricing, and export PDFs.
            </p>
          </div>
          {canCreate && (
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4" />
              <span>New Quotation</span>
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
              placeholder="Search quotations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>
        </div>

        <div className="liquid-glass rounded p-5">
          {isLoading ? (
            <p className="text-sm text-slate-500 py-8 text-center">
              Loading quotations...
            </p>
          ) : error ? (
            <p className="text-sm text-red-500 py-8 text-center">
              Could not load quotations. Make sure you ran{" "}
              <code className="font-mono">0008_quotations_rls.sql</code>.
            </p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">
              No quotations found.
            </p>
          ) : (
            <div className="space-y-3">
              {filtered.map((q) => (
                <div
                  key={q.id}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded bg-white/50 dark:bg-slate-800/40 border border-white/40 dark:border-white/10"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-slate-900 dark:text-white">
                        {q.quote_number}
                      </p>
                      <span className="text-xs text-slate-500">
                        · {q.client?.company_name ?? "Client"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Total:{" "}
                      <span className="font-semibold text-slate-900 dark:text-white">
                        ${Number(q.total).toLocaleString()}
                      </span>
                      {q.valid_until ? ` · Valid until ${q.valid_until}` : ""}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {canEdit ? (
                      <Select
                        value={q.status}
                        onValueChange={(val) =>
                          updateStatus.mutate({
                            id: q.id,
                            status: val as QuotationStatus,
                          })
                        }
                      >
                        <SelectTrigger className="w-[125px]">
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
                        {q.status}
                      </span>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewingQuotation(q)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>View</span>
                    </Button>

                    {canEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingQuotation(q);
                          setShowCreate(true);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </Button>
                    )}

                    {canEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={sendEmail.isPending}
                        onClick={() => sendEmail.mutate(q.id)}
                      >
                        <Mail className="h-3.5 w-3.5" />
                        <span>Email</span>
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadQuotationPdf(q)}
                    >
                      <FileDown className="h-3.5 w-3.5" />
                      <span>PDF</span>
                    </Button>

                    {canDelete && (
                      <button
                        onClick={() => setDeleteTarget(q)}
                        className="p-1.5 rounded text-red-500 hover:bg-red-500/10 cursor-pointer"
                        aria-label="Delete quotation"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateQuotationDialog
        open={showCreate}
        quotation={editingQuotation}
        onClose={() => {
          setShowCreate(false);
          setEditingQuotation(null);
        }}
      />

      <ViewQuotationDialog
        quotation={viewingQuotation}
        canEdit={canEdit}
        onClose={() => setViewingQuotation(null)}
      />

      <ConfirmDeleteModal
        open={Boolean(deleteTarget)}
        title="Delete Quotation"
        description={`Are you sure you want to delete "${deleteTarget?.quote_number ?? ""}"?`}
        isPending={deleteQuotation.isPending}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteQuotation.mutateAsync(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </CrmShell>
  );
}
