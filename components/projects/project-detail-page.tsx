"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CrmShell } from "@/components/layout/crm-shell";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useProject,
  useUpdateProject,
  type ProjectStatus,
} from "@/hooks/use-projects";
import { usePermissions } from "@/hooks/use-permissions";
import { CreateProjectDialog } from "./create-project-dialog";
import { ProjectKanbanBoard } from "./project-kanban-board";
import { ProjectResourcesPanel } from "./project-resources-panel";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Pencil } from "lucide-react";

export function ProjectDetailPage({ projectId }: { projectId: string }) {
  const { can } = usePermissions();
  const canEdit = can("projects", "edit");
  const canDelete = can("projects", "delete");

  const { data: project, isLoading, error } = useProject(projectId);
  const updateProject = useUpdateProject();
  const [showEditProject, setShowEditProject] = useState(false);

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

  return (
    <CrmShell>
      <div className="space-y-5">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-[#f97316] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Projects</span>
        </Link>

        {isLoading ? (
          <div className="liquid-glass rounded p-8 text-center text-sm text-slate-500">
            Loading project...
          </div>
        ) : error || !project ? (
          <div className="liquid-glass rounded p-8 text-center text-sm text-red-500">
            Project not found.
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
            {/* Left Side: Header + Kanban Board */}
            <div className="xl:col-span-8 space-y-5">
              <div className="liquid-glass rounded p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {project.name}
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {project.client?.company_name ?? "Client"}
                  </p>
                </div>

                {canEdit && (
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowEditProject(true)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </Button>
                    <Select
                      value={project.status}
                      onValueChange={(val) =>
                        updateProject.mutate({
                          id: project.id,
                          status: val as ProjectStatus,
                        })
                      }
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="review">Review</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <ProjectKanbanBoard
                projectId={project.id}
                tasks={project.tasks ?? []}
                teamMembers={teamMembers}
                canEdit={canEdit}
                canDelete={canDelete}
              />
            </div>

            {/* Right Side: Project Info, Documents & Links */}
            <div className="xl:col-span-4">
              <ProjectResourcesPanel
                project={project}
                canEdit={canEdit}
                canDelete={canDelete}
              />
            </div>
          </div>
        )}
      </div>

      <CreateProjectDialog
        open={showEditProject}
        project={project}
        teamMembers={teamMembers}
        onClose={() => setShowEditProject(false)}
      />
    </CrmShell>
  );
}
