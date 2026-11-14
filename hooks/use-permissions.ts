"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  type CrmModule,
  type PermissionAction,
  type RolePermissions,
  hasPermission,
} from "@/lib/permissions";

interface CurrentUserProfile {
  id: string;
  full_name: string;
  email: string;
  role: "admin" | "manager" | "member";
  status: string;
  role_info: {
    id: string;
    name: string;
    permissions: RolePermissions;
  } | null;
}

export function usePermissions() {
  const supabase = createClient();

  const { data: profile, isLoading } = useQuery<CurrentUserProfile | null>({
    queryKey: ["my-permissions"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, email, role, status, role_info:roles(id, name, permissions)")
        .eq("id", user.id)
        .single();

      return (data as unknown as CurrentUserProfile) ?? null;
    },
  });

  const isAdmin = profile?.role === "admin";
  const permissions = profile?.role_info?.permissions;

  const can = (module: CrmModule, action: PermissionAction): boolean => {
    if (isAdmin) return true;
    return hasPermission(permissions, module, action);
  };

  return { profile, isLoading, isAdmin, can };
}
