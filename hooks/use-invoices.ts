"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/providers/toast-provider";

export type InvoiceStatus =
  | "unpaid"
  | "partially_paid"
  | "paid"
  | "overdue"
  | "cancelled";

export interface PaymentRecord {
  id: string;
  invoice_id: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  reference_number: string | null;
  created_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  client_id: string;
  quotation_id: string | null;
  status: InvoiceStatus;
  subtotal: number;
  tax_rate: number;
  discount_amount: number;
  total: number;
  amount_paid: number;
  due_date: string;
  created_at: string;
  client?: {
    id: string;
    company_name: string;
    contact_name: string;
    email: string;
  } | null;
  quotation?: { id: string; quote_number: string } | null;
  payments?: PaymentRecord[];
}

export const invoiceKeys = {
  all: ["invoices"] as const,
  list: (status?: string) => [...invoiceKeys.all, "list", status ?? "all"] as const,
};

export function useInvoices(status?: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: invoiceKeys.list(status),
    queryFn: async () => {
      let query = supabase
        .from("invoices")
        .select(
          "*, client:clients(id, company_name, contact_name, email), quotation:quotations(id, quote_number), payments(*)"
        )
        .order("created_at", { ascending: false });

      if (status && status !== "all") {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as unknown as Invoice[];
    },
  });
}

export function useCreateInvoice() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (payload: {
      client_id: string;
      quotation_id?: string | null;
      subtotal: number;
      tax_rate: number;
      discount_amount: number;
      due_date: string;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const taxAmount = payload.subtotal * (payload.tax_rate / 100);
      const total = Math.max(
        0,
        payload.subtotal + taxAmount - payload.discount_amount
      );
      const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(
        1000 + Math.random() * 9000
      )}`;

      const { data, error } = await supabase
        .from("invoices")
        .insert({
          invoice_number: invoiceNumber,
          client_id: payload.client_id,
          quotation_id: payload.quotation_id || null,
          status: "unpaid",
          subtotal: payload.subtotal,
          tax_rate: payload.tax_rate,
          discount_amount: payload.discount_amount,
          total,
          amount_paid: 0,
          due_date: payload.due_date,
          created_by: user?.id ?? null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
      toast.success("Invoice created");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useRecordPayment() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (payload: {
      invoice: Invoice;
      amount: number;
      payment_method: string;
      payment_date: string;
      reference_number?: string | null;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error: payError } = await supabase.from("payments").insert({
        invoice_id: payload.invoice.id,
        amount: payload.amount,
        payment_method: payload.payment_method,
        payment_date: payload.payment_date,
        reference_number: payload.reference_number || null,
        recorded_by: user?.id ?? null,
      });

      if (payError) throw payError;

      const newAmountPaid =
        Number(payload.invoice.amount_paid) + Number(payload.amount);
      const total = Number(payload.invoice.total);
      const newStatus: InvoiceStatus =
        newAmountPaid >= total
          ? "paid"
          : newAmountPaid > 0
            ? "partially_paid"
            : payload.invoice.status;

      const { error: invError } = await supabase
        .from("invoices")
        .update({
          amount_paid: newAmountPaid,
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", payload.invoice.id);

      if (invError) throw invError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
      toast.success("Payment recorded");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateInvoiceStatus() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: InvoiceStatus;
    }) => {
      const { error } = await supabase
        .from("invoices")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
      toast.success("Invoice status updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteInvoice() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("invoices").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
      toast.success("Invoice deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
