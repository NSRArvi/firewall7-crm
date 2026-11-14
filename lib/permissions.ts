export const CRM_MODULES = [
  { key: "dashboard", label: "Dashboard" },
  { key: "leads", label: "Leads & Enquiries" },
  { key: "clients", label: "Clients" },
  { key: "services", label: "Services" },
  { key: "quotations", label: "Quotations" },
  { key: "invoices", label: "Invoices & Payments" },
  { key: "projects", label: "Projects & Tasks" },
  { key: "reports", label: "Reports & Logs" },
  { key: "team", label: "Team & Roles" },
] as const;

export type CrmModule = (typeof CRM_MODULES)[number]["key"];
export type PermissionAction = "view" | "create" | "edit" | "delete";

export interface ModulePermission {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export type RolePermissions = Record<CrmModule, ModulePermission>;

export function emptyPermissions(): RolePermissions {
  return CRM_MODULES.reduce((acc, m) => {
    acc[m.key] = { view: false, create: false, edit: false, delete: false };
    return acc;
  }, {} as RolePermissions);
}

export function hasPermission(
  permissions: Partial<RolePermissions> | null | undefined,
  module: CrmModule,
  action: PermissionAction
): boolean {
  if (!permissions) return false;
  return Boolean(permissions[module]?.[action]);
}
