import type { Metadata } from "next";
import { QuotationsClient } from "@/components/quotations/quotations-client";

export const metadata: Metadata = {
  title: "Quotations | Firewall 7 CRM",
  description:
    "Create and manage client quotations, pricing, taxes, discounts, and downloadable PDF proposals.",
};

export default function QuotationsPage() {
  return <QuotationsClient />;
}
