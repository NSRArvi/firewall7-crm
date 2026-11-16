import type { Metadata } from "next";
import { ProjectsClient } from "@/components/projects/projects-client";

export const metadata: Metadata = {
  title: "Projects & Tasks | Firewall 7 CRM",
  description:
    "Manage client projects, team assignments, deadlines, and task completion.",
};

export default function ProjectsPage() {
  return <ProjectsClient />;
}
