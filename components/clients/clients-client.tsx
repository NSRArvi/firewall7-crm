"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CrmShell } from "@/components/layout/crm-shell";
import {
  useClients,
  useDeleteClient,
  type ClientRecord,
} from "@/hooks/use-clients";
import { usePermissions } from "@/hooks/use-permissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { CreateClientDialog } from "./create-client-dialog";
import { Building2, Mail, Phone, Plus, Search, Trash2 } from "lucide-react";

export function ClientsClient() {
  const { can } = usePermissions();
  const canCreate = can("clients", "create");
  const canEdit = can("clients", "edit");
  const canDelete = can("clients", "delete");

  const { data: clients = [], isLoading, error } = useClients();
  const deleteClient = useDeleteClient();

  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ClientRecord | null>(null);

  const filtered = clients.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.company_name.toLowerCase().includes(q) ||
      c.contact_name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.industry ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <CrmShell>
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Clients
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage client profiles, documents, communications, and history.
            </p>
          </div>
          {canCreate && (
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4" />
              <span>New Client</span>
            </Button>
          )}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="liquid-glass rounded p-5">
          {isLoading ? (
            <p className="text-sm text-slate-500 py-8 text-center">
              Loading clients...
            </p>
          ) : error ? (
            <p className="text-sm text-red-500 py-8 text-center">
              Could not load clients. Make sure you ran{" "}
              <code className="font-mono">0006_clients_storage_communications.sql</code>.
            </p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">
              No clients found.
            </p>
          ) : (
            <div className="space-y-3">
              {filtered.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded bg-white/50 dark:bg-slate-800/40 border border-white/40 dark:border-white/10"
                >
                  <Link
                    href={`/clients/${c.id}`}
                    className="space-y-1 flex-1 block"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-sm text-slate-900 dark:text-white hover:text-[#f97316] transition-colors">
                        {c.company_name}
                      </p>
                      {c.industry && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#f97316]/15 text-[#f97316]">
                          {c.industry}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5" />
                        {c.contact_name}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" />
                        {c.email}
                      </span>
                      {c.phone && (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" />
                          {c.country_code ? `${c.country_code} ` : ""}
                          {c.phone}
                        </span>
                      )}
                    </div>
                  </Link>

                  <div className="flex items-center gap-2">
                    <Link href={`/clients/${c.id}`}>
                      <Button variant="outline" size="sm">
                        Open Profile
                      </Button>
                    </Link>
                    {canDelete && (
                      <button
                        onClick={() => setDeleteTarget(c)}
                        className="p-1.5 rounded text-red-500 hover:bg-red-500/10 cursor-pointer"
                        aria-label="Delete client"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateClientDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
      />

      <ConfirmDeleteModal
        open={Boolean(deleteTarget)}
        title="Delete Client"
        description={`Are you sure you want to delete "${deleteTarget?.company_name ?? ""}"?`}
        isPending={deleteClient.isPending}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteClient.mutateAsync(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </CrmShell>
  );
}
