"use client";

import React, { useState } from "react";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import {
  getSignedDocumentUrl,
  useClientDocuments,
  useDeleteClientDocument,
  useUploadClientDocument,
  type ClientDocument,
} from "@/hooks/use-clients";
import { useToast } from "@/components/providers/toast-provider";
import { Download, Trash2, Upload } from "lucide-react";

interface ClientDocumentsTabProps {
  clientId: string;
  canEdit: boolean;
  canDelete: boolean;
}

export function ClientDocumentsTab({
  clientId,
  canEdit,
  canDelete,
}: ClientDocumentsTabProps) {
  const toast = useToast();
  const { data: documents = [], isLoading } = useClientDocuments(clientId);
  const uploadDoc = useUploadClientDocument();
  const deleteDoc = useDeleteClientDocument();
  const [docToDelete, setDocToDelete] = useState<ClientDocument | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadDoc.mutateAsync({ clientId, file });
    e.target.value = "";
  };

  const handleDownload = async (doc: ClientDocument) => {
    try {
      const url = await getSignedDocumentUrl(doc.file_path);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not download file");
    }
  };

  return (
    <div className="space-y-3">
      {canEdit && (
        <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-medium cursor-pointer">
          <Upload className="h-3.5 w-3.5" />
          <span>{uploadDoc.isPending ? "Uploading..." : "Upload Document"}</span>
          <input
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploadDoc.isPending}
          />
        </label>
      )}

      {isLoading ? (
        <p className="text-xs text-slate-500">Loading documents...</p>
      ) : documents.length === 0 ? (
        <p className="text-xs text-slate-500">No documents uploaded yet.</p>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-3 rounded bg-white/50 dark:bg-slate-800/40 text-xs"
            >
              <div className="min-w-0">
                <p className="font-medium truncate">{doc.file_name}</p>
                <p className="text-[11px] text-slate-500">
                  {doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : ""}
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
    </div>
  );
}
