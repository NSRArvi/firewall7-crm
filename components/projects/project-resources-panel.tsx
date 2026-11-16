"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getSignedProjectDocUrl,
  useAddProjectLink,
  useDeleteProjectDocument,
  useDeleteProjectLink,
  useProjectDocuments,
  useProjectLinks,
  useUploadProjectDocument,
  type Project,
} from "@/hooks/use-projects";
import { useToast } from "@/components/providers/toast-provider";
import { Download, ExternalLink, Link2, Trash2, Upload } from "lucide-react";

interface ProjectResourcesPanelProps {
  project: Project;
  canEdit: boolean;
  canDelete: boolean;
}

export function ProjectResourcesPanel({
  project,
  canEdit,
  canDelete,
}: ProjectResourcesPanelProps) {
  const toast = useToast();
  const { data: documents = [] } = useProjectDocuments(project.id);
  const { data: links = [] } = useProjectLinks(project.id);
  const uploadDoc = useUploadProjectDocument();
  const deleteDoc = useDeleteProjectDocument();
  const addLink = useAddProjectLink();
  const deleteLink = useDeleteProjectLink();

  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  return (
    <div className="space-y-4">
      {/* Project Info */}
      <div className="liquid-glass rounded p-5 space-y-3">
        <h2 className="font-semibold text-sm text-slate-900 dark:text-white">
          Project Info
        </h2>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Client</span>
            <span className="font-medium">
              {project.client?.company_name ?? "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Manager</span>
            <span className="font-medium">
              {project.manager?.full_name ?? "Unassigned"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Start Date</span>
            <span className="font-medium">{project.start_date || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Deadline</span>
            <span className="font-medium text-[#f97316]">
              {project.deadline || "—"}
            </span>
          </div>
          {project.description && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <p className="text-slate-500 mb-1">Description</p>
              <p className="text-slate-700 dark:text-slate-300">
                {project.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Documents */}
      <div className="liquid-glass rounded p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm text-slate-900 dark:text-white">
            Documents ({documents.length})
          </h2>
          {canEdit && (
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-medium cursor-pointer">
              <Upload className="h-3.5 w-3.5" />
              <span>{uploadDoc.isPending ? "Uploading..." : "Upload"}</span>
              <input
                type="file"
                className="hidden"
                disabled={uploadDoc.isPending}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  await uploadDoc.mutateAsync({ projectId: project.id, file });
                  e.target.value = "";
                }}
              />
            </label>
          )}
        </div>

        {documents.length === 0 ? (
          <p className="text-xs text-slate-500">No documents uploaded yet.</p>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-2.5 rounded bg-white/60 dark:bg-slate-800/40 text-xs"
              >
                <span className="font-medium truncate">{doc.file_name}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={async () => {
                      try {
                        const url = await getSignedProjectDocUrl(doc.file_path);
                        window.open(url, "_blank", "noopener,noreferrer");
                      } catch (err) {
                        toast.error(
                          err instanceof Error ? err.message : "Download failed"
                        );
                      }
                    }}
                    className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                    aria-label="Download"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                  {canDelete && (
                    <button
                      onClick={() => deleteDoc.mutate(doc)}
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

      {/* Links */}
      <div className="liquid-glass rounded p-5 space-y-3">
        <h2 className="font-semibold text-sm text-slate-900 dark:text-white">
          Links ({links.length})
        </h2>

        {canEdit && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!linkTitle.trim() || !linkUrl.trim()) return;
              await addLink.mutateAsync({
                project_id: project.id,
                title: linkTitle.trim(),
                url: linkUrl.trim(),
              });
              setLinkTitle("");
              setLinkUrl("");
            }}
            className="space-y-2"
          >
            <Input
              required
              placeholder="Label (e.g. Figma)"
              value={linkTitle}
              onChange={(e) => setLinkTitle(e.target.value)}
              className="h-9 text-xs"
            />
            <div className="flex gap-2">
              <Input
                required
                type="url"
                placeholder="https://..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="h-9 text-xs"
              />
              <Button type="submit" size="sm" disabled={addLink.isPending}>
                <Link2 className="h-3.5 w-3.5" />
                <span>Add</span>
              </Button>
            </div>
          </form>
        )}

        {links.length === 0 ? (
          <p className="text-xs text-slate-500">No links added yet.</p>
        ) : (
          <div className="space-y-2">
            {links.map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between p-2.5 rounded bg-white/60 dark:bg-slate-800/40 text-xs"
              >
                <a
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-medium text-[#f97316] hover:underline truncate"
                >
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{l.title}</span>
                </a>
                {canDelete && (
                  <button
                    onClick={() => deleteLink.mutate(l)}
                    className="p-1.5 rounded text-red-500 hover:bg-red-500/10 cursor-pointer shrink-0"
                    aria-label="Delete link"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
