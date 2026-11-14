"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "proposal_sent"
  | "won"
  | "lost";

export interface Lead {
  id: string;
  full_name: string;
  email: string;
  company_name: string | null;
  job_title: string | null;
  phone: string | null;
  topic: string | null;
  notes: string | null;
  source: string;
  status: LeadStatus;
  consultation_date: string | null;
  consultation_slot: string | null;
  timezone: string | null;
  created_at: string;
}

export const leadKeys = {
  all: ["leads"] as const,
  list: (status?: string) => [...leadKeys.all, "list", status ?? "all"] as const,
};

export function useLeads(status?: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: leadKeys.list(status),
    queryFn: async () => {
      let query = supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (status && status !== "all") {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Lead[];
    },
  });
}

export function useCreateLead() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: Omit<Lead, "id" | "created_at" | "status" | "source"> & {
        source?: string;
        status?: LeadStatus;
      }
    ) => {
      const { data, error } = await supabase
        .from("leads")
        .insert({
          ...payload,
          source: payload.source ?? "other",
          status: payload.status ?? "new",
        })
        .select()
        .single();

      if (error) throw error;
      return data as Lead;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.all });
    },
  });
}

export function useUpdateLeadStatus() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: LeadStatus }) => {
      const { data, error } = await supabase
        .from("leads")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Lead;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.all });
    },
  });
}
