"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavItem } from "./nav-items";

interface MobileNavbarProps {
  items: NavItem[];
  profile: { full_name: string; email: string } | null;
  initials: string;
  onSignOut: () => void;
}

export function MobileNavbar({
  items,
  profile,
  initials,
  onSignOut,
}: MobileNavbarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
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
          onClick={() => setOpen(true)}
          className="p-2 rounded hover:bg-white/40 dark:hover:bg-white/10 cursor-pointer"
          aria-label="Open Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="relative z-10 w-72 max-w-[85vw] h-full liquid-glass rounded-none p-4 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-5">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded bg-gradient-to-br from-[#f97316] to-[#ea580c] flex items-center justify-center text-white font-bold text-sm">
                    F7
                  </div>
                  <span className="font-bold tracking-tight text-sm text-slate-900 dark:text-white">
                    FIREWALL <span className="text-[#f97316]">7</span>
                  </span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded hover:bg-white/40 dark:hover:bg-white/10 cursor-pointer"
                  aria-label="Close Menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
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
        </div>
      )}
    </>
  );
}
