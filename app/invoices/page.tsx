import type { Metadata } from "next";
import { InvoicesClient } from "@/components/invoices/invoices-client";

export const metadata: Metadata = {
  title: "Invoices & Payments | Firewall 7 CRM",
  description:
    "Generate client invoices, record partial or full payments, monitor overdue balances, and export PDFs.",
};

export default function InvoicesPage() {
  return <InvoicesClient />;
}
