"use client";

import React, { useState } from "react";
import { CrmShell } from "@/components/layout/crm-shell";
import {
  useLeads,
  useUpdateLead,
  useDeleteLead,
  type Lead,
  type LeadStatus,
} from "@/hooks/use-leads";
import { usePermissions } from "@/hooks/use-permissions";
import { useQuery } from "@tanstack/react-query";
import {
  Plus,
  Calendar,
  Building2,
  Mail,
  Trash2,
  Search,
  User,
} from "lucide-react";
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
import { LeadDetailDialog } from "./lead-detail-dialog";
import { CreateLeadDialog } from "./create-lead-dialog";

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: "All", value: "all" },
  { label: "New", value: "new" },
  { label: "Contacted", value: "contacted" },
  { label: "Proposal Sent", value: "proposal_sent" },
  { label: "Won", value: "won" },
  { label: "Lost", value: "lost" },
];

export function LeadsClient() {
  const { can } = usePermissions();
  const canCreate = can("leads", "create");
  const canEdit = can("leads", "edit");
  const canDelete = can("leads", "delete");

  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null);

  const { data: leads = [], isLoading, error } = useLeads(statusFilter);
  const selectedLead = leads.find((l) => l.id === selectedLeadId) ?? null;
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();

  const { data: teamMembers = [] } = useQuery<{ id: string; full_name: string }[]>({
    queryKey: ["team-basic"],
    queryFn: async () => {
      const res = await fetch("/api/team");
      if (!res.ok) return [];
      const json = await res.json();
      return json.members ?? [];
    },
  });

  const filteredLeads = leads.filter((l) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      l.full_name.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      (l.company_name ?? "").toLowerCase().includes(q) ||
      (l.topic ?? "").toLowerCase().includes(q)
    );
  });


  return (
    <CrmShell>
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Leads & Enquiries
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage website consultation bookings, manual leads, and follow-ups.
            </p>
          </div>
          {canCreate && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4" />
              <span>New Lead</span>
            </Button>
          )}
        </div>

        {/* Filters & Search */}
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
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>
        </div>

        {/* Leads List */}
        <div className="liquid-glass rounded p-5">
          {isLoading ? (
            <p className="text-sm text-slate-500 py-8 text-center">
              Loading leads...
            </p>
          ) : error ? (
            <div className="text-sm text-red-500 py-8 text-center">
              Could not load leads. Make sure you ran{" "}
              <code className="font-mono">0001_initial_schema.sql</code> in Supabase.
            </div>
          ) : filteredLeads.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">
              No leads found.
            </p>
          ) : (
            <div className="space-y-3">
              {filteredLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded bg-white/50 dark:bg-slate-800/40 border border-white/40 dark:border-white/10"
                >
                  <div
                    onClick={() => setSelectedLeadId(lead.id)}
                    className="space-y-1 cursor-pointer flex-1"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-sm text-slate-900 dark:text-white hover:text-[#f97316] transition-colors">
                        {lead.full_name}
                      </p>
                      {lead.job_title && (
                        <span className="text-xs text-slate-500">
                          · {lead.job_title}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-500/10 text-slate-600 dark:text-slate-300 capitalize">
                        {lead.source.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" />
                        {lead.email}
                      </span>
                      {lead.company_name && (
                        <span className="inline-flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5" />
                          {lead.company_name}
                        </span>
                      )}
                      {lead.consultation_date && (
                        <span className="inline-flex items-center gap-1 text-[#f97316] font-medium">
                          <Calendar className="h-3.5 w-3.5" />
                          {lead.consultation_date} {lead.consultation_slot ?? ""}
                        </span>
                      )}
                      {lead.assignee?.full_name && (
                        <span className="inline-flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          {lead.assignee.full_name}
                        </span>
                      )}
                    </div>
                    {lead.topic && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 pt-1">
                        Topic: {lead.topic}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {canEdit ? (
                      <Select
                        value={lead.status}
                        onValueChange={(val) =>
                          updateLead.mutate({
                            id: lead.id,
                            status: val as LeadStatus,
                          })
                        }
                      >
                        <SelectTrigger className="w-[140px]">
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
                        {lead.status.replace("_", " ")}
                      </span>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedLeadId(lead.id)}
                    >
                      Details
                    </Button>

                    {canDelete && (
                      <button
                        onClick={() => setDeleteTarget(lead)}
                        className="p-1.5 rounded text-red-500 hover:bg-red-500/10 cursor-pointer"
                        aria-label="Delete lead"
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

      {/* Create Lead Modal */}
      <CreateLeadDialog
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {/* Lead Detail & Activities Modal */}
      <LeadDetailDialog
        lead={selectedLead}
        teamMembers={teamMembers}
        canEdit={canEdit}
        onClose={() => setSelectedLeadId(null)}
      />

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        open={Boolean(deleteTarget)}
        title="Delete Lead"
        description={`Are you sure you want to delete "${deleteTarget?.full_name ?? ""}"? All associated activity logs will also be removed.`}
        isPending={deleteLead.isPending}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteLead.mutateAsync(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </CrmShell>
  );
}
