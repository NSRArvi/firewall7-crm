"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavItem } from "./nav-items";

interface DesktopSidebarProps {
  items: NavItem[];
  profile: { full_name: string; email: string } | null;
  initials: string;
  onSignOut: () => void;
}

export function DesktopSidebar({
  items,
  profile,
  initials,
  onSignOut,
}: DesktopSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex liquid-glass rounded p-4 w-64 shrink-0 flex-col justify-between">
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2 pt-1">
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

        <nav className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
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
            onClick={onSignOut}
            title="Sign out"
            className="p-2 rounded hover:bg-white/40 dark:hover:bg-white/10 text-slate-500 hover:text-red-500 transition-colors cursor-pointer shrink-0"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
