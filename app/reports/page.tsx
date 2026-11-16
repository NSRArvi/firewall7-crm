import type { Metadata } from "next";
import { ReportsClient } from "@/components/reports/reports-client";

export const metadata: Metadata = {
  title: "Reports & Activity Logs | Firewall 7 CRM",
  description:
    "Review lead, client, revenue, project, and outstanding payment reports alongside administrative activity logs.",
};

export default function ReportsPage() {
  return <ReportsClient />;
}
