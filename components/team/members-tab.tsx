"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, Eye, EyeOff, Save, Trash2 } from "lucide-react";
import { useToast } from "@/components/providers/toast-provider";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  AccountStatus,
  DesignationRecord,
  RoleRecord,
  TeamMember,
} from "./types";

interface MembersTabProps {
  members: TeamMember[];
  roles: RoleRecord[];
  designations: DesignationRecord[];
  isLoading: boolean;
  isAdmin: boolean;
  showModal: boolean;
  onCloseModal: () => void;
}

export function MembersTab({
  members,
  roles,
  designations,
  isLoading,
  isAdmin,
  showModal,
  onCloseModal,
}: MembersTabProps) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TeamMember | null>(null);
  const [pendingEdits, setPendingEdits] = useState<
    Record<
      string,
      { role_id: string | null; designation_id: string | null; status: AccountStatus }
    >
  >({});
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role_id: "",
    designation_id: "",
  });

  const createMember = useMutation({
    mutationFn: async (payload: typeof form) => {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to add member");
      return json.member;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team"] });
      setForm({ full_name: "", email: "", password: "", role_id: "", designation_id: "" });
      setShowPassword(false);
      onCloseModal();
      toast.success("Team member created successfully");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMember = useMutation({
    mutationFn: async (payload: {
      id: string;
      role_id?: string | null;
      designation_id?: string | null;
      status?: AccountStatus;
    }) => {
      const res = await fetch("/api/team", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update member");
      return json.member;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["team"] });
      setPendingEdits((prev) => {
        const next = { ...prev };
        delete next[variables.id];
        return next;
      });
      toast.success("Team member updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMember = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/team?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete member");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team"] });
      setDeleteTarget(null);
      toast.success("Team member deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const getDraft = (m: TeamMember) =>
    pendingEdits[m.id] ?? {
      role_id: m.role_id,
      designation_id: m.designation_id,
      status: m.status,
    };

  const setDraftField = (
    m: TeamMember,
    patch: Partial<{
      role_id: string | null;
      designation_id: string | null;
      status: AccountStatus;
    }>
  ) => {
    setPendingEdits((prev) => ({
      ...prev,
      [m.id]: { ...getDraft(m), ...patch },
    }));
  };

  const isDirty = (m: TeamMember) => {
    const d = pendingEdits[m.id];
    if (!d) return false;
    return (
      d.role_id !== m.role_id ||
      d.designation_id !== m.designation_id ||
      d.status !== m.status
    );
  };

  return (
    <>
      <div className="liquid-glass rounded p-5">
        {isLoading ? (
          <p className="text-sm text-slate-500 py-8 text-center">
            Loading team members...
          </p>
        ) : (
          <div className="space-y-3">
            {members.map((m) => (
              <div
                key={m.id}
                className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded bg-white/50 dark:bg-slate-800/40 border border-white/40 dark:border-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {m.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-slate-900 dark:text-white">
                        {m.full_name}
                      </p>
                      {m.role === "admin" && (
                        <ShieldCheck className="h-4 w-4 text-[#f97316]" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {m.email}
                      {m.designation_info?.title
                        ? ` · ${m.designation_info.title}`
                        : ""}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {isAdmin && m.role !== "admin" ? (
                    <>
                      <Select
                        value={getDraft(m).role_id ?? "none"}
                        onValueChange={(val) =>
                          setDraftField(m, {
                            role_id: val === "none" ? null : val,
                          })
                        }
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue placeholder="Select Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Select Role</SelectItem>
                          {roles.map((r) => (
                            <SelectItem key={r.id} value={r.id}>
                              {r.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={getDraft(m).designation_id ?? "none"}
                        onValueChange={(val) =>
                          setDraftField(m, {
                            designation_id: val === "none" ? null : val,
                          })
                        }
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="No Designation" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Designation</SelectItem>
                          {designations.map((d) => (
                            <SelectItem key={d.id} value={d.id}>
                              {d.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={getDraft(m).status}
                        onValueChange={(val) =>
                          setDraftField(m, {
                            status: val as AccountStatus,
                          })
                        }
                      >
                        <SelectTrigger className="w-[105px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      {isDirty(m) && (
                        <Button
                          size="sm"
                          onClick={() =>
                            updateMember.mutate({ id: m.id, ...getDraft(m) })
                          }
                          disabled={updateMember.isPending}
                        >
                          <Save className="h-3.5 w-3.5" />
                          <span>Save</span>
                        </Button>
                      )}
                      <button
                        onClick={() => setDeleteTarget(m)}
                        className="p-1.5 rounded text-red-500 hover:bg-red-500/10 cursor-pointer"
                        aria-label="Delete member"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <span className="px-3 py-1 rounded text-xs font-semibold bg-[#f97316]/15 text-[#f97316] capitalize">
                      {m.role_info?.name ?? m.role} · {m.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showModal && isAdmin} onOpenChange={(next) => !next && onCloseModal()}>
        <DialogContent className="space-y-4">
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createMember.mutate(form);
            }}
            className="space-y-3"
          >
              <Input
                required
                placeholder="Full Name *"
                value={form.full_name}
                onChange={(e) =>
                  setForm({ ...form, full_name: e.target.value })
                }
              />
              <Input
                required
                type="email"
                placeholder="Email *"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <div className="relative">
                <Input
                  required
                  type={showPassword ? "text" : "password"}
                  minLength={6}
                  placeholder="Temporary Password (min 6 chars) *"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <Select
                value={form.role_id || "none"}
                onValueChange={(val) =>
                  setForm({ ...form, role_id: val === "none" ? "" : val })
                }
              >
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue placeholder="Select Role *" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select Role *</SelectItem>
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={form.designation_id || "none"}
                onValueChange={(val) =>
                  setForm({ ...form, designation_id: val === "none" ? "" : val })
                }
              >
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue placeholder="Select Designation (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select Designation (optional)</SelectItem>
                  {designations.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={onCloseModal}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMember.isPending}>
                  {createMember.isPending ? "Creating..." : "Create Member"}
                </Button>
              </div>
            </form>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteModal
        open={Boolean(deleteTarget)}
        title="Delete Team Member"
        description={`Are you sure you want to delete "${deleteTarget?.full_name ?? ""}" (${deleteTarget?.email ?? ""})? They will immediately lose access to the CRM.`}
        isPending={deleteMember.isPending}
        onConfirm={() => deleteTarget && deleteMember.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
