import { createSupabaseServer } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

/**
 * PUT /api/events/[id]
 */
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const supabase = await createSupabaseServer();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json();

  if (!body.title || !body.date) {
    return NextResponse.json(
      { error: "Missing required fields: title, date" },
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
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("eventos")
    .update(sanitized)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

/**
 * DELETE /api/events/[id]
 */
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const supabase = await createSupabaseServer();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const { error } = await supabase.from("eventos").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Event deleted successfully" });
}
