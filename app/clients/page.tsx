import type { Metadata } from "next";
import { ClientsClient } from "@/components/clients/clients-client";

export const metadata: Metadata = {
  title: "Clients | Firewall 7 CRM",
  description:
    "Manage Firewall 7 client profiles, documents, communication logs, and quotation/invoice history.",
};

export default function ClientsPage() {
  return <ClientsClient />;
}
