"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateTask,
  useDeleteTask,
  useUpdateProject,
  useUpdateTaskStatus,
  type Project,
  type ProjectStatus,
  type TaskStatus,
} from "@/hooks/use-projects";
import { Plus, Trash2 } from "lucide-react";

interface ProjectDetailDialogProps {
  project: Project | null;
  teamMembers: { id: string; full_name: string }[];
  canEdit: boolean;
  canDelete: boolean;
  onClose: () => void;
}

export function ProjectDetailDialog({
  project,
  teamMembers,
  canEdit,
  canDelete,
  onClose,
}: ProjectDetailDialogProps) {
  const updateProject = useUpdateProject();
  const createTask = useCreateTask();
  const updateTaskStatus = useUpdateTaskStatus();
  const deleteTask = useDeleteTask();

  const [taskTitle, setTaskTitle] = useState("");
  const [taskAssignee, setTaskAssignee] = useState("none");
  const [taskDue, setTaskDue] = useState("");

  if (!project) return null;

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    await createTask.mutateAsync({
      project_id: project.id,
      title: taskTitle.trim(),
      assigned_to: taskAssignee === "none" ? null : taskAssignee,
      due_date: taskDue || null,
    });
    setTaskTitle("");
    setTaskAssignee("none");
    setTaskDue("");
  };

  return (
    <Dialog open={Boolean(project)} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto space-y-4">
        <DialogHeader>
          <DialogTitle>{project.name}</DialogTitle>
          <p className="text-xs text-slate-500">
            {project.client?.company_name ?? "Client"}
            {project.deadline ? ` · Deadline: ${project.deadline}` : ""}
          </p>
        </DialogHeader>

        {canEdit && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Project Status</Label>
              <Select
                value={project.status}
                onValueChange={(val) =>
                  updateProject.mutate({
                    id: project.id,
                    status: val as ProjectStatus,
                  })
                }
              >
                <SelectTrigger>
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
            <div className="space-y-1">
              <Label>Project Manager</Label>
              <Select
                value={project.manager_id ?? "none"}
                onValueChange={(val) =>
                  updateProject.mutate({
                    id: project.id,
                    manager_id: val === "none" ? null : val,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {teamMembers.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {project.description && (
          <div className="p-3 rounded bg-slate-50 dark:bg-slate-800/60 text-xs">
            {project.description}
          </div>
        )}

        <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-semibold">
            Tasks ({project.tasks?.length ?? 0})
          </h3>

          {canEdit && (
            <form onSubmit={handleAddTask} className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Input
                  required
                  placeholder="Task title *"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="sm:col-span-3 h-9 text-xs"
                />
                <Select value={taskAssignee} onValueChange={setTaskAssignee}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {teamMembers.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <DatePicker
                  value={taskDue}
                  onChange={setTaskDue}
                  placeholder="Due date"
                  className="h-9 text-xs"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={createTask.isPending}
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Task</span>
                </Button>
              </div>
            </form>
          )}

          <div className="space-y-2 max-h-56 overflow-y-auto">
            {(project.tasks ?? []).length === 0 ? (
              <p className="text-xs text-slate-500">No tasks added yet.</p>
            ) : (
              project.tasks?.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-2 p-2.5 rounded bg-slate-50 dark:bg-slate-800/60 text-xs"
                >
                  <div className="min-w-0">
                    <p
                      className={`font-medium ${
                        t.status === "done" ? "line-through text-slate-400" : ""
                      }`}
                    >
                      {t.title}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {t.assignee?.full_name ?? "Unassigned"}
                      {t.due_date ? ` · Due ${t.due_date}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {canEdit ? (
                      <Select
                        value={t.status}
                        onValueChange={(val) =>
                          updateTaskStatus.mutate({
                            id: t.id,
                            status: val as TaskStatus,
                          })
                        }
                      >
                        <SelectTrigger className="w-[115px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todo">To Do</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="done">Done</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="capitalize">{t.status}</span>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => deleteTask.mutate(t.id)}
                        className="p-1 rounded text-red-500 hover:bg-red-500/10 cursor-pointer"
                        aria-label="Delete task"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
