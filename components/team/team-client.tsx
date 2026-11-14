"use client";

import React, { useState } from "react";
import { CrmShell } from "@/components/layout/crm-shell";
import { useQuery } from "@tanstack/react-query";
import { UserPlus, Plus, Briefcase, Users, KeyRound } from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";
import { MembersTab } from "./members-tab";
import { RolesTab } from "./roles-tab";
import { DesignationsTab } from "./designations-tab";
import type { DesignationRecord, RoleRecord, TeamMember } from "./types";

export function TeamClient() {
  const { isAdmin } = usePermissions();
  const [activeTab, setActiveTab] = useState<"members" | "roles" | "designations">("members");
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleRecord | null>(null);
  const [showDesigModal, setShowDesigModal] = useState(false);

  const { data: members = [], isLoading: membersLoading } = useQuery<TeamMember[]>({
    queryKey: ["team"],
    queryFn: async () => {
      const res = await fetch("/api/team");
      if (!res.ok) throw new Error("Failed to load team");
      return (await res.json()).members;
    },
  });

  const { data: roles = [], isLoading: rolesLoading } = useQuery<RoleRecord[]>({
    queryKey: ["roles"],
    queryFn: async () => {
      const res = await fetch("/api/roles");
      if (!res.ok) throw new Error("Failed to load roles");
      return (await res.json()).roles;
    },
  });

  const { data: designations = [], isLoading: desigLoading } = useQuery<DesignationRecord[]>({
    queryKey: ["designations"],
    queryFn: async () => {
      const res = await fetch("/api/designations");
      if (!res.ok) throw new Error("Failed to load designations");
      return (await res.json()).designations;
    },
  });

  return (
    <CrmShell>
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Team, Roles & Designations
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage team accounts, custom roles, module permissions, and designations.
            </p>
          </div>
          {isAdmin && activeTab === "members" && (
            <button
              onClick={() => setShowMemberModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded bg-[#f97316] hover:bg-[#ea580c] text-white text-sm font-medium shadow-md shadow-orange-500/25 transition-all cursor-pointer"
            >
              <UserPlus className="h-4 w-4" />
              <span>Add Member</span>
            </button>
          )}
          {isAdmin && activeTab === "roles" && (
            <button
              onClick={() => {
                setEditingRole(null);
                setShowRoleModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded bg-[#f97316] hover:bg-[#ea580c] text-white text-sm font-medium shadow-md shadow-orange-500/25 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Create Role</span>
            </button>
          )}
          {isAdmin && activeTab === "designations" && (
            <button
              onClick={() => setShowDesigModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded bg-[#f97316] hover:bg-[#ea580c] text-white text-sm font-medium shadow-md shadow-orange-500/25 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Designation</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("members")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "members"
                ? "bg-[#f97316] text-white shadow-sm shadow-orange-500/25"
                : "liquid-glass-pill text-slate-700 dark:text-slate-200"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Team Members</span>
          </button>
          <button
            onClick={() => setActiveTab("roles")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "roles"
                ? "bg-[#f97316] text-white shadow-sm shadow-orange-500/25"
                : "liquid-glass-pill text-slate-700 dark:text-slate-200"
            }`}
          >
            <KeyRound className="h-3.5 w-3.5" />
            <span>Roles & Permissions</span>
          </button>
          <button
            onClick={() => setActiveTab("designations")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "designations"
                ? "bg-[#f97316] text-white shadow-sm shadow-orange-500/25"
                : "liquid-glass-pill text-slate-700 dark:text-slate-200"
            }`}
          >
            <Briefcase className="h-3.5 w-3.5" />
            <span>Designations</span>
          </button>
        </div>

        {activeTab === "members" && (
          <MembersTab
            members={members}
            roles={roles}
            designations={designations}
            isLoading={membersLoading}
            isAdmin={isAdmin}
            showModal={showMemberModal}
            onCloseModal={() => setShowMemberModal(false)}
          />
        )}

        {activeTab === "roles" && (
          <RolesTab
            roles={roles}
            isLoading={rolesLoading}
            isAdmin={isAdmin}
            showModal={showRoleModal}
            editingRole={editingRole}
            onEditRole={(role) => {
              setEditingRole(role);
              setShowRoleModal(true);
            }}
            onCloseModal={() => {
              setShowRoleModal(false);
              setEditingRole(null);
            }}
          />
        )}

        {activeTab === "designations" && (
          <DesignationsTab
            designations={designations}
            isLoading={desigLoading}
            isAdmin={isAdmin}
            showModal={showDesigModal}
            onCloseModal={() => setShowDesigModal(false)}
          />
        )}
      </div>
    </CrmShell>
  );
}
