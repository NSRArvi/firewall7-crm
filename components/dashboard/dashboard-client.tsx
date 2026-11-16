"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CrmShell } from "@/components/layout/crm-shell";
import { useDashboardData } from "@/hooks/use-dashboard";
import { Button } from "@/components/ui/button";
import { CreateLeadDialog } from "@/components/leads/create-lead-dialog";
import {
  Users,
  UserCheck,
  FolderKanban,
  DollarSign,
  AlertCircle,
  Calendar,
  ArrowUpRight,
  Clock,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export function DashboardClient() {
  const { data, isLoading } = useDashboardData();
  const [showNewLead, setShowNewLead] = useState(false);

  const kpis = [
    {
      label: "Total Clients",
      value: isLoading ? "—" : String(data?.totalClients ?? 0),
      change: "Registered accounts",
      icon: UserCheck,
    },
    {
      label: "New Leads",
      value: isLoading ? "—" : String(data?.newLeadsCount ?? 0),
      change: `${data?.totalLeads ?? 0} total leads`,
      icon: Users,
    },
    {
      label: "Active Projects",
      value: isLoading ? "—" : String(data?.activeProjectsCount ?? 0),
      change: `${data?.upcomingDeadlines.length ?? 0} with deadlines`,
      icon: FolderKanban,
    },
    {
      label: "Total Revenue",
      value: isLoading
        ? "—"
        : `$${(data?.totalRevenue ?? 0).toLocaleString()}`,
      change: "Recorded payments",
      icon: DollarSign,
    },
    {
      label: "Overdue Invoices",
      value: isLoading
        ? "—"
        : `$${(data?.overdueTotal ?? 0).toLocaleString()}`,
      change: `${data?.overdueCount ?? 0} invoices pending`,
      icon: AlertCircle,
      alert: (data?.overdueCount ?? 0) > 0,
    },
  ];

  return (
    <CrmShell>
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Admin Dashboard
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Real-time overview of Firewall 7 leads, clients, revenue & projects.
            </p>
          </div>
          <Button onClick={() => setShowNewLead(true)}>
            <span>+ New Lead</span>
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {kpis.map((kpi) => {
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
                  <p
                    className={`text-xs mt-1 ${
                      kpi.alert
                        ? "text-red-500 font-medium"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {kpi.change}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="liquid-glass rounded p-5 space-y-3">
            <h2 className="font-semibold text-sm text-slate-900 dark:text-white">
              Revenue Trend (Last 6 Months)
            </h2>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.revenueChart ?? []}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#f97316"
                    strokeWidth={2}
                    fill="url(#revGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="liquid-glass rounded p-5 space-y-3">
            <h2 className="font-semibold text-sm text-slate-900 dark:text-white">
              Leads Pipeline
            </h2>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.leadsChart ?? []}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Leads & Upcoming Deadlines */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 liquid-glass rounded p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#f97316]" />
                <h2 className="font-semibold text-slate-900 dark:text-white">
                  Recent Leads & Enquiries
                </h2>
              </div>
              <Link
                href="/leads"
                className="text-xs text-[#f97316] font-medium hover:underline"
              >
                View all leads →
              </Link>
            </div>

            {(data?.recentLeads ?? []).length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                No leads yet.
              </p>
            ) : (
              <div className="space-y-2.5">
                {data?.recentLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded bg-white/45 dark:bg-slate-800/40 border border-white/40 dark:border-white/10"
                  >
                    <div>
                      <p className="font-semibold text-sm text-slate-900 dark:text-white">
                        {lead.full_name}{" "}
                        {lead.company_name && (
                          <span className="font-normal text-slate-500">
                            · {lead.company_name}
                          </span>
                        )}
                      </p>
                      {lead.topic && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                          {lead.topic}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {lead.consultation_date && (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                          <Clock className="h-3.5 w-3.5" />
                          {lead.consultation_date} {lead.consultation_slot ?? ""}
                        </span>
                      )}
                      <span className="px-2.5 py-1 rounded text-[11px] font-semibold bg-[#f97316]/15 text-[#f97316] capitalize">
                        {lead.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="liquid-glass rounded p-5 space-y-4">
            <h2 className="font-semibold text-slate-900 dark:text-white">
              Upcoming Deadlines
            </h2>
            {(data?.upcomingDeadlines ?? []).length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                No upcoming project deadlines.
              </p>
            ) : (
              <div className="space-y-3">
                {data?.upcomingDeadlines.map((p) => (
                  <Link
                    key={p.id}
                    href={`/projects/${p.id}`}
                    className="block p-3 rounded bg-white/45 dark:bg-slate-800/40 border border-white/40 dark:border-white/10 hover:border-[#f97316]/40 transition-colors"
                  >
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {p.name}
                    </p>
                    <div className="flex items-center justify-between mt-1 text-xs text-slate-500">
                      <span>
                        {(p.client as { company_name?: string } | null)
                          ?.company_name ?? "Client"}
                      </span>
                      <span className="text-[#f97316] font-medium">
                        {p.deadline}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <CreateLeadDialog
        open={showNewLead}
        onClose={() => setShowNewLead(false)}
      />
    </CrmShell>
  );
}
