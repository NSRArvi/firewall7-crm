"use client";

import React, { useState, useEffect } from "react";
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
import { useUpdateClient, type ClientRecord } from "@/hooks/use-clients";

interface ClientProfileTabProps {
  client: ClientRecord;
  isEditing: boolean;
  onStopEditing: () => void;
}

export function ClientProfileTab({
  client,
  isEditing,
  onStopEditing,
}: ClientProfileTabProps) {
  const updateClient = useUpdateClient();
  const [editForm, setEditForm] = useState({
    company_name: client.company_name,
    contact_name: client.contact_name,
    email: client.email,
    country_code: client.country_code ?? "+61",
    phone: client.phone ?? "",
    industry: client.industry ?? "",
    address: client.address ?? "",
  });

  useEffect(() => {
    setEditForm({
      company_name: client.company_name,
      contact_name: client.contact_name,
      email: client.email,
      country_code: client.country_code ?? "+61",
      phone: client.phone ?? "",
      industry: client.industry ?? "",
      address: client.address ?? "",
    });
  }, [client, isEditing]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateClient.mutateAsync({
      id: client.id,
      company_name: editForm.company_name,
      contact_name: editForm.contact_name,
      email: editForm.email,
      country_code: editForm.phone ? editForm.country_code || null : null,
      phone: editForm.phone || null,
      industry: editForm.industry || null,
      address: editForm.address || null,
    });
    onStopEditing();
  };

  if (!isEditing) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="p-3.5 rounded bg-white/50 dark:bg-slate-800/40">
          <p className="text-slate-500">Industry</p>
          <p className="font-medium mt-1">{client.industry || "—"}</p>
        </div>
        <div className="p-3.5 rounded bg-white/50 dark:bg-slate-800/40">
          <p className="text-slate-500">Address</p>
          <p className="font-medium mt-1">{client.address || "—"}</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Company Name *</Label>
          <Input
            required
            value={editForm.company_name}
            onChange={(e) =>
              setEditForm({ ...editForm, company_name: e.target.value })
            }
          />
        </div>
        <div className="space-y-1">
          <Label>Contact Name *</Label>
          <Input
            required
            value={editForm.contact_name}
            onChange={(e) =>
              setEditForm({ ...editForm, contact_name: e.target.value })
            }
          />
        </div>
        <div className="space-y-1">
          <Label>Email *</Label>
          <Input
            required
            type="email"
            value={editForm.email}
            onChange={(e) =>
              setEditForm({ ...editForm, email: e.target.value })
            }
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <Label>Country Code</Label>
            <Select
              value={editForm.country_code || "+61"}
              onValueChange={(val) =>
                setEditForm({ ...editForm, country_code: val })
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
          <div className="space-y-1 col-span-2">
            <Label>Phone</Label>
            <Input
              value={editForm.phone}
              onChange={(e) =>
                setEditForm({ ...editForm, phone: e.target.value })
              }
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label>Industry</Label>
          <Input
            value={editForm.industry}
            onChange={(e) =>
              setEditForm({ ...editForm, industry: e.target.value })
            }
          />
        </div>
        <div className="space-y-1">
          <Label>Address</Label>
          <Input
            value={editForm.address}
            onChange={(e) =>
              setEditForm({ ...editForm, address: e.target.value })
            }
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onStopEditing}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={updateClient.isPending}>
          {updateClient.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
