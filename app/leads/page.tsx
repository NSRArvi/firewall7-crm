import type { Metadata } from "next";
import { LeadsClient } from "@/components/leads/leads-client";

export const metadata: Metadata = {
  title: "Leads & Enquiries | Firewall 7 CRM",
  description:
    "Manage website consultation bookings, manual sales leads, follow-ups, and client conversions.",
};

export default function LeadsPage() {
  return <LeadsClient />;
}
