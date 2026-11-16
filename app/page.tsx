import type { Metadata } from "next";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export const metadata: Metadata = {
  title: "Admin Dashboard | Firewall 7 CRM",
  description:
    "Real-time overview of Firewall 7 leads, clients, revenue, projects, and upcoming deadlines.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
