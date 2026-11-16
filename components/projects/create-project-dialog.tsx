"use client";

import React, { useEffect, useState } from "react";
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
import { useClients } from "@/hooks/use-clients";
import {
  useCreateProject,
  useUpdateProject,
  type Project,
} from "@/hooks/use-projects";

interface CreateProjectDialogProps {
  open: boolean;
  project?: Project | null;
  teamMembers: { id: string; full_name: string }[];
  onClose: () => void;
}

export function CreateProjectDialog({
  open,
  project,
  teamMembers,
  onClose,
}: CreateProjectDialogProps) {
  const { data: clients = [] } = useClients();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();

  const [name, setName] = useState("");
  const [clientId, setClientId] = useState("");
  const [managerId, setManagerId] = useState("none");
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (project) {
      setName(project.name);
      setClientId(project.client_id);
      setManagerId(project.manager_id ?? "none");
      setStartDate(project.start_date ?? "");
      setDeadline(project.deadline ?? "");
      setDescription(project.description ?? "");
    } else {
      setName("");
      setClientId("");
      setManagerId("none");
      setStartDate("");
      setDeadline("");
      setDescription("");
    }
  }, [project, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !clientId) return;

    if (project) {
      await updateProject.mutateAsync({
        id: project.id,
        name,
        client_id: clientId,
        manager_id: managerId === "none" ? null : managerId,
        start_date: startDate || null,
        deadline: deadline || null,
        description: description || null,
      });
    } else {
      await createProject.mutateAsync({
        name,
        client_id: clientId,
        manager_id: managerId === "none" ? null : managerId,
        start_date: startDate || null,
        deadline: deadline || null,
        description: description || null,
      });
    }

    onClose();
  };

  const isPending = createProject.isPending || updateProject.isPending;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-lg space-y-4">
        <DialogHeader>
          <DialogTitle>{project ? "Edit Project" : "Create Project"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label>Project Name *</Label>
            <Input
              required
              placeholder="ISO 27001 Readiness Audit"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Client *</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue placeholder="Select Client *" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Project Manager</Label>
              <Select value={managerId} onValueChange={setManagerId}>
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue placeholder="Unassigned" />
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Start Date</Label>
              <DatePicker
                value={startDate}
                onChange={setStartDate}
                placeholder="Start date"
              />
            </div>
            <div className="space-y-1">
              <Label>Deadline</Label>
              <DatePicker
                value={deadline}
                onChange={setDeadline}
                placeholder="Deadline"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Description / Notes</Label>
            <Input
              placeholder="Project scope & notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name || !clientId || isPending}
            >
              {isPending ? "Saving..." : project ? "Save Changes" : "Create Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
