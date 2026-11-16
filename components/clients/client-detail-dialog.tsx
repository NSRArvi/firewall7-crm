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
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import {
  getSignedDocumentUrl,
  useAddClientCommunication,
  useClientCommunications,
  useClientDocuments,
  useClientHistory,
  useDeleteClientDocument,
  useUpdateClient,
  useUploadClientDocument,
  type ClientDocument,
  type ClientRecord,
} from "@/hooks/use-clients";
import { useToast } from "@/components/providers/toast-provider";
import {
  Building2,
  Mail,
  Phone,
  FileText,
  Upload,
  Download,
  Trash2,
  MessageSquare,
  History,
  Pencil,
} from "lucide-react";

interface ClientDetailDialogProps {
  client: ClientRecord | null;
  canEdit: boolean;
  canDelete: boolean;
  onClose: () => void;
}

export function ClientDetailDialog({
  client,
  canEdit,
  canDelete,
  onClose,
}: ClientDetailDialogProps) {
  const toast = useToast();
  const updateClient = useUpdateClient();
  const { data: documents = [], isLoading: docsLoading } = useClientDocuments(
    client?.id ?? null
  );
  const uploadDoc = useUploadClientDocument();
  const deleteDoc = useDeleteClientDocument();

  const { data: comms = [], isLoading: commsLoading } =
    useClientCommunications(client?.id ?? null);
  const addComm = useAddClientCommunication();

  const { data: history, isLoading: historyLoading } = useClientHistory(
    client?.id ?? null
  );

  const [tab, setTab] = useState<"profile" | "documents" | "comms" | "history">(
    "profile"
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    company_name: "",
    contact_name: "",
    email: "",
    phone: "",
    industry: "",
    address: "",
  });

  const [docToDelete, setDocToDelete] = useState<ClientDocument | null>(null);
  const [channel, setChannel] = useState("note");
  const [summary, setSummary] = useState("");

  if (!client) return null;

  const startEditing = () => {
    setEditForm({
      company_name: client.company_name,
      contact_name: client.contact_name,
      email: client.email,
      phone: client.phone ?? "",
      industry: client.industry ?? "",
      address: client.address ?? "",
    });
    setIsEditing(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateClient.mutateAsync({
      id: client.id,
      company_name: editForm.company_name,
      contact_name: editForm.contact_name,
      email: editForm.email,
      phone: editForm.phone || null,
      industry: editForm.industry || null,
      address: editForm.address || null,
    });
    setIsEditing(false);
    onClose();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadDoc.mutateAsync({ clientId: client.id, file });
    e.target.value = "";
  };

  const handleDownload = async (doc: ClientDocument) => {
    try {
      const url = await getSignedDocumentUrl(doc.file_path);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not download file"
      );
    }
  };

  const handleAddComm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim()) return;
    await addComm.mutateAsync({
      client_id: client.id,
      channel,
      summary: summary.trim(),
    });
    setSummary("");
  };

  return (
    <>
      <Dialog open={Boolean(client)} onOpenChange={(next) => !next && onClose()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto space-y-4">
          <DialogHeader>
            <div className="flex items-center justify-between gap-2">
              <DialogTitle>{client.company_name}</DialogTitle>
              {canEdit && tab === "profile" && !isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={startEditing}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </Button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span className="inline-flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" />
                {client.contact_name}
              </span>
              <span className="inline-flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" />
                {client.email}
              </span>
              {client.phone && (
                <span className="inline-flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  {client.phone}
                </span>
              )}
            </div>
          </DialogHeader>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            {(
              [
                { key: "profile", label: "Profile", icon: Building2 },
                { key: "documents", label: "Documents", icon: FileText },
                { key: "comms", label: "Communications", icon: MessageSquare },
                { key: "history", label: "History", icon: History },
              ] as const
            ).map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium cursor-pointer transition-colors ${
                    tab === t.key
                      ? "bg-[#f97316] text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: PROFILE */}
          {tab === "profile" &&
            (isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Company Name *</Label>
                    <Input
                      required
                      value={editForm.company_name}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          company_name: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Contact Name *</Label>
                    <Input
                      required
                      value={editForm.contact_name}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          contact_name: e.target.value,
                        })
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
                  <div className="space-y-1">
                    <Label>Phone</Label>
                    <Input
                      value={editForm.phone}
                      onChange={(e) =>
                        setEditForm({ ...editForm, phone: e.target.value })
                      }
                    />
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
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={updateClient.isPending}
                  >
                    {updateClient.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded bg-slate-50 dark:bg-slate-800/60">
                  <p className="text-slate-500">Industry</p>
                  <p className="font-medium mt-0.5">
                    {client.industry || "—"}
                  </p>
                </div>
                <div className="p-3 rounded bg-slate-50 dark:bg-slate-800/60">
                  <p className="text-slate-500">Address</p>
                  <p className="font-medium mt-0.5">
                    {client.address || "—"}
                  </p>
                </div>
              </div>
            ))}

          {/* TAB 2: DOCUMENTS */}
          {tab === "documents" && (
            <div className="space-y-3">
              {canEdit && (
                <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-medium cursor-pointer">
                  <Upload className="h-3.5 w-3.5" />
                  <span>
                    {uploadDoc.isPending ? "Uploading..." : "Upload Document"}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploadDoc.isPending}
                  />
                </label>
              )}

              {docsLoading ? (
                <p className="text-xs text-slate-500">Loading documents...</p>
              ) : documents.length === 0 ? (
                <p className="text-xs text-slate-500">
                  No documents uploaded yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 rounded bg-slate-50 dark:bg-slate-800/60 text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-medium truncate">{doc.file_name}</p>
                        <p className="text-[11px] text-slate-500">
                          {doc.file_size
                            ? `${(doc.file_size / 1024).toFixed(1)} KB`
                            : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleDownload(doc)}
                          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                          aria-label="Download"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                        {canDelete && (
                          <button
                            onClick={() => setDocToDelete(doc)}
                            className="p-1.5 rounded text-red-500 hover:bg-red-500/10 cursor-pointer"
                            aria-label="Delete document"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: COMMUNICATIONS */}
          {tab === "comms" && (
            <div className="space-y-3">
              {canEdit && (
                <form onSubmit={handleAddComm} className="flex gap-2">
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
                  <Button
                    type="submit"
                    size="sm"
                    disabled={addComm.isPending}
                  >
                    Log
                  </Button>
                </form>
              )}

              {commsLoading ? (
                <p className="text-xs text-slate-500">
                  Loading communications...
                </p>
              ) : comms.length === 0 ? (
                <p className="text-xs text-slate-500">
                  No communication records yet.
                </p>
              ) : (
                <div className="space-y-2 max-h-52 overflow-y-auto">
                  {comms.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1"
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
          )}

          {/* TAB 4: QUOTATION, INVOICE & PROJECT HISTORY */}
          {tab === "history" && (
            <div className="space-y-4 text-xs">
              {historyLoading ? (
                <p className="text-slate-500">Loading history...</p>
              ) : (
                <>
                  <div>
                    <h4 className="font-semibold mb-1.5">
                      Quotations ({history?.quotations.length ?? 0})
                    </h4>
                    {history?.quotations.length === 0 ? (
                      <p className="text-slate-500">No quotations yet.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {history?.quotations.map((q) => (
                          <div
                            key={q.id}
                            className="flex justify-between p-2.5 rounded bg-slate-50 dark:bg-slate-800/60"
                          >
                            <span className="font-medium">
                              {q.quote_number}
                            </span>
                            <span className="capitalize">
                              {q.status} · ${Number(q.total).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold mb-1.5">
                      Invoices ({history?.invoices.length ?? 0})
                    </h4>
                    {history?.invoices.length === 0 ? (
                      <p className="text-slate-500">No invoices yet.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {history?.invoices.map((inv) => (
                          <div
                            key={inv.id}
                            className="flex justify-between p-2.5 rounded bg-slate-50 dark:bg-slate-800/60"
                          >
                            <span className="font-medium">
                              {inv.invoice_number}
                            </span>
                            <span className="capitalize">
                              {inv.status.replace("_", " ")} · $
                              {Number(inv.total).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold mb-1.5">
                      Projects ({history?.projects.length ?? 0})
                    </h4>
                    {history?.projects.length === 0 ? (
                      <p className="text-slate-500">No projects yet.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {history?.projects.map((p) => (
                          <div
                            key={p.id}
                            className="flex justify-between p-2.5 rounded bg-slate-50 dark:bg-slate-800/60"
                          >
                            <span className="font-medium">{p.name}</span>
                            <span className="capitalize">
                              {p.status.replace("_", " ")}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDeleteModal
        open={Boolean(docToDelete)}
        title="Delete Document"
        description={`Are you sure you want to delete "${docToDelete?.file_name ?? ""}"?`}
        isPending={deleteDoc.isPending}
        onConfirm={async () => {
          if (!docToDelete) return;
          await deleteDoc.mutateAsync(docToDelete);
          setDocToDelete(null);
        }}
        onCancel={() => setDocToDelete(null)}
      />
    </>
  );
}
