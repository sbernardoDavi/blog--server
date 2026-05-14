import { createSupabaseServer } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

/**
 * PUT /api/articles/[id]
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
  if (!id) {
    return NextResponse.json({ error: "Missing article ID" }, { status: 400 });
  }

  const body = await request.json();
  if (!body.tema || !body.autor) {
    return NextResponse.json(
      { error: "Missing required fields: tema, autor" },
      { status: 400 },
    );
  }

  const sanitized = {
    tema: body.tema.trim().substring(0, 200),
    autor: body.autor.trim().substring(0, 100),
    resumo: body.resumo?.trim().substring(0, 1000) || "",
    pdf_url: body.pdf_url?.trim().substring(0, 500) || null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("artigos")
    .update(sanitized)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

/**
 * DELETE /api/articles/[id]
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
  if (!id) {
    return NextResponse.json({ error: "Missing article ID" }, { status: 400 });
  }

  const { error } = await supabase.from("artigos").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Article deleted successfully" });
}
