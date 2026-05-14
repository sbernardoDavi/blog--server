import { createSupabaseServer } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

/**
 * GET /api/videos
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
    .from("videos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

/**
 * POST /api/videos
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
  };

  const { data, error } = await supabase
    .from("videos")
    .insert(sanitized)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
