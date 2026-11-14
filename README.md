# Firewall 7 — CRM & Business Management System

Centralised CRM & Business Management platform for **Firewall 7** (cybersecurity services), built with Next.js App Router, Supabase, TanStack Query, and `shadcn/ui`.

---

## Tech Stack & Design Standards

- **Framework:** Next.js `16.4.6` (App Router), React `19.3.0`, TypeScript
- **Database & Auth:** Supabase (PostgreSQL, Row Level Security, Supabase Auth)
- **State & Data Fetching:** `@tanstack/react-query`
- **UI & Styling:** Tailwind CSS v4, `shadcn/ui` (`Button`, `Input`, `Label`, `Checkbox`, `Select`, `Dialog`), `lucide-react`
- **Design Conventions:**
  - Base `rounded` border radius across all components (no `rounded-lg`/`xl`/`2xl`/`3xl`)
  - Liquid-glass surfaces with `#f97316` orange primary accent
  - Light & Dark mode support (`ThemeProvider`)
  - Global Toast notifications (`ToastProvider`) for API responses
  - Reusable `ConfirmDeleteModal` (`components/ui/confirm-delete-modal.tsx`) before all destructive actions
  - SEO `metadata` (`title` and `description`) on every page

---

## Environment Setup

Create `.env.local` with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_secret_or_service_role_key
```

### Database Migrations (Run in order in Supabase SQL Editor)
1. `supabase/migrations/0001_initial_schema.sql` — Core 14 CRM tables & RLS
2. `supabase/migrations/0002_auth_rbac.sql` — Auth triggers, `get_my_role()`, `is_active_user()`, and default Admin (`admin@firewall7.com` / `@Firewall7`)
3. `supabase/migrations/0003_roles_permissions.sql` — Custom `roles`, `designations`, and module-level `permissions` JSONB

---

## Completed Modules

- **Authentication & Private Routes**
  - `middleware.ts` protects all CRM routes (redirects unauthenticated users to `/login`; `/api/enquiries` remains public for website forms)
  - `/login` with `shadcn/ui` controls, password show/hide, Remember me, Light/Dark toggle, and Toast feedback
- **Module 2.9 — User, Role & Designation Management (`/team`)**
  - Modularized into `components/team/` (`members-tab.tsx`, `roles-tab.tsx`, `designations-tab.tsx`, `team-client.tsx`)
  - Admin can create/delete team members, assign custom Roles & Designations, and toggle `active`/`inactive` (with explicit **Save** button; Admin account is protected from edits/deletion)
  - Admin can create/edit custom Roles with a module permission matrix (`view`, `create`, `edit`, `delete`)
  - Admin can create/delete Designations
  - Sidebar navigation in `components/layout/crm-shell.tsx` filters modules by `view` permission
- **Module 2.8 — Website Enquiry Integration (`/api/enquiries`)**
  - CORS-enabled `POST` endpoint to capture website consultation enquiries into `leads`

---

## Upcoming Modules Roadmap (From Specification PDF)

1. **Module 2.2 — Lead Management (`/leads`)**: Upgrade UI to `shadcn/ui`, add lead assignment, follow-up activities/notes, and "Convert Lead to Client"
2. **Module 2.1 — Admin Dashboard (`/`)**: Replace static KPIs with live Supabase queries (clients, leads, projects, revenue, overdue invoices, upcoming deadlines)
3. **Module 2.3 — Client Management (`/clients`)**: Client directory, profiles, document uploads (Supabase Storage), communication/quotation/invoice history
4. **Module 2.4 — Service Management (`/services`)**: Cybersecurity service catalog CRUD (categories, pricing, billing cycles)
5. **Module 2.5 — Quotation Management (`/quotations`)**: Quotation builder (catalog + custom line items, taxes, discounts, status tracking, downloadable PDF)
6. **Module 2.6 — Invoice & Payment Management (`/invoices`)**: Invoice generation, partial/full payment tracking, overdue monitoring, downloadable PDF
7. **Module 2.7 — Project Management (`/projects`)**: Client projects, team assignment, deadlines, task tracking, project notes
8. **Module 2.10 — Reports & Activity Logs (`/reports`)**: Lead, client, revenue, project, and outstanding payment reports + `activity_logs` viewer

---

## Out of Scope (Specification Section 5)
- Advanced cybersecurity monitoring, automated vulnerability scanning, SIEM operations, MDR operations, automated threat detection, and security incident response automation.
