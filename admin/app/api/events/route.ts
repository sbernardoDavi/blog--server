import { createSupabaseServer } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

/**
 * GET /api/events
 */
export async function GET() {
  const supabase = await createSupabaseServer();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("eventos")
    .select("*")
    .order("date", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

/**
 * POST /api/events
 */
export async function POST(request: Request) {
  const supabase = await createSupabaseServer();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  if (!body.title || !body.date) {
    return NextResponse.json(
      { error: "Missing required fields: title, date" },
      { status: 400 },
    );
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(body.date)) {
    return NextResponse.json(
      { error: "Invalid date format. Use YYYY-MM-DD" },
      { status: 400 },
    );
  }

  const sanitized = {
    title: body.title.trim().substring(0, 200),
    date: body.date,
    time: body.time?.trim().substring(0, 10) || "",
    description: body.description?.trim().substring(0, 2000) || "",
    location: body.location?.trim().substring(0, 200) || "",
    speaker: body.speaker?.trim().substring(0, 100) || "",
  };

  const { data, error } = await supabase
    .from("eventos")
    .insert(sanitized)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
