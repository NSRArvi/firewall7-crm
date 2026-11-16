import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      full_name,
      email,
      company_name,
      job_title,
      country_code,
      phone,
      topic,
      consultation_date,
      consultation_slot,
      timezone,
      notes,
    } = body;

    if (!full_name || !email) {
      return NextResponse.json(
        { error: "full_name and email are required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const supabase = createAdminClient();

    const { data: lead, error } = await supabase
      .from("leads")
      .insert({
        full_name: String(full_name).trim(),
        email: String(email).trim(),
        company_name: company_name ? String(company_name).trim() : null,
        job_title: job_title ? String(job_title).trim() : null,
        country_code: country_code ? String(country_code).trim() : null,
        phone: phone ? String(phone).trim() : null,
        topic: topic ? String(topic).trim() : null,
        consultation_date: consultation_date || null,
        consultation_slot: consultation_slot || null,
        timezone: timezone || null,
        notes: notes || null,
        source: "website_consultation",
        status: "new",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500, headers: corsHeaders }
      );
    }

    // Notify all active admins about the new website enquiry
    const { data: admins } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "admin")
      .eq("status", "active");

    if (admins && admins.length > 0) {
      await supabase.from("notifications").insert(
        admins.map((admin) => ({
          user_id: admin.id,
          title: "New Website Consultation Enquiry",
          message: `${lead.full_name}${lead.company_name ? ` (${lead.company_name})` : ""} booked a consultation${lead.topic ? ` for ${lead.topic}` : ""}.`,
          link: "/leads",
        }))
      );
    }

    return NextResponse.json(
      { success: true, lead },
      { status: 201, headers: corsHeaders }
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid request payload" },
      { status: 400, headers: corsHeaders }
    );
  }
}
