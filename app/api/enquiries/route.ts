import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("leads")
      .insert({
        full_name,
        email,
        company_name: company_name || null,
        job_title: job_title || null,
        topic: topic || null,
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

    return NextResponse.json({ lead: data }, { status: 201, headers: corsHeaders });
  } catch {
    return NextResponse.json(
      { error: "Invalid request payload" },
      { status: 400, headers: corsHeaders }
    );
  }
}
