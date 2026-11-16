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
import { useCreateLead, type LeadSource } from "@/hooks/use-leads";
import { COUNTRY_CODES, CONSULTATION_SLOTS, TIMEZONES } from "@/lib/lead-options";

interface CreateLeadDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateLeadDialog({ open, onClose }: CreateLeadDialogProps) {
  const createLead = useCreateLead();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    company_name: "",
    job_title: "",
    country_code: "+61",
    phone: "",
    topic: "",
    source: "other" as LeadSource,
    consultation_date: "",
    consultation_slot: "",
    timezone: "(GMT+11:00) Sydney, Melbourne",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.email) return;

    await createLead.mutateAsync({
      full_name: form.full_name,
      email: form.email,
      company_name: form.company_name || null,
      job_title: form.job_title || null,
      country_code: form.phone ? form.country_code || null : null,
      phone: form.phone || null,
      topic: form.topic || null,
      notes: form.notes || null,
      source: form.source,
      consultation_date: form.consultation_date || null,
      consultation_slot: form.consultation_slot || null,
      timezone: form.consultation_date ? form.timezone || null : null,
    });

    setForm({
      full_name: "",
      email: "",
      company_name: "",
      job_title: "",
      country_code: "+61",
      phone: "",
      topic: "",
      source: "other",
      consultation_date: "",
      consultation_slot: "",
      timezone: "(GMT+11:00) Sydney, Melbourne",
      notes: "",
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto space-y-4">
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label>Full Name *</Label>
            <Input
              required
              placeholder="Noor Washe"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label>Email *</Label>
            <Input
              required
              type="email"
              placeholder="noor@company.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Company Name</Label>
              <Input
                placeholder="Apex FinTech"
                value={form.company_name}
                onChange={(e) =>
                  setForm({ ...form, company_name: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Job Title</Label>
              <Input
                placeholder="CTO"
                value={form.job_title}
                onChange={(e) =>
                  setForm({ ...form, job_title: e.target.value })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label>Country Code</Label>
              <Select
                value={form.country_code}
                onValueChange={(val) => setForm({ ...form, country_code: val })}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Lead Source</Label>
              <Select
                value={form.source}
                onValueChange={(val) =>
                  setForm({ ...form, source: val as LeadSource })
                }
              >
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="other">Manual / Other</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="outbound">Outbound</SelectItem>
                  <SelectItem value="website_contact">Website Contact</SelectItem>
                  <SelectItem value="website_consultation">
                    Website Consultation
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Topic / Service Interest</Label>
              <Input
                placeholder="Penetration Testing & SOC Audit"
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Consultation Date</Label>
              <DatePicker
                value={form.consultation_date}
                onChange={(val) => setForm({ ...form, consultation_date: val })}
                placeholder="Pick a date"
              />
            </div>
            <div className="space-y-1">
              <Label>Time Slot</Label>
              <Select
                value={form.consultation_slot || "none"}
                onValueChange={(val) =>
                  setForm({
                    ...form,
                    consultation_slot: val === "none" ? "" : val,
                  })
                }
              >
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue placeholder="Time Slot" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Slot</SelectItem>
                  {CONSULTATION_SLOTS.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label>Timezone</Label>
            <Select
              value={form.timezone}
              onValueChange={(val) => setForm({ ...form, timezone: val })}
            >
              <SelectTrigger className="h-10 text-sm">
                <SelectValue placeholder="Timezone" />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Notes</Label>
            <Input
              placeholder="Additional notes..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createLead.isPending}>
              {createLead.isPending ? "Saving..." : "Save Lead"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
