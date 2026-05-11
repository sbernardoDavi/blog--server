"use client";

import { useRef, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Article, ArticleModalProps } from "@/app/types";

const empty: Article = { tema: "", autor: "", resumo: "", pdf_url: "" };

export default function ArticleModal({
  article,
  onClose,
  onSaved,
}: ArticleModalProps) {
  const [form, setForm] = useState<Article>(empty);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setForm(article ?? empty);
    setFile(null);
  }, [article]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
  }

  async function uploadPdf(): Promise<string | null> {
    if (!file) return form.pdf_url ?? null;
    const path = `${Date.now()}.pdf`;
    const { error } = await supabase.storage.from("artigos").upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from("artigos").getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const pdf_url = await uploadPdf();
      const { id, ...data } = { ...form, pdf_url };
      const query = id
        ? supabase
            .from("artigos")
            .update({ ...data, updated_at: new Date().toISOString() })
            .eq("id", id)
        : supabase.from("artigos").insert(data);
      const { error } = await query;
      if (error) throw error;
      onSaved();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error saving");
      setLoading(false);
    }
  }

  const savedFileName = form.pdf_url
    ? decodeURIComponent(form.pdf_url.split("/").pop() ?? "")
    : null;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="article-modal-title"
    >
      <article className="modal">
        <header className="flex items-center justify-between mb-4">
          <h2 id="article-modal-title" className="text-lg font-semibold">
            {form.id ? "Edit Article" : "New Article"}
          </h2>
          {article?.updated_at && (
            <time
              className="text-xs text-zinc-400"
              dateTime={article.updated_at}
            >
              Edited {new Date(article.updated_at).toLocaleDateString("pt-BR")}
            </time>
          )}
        </header>

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            name="tema"
            placeholder="Topic"
            value={form.tema}
            onChange={handleChange}
            required
            className="input"
          />
          <input
            name="autor"
            placeholder="Author"
            value={form.autor}
            onChange={handleChange}
            required
            className="input"
          />
          <textarea
            name="resumo"
            placeholder="Summary"
            value={form.resumo}
            onChange={handleChange}
            rows={10}
            className="input resize-none"
          />

          <div className="flex flex-col gap-2">
            <label className="text-xs text-zinc-500 font-medium">PDF</label>
            {savedFileName && !file && (
              <div className="flex items-center gap-2">
                <p className="text-xs ">Saved PDF — {savedFileName}</p>
                <a
                  href={form.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  View PDF
                </a>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFile}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-secondary w-full"
            >
              {file ? file.name : "No file selected"}
            </button>
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={onClose} className="btn btn-ghost">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </article>
    </div>
  );
}
