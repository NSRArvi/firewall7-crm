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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COUNTRY_CODES } from "@/lib/lead-options";
import { useCreateClient } from "@/hooks/use-clients";

interface CreateClientDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateClientDialog({ open, onClose }: CreateClientDialogProps) {
  const createClient = useCreateClient();
  const [form, setForm] = useState({
    company_name: "",
    contact_name: "",
    email: "",
    country_code: "+61",
    phone: "",
    industry: "",
    address: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company_name || !form.contact_name || !form.email) return;

    await createClient.mutateAsync({
      company_name: form.company_name,
      contact_name: form.contact_name,
      email: form.email,
      country_code: form.phone ? form.country_code || null : null,
      phone: form.phone || null,
      industry: form.industry || null,
      address: form.address || null,
    });

    setForm({
      company_name: "",
      contact_name: "",
      email: "",
      country_code: "+61",
      phone: "",
      industry: "",
      address: "",
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-lg space-y-4">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label>Company Name *</Label>
            <Input
              required
              placeholder="Apex FinTech Pty Ltd"
              value={form.company_name}
              onChange={(e) =>
                setForm({ ...form, company_name: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Contact Name *</Label>
              <Input
                required
                placeholder="Noor Washe"
                value={form.contact_name}
                onChange={(e) =>
                  setForm({ ...form, contact_name: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Email *</Label>
              <Input
                required
                type="email"
                placeholder="noor@apexfintech.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label>Country Code</Label>
              <Select
                value={form.country_code}
                onValueChange={(val) =>
                  setForm({ ...form, country_code: val })
                }
              >
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRY_CODES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label>Phone</Label>
              <Input
                placeholder="412 345 678"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Industry</Label>
            <Input
              placeholder="FinTech / Healthcare"
              value={form.industry}
              onChange={(e) => setForm({ ...form, industry: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label>Address</Label>
            <Input
              placeholder="123 Collins St, Melbourne VIC"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createClient.isPending}>
              {createClient.isPending ? "Saving..." : "Save Client"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
