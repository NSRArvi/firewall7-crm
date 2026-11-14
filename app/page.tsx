import type { Metadata } from "next";
import { CrmShell } from "@/components/layout/crm-shell";

export const metadata: Metadata = {
  title: "Admin Dashboard | Firewall 7 CRM",
  description:
    "Real-time overview of Firewall 7 leads, clients, revenue, projects, and upcoming deadlines.",
};
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

const kpis = [
  {
    label: "Total Clients",
    value: "48",
    change: "+4 this month",
    icon: UserCheck,
  },
  {
    label: "New Leads",
    value: "19",
    change: "6 from website",
    icon: Users,
  },
  {
    label: "Active Projects",
    value: "12",
    change: "3 due this week",
    icon: FolderKanban,
  },
  {
    label: "Monthly Revenue",
    value: "$42,850",
    change: "+14.2% vs last mo",
    icon: DollarSign,
  },
  {
    label: "Overdue Invoices",
    value: "$6,400",
    change: "2 invoices pending",
    icon: AlertCircle,
    alert: true,
  },
];

const recentEnquiries = [
  {
    name: "Noor Washe",
    company: "Apex FinTech",
    topic: "Penetration Testing & SOC Audit",
    slot: "Mon, Nov 16 · 10:00 AM",
    status: "New",
  },
  {
    name: "Elena Vance",
    company: "CloudScale AU",
    topic: "ISO 27001 Readiness",
    slot: "Tue, Nov 17 · 2:00 PM",
    status: "Qualified",
  },
  {
    name: "Marcus Chen",
    company: "MedVault Health",
    topic: "Network Firewall Hardening",
    slot: "Wed, Nov 18 · 11:00 AM",
    status: "Contacted",
  },
];

export default function DashboardPage() {
  return (
    <CrmShell>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Admin Dashboard
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Real-time overview of Firewall 7 leads, clients, revenue & projects.
            </p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded bg-[#f97316] hover:bg-[#ea580c] text-white text-sm font-medium shadow-md shadow-orange-500/25 transition-all cursor-pointer">
            <span>+ New Lead</span>
            <ArrowUpRight className="h-4 w-4" />
          </button>
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recent Website Consultation Enquiries */}
          <div className="lg:col-span-2 liquid-glass rounded p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#f97316]" />
                <h2 className="font-semibold text-slate-900 dark:text-white">
                  Recent Website Consultation Enquiries
                </h2>
              </div>
              <span className="text-xs text-[#f97316] font-medium">
                View all leads →
              </span>
            </div>

            <div className="space-y-2.5">
              {recentEnquiries.map((lead) => (
                <div
                  key={lead.name}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded bg-white/45 dark:bg-slate-800/40 border border-white/40 dark:border-white/10"
                >
                  <div>
                    <p className="font-semibold text-sm text-slate-900 dark:text-white">
                      {lead.name}{" "}
                      <span className="font-normal text-slate-500">
                        · {lead.company}
                      </span>
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      {lead.topic}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="h-3.5 w-3.5" />
                      {lead.slot}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#f97316]/15 text-[#f97316]">
                      {lead.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Tasks & Deadlines */}
          <div className="liquid-glass rounded p-5 space-y-4">
            <h2 className="font-semibold text-slate-900 dark:text-white">
              Upcoming Deadlines
            </h2>
            <div className="space-y-3">
              {[
                {
                  title: "Send ISO 27001 Quotation",
                  client: "CloudScale AU",
                  due: "Today, 5:00 PM",
                },
                {
                  title: "Complete PenTest Report",
                  client: "Apex FinTech",
                  due: "Tomorrow",
                },
                {
                  title: "Follow up Overdue Invoice #INV-104",
                  client: "MedVault Health",
                  due: "Nov 18",
                },
              ].map((task) => (
                <div
                  key={task.title}
                  className="p-3 rounded bg-white/45 dark:bg-slate-800/40 border border-white/40 dark:border-white/10"
                >
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {task.title}
                  </p>
                  <div className="flex items-center justify-between mt-1 text-xs text-slate-500">
                    <span>{task.client}</span>
                    <span className="text-[#f97316] font-medium">{task.due}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </CrmShell>
  );
}
