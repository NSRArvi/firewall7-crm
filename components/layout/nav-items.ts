import type React from "react";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Shield,
  FileText,
  Receipt,
  FolderKanban,
  BarChart3,
  UserCog,
} from "lucide-react";
import type { CrmModule } from "@/lib/permissions";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  module: CrmModule;
}

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard, module: "dashboard" },
  { label: "Leads", href: "/leads", icon: Users, module: "leads" },
  { label: "Clients", href: "/clients", icon: UserCheck, module: "clients" },
  { label: "Services", href: "/services", icon: Shield, module: "services" },
  { label: "Quotations", href: "/quotations", icon: FileText, module: "quotations" },
  { label: "Invoices", href: "/invoices", icon: Receipt, module: "invoices" },
  { label: "Projects", href: "/projects", icon: FolderKanban, module: "projects" },
  { label: "Reports", href: "/reports", icon: BarChart3, module: "reports" },
  { label: "Team", href: "/team", icon: UserCog, module: "team" },
];
