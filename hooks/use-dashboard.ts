"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export function useDashboardData() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["dashboard", "live"],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);

      const [clientsRes, leadsRes, projectsRes, invoicesRes, paymentsRes] =
        await Promise.all([
          supabase.from("clients").select("id"),
          supabase
            .from("leads")
            .select("id, full_name, company_name, topic, consultation_date, consultation_slot, status, source, created_at")
            .order("created_at", { ascending: false }),
          supabase
            .from("projects")
            .select("id, name, status, deadline, client:clients(company_name)")
            .order("deadline", { ascending: true }),
          supabase
            .from("invoices")
            .select("id, status, total, amount_paid, due_date"),
          supabase
            .from("payments")
            .select("id, amount, payment_date")
            .order("payment_date", { ascending: true }),
        ]);

      const clients = clientsRes.data ?? [];
      const leads = leadsRes.data ?? [];
      const projects = projectsRes.data ?? [];
      const invoices = invoicesRes.data ?? [];
      const payments = paymentsRes.data ?? [];

      const newLeadsCount = leads.filter((l) => l.status === "new").length;
      const activeProjectsCount = projects.filter(
        (p) => p.status !== "completed" && p.status !== "on_hold"
      ).length;

      const totalRevenue = payments.reduce(
        (sum, p) => sum + Number(p.amount || 0),
        0
      );

      const overdueInvoices = invoices.filter(
        (inv) =>
          inv.status !== "paid" &&
          inv.status !== "cancelled" &&
          (inv.status === "overdue" || inv.due_date < today)
      );
      const overdueTotal = overdueInvoices.reduce(
        (sum, inv) =>
          sum + Math.max(0, Number(inv.total) - Number(inv.amount_paid || 0)),
        0
      );

      // Revenue by month (last 6 months)
      const monthMap = new Map<string, number>();
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = d.toISOString().slice(0, 7);
        monthMap.set(key, 0);
      }
      for (const p of payments) {
        const key = String(p.payment_date).slice(0, 7);
        if (monthMap.has(key)) {
          monthMap.set(key, (monthMap.get(key) ?? 0) + Number(p.amount || 0));
        }
      }
      const revenueChart = Array.from(monthMap.entries()).map(
        ([month, revenue]) => ({
          month,
          revenue,
        })
      );

      // Leads by status chart
      const statuses = ["new", "contacted", "proposal_sent", "won", "lost"];
      const leadsChart = statuses.map((s) => ({
        stage: s.replace("_", " "),
        count: leads.filter((l) => l.status === s).length,
      }));

      const upcomingDeadlines = projects
        .filter((p) => p.deadline && p.status !== "completed")
        .slice(0, 5);

      return {
        totalClients: clients.length,
        newLeadsCount,
        totalLeads: leads.length,
        activeProjectsCount,
        totalRevenue,
        overdueCount: overdueInvoices.length,
        overdueTotal,
        recentLeads: leads.slice(0, 5),
        upcomingDeadlines,
        revenueChart,
        leadsChart,
      };
    },
  });
}
