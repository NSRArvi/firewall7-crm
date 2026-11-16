"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAddClientCommunication,
  useClientCommunications,
} from "@/hooks/use-clients";

export function ClientCommsTab({
  clientId,
  canEdit,
}: {
  clientId: string;
  canEdit: boolean;
}) {
  const { data: comms = [], isLoading } = useClientCommunications(clientId);
  const addComm = useAddClientCommunication();
  const [channel, setChannel] = useState("note");
  const [summary, setSummary] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim()) return;
    await addComm.mutateAsync({
      client_id: clientId,
      channel,
      summary: summary.trim(),
    });
    setSummary("");
  };

  return (
    <div className="space-y-3">
      {canEdit && (
        <form onSubmit={handleAdd} className="flex gap-2">
          <Select value={channel} onValueChange={setChannel}>
            <SelectTrigger className="w-[110px] h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="note">Note</SelectItem>
              <SelectItem value="call">Call</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="meeting">Meeting</SelectItem>
            </SelectContent>
          </Select>
          <Input
            required
            placeholder="Log communication summary..."
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="h-9 text-xs"
          />
          <Button type="submit" size="sm" disabled={addComm.isPending}>
            Log
          </Button>
        </form>
      )}

      {isLoading ? (
        <p className="text-xs text-slate-500">Loading communications...</p>
      ) : comms.length === 0 ? (
        <p className="text-xs text-slate-500">No communication records yet.</p>
      ) : (
        <div className="space-y-2">
          {comms.map((c) => (
            <div
              key={c.id}
              className="p-3 rounded bg-white/50 dark:bg-slate-800/40 text-xs space-y-1"
            >
              <div className="flex justify-between text-[11px] text-slate-500">
                <span className="font-semibold uppercase text-[#f97316]">
                  {c.channel}
                </span>
                <span>{new Date(c.created_at).toLocaleString()}</span>
              </div>
              <p>{c.summary}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
