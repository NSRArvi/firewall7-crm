"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/providers/toast-provider";

export type ProjectStatus =
  | "planning"
  | "in_progress"
  | "review"
  | "completed"
  | "on_hold";

export type TaskStatus = "todo" | "in_progress" | "done";

export interface ProjectTask {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  assigned_to: string | null;
  due_date: string | null;
  created_at: string;
  assignee?: { id: string; full_name: string } | null;
}

export interface Project {
  id: string;
  name: string;
  client_id: string;
  status: ProjectStatus;
  start_date: string | null;
  deadline: string | null;
  manager_id: string | null;
  description: string | null;
  created_at: string;
  client?: { id: string; company_name: string } | null;
  manager?: { id: string; full_name: string } | null;
  tasks?: ProjectTask[];
}

export const projectKeys = {
  all: ["projects"] as const,
  detail: (id: string) => ["projects", "detail", id] as const,
  list: (status?: string) => [...projectKeys.all, "list", status ?? "all"] as const,
};

export function useProject(id: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: projectKeys.detail(id),
    enabled: Boolean(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select(
          "*, client:clients(id, company_name), manager:profiles!projects_manager_id_fkey(id, full_name), tasks:project_tasks(*, assignee:profiles!project_tasks_assigned_to_fkey(id, full_name))"
        )
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as unknown as Project;
    },
  });
}

export function useProjects(status?: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: projectKeys.list(status),
    queryFn: async () => {
      let query = supabase
        .from("projects")
        .select(
          "*, client:clients(id, company_name), manager:profiles!projects_manager_id_fkey(id, full_name), tasks:project_tasks(*, assignee:profiles!project_tasks_assigned_to_fkey(id, full_name))"
        )
        .order("created_at", { ascending: false });

      if (status && status !== "all") {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as unknown as Project[];
    },
  });
}

export function useCreateProject() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (payload: {
      name: string;
      client_id: string;
      manager_id?: string | null;
      start_date?: string | null;
      deadline?: string | null;
      description?: string | null;
    }) => {
      const { data, error } = await supabase
        .from("projects")
        .insert({
          ...payload,
          status: "planning",
        })
        .select()
        .single();

      if (error) throw error;
      return data as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      toast.success("Project created");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateProject() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      name?: string;
      client_id?: string;
      status?: ProjectStatus;
      description?: string | null;
      manager_id?: string | null;
      start_date?: string | null;
      deadline?: string | null;
    }) => {
      const { error } = await supabase
        .from("projects")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      toast.success("Project updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteProject() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      toast.success("Project deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useCreateTask() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (payload: {
      project_id: string;
      title: string;
      assigned_to?: string | null;
      due_date?: string | null;
    }) => {
      const { error } = await supabase.from("project_tasks").insert({
        ...payload,
        status: "todo",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      toast.success("Task added");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateTaskStatus() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TaskStatus }) => {
      const { error } = await supabase
        .from("project_tasks")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      toast.success("Task updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteTask() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("project_tasks")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      toast.success("Task deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export interface ProjectDocument {
  id: string;
  project_id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  created_at: string;
}

export interface ProjectLink {
  id: string;
  project_id: string;
  title: string;
  url: string;
  created_at: string;
}

export function useProjectDocuments(projectId: string) {
  const supabase = createClient();
  return useQuery({
    queryKey: ["projects", "documents", projectId],
    enabled: Boolean(projectId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_documents")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ProjectDocument[];
    },
  });
}

export function useUploadProjectDocument() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({ projectId, file }: { projectId: string; file: File }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const filePath = `${projectId}/${Date.now()}_${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("project-documents")
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const { error } = await supabase.from("project_documents").insert({
        project_id: projectId,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        uploaded_by: user?.id ?? null,
      });
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: ["projects", "documents", vars.projectId] });
      toast.success("Document uploaded");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteProjectDocument() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (doc: ProjectDocument) => {
      await supabase.storage.from("project-documents").remove([doc.file_path]);
      const { error } = await supabase.from("project_documents").delete().eq("id", doc.id);
      if (error) throw error;
    },
    onSuccess: (_d, doc) => {
      queryClient.invalidateQueries({ queryKey: ["projects", "documents", doc.project_id] });
      toast.success("Document deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export async function getSignedProjectDocUrl(filePath: string) {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from("project-documents")
    .createSignedUrl(filePath, 60);
  if (error) throw error;
  return data.signedUrl;
}

export function useProjectLinks(projectId: string) {
  const supabase = createClient();
  return useQuery({
    queryKey: ["projects", "links", projectId],
    enabled: Boolean(projectId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_links")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ProjectLink[];
    },
  });
}

export function useAddProjectLink() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (payload: { project_id: string; title: string; url: string }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("project_links")
        .insert({ ...payload, created_by: user?.id ?? null });
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: ["projects", "links", vars.project_id] });
      toast.success("Link added");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteProjectLink() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (link: ProjectLink) => {
      const { error } = await supabase.from("project_links").delete().eq("id", link.id);
      if (error) throw error;
    },
    onSuccess: (_d, link) => {
      queryClient.invalidateQueries({ queryKey: ["projects", "links", link.project_id] });
      toast.success("Link deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
