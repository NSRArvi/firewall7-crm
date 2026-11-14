"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
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
import type { DesignationRecord } from "./types";

interface DesignationsTabProps {
  designations: DesignationRecord[];
  isLoading: boolean;
  isAdmin: boolean;
  showModal: boolean;
  onCloseModal: () => void;
}

export function DesignationsTab({
  designations,
  isLoading,
  isAdmin,
  showModal,
  onCloseModal,
}: DesignationsTabProps) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [form, setForm] = useState({ title: "", department: "" });
  const [deleteTarget, setDeleteTarget] = useState<DesignationRecord | null>(null);

  const createDesig = useMutation({
    mutationFn: async (payload: typeof form) => {
      const res = await fetch("/api/designations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create designation");
      return json.designation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["designations"] });
      setForm({ title: "", department: "" });
      onCloseModal();
      toast.success("Designation created");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteDesig = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/designations?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete designation");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["designations"] });
      setDeleteTarget(null);
      toast.success("Designation deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <>
      <div className="liquid-glass rounded p-5">
        {isLoading ? (
          <p className="text-sm text-slate-500 py-8 text-center">
            Loading designations...
          </p>
        ) : designations.length === 0 ? (
          <p className="text-sm text-slate-500 py-8 text-center">
            No designations yet. Add your first designation.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {designations.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between p-4 rounded bg-white/50 dark:bg-slate-800/40 border border-white/40 dark:border-white/10"
              >
                <div>
                  <p className="font-semibold text-sm text-slate-900 dark:text-white">
                    {d.title}
                  </p>
                  {d.department && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {d.department}
                    </p>
                  )}
                </div>
                {isAdmin && (
                  <button
                    onClick={() => setDeleteTarget(d)}
                    className="p-1.5 rounded text-red-500 hover:bg-red-500/10 cursor-pointer"
                    aria-label="Delete designation"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showModal && isAdmin} onOpenChange={(next) => !next && onCloseModal()}>
        <DialogContent className="space-y-4">
          <DialogHeader>
            <DialogTitle>Add Designation</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createDesig.mutate(form);
            }}
            className="space-y-3"
          >
              <Input
                required
                placeholder="Designation Title (e.g. SOC Lead) *"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <Input
                placeholder="Department (e.g. Security Operations)"
                value={form.department}
                onChange={(e) =>
                  setForm({ ...form, department: e.target.value })
                }
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={onCloseModal}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createDesig.isPending}>
                  {createDesig.isPending ? "Saving..." : "Save Designation"}
                </Button>
              </div>
            </form>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteModal
        open={Boolean(deleteTarget)}
        title="Delete Designation"
        description={`Are you sure you want to delete "${deleteTarget?.title ?? ""}"? This action cannot be undone.`}
        isPending={deleteDesig.isPending}
        onConfirm={() => deleteTarget && deleteDesig.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
