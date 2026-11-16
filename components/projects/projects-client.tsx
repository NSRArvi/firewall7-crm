"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CrmShell } from "@/components/layout/crm-shell";
import {
  useProjects,
  useUpdateProject,
  useDeleteProject,
  type Project,
  type ProjectStatus,
} from "@/hooks/use-projects";
import { usePermissions } from "@/hooks/use-permissions";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { CreateProjectDialog } from "./create-project-dialog";
import { Calendar, Plus, Search, Trash2, User } from "lucide-react";

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: "All", value: "all" },
  { label: "Planning", value: "planning" },
  { label: "In Progress", value: "in_progress" },
  { label: "Review", value: "review" },
  { label: "Completed", value: "completed" },
  { label: "On Hold", value: "on_hold" },
];

export function ProjectsClient() {
  const { can } = usePermissions();
  const canCreate = can("projects", "create");
  const canEdit = can("projects", "edit");
  const canDelete = can("projects", "delete");

  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  const { data: projects = [], isLoading, error } = useProjects(statusFilter);
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const { data: teamMembers = [] } = useQuery<
    { id: string; full_name: string }[]
  >({
    queryKey: ["team-basic"],
    queryFn: async () => {
      const res = await fetch("/api/team");
      if (!res.ok) return [];
      return (await res.json()).members ?? [];
    },
  });

  const filtered = projects.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.client?.company_name ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <CrmShell>
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Projects & Tasks
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Assign client projects, track deadlines, and manage team tasks.
            </p>
          </div>
          {canCreate && (
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4" />
              <span>New Project</span>
            </Button>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3.5 py-1.5 rounded text-xs font-medium transition-all cursor-pointer ${
                  statusFilter === f.value
                    ? "bg-[#f97316] text-white shadow-sm shadow-orange-500/25"
                    : "liquid-glass-pill text-slate-700 dark:text-slate-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>
        </div>

        <div className="liquid-glass rounded p-5">
          {isLoading ? (
            <p className="text-sm text-slate-500 py-8 text-center">
              Loading projects...
            </p>
          ) : error ? (
            <p className="text-sm text-red-500 py-8 text-center">
              Could not load projects. Make sure you ran{" "}
              <code className="font-mono">0010_projects_tasks_rls.sql</code>.
            </p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">
              No projects found.
            </p>
          ) : (
            <div className="space-y-3">
              {filtered.map((p) => {
                const totalTasks = p.tasks?.length ?? 0;
                const doneTasks =
                  p.tasks?.filter((t) => t.status === "done").length ?? 0;

                return (
                  <div
                    key={p.id}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded bg-white/50 dark:bg-slate-800/40 border border-white/40 dark:border-white/10"
                  >
                    <Link
                      href={`/projects/${p.id}`}
                      className="space-y-1 flex-1 block"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-sm text-slate-900 dark:text-white hover:text-[#f97316]">
                          {p.name}
                        </p>
                        <span className="text-xs text-slate-500">
                          · {p.client?.company_name ?? "Client"}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        {p.manager?.full_name && (
                          <span className="inline-flex items-center gap-1">
                            <User className="h-3.5 w-3.5" />
                            {p.manager.full_name}
                          </span>
                        )}
                        {p.deadline && (
                          <span className="inline-flex items-center gap-1 text-[#f97316]">
                            <Calendar className="h-3.5 w-3.5" />
                            Due {p.deadline}
                          </span>
                        )}
                        <span>
                          Tasks: {doneTasks}/{totalTasks} done
                        </span>
                      </div>
                    </Link>

                    <div className="flex flex-wrap items-center gap-2">
                      {canEdit ? (
                        <Select
                          value={p.status}
                          onValueChange={(val) =>
                            updateProject.mutate({
                              id: p.id,
                              status: val as ProjectStatus,
                            })
                          }
                        >
                          <SelectTrigger className="w-[130px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_FILTERS.filter(
                              (s) => s.value !== "all"
                            ).map((s) => (
                              <SelectItem key={s.value} value={s.value}>
                                {s.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="px-3 py-1 rounded text-xs font-semibold bg-[#f97316]/15 text-[#f97316] capitalize">
                          {p.status.replace("_", " ")}
                        </span>
                      )}

                      <Link href={`/projects/${p.id}`}>
                        <Button variant="outline" size="sm">
                          Open Board
                        </Button>
                      </Link>

                      {canDelete && (
                        <button
                          onClick={() => setDeleteTarget(p)}
                          className="p-1.5 rounded text-red-500 hover:bg-red-500/10 cursor-pointer"
                          aria-label="Delete project"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <CreateProjectDialog
        open={showCreate}
        teamMembers={teamMembers}
        onClose={() => setShowCreate(false)}
      />

      <ConfirmDeleteModal
        open={Boolean(deleteTarget)}
        title="Delete Project"
        description={`Are you sure you want to delete "${deleteTarget?.name ?? ""}" and all its tasks?`}
        isPending={deleteProject.isPending}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteProject.mutateAsync(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </CrmShell>
  );
}
