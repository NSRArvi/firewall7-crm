"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CrmShell } from "@/components/layout/crm-shell";
import { Button } from "@/components/ui/button";
import { useClient } from "@/hooks/use-clients";
import { usePermissions } from "@/hooks/use-permissions";
import { ClientProfileTab } from "./client-profile-tab";
import { ClientDocumentsTab } from "./client-documents-tab";
import { ClientCommsTab } from "./client-comms-tab";
import { ClientHistoryTab } from "./client-history-tab";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  FileText,
  MessageSquare,
  History,
  Pencil,
} from "lucide-react";

export function ClientDetailPage({ clientId }: { clientId: string }) {
  const { can } = usePermissions();
  const canEdit = can("clients", "edit");
  const canDelete = can("clients", "delete");

  const { data: client, isLoading, error } = useClient(clientId);
  const [tab, setTab] = useState<"profile" | "documents" | "comms" | "history">(
    "profile"
  );
  const [isEditing, setIsEditing] = useState(false);

  return (
    <CrmShell>
      <div className="space-y-5">
        <Link
          href="/clients"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-[#f97316] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Clients</span>
        </Link>

        {isLoading ? (
          <div className="liquid-glass rounded p-8 text-center text-sm text-slate-500">
            Loading client profile...
          </div>
        ) : error || !client ? (
          <div className="liquid-glass rounded p-8 text-center text-sm text-red-500">
            Client not found.
          </div>
        ) : (
          <>
            <div className="liquid-glass rounded p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {client.company_name}
                  </h1>
                  {client.industry && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#f97316]/15 text-[#f97316]">
                      {client.industry}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5" />
                    {client.contact_name}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" />
                    {client.email}
                  </span>
                  {client.phone && (
                    <span className="inline-flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" />
                      {client.country_code ? `${client.country_code} ` : ""}
                      {client.phone}
                    </span>
                  )}
                </div>
              </div>

              {canEdit && tab === "profile" && !isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span>Edit Profile</span>
                </Button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {(
                [
                  { key: "profile", label: "Profile", icon: Building2 },
                  { key: "documents", label: "Documents", icon: FileText },
                  { key: "comms", label: "Communications", icon: MessageSquare },
                  { key: "history", label: "History", icon: History },
                ] as const
              ).map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded text-xs font-semibold cursor-pointer transition-colors ${
                      tab === t.key
                        ? "bg-[#f97316] text-white shadow-sm shadow-orange-500/25"
                        : "liquid-glass-pill text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="liquid-glass rounded p-5">
              {tab === "profile" && (
                <ClientProfileTab
                  client={client}
                  isEditing={isEditing}
                  onStopEditing={() => setIsEditing(false)}
                />
              )}
              {tab === "documents" && (
                <ClientDocumentsTab
                  clientId={client.id}
                  canEdit={canEdit}
                  canDelete={canDelete}
                />
              )}
              {tab === "comms" && (
                <ClientCommsTab clientId={client.id} canEdit={canEdit} />
              )}
              {tab === "history" && <ClientHistoryTab clientId={client.id} />}
            </div>
          </>
        )}
      </div>
    </CrmShell>
  );
}
