"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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
  Bell,
  Search,
  Menu,
  X,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/theme-provider";
import { usePermissions } from "@/hooks/use-permissions";
import type { CrmModule } from "@/lib/permissions";

const navItems: { label: string; href: string; icon: React.ComponentType<{ className?: string }>; module: CrmModule }[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard, module: "dashboard" },
  { label: "Leads & Enquiries", href: "/leads", icon: Users, module: "leads" },
  { label: "Clients", href: "/clients", icon: UserCheck, module: "clients" },
  { label: "Services", href: "/services", icon: Shield, module: "services" },
  { label: "Quotations", href: "/quotations", icon: FileText, module: "quotations" },
  { label: "Invoices & Payments", href: "/invoices", icon: Receipt, module: "invoices" },
  { label: "Projects & Tasks", href: "/projects", icon: FolderKanban, module: "projects" },
  { label: "Reports & Logs", href: "/reports", icon: BarChart3, module: "reports" },
  { label: "Team & Roles", href: "/team", icon: UserCog, module: "team" },
];

export function CrmShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { can, isLoading: permLoading } = usePermissions();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profile, setProfile] = useState<{
    full_name: string;
    email: string;
    role: string;
  } | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("full_name, email, role")
          .eq("id", user.id)
          .single();
        if (data) setProfile(data);
      }
    };
    loadProfile();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "F7";

  return (
    <div className="min-h-screen flex flex-col md:flex-row p-3 md:p-5 gap-4 max-w-[1600px] mx-auto w-full">
      {/* Mobile Header */}
      <div className="flex md:hidden items-center justify-between liquid-glass rounded px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-[#f97316] flex items-center justify-center text-white font-bold text-sm shadow-sm">
            F7
          </div>
          <span className="font-bold tracking-tight text-slate-900 dark:text-white">
            FIREWALL <span className="text-[#f97316]">7</span>
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded hover:bg-white/40 dark:hover:bg-white/10"
          aria-label="Toggle Menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Liquid Glass Sidebar */}
      <aside
        className={cn(
          "liquid-glass rounded p-4 w-full md:w-64 shrink-0 flex flex-col justify-between transition-all",
          mobileOpen ? "block" : "hidden md:flex"
        )}
      >
        <div className="space-y-6">
          {/* Brand */}
          <div className="hidden md:flex items-center gap-3 px-2 pt-1">
            <div className="h-9 w-9 rounded bg-gradient-to-br from-[#f97316] to-[#ea580c] flex items-center justify-center text-white font-bold shadow-md shadow-orange-500/20">
              F7
            </div>
            <div>
              <p className="font-bold tracking-tight text-sm text-slate-900 dark:text-white">
                FIREWALL <span className="text-[#f97316]">7</span>
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                CRM & Operations
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {navItems
              .filter((item) => permLoading || can(item.module, "view"))
              .map((item) => {
                const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3.5 py-2.5 rounded text-sm font-medium transition-all",
                    isActive
                      ? "bg-[#f97316] text-white shadow-md shadow-orange-500/25"
                      : "text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-white/10"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile Pill */}
        <div className="mt-6 pt-4 border-t border-white/30 dark:border-white/10">
          <div className="flex items-center justify-between gap-2 px-2 py-1.5 rounded">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-8 w-8 rounded-full bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center text-xs font-semibold shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate">
                  {profile?.full_name ?? "Loading..."}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {profile?.email ?? ""}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              title="Sign out"
              className="p-2 rounded hover:bg-white/40 dark:hover:bg-white/10 text-slate-500 hover:text-red-500 transition-colors cursor-pointer shrink-0"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        {/* Topbar */}
        <header className="liquid-glass rounded px-5 py-3 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search leads, clients, invoices..."
              className="w-full pl-10 pr-4 py-2 rounded bg-white/50 dark:bg-slate-800/50 border border-white/40 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]/50"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="liquid-glass-pill p-2.5 rounded cursor-pointer"
              aria-label="Toggle theme"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-slate-700" />
              )}
            </button>
            <button
              className="liquid-glass-pill p-2.5 rounded relative cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4 text-slate-700 dark:text-slate-200" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#f97316]" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
