"use client";

import React, { useState } from "react";
import { CrmShell } from "@/components/layout/crm-shell";
import {
  useLeads,
  useCreateLead,
  useUpdateLeadStatus,
  type LeadStatus,
} from "@/hooks/use-leads";
import { Plus, Calendar, Building2, Mail, X } from "lucide-react";

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: "All", value: "all" },
  { label: "New", value: "new" },
  { label: "Contacted", value: "contacted" },
  { label: "Qualified", value: "qualified" },
  { label: "Proposal Sent", value: "proposal_sent" },
  { label: "Won", value: "won" },
  { label: "Lost", value: "lost" },
];

export default function LeadsPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    company_name: "",
    job_title: "",
    topic: "",
  });

  const { data: leads = [], isLoading, error } = useLeads(statusFilter);
  const createLead = useCreateLead();
  const updateStatus = useUpdateLeadStatus();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.email) return;
    await createLead.mutateAsync({
      full_name: form.full_name,
      email: form.email,
      company_name: form.company_name || null,
      job_title: form.job_title || null,
      phone: null,
      topic: form.topic || null,
      notes: null,
      consultation_date: null,
      consultation_slot: null,
      timezone: null,
    });
    setForm({ full_name: "", email: "", company_name: "", job_title: "", topic: "" });
    setShowModal(false);
  };

  return (
    <CrmShell>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Leads & Enquiries
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage website consultation bookings and manual sales leads.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded bg-[#f97316] hover:bg-[#ea580c] text-white text-sm font-medium shadow-md shadow-orange-500/25 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>New Lead</span>
          </button>
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                statusFilter === f.value
                  ? "bg-[#f97316] text-white shadow-sm shadow-orange-500/25"
                  : "liquid-glass-pill text-slate-700 dark:text-slate-200"
              }`}
            >
              {f.label}
            </button>
          ))}
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
          ) : leads.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">
              No leads found for this filter.
            </p>
          ) : (
            <div className="space-y-3">
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded bg-white/50 dark:bg-slate-800/40 border border-white/40 dark:border-white/10"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-slate-900 dark:text-white">
                        {lead.full_name}
                      </p>
                      {lead.job_title && (
                        <span className="text-xs text-slate-500">
                          · {lead.job_title}
                        </span>
                      )}
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
                    </div>
                    {lead.topic && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 pt-1">
                        Topic: {lead.topic}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={lead.status}
                      onChange={(e) =>
                        updateStatus.mutate({
                          id: lead.id,
                          status: e.target.value as LeadStatus,
                        })
                      }
                      className="px-3 py-1.5 rounded bg-white/70 dark:bg-slate-900/60 border border-white/40 dark:border-white/10 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#f97316]/50"
                    >
                      {STATUS_FILTERS.filter((s) => s.value !== "all").map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Lead Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="liquid-glass rounded p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg text-slate-900 dark:text-white">
                Add New Lead
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded hover:bg-white/40"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <input
                required
                placeholder="Full Name *"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded bg-white/60 dark:bg-slate-800/60 border border-white/40 text-sm"
              />
              <input
                required
                type="email"
                placeholder="Email *"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded bg-white/60 dark:bg-slate-800/60 border border-white/40 text-sm"
              />
              <input
                placeholder="Company Name"
                value={form.company_name}
                onChange={(e) =>
                  setForm({ ...form, company_name: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded bg-white/60 dark:bg-slate-800/60 border border-white/40 text-sm"
              />
              <input
                placeholder="Job Title"
                value={form.job_title}
                onChange={(e) => setForm({ ...form, job_title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded bg-white/60 dark:bg-slate-800/60 border border-white/40 text-sm"
              />
              <input
                placeholder="What would they like to discuss?"
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded bg-white/60 dark:bg-slate-800/60 border border-white/40 text-sm"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded text-sm font-medium liquid-glass-pill"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLead.isPending}
                  className="px-4 py-2 rounded text-sm font-medium bg-[#f97316] text-white shadow-md shadow-orange-500/25"
                >
                  {createLead.isPending ? "Saving..." : "Save Lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </CrmShell>
  );
}
