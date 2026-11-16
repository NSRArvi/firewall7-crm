"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  useUpdateTaskStatus,
  type ProjectTask,
  type TaskStatus,
} from "@/hooks/use-projects";
import { Calendar, Plus, Trash2, User } from "lucide-react";

const COLUMNS: { key: TaskStatus; label: string; badge: string }[] = [
  { key: "todo", label: "To Do", badge: "bg-slate-500/15 text-slate-600 dark:text-slate-300" },
  { key: "in_progress", label: "In Progress", badge: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  { key: "done", label: "Done", badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
];

interface ProjectKanbanBoardProps {
  projectId: string;
  tasks: ProjectTask[];
  teamMembers: { id: string; full_name: string }[];
  canEdit: boolean;
  canDelete: boolean;
}

export function ProjectKanbanBoard({
  projectId,
  tasks,
  teamMembers,
  canEdit,
  canDelete,
}: ProjectKanbanBoardProps) {
  const createTask = useCreateTask();
  const updateTaskStatus = useUpdateTaskStatus();
  const deleteTask = useDeleteTask();

  const [taskTitle, setTaskTitle] = useState("");
  const [taskAssignee, setTaskAssignee] = useState("none");
  const [taskDue, setTaskDue] = useState("");
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    await createTask.mutateAsync({
      project_id: projectId,
      title: taskTitle.trim(),
      assigned_to: taskAssignee === "none" ? null : taskAssignee,
      due_date: taskDue || null,
    });
    setTaskTitle("");
    setTaskAssignee("none");
    setTaskDue("");
  };

  return (
    <div className="space-y-4">
      {canEdit && (
        <form
          onSubmit={handleAddTask}
          className="liquid-glass rounded p-4 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
        >
          <Input
            required
            placeholder="New task title *"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            className="sm:col-span-5 h-9 text-xs"
          />
          <div className="sm:col-span-3">
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
          </div>
          <div className="sm:col-span-2">
            <DatePicker
              value={taskDue}
              onChange={setTaskDue}
              placeholder="Due date"
              className="h-9 text-xs"
            />
          </div>
          <Button
            type="submit"
            size="sm"
            disabled={createTask.isPending}
            className="sm:col-span-2"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Task</span>
          </Button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.key);

          return (
            <div
              key={col.key}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (canEdit && draggedTaskId) {
                  updateTaskStatus.mutate({
                    id: draggedTaskId,
                    status: col.key,
                  });
                  setDraggedTaskId(null);
                }
              }}
              className="liquid-glass rounded p-4 space-y-3 min-h-[280px]"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`px-2.5 py-1 rounded text-xs font-semibold ${col.badge}`}
                >
                  {col.label}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {colTasks.length}
                </span>
              </div>

              <div className="space-y-2.5">
                {colTasks.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">
                    No tasks
                  </p>
                ) : (
                  colTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable={canEdit}
                      onDragStart={() => setDraggedTaskId(task.id)}
                      className="p-3 rounded bg-white/70 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 space-y-2 cursor-grab active:cursor-grabbing"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">
                          {task.title}
                        </p>
                        {canDelete && (
                          <button
                            onClick={() => deleteTask.mutate(task.id)}
                            className="p-1 rounded text-red-500 hover:bg-red-500/10 cursor-pointer shrink-0"
                            aria-label="Delete task"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {task.assignee?.full_name ?? "Unassigned"}
                        </span>
                        {task.due_date && (
                          <span className="inline-flex items-center gap-1 text-[#f97316]">
                            <Calendar className="h-3 w-3" />
                            {task.due_date}
                          </span>
                        )}
                      </div>

                      {canEdit && (
                        <Select
                          value={task.status}
                          onValueChange={(val) =>
                            updateTaskStatus.mutate({
                              id: task.id,
                              status: val as TaskStatus,
                            })
                          }
                        >
                          <SelectTrigger className="h-7 text-[11px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todo">To Do</SelectItem>
                            <SelectItem value="in_progress">
                              In Progress
                            </SelectItem>
                            <SelectItem value="done">Done</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
