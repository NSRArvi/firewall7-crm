"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/providers/toast-provider";

export interface ClientRecord {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  country_code: string | null;
  phone: string | null;
  address: string | null;
  industry: string | null;
  lead_id: string | null;
  created_at: string;
}

export interface ClientDocument {
  id: string;
  client_id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  created_at: string;
}

export interface ClientCommunication {
  id: string;
  client_id: string;
  channel: string;
  summary: string;
  created_at: string;
  author?: { id: string; full_name: string } | null;
}

export const clientKeys = {
  all: ["clients"] as const,
  detail: (id: string) => ["clients", "detail", id] as const,
  documents: (clientId: string) => ["clients", "documents", clientId] as const,
  communications: (clientId: string) => ["clients", "communications", clientId] as const,
  history: (clientId: string) => ["clients", "history", clientId] as const,
};

export function useClient(id: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: clientKeys.detail(id),
    enabled: Boolean(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as ClientRecord;
    },
  });
}

export function useClients() {
  const supabase = createClient();

  return useQuery({
    queryKey: clientKeys.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as ClientRecord[];
    },
  });
}

export function useCreateClient() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (payload: {
      company_name: string;
      contact_name: string;
      email: string;
      country_code?: string | null;
      phone?: string | null;
      address?: string | null;
      industry?: string | null;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("clients")
        .insert({ ...payload, created_by: user?.id ?? null })
        .select()
        .single();

      if (error) throw error;
      return data as ClientRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
      toast.success("Client created");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateClient() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      company_name?: string;
      contact_name?: string;
      email?: string;
      country_code?: string | null;
      phone?: string | null;
      address?: string | null;
      industry?: string | null;
    }) => {
      const { data, error } = await supabase
        .from("clients")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as ClientRecord;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
      queryClient.invalidateQueries({ queryKey: clientKeys.detail(variables.id) });
      toast.success("Client updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteClient() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
      toast.success("Client deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useClientDocuments(clientId: string | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: clientKeys.documents(clientId ?? ""),
    enabled: Boolean(clientId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_documents")
        .select("*")
        .eq("client_id", clientId!)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as ClientDocument[];
    },
  });
}

export function useUploadClientDocument() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({
      clientId,
      file,
    }: {
      clientId: string;
      file: File;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const filePath = `${clientId}/${Date.now()}_${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("client-documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data, error } = await supabase
        .from("client_documents")
        .insert({
          client_id: clientId,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          uploaded_by: user?.id ?? null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as ClientDocument;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: clientKeys.documents(variables.clientId),
      });
      toast.success("Document uploaded");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteClientDocument() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (doc: ClientDocument) => {
      await supabase.storage.from("client-documents").remove([doc.file_path]);
      const { error } = await supabase
        .from("client_documents")
        .delete()
        .eq("id", doc.id);
      if (error) throw error;
    },
    onSuccess: (_data, doc) => {
      queryClient.invalidateQueries({
        queryKey: clientKeys.documents(doc.client_id),
      });
      toast.success("Document deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export async function getSignedDocumentUrl(filePath: string) {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from("client-documents")
    .createSignedUrl(filePath, 60);
  if (error) throw error;
  return data.signedUrl;
}

export function useClientCommunications(clientId: string | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: clientKeys.communications(clientId ?? ""),
    enabled: Boolean(clientId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_communications")
        .select("*, author:profiles!client_communications_author_id_fkey(id, full_name)")
        .eq("client_id", clientId!)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as unknown as ClientCommunication[];
    },
  });
}

export function useAddClientCommunication() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (payload: {
      client_id: string;
      channel: string;
      summary: string;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("client_communications")
        .insert({ ...payload, author_id: user?.id ?? null })
        .select()
        .single();

      if (error) throw error;
      return data as ClientCommunication;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: clientKeys.communications(variables.client_id),
      });
      toast.success("Communication logged");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useClientHistory(clientId: string | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: clientKeys.history(clientId ?? ""),
    enabled: Boolean(clientId),
    queryFn: async () => {
      const [quotationsRes, invoicesRes, projectsRes] = await Promise.all([
        supabase
          .from("quotations")
          .select("id, quote_number, status, total, created_at")
          .eq("client_id", clientId!)
          .order("created_at", { ascending: false }),
        supabase
          .from("invoices")
          .select("id, invoice_number, status, total, amount_paid, due_date")
          .eq("client_id", clientId!)
          .order("created_at", { ascending: false }),
        supabase
          .from("projects")
          .select("id, name, status, deadline")
          .eq("client_id", clientId!)
          .order("created_at", { ascending: false }),
      ]);

      return {
        quotations: quotationsRes.data ?? [],
        invoices: invoicesRes.data ?? [],
        projects: projectsRes.data ?? [],
      };
    },
  });
}
