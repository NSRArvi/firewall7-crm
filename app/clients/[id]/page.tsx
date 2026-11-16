import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ClientDetailPage } from "@/components/clients/client-detail-page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("clients")
    .select("company_name")
    .eq("id", id)
    .single();

  const name = data?.company_name ?? "Client Profile";
  return {
    title: `${name} | Firewall 7 CRM`,
    description: `Client profile, documents, communications, and history for ${name}.`,
  };
}

export default async function ClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ClientDetailPage clientId={id} />;
}
