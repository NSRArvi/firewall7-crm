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
import { COUNTRY_CODES, CONSULTATION_SLOTS, TIMEZONES } from "@/lib/lead-options";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAddLeadActivity,
  useConvertLeadToClient,
  useLeadActivities,
  useUpdateLead,
  type Lead,
  type LeadStatus,
} from "@/hooks/use-leads";
import { UserCheck, Calendar, Building2, Mail, Phone, Clock, Pencil } from "lucide-react";

interface LeadDetailDialogProps {
  lead: Lead | null;
  teamMembers: { id: string; full_name: string }[];
  canEdit: boolean;
  onClose: () => void;
}

const STATUS_OPTIONS: { label: string; value: LeadStatus }[] = [
  { label: "New", value: "new" },
  { label: "Contacted", value: "contacted" },
  { label: "Proposal Sent", value: "proposal_sent" },
  { label: "Won", value: "won" },
  { label: "Lost", value: "lost" },
];

export function LeadDetailDialog({
  lead,
  teamMembers,
  canEdit,
  onClose,
}: LeadDetailDialogProps) {
  const updateLead = useUpdateLead();
  const convertToClient = useConvertLeadToClient();
  const { data: activities = [], isLoading: activitiesLoading } =
    useLeadActivities(lead?.id ?? null);
  const addActivity = useAddLeadActivity();

  const [activityType, setActivityType] = useState("note");
  const [content, setContent] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpTime, setFollowUpTime] = useState("10:00");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: "",
    email: "",
    company_name: "",
    job_title: "",
    country_code: "+61",
    phone: "",
    topic: "",
    notes: "",
    consultation_date: "",
    consultation_slot: "",
    timezone: "",
  });

  if (!lead) return null;

  const startEditing = () => {
    setEditForm({
      full_name: lead.full_name,
      email: lead.email,
      company_name: lead.company_name ?? "",
      job_title: lead.job_title ?? "",
      country_code: lead.country_code ?? "+61",
      phone: lead.phone ?? "",
      topic: lead.topic ?? "",
      notes: lead.notes ?? "",
      consultation_date: lead.consultation_date ?? "",
      consultation_slot: lead.consultation_slot ?? "",
      timezone: lead.timezone ?? "",
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateLead.mutateAsync({
      id: lead.id,
      full_name: editForm.full_name,
      email: editForm.email,
      company_name: editForm.company_name || null,
      job_title: editForm.job_title || null,
      country_code: editForm.phone ? editForm.country_code || null : null,
      phone: editForm.phone || null,
      topic: editForm.topic || null,
      notes: editForm.notes || null,
      consultation_date: editForm.consultation_date || null,
      consultation_slot: editForm.consultation_slot || null,
      timezone: editForm.timezone || null,
    });
    setIsEditing(false);
    onClose();
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    const followUpAt = followUpDate
      ? new Date(`${followUpDate}T${followUpTime || "10:00"}:00`).toISOString()
      : null;
    await addActivity.mutateAsync({
      lead_id: lead.id,
      activity_type: activityType,
      content: content.trim(),
      follow_up_at: followUpAt,
    });
    setContent("");
    setFollowUpDate("");
    setFollowUpTime("10:00");
  };

  return (
    <Dialog open={Boolean(lead)} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto space-y-5">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2">
            <DialogTitle>{lead.full_name}</DialogTitle>
            {canEdit && !isEditing && (
              <Button type="button" variant="outline" size="sm" onClick={startEditing}>
                <Pencil className="h-3.5 w-3.5" />
                <span>Edit Info</span>
              </Button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1">
            <span className="inline-flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" />
              {lead.email}
            </span>
            {lead.company_name && (
              <span className="inline-flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" />
                {lead.company_name}
              </span>
            )}
            {lead.phone && (
              <span className="inline-flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" />
                {lead.country_code ? `${lead.country_code} ` : ""}
                {lead.phone}
              </span>
            )}
            {lead.consultation_date && (
              <span className="inline-flex items-center gap-1 text-[#f97316] font-medium">
                <Calendar className="h-3.5 w-3.5" />
                {lead.consultation_date} {lead.consultation_slot ?? ""}
              </span>
            )}
          </div>
        </DialogHeader>

        {isEditing && (
          <form onSubmit={handleSaveEdit} className="space-y-3 p-3.5 rounded bg-white/40 dark:bg-slate-800/40 border border-white/30 dark:border-white/10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <Label>Full Name *</Label>
                <Input
                  required
                  placeholder="Full Name *"
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Email *</Label>
                <Input
                  required
                  type="email"
                  placeholder="Email *"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Company Name</Label>
                <Input
                  placeholder="Company Name"
                  value={editForm.company_name}
                  onChange={(e) => setEditForm({ ...editForm, company_name: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Job Title</Label>
                <Input
                  placeholder="Job Title"
                  value={editForm.job_title}
                  onChange={(e) => setEditForm({ ...editForm, job_title: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Country Code</Label>
                <Select
                  value={editForm.country_code || "+61"}
                  onValueChange={(val) => setEditForm({ ...editForm, country_code: val })}
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
              <div className="space-y-1">
                <Label>Phone</Label>
                <Input
                  placeholder="Phone"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Topic</Label>
                <Input
                  placeholder="Topic"
                  value={editForm.topic}
                  onChange={(e) => setEditForm({ ...editForm, topic: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Consultation Date</Label>
                <DatePicker
                  value={editForm.consultation_date}
                  onChange={(val) => setEditForm({ ...editForm, consultation_date: val })}
                  placeholder="Consultation Date"
                />
              </div>
              <div className="space-y-1">
                <Label>Time Slot</Label>
                <Select
                  value={editForm.consultation_slot || "none"}
                  onValueChange={(val) =>
                    setEditForm({
                      ...editForm,
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
              <div className="space-y-1">
                <Label>Timezone</Label>
                <Select
                  value={editForm.timezone || "(GMT+11:00) Sydney, Melbourne"}
                  onValueChange={(val) => setEditForm({ ...editForm, timezone: val })}
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
            </div>
            <div className="space-y-1">
              <Label>Notes</Label>
              <Input
                placeholder="Notes"
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={updateLead.isPending}>
                {updateLead.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        )}

        {lead.topic && !isEditing && (
          <div className="p-3 rounded bg-white/40 dark:bg-slate-800/40 border border-white/30 dark:border-white/10 text-xs">
            <span className="font-semibold">Topic:</span> {lead.topic}
          </div>
        )}

        {/* Controls: Status, Assignee, Convert */}
        {canEdit && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div className="space-y-1">
              <Label>Status</Label>
              <Select
                value={lead.status}
                onValueChange={(val) =>
                  updateLead.mutate({ id: lead.id, status: val as LeadStatus })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Assigned To</Label>
              <Select
                value={lead.assigned_to ?? "unassigned"}
                onValueChange={(val) =>
                  updateLead.mutate({
                    id: lead.id,
                    assigned_to: val === "unassigned" ? null : val,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {teamMembers.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="button"
              disabled={lead.status === "won" || convertToClient.isPending}
              onClick={async () => {
                await convertToClient.mutateAsync(lead);
                onClose();
              }}
            >
              <UserCheck className="h-4 w-4" />
              <span>
                {lead.status === "won" ? "Converted" : "Convert to Client"}
              </span>
            </Button>
          </div>
        )}

        {/* Follow-up & Activity Log */}
        <div className="space-y-3 pt-2 border-t border-white/20 dark:border-white/10">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Follow-ups & Notes
          </h3>

          {canEdit && (
            <form onSubmit={handleAddActivity} className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Select value={activityType} onValueChange={setActivityType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="note">Note</SelectItem>
                    <SelectItem value="call">Call</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                  </SelectContent>
                </Select>
                <DatePicker
                  value={followUpDate}
                  onChange={setFollowUpDate}
                  placeholder="Follow-up date"
                  className="h-9 text-xs"
                />
                <Select value={followUpTime} onValueChange={setFollowUpTime}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Time" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "09:00",
                      "09:30",
                      "10:00",
                      "10:30",
                      "11:00",
                      "11:30",
                      "12:00",
                      "13:00",
                      "14:00",
                      "15:00",
                      "16:00",
                      "17:00",
                    ].map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Input
                  required
                  placeholder="Add a note or follow-up summary..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="h-9 text-xs"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={addActivity.isPending}
                >
                  {addActivity.isPending ? "Saving..." : "Log"}
                </Button>
              </div>
            </form>
          )}

          <div className="space-y-2 max-h-52 overflow-y-auto">
            {activitiesLoading ? (
              <p className="text-xs text-slate-500">Loading activities...</p>
            ) : activities.length === 0 ? (
              <p className="text-xs text-slate-500">
                No activities logged yet.
              </p>
            ) : (
              activities.map((act) => (
                <div
                  key={act.id}
                  className="p-2.5 rounded bg-white/40 dark:bg-slate-800/40 border border-white/30 dark:border-white/10 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-semibold uppercase text-[#f97316]">
                      {act.activity_type}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(act.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-800 dark:text-slate-200">
                    {act.content}
                  </p>
                  {act.follow_up_at && (
                    <p className="text-[11px] text-[#f97316]">
                      Follow-up: {new Date(act.follow_up_at).toLocaleString()}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
