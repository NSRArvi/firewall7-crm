import type { Metadata } from "next";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { ProjectDetailPage } from "@/components/projects/project-detail-page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("name")
    .eq("id", id)
    .single();

  const name = data?.name ?? "Project Details";
  return {
    title: `${name} | Firewall 7 CRM`,
    description: `Kanban task board and project details for ${name}.`,
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense>
      <ProjectDetailPage projectId={id} />
    </Suspense>
  );
}
