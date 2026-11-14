import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized", status: 401 as const };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .single();

  if (!profile || profile.status !== "active" || profile.role !== "admin") {
    return { error: "Forbidden: Admin access required", status: 403 as const };
  }

  return { user, profile };
}

function mapRoleNameToEnum(roleName?: string): "admin" | "manager" | "member" {
  const lower = (roleName ?? "").toLowerCase();
  if (lower === "admin") return "admin";
  if (lower === "manager") return "manager";
  return "member";
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*, role_info:roles(id, name), designation_info:designations(id, title, department)")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ members: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const {
      full_name,
      email,
      password,
      role_id,
      designation_id,
    } = await request.json();

    if (!full_name || !email || !password) {
      return NextResponse.json(
        { error: "full_name, email, and password are required" },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    let roleEnum: "admin" | "manager" | "member" = "member";
    if (role_id) {
      const { data: roleRow } = await adminClient
        .from("roles")
        .select("name")
        .eq("id", role_id)
        .single();
      roleEnum = mapRoleNameToEnum(roleRow?.name);
    }

    const { data: created, error: createError } =
      await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name, role: roleEnum },
      });

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .upsert({
        id: created.user.id,
        full_name,
        email,
        role: roleEnum,
        role_id: role_id || null,
        designation_id: designation_id || null,
        status: "active",
      })
      .select("*, role_info:roles(id, name), designation_info:designations(id, title, department)")
      .single();

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    return NextResponse.json({ member: profile }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid request payload";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id, role_id, designation_id, status } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Member id is required" }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (role_id !== undefined) {
      updates.role_id = role_id || null;
      if (role_id) {
        const { data: roleRow } = await adminClient
          .from("roles")
          .select("name")
          .eq("id", role_id)
          .single();
        updates.role = mapRoleNameToEnum(roleRow?.name);
      }
    }
    if (designation_id !== undefined) {
      updates.designation_id = designation_id || null;
    }
    if (status !== undefined) {
      updates.status = status;
    }

    const { data, error } = await adminClient
      .from("profiles")
      .update(updates)
      .eq("id", id)
      .select("*, role_info:roles(id, name), designation_info:designations(id, title, department)")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ member: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid request payload";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Member id is required" }, { status: 400 });
  }

  if (id === auth.user.id) {
    return NextResponse.json(
      { error: "You cannot delete your own admin account" },
      { status: 400 }
    );
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.deleteUser(id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
