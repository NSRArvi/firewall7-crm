"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/providers/toast-provider";

export type QuotationStatus =
  | "draft"
  | "sent"
  | "approved"
  | "rejected"
  | "expired";

export interface QuotationItem {
  id?: string;
  quotation_id?: string;
  service_id: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Quotation {
  id: string;
  quote_number: string;
  client_id: string;
  status: QuotationStatus;
  subtotal: number;
  tax_rate: number;
  discount_amount: number;
  total: number;
  valid_until: string | null;
  notes: string | null;
  created_at: string;
  client?: {
    id: string;
    company_name: string;
    contact_name: string;
    email: string;
  } | null;
  items?: QuotationItem[];
}

export const quotationKeys = {
  all: ["quotations"] as const,
  list: (status?: string) => [...quotationKeys.all, "list", status ?? "all"] as const,
};

export function useQuotations(status?: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: quotationKeys.list(status),
    queryFn: async () => {
      let query = supabase
        .from("quotations")
        .select(
          "*, client:clients(id, company_name, contact_name, email), items:quotation_items(*)"
        )
        .order("created_at", { ascending: false });

      if (status && status !== "all") {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as unknown as Quotation[];
    },
  });
}

export function useCreateQuotation() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (payload: {
      client_id: string;
      tax_rate: number;
      discount_amount: number;
      valid_until: string | null;
      notes: string | null;
      items: QuotationItem[];
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const subtotal = payload.items.reduce(
        (sum, item) => sum + item.quantity * item.unit_price,
        0
      );
      const taxAmount = subtotal * (payload.tax_rate / 100);
      const total = Math.max(0, subtotal + taxAmount - payload.discount_amount);
      const quoteNumber = `QT-${new Date().getFullYear()}-${Math.floor(
        1000 + Math.random() * 9000
      )}`;

      const { data: quotation, error } = await supabase
        .from("quotations")
        .insert({
          quote_number: quoteNumber,
          client_id: payload.client_id,
          status: "draft",
          subtotal,
          tax_rate: payload.tax_rate,
          discount_amount: payload.discount_amount,
          total,
          valid_until: payload.valid_until || null,
          notes: payload.notes || null,
          created_by: user?.id ?? null,
        })
        .select()
        .single();

      if (error) throw error;

      if (payload.items.length > 0) {
        const { error: itemsError } = await supabase
          .from("quotation_items")
          .insert(
            payload.items.map((item) => ({
              quotation_id: quotation.id,
              service_id: item.service_id || null,
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unit_price,
              total: item.quantity * item.unit_price,
            }))
          );
        if (itemsError) throw itemsError;
      }

      return quotation as Quotation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quotationKeys.all });
      toast.success("Quotation created");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateQuotation() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (payload: {
      id: string;
      client_id: string;
      tax_rate: number;
      discount_amount: number;
      valid_until: string | null;
      notes: string | null;
      items: QuotationItem[];
    }) => {
      const subtotal = payload.items.reduce(
        (sum, item) => sum + item.quantity * item.unit_price,
        0
      );
      const taxAmount = subtotal * (payload.tax_rate / 100);
      const total = Math.max(0, subtotal + taxAmount - payload.discount_amount);

      const { error } = await supabase
        .from("quotations")
        .update({
          client_id: payload.client_id,
          subtotal,
          tax_rate: payload.tax_rate,
          discount_amount: payload.discount_amount,
          total,
          valid_until: payload.valid_until || null,
          notes: payload.notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", payload.id);

      if (error) throw error;

      await supabase
        .from("quotation_items")
        .delete()
        .eq("quotation_id", payload.id);

      if (payload.items.length > 0) {
        const { error: itemsError } = await supabase
          .from("quotation_items")
          .insert(
            payload.items.map((item) => ({
              quotation_id: payload.id,
              service_id: item.service_id || null,
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unit_price,
              total: item.quantity * item.unit_price,
            }))
          );
        if (itemsError) throw itemsError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quotationKeys.all });
      toast.success("Quotation updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useSendQuotationEmail() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (quotationId: string) => {
      const res = await fetch("/api/quotations/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quotationId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to send email");
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quotationKeys.all });
      toast.success("Quotation emailed to client and marked as Sent");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateQuotationStatus() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: QuotationStatus;
    }) => {
      const { error } = await supabase
        .from("quotations")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quotationKeys.all });
      toast.success("Quotation status updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteQuotation() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("quotations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quotationKeys.all });
      toast.success("Quotation deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
