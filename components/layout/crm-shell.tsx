"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Bell, Search, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";
import { usePermissions } from "@/hooks/use-permissions";
import { navItems } from "./nav-items";
import { DesktopSidebar } from "./desktop-sidebar";
import { MobileNavbar } from "./mobile-navbar";

export function CrmShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { can, isLoading: permLoading } = usePermissions();
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

  const visibleItems = navItems.filter(
    (item) => permLoading || can(item.module, "view")
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row p-3 md:p-5 gap-4 max-w-[1600px] mx-auto w-full">
      <MobileNavbar
        items={visibleItems}
        profile={profile}
        initials={initials}
        onSignOut={handleSignOut}
      />

      <DesktopSidebar
        items={visibleItems}
        profile={profile}
        initials={initials}
        onSignOut={handleSignOut}
      />

      <div className="flex-1 flex flex-col gap-4 min-w-0">
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
              title={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
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

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
