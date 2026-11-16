"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface ActivityLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  actor?: { id: string; full_name: string; email: string } | null;
}

export function useReportsSummary() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["reports", "summary"],
    queryFn: async () => {
      const [leadsRes, clientsRes, invoicesRes, projectsRes] = await Promise.all([
        supabase.from("leads").select("id, status, source"),
        supabase.from("clients").select("id"),
        supabase
          .from("invoices")
          .select("id, invoice_number, status, total, amount_paid, due_date, client:clients(company_name)"),
        supabase.from("projects").select("id, status"),
      ]);

      const leads = leadsRes.data ?? [];
      const clients = clientsRes.data ?? [];
      const invoices = invoicesRes.data ?? [];
      const projects = projectsRes.data ?? [];

      const totalRevenue = invoices.reduce(
        (sum, inv) => sum + Number(inv.amount_paid || 0),
        0
      );
      const outstandingInvoices = invoices.filter(
        (inv) => inv.status !== "paid" && inv.status !== "cancelled"
      );
      const totalOutstanding = outstandingInvoices.reduce(
        (sum, inv) =>
          sum + Math.max(0, Number(inv.total) - Number(inv.amount_paid || 0)),
        0
      );

      const wonLeads = leads.filter((l) => l.status === "won").length;
      const conversionRate =
        leads.length > 0 ? Math.round((wonLeads / leads.length) * 100) : 0;

      const leadsByStatus = leads.reduce<Record<string, number>>((acc, l) => {
        acc[l.status] = (acc[l.status] || 0) + 1;
        return acc;
      }, {});

      const projectsByStatus = projects.reduce<Record<string, number>>(
        (acc, p) => {
          acc[p.status] = (acc[p.status] || 0) + 1;
          return acc;
        },
        {}
      );

      return {
        totalLeads: leads.length,
        wonLeads,
        conversionRate,
        leadsByStatus,
        totalClients: clients.length,
        totalRevenue,
        totalOutstanding,
        outstandingInvoices,
        totalProjects: projects.length,
        projectsByStatus,
      };
    },
  });
}

export function useActivityLogs() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["reports", "activity-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*, actor:profiles!activity_logs_actor_id_fkey(id, full_name, email)")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return (data ?? []) as unknown as ActivityLog[];
    },
  });
}
