import { createSupabaseServer } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

/**
 * GET /api/articles
 */

export async function GET() {
  const supabase = await createSupabaseServer();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Buscar artigos
  const { data, error } = await supabase
    .from("artigos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

/**
 * POST /api/articles
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
  };

  const { data, error } = await supabase
    .from("artigos")
    .insert(sanitized)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
