import { createSupabaseServer } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

/**
 * PUT /api/videos/[id]
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

  if (!body.titulo || !body.url) {
    return NextResponse.json(
      { error: "Missing required fields: titulo, url" },
      { status: 400 },
    );
  }

  try {
    new URL(body.url);
  } catch {
    return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
  }

  const sanitized = {
    titulo: body.titulo.trim().substring(0, 200),
    conteudo: body.conteudo?.trim().substring(0, 2000) || "",
    url: body.url.trim().substring(0, 500),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("videos")
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
 * DELETE /api/videos/[id]
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
  const { error } = await supabase.from("videos").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Video deleted successfully" });
}
