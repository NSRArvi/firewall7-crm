import type { Metadata } from "next";
import { TeamClient } from "@/components/team/team-client";

export const metadata: Metadata = {
  title: "Team, Roles & Designations | Firewall 7 CRM",
  description:
    "Manage Firewall 7 team member accounts, custom roles, module permissions, and job designations.",
};

export default function TeamPage() {
  return <TeamClient />;
}
