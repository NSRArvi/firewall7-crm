"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/providers/toast-provider";

export type LeadStatus =
  | "new"
  | "contacted"
  | "proposal_sent"
  | "won"
  | "lost";

export type LeadSource =
  | "website_consultation"
  | "website_contact"
  | "referral"
  | "outbound"
  | "other";

export interface Lead {
  id: string;
  full_name: string;
  email: string;
  company_name: string | null;
  job_title: string | null;
  country_code: string | null;
  phone: string | null;
  topic: string | null;
  notes: string | null;
  source: LeadSource;
  status: LeadStatus;
  consultation_date: string | null;
  consultation_slot: string | null;
  timezone: string | null;
  assigned_to: string | null;
  assignee?: { id: string; full_name: string } | null;
  created_at: string;
}

export interface LeadActivity {
  id: string;
  lead_id: string;
  author_id: string | null;
  activity_type: string;
  content: string;
  follow_up_at: string | null;
  created_at: string;
  author?: { id: string; full_name: string } | null;
}

export const leadKeys = {
  all: ["leads"] as const,
  list: (status?: string) => [...leadKeys.all, "list", status ?? "all"] as const,
  activities: (leadId: string) => [...leadKeys.all, "activities", leadId] as const,
};

export function useLeads(status?: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: leadKeys.list(status),
    queryFn: async () => {
      let query = supabase
        .from("leads")
        .select("*, assignee:profiles!leads_assigned_to_fkey(id, full_name)")
        .order("created_at", { ascending: false });

      if (status && status !== "all") {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as unknown as Lead[];
    },
  });
}

export function useCreateLead() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (
      payload: Omit<Lead, "id" | "created_at" | "status" | "source" | "assigned_to" | "assignee"> & {
        source?: LeadSource;
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
      toast.success("Lead created");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateLead() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      full_name?: string;
      email?: string;
      company_name?: string | null;
      job_title?: string | null;
      country_code?: string | null;
      phone?: string | null;
      topic?: string | null;
      notes?: string | null;
      consultation_date?: string | null;
      consultation_slot?: string | null;
      timezone?: string | null;
      status?: LeadStatus;
      assigned_to?: string | null;
    }) => {
      const { data, error } = await supabase
        .from("leads")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Lead;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.all });
      toast.success("Lead updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteLead() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("leads").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.all });
      toast.success("Lead deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useLeadActivities(leadId: string | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: leadKeys.activities(leadId ?? ""),
    enabled: Boolean(leadId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lead_activities")
        .select("*, author:profiles!lead_activities_author_id_fkey(id, full_name)")
        .eq("lead_id", leadId!)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as unknown as LeadActivity[];
    },
  });
}

export function useAddLeadActivity() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (payload: {
      lead_id: string;
      activity_type: string;
      content: string;
      follow_up_at?: string | null;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("lead_activities")
        .insert({
          ...payload,
          author_id: user?.id ?? null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as LeadActivity;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: leadKeys.activities(variables.lead_id),
      });
      toast.success("Activity logged");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useConvertLeadToClient() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (lead: Lead) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error: clientError } = await supabase.from("clients").insert({
        company_name: lead.company_name || lead.full_name,
        contact_name: lead.full_name,
        email: lead.email,
        country_code: lead.country_code,
        phone: lead.phone,
        lead_id: lead.id,
        created_by: user?.id ?? null,
      });

      if (clientError) throw clientError;

      const { error: leadError } = await supabase
        .from("leads")
        .update({ status: "won", updated_at: new Date().toISOString() })
        .eq("id", lead.id);

      if (leadError) throw leadError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.all });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Lead converted to Client");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
