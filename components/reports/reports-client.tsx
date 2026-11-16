"use client";

import React, { useState } from "react";
import { CrmShell } from "@/components/layout/crm-shell";
import { useActivityLogs, useReportsSummary } from "@/hooks/use-reports";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  UserCheck,
  DollarSign,
  AlertCircle,
  FolderKanban,
  FileDown,
  Search,
} from "lucide-react";

export function ReportsClient() {
  const { data: summary, isLoading: summaryLoading } = useReportsSummary();
  const { data: logs = [], isLoading: logsLoading } = useActivityLogs();
  const [logSearch, setLogSearch] = useState("");

  const filteredLogs = logs.filter((l) => {
    if (!logSearch.trim()) return true;
    const q = logSearch.toLowerCase();
    return (
      l.action.toLowerCase().includes(q) ||
      l.entity_type.toLowerCase().includes(q) ||
      (l.actor?.full_name ?? "").toLowerCase().includes(q)
    );
  });

  const exportCsv = () => {
    if (!summary) return;
    const rows = [
      ["Metric", "Value"],
      ["Total Leads", String(summary.totalLeads)],
      ["Won Leads", String(summary.wonLeads)],
      ["Lead Conversion Rate", `${summary.conversionRate}%`],
      ["Total Clients", String(summary.totalClients)],
      ["Revenue Collected", `$${summary.totalRevenue.toFixed(2)}`],
      ["Outstanding Balance", `$${summary.totalOutstanding.toFixed(2)}`],
      ["Total Projects", String(summary.totalProjects)],
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `firewall7-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <CrmShell>
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Reports & Activity Logs
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Business performance across leads, clients, revenue, projects, and system activity.
            </p>
          </div>
          <Button variant="outline" onClick={exportCsv} disabled={!summary}>
            <FileDown className="h-4 w-4" />
            <span>Export CSV</span>
          </Button>
        </div>

        {/* KPI Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            {
              label: "Total Leads",
              value: summaryLoading ? "—" : String(summary?.totalLeads ?? 0),
              sub: `${summary?.conversionRate ?? 0}% conversion`,
              icon: Users,
            },
            {
              label: "Total Clients",
              value: summaryLoading ? "—" : String(summary?.totalClients ?? 0),
              sub: "Registered accounts",
              icon: UserCheck,
            },
            {
              label: "Revenue Collected",
              value: summaryLoading
                ? "—"
                : `$${(summary?.totalRevenue ?? 0).toLocaleString()}`,
              sub: "Recorded payments",
              icon: DollarSign,
            },
            {
              label: "Outstanding",
              value: summaryLoading
                ? "—"
                : `$${(summary?.totalOutstanding ?? 0).toLocaleString()}`,
              sub: `${summary?.outstandingInvoices.length ?? 0} unpaid invoices`,
              icon: AlertCircle,
              alert: true,
            },
            {
              label: "Total Projects",
              value: summaryLoading ? "—" : String(summary?.totalProjects ?? 0),
              sub: "All statuses",
              icon: FolderKanban,
            },
          ].map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div
                key={kpi.label}
                className="liquid-glass rounded p-4 flex flex-col justify-between gap-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {kpi.label}
                  </span>
                  <div
                    className={`p-2 rounded ${
                      kpi.alert
                        ? "bg-red-500/10 text-red-600"
                        : "bg-[#f97316]/10 text-[#f97316]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {kpi.value}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{kpi.sub}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Breakdown Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="liquid-glass rounded p-5 space-y-3">
            <h2 className="font-semibold text-sm text-slate-900 dark:text-white">
              Leads by Pipeline Stage
            </h2>
            <div className="space-y-2 text-xs">
              {Object.entries(summary?.leadsByStatus ?? {}).length === 0 ? (
                <p className="text-slate-500">No lead data yet.</p>
              ) : (
                Object.entries(summary?.leadsByStatus ?? {}).map(
                  ([status, count]) => (
                    <div
                      key={status}
                      className="flex justify-between p-2.5 rounded bg-white/50 dark:bg-slate-800/40"
                    >
                      <span className="capitalize font-medium">
                        {status.replace("_", " ")}
                      </span>
                      <span className="font-bold text-[#f97316]">{count}</span>
                    </div>
                  )
                )
              )}
            </div>
          </div>

          <div className="liquid-glass rounded p-5 space-y-3">
            <h2 className="font-semibold text-sm text-slate-900 dark:text-white">
              Projects by Status
            </h2>
            <div className="space-y-2 text-xs">
              {Object.entries(summary?.projectsByStatus ?? {}).length === 0 ? (
                <p className="text-slate-500">No project data yet.</p>
              ) : (
                Object.entries(summary?.projectsByStatus ?? {}).map(
                  ([status, count]) => (
                    <div
                      key={status}
                      className="flex justify-between p-2.5 rounded bg-white/50 dark:bg-slate-800/40"
                    >
                      <span className="capitalize font-medium">
                        {status.replace("_", " ")}
                      </span>
                      <span className="font-bold text-[#f97316]">{count}</span>
                    </div>
                  )
                )
              )}
            </div>
          </div>
        </div>

        {/* Activity Logs */}
        <div className="liquid-glass rounded p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="font-semibold text-sm text-slate-900 dark:text-white">
              Administrative Activity Logs
            </h2>
            <div className="relative w-full sm:w-64">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search logs..."
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
          </div>

          {logsLoading ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              Loading activity logs...
            </p>
          ) : filteredLogs.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              No activity logs recorded yet.
            </p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto text-xs">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-3 rounded bg-white/50 dark:bg-slate-800/40"
                >
                  <div>
                    <span className="font-semibold text-[#f97316]">
                      {log.actor?.full_name ?? "System"}
                    </span>{" "}
                    <span>{log.action}</span>{" "}
                    <span className="text-slate-500">({log.entity_type})</span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </CrmShell>
  );
}
