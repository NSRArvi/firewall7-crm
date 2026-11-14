import type { RolePermissions } from "@/lib/permissions";

export type AccountStatus = "active" | "inactive" | "invited";

export interface RoleRecord {
  id: string;
  name: string;
  description: string | null;
  is_system: boolean;
  permissions: RolePermissions;
}

export interface DesignationRecord {
  id: string;
  title: string;
  department: string | null;
}

export interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  role: "admin" | "manager" | "member";
  role_id: string | null;
  designation_id: string | null;
  status: AccountStatus;
  role_info: { id: string; name: string } | null;
  designation_info: { id: string; title: string; department: string | null } | null;
}
