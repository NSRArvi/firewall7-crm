"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/components/providers/toast-provider";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CRM_MODULES,
  emptyPermissions,
  type CrmModule,
  type PermissionAction,
  type RolePermissions,
} from "@/lib/permissions";
import type { RoleRecord } from "./types";

const ACTIONS: PermissionAction[] = ["view", "create", "edit", "delete"];

interface RolesTabProps {
  roles: RoleRecord[];
  isLoading: boolean;
  isAdmin: boolean;
  showModal: boolean;
  editingRole: RoleRecord | null;
  onEditRole: (role: RoleRecord) => void;
  onCloseModal: () => void;
}

export function RolesTab({
  roles,
  isLoading,
  isAdmin,
  showModal,
  editingRole,
  onEditRole,
  onCloseModal,
}: RolesTabProps) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [deleteTarget, setDeleteTarget] = useState<RoleRecord | null>(null);

  const [roleForm, setRoleForm] = useState<{
    name: string;
    description: string;
    permissions: RolePermissions;
  }>({
    name: "",
    description: "",
    permissions: emptyPermissions(),
  });

  useEffect(() => {
    if (editingRole) {
      setRoleForm({
        name: editingRole.name,
        description: editingRole.description ?? "",
        permissions: { ...emptyPermissions(), ...editingRole.permissions },
      });
    } else {
      setRoleForm({
        name: "",
        description: "",
        permissions: emptyPermissions(),
      });
    }
  }, [editingRole, showModal]);

  const saveRole = useMutation({
    mutationFn: async () => {
      const method = editingRole ? "PATCH" : "POST";
      const body = editingRole ? { id: editingRole.id, ...roleForm } : roleForm;
      const res = await fetch("/api/roles", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save role");
      return json.role;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["team"] });
      onCloseModal();
      toast.success(editingRole ? "Role updated" : "Role created");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteRole = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/roles?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete role");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      setDeleteTarget(null);
      toast.success("Role deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const togglePermission = (mod: CrmModule, action: PermissionAction) => {
    setRoleForm((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [mod]: {
          ...prev.permissions[mod],
          [action]: !prev.permissions[mod]?.[action],
        },
      },
    }));
  };

  return (
    <>
      <div className="liquid-glass rounded p-5">
        {isLoading ? (
          <p className="text-sm text-slate-500 py-8 text-center">
            Loading roles...
          </p>
        ) : (
          <div className="space-y-3">
            {roles.map((r) => (
              <div
                key={r.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded bg-white/50 dark:bg-slate-800/40 border border-white/40 dark:border-white/10"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-slate-900 dark:text-white">
                      {r.name}
                    </p>
                    {r.is_system && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#f97316]/15 text-[#f97316]">
                        System
                      </span>
                    )}
                  </div>
                  {r.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {r.description}
                    </p>
                  )}
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEditRole(r)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium liquid-glass-pill cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      <span>Permissions</span>
                    </button>
                    {!r.is_system && (
                      <button
                        onClick={() => setDeleteTarget(r)}
                        className="p-1.5 rounded text-red-500 hover:bg-red-500/10 cursor-pointer"
                        aria-label="Delete role"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showModal && isAdmin} onOpenChange={(next) => !next && onCloseModal()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto space-y-4">
          <DialogHeader>
            <DialogTitle>
              {editingRole ? "Edit Role & Permissions" : "Create Custom Role"}
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveRole.mutate();
            }}
            className="space-y-4"
          >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  required
                  placeholder="Role Name (e.g. Sales Lead) *"
                  value={roleForm.name}
                  onChange={(e) =>
                    setRoleForm({ ...roleForm, name: e.target.value })
                  }
                />
                <Input
                  placeholder="Description"
                  value={roleForm.description}
                  onChange={(e) =>
                    setRoleForm({ ...roleForm, description: e.target.value })
                  }
                />
              </div>

              <div className="rounded border border-white/40 dark:border-white/10 overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-white/40 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300">
                    <tr>
                      <th className="text-left px-3 py-2.5 font-semibold">Module</th>
                      {ACTIONS.map((a) => (
                        <th key={a} className="text-center px-3 py-2.5 font-semibold capitalize">
                          {a}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/20 dark:divide-white/10">
                    {CRM_MODULES.map((mod) => (
                      <tr key={mod.key} className="hover:bg-white/20 dark:hover:bg-white/5">
                        <td className="px-3 py-2.5 font-medium text-slate-800 dark:text-slate-200">
                          {mod.label}
                        </td>
                        {ACTIONS.map((action) => (
                          <td key={action} className="text-center px-3 py-2.5">
                            <div className="flex justify-center">
                              <Checkbox
                                checked={Boolean(roleForm.permissions[mod.key]?.[action])}
                                onCheckedChange={() => togglePermission(mod.key, action)}
                              />
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={onCloseModal}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saveRole.isPending}>
                  {saveRole.isPending ? "Saving..." : "Save Role"}
                </Button>
              </div>
            </form>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteModal
        open={Boolean(deleteTarget)}
        title="Delete Role"
        description={`Are you sure you want to delete the "${deleteTarget?.name ?? ""}" role? Members assigned to this role will lose its permissions.`}
        isPending={deleteRole.isPending}
        onConfirm={() => deleteTarget && deleteRole.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
