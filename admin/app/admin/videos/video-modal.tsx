"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Video = {
  id?: string;
  titulo: string;
  conteudo: string;
  url: string;
  updated_at?: string;
};

type Props = {
  video?: Video | null;
  onClose: () => void;
  onSaved: () => void;
};

const empty: Video = { titulo: "", conteudo: "", url: "" };

export default function VideoModal({ video, onClose, onSaved }: Props) {
  const [form, setForm] = useState<Video>(empty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(video ?? empty);
  }, [video]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { id, ...data } = form;
    const query = id
      ? supabase
          .from("videos")
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq("id", id)
      : supabase.from("videos").insert(data);

    const { error } = await query;

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      onSaved();
    }
  }

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-modal-title"
    >
      <article className="modal">
        <header className="flex items-center justify-between mb-4">
          <h2 id="video-modal-title" className="text-lg font-semibold ">
            {form.id ? "Edit Video" : "New Video"}
          </h2>
          {video?.updated_at && (
            <time className="text-xs text-zinc-400" dateTime={video.updated_at}>
              Edited {new Date(video.updated_at).toLocaleDateString("pt-BR")}
            </time>
          )}
        </header>

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            name="titulo"
            placeholder="Title"
            value={form.titulo}
            onChange={handleChange}
            required
            className="input"
          />
          <textarea
            name="conteudo"
            placeholder="Content"
            value={form.conteudo}
            onChange={handleChange}
            rows={10}
            className="input resize-none"
          />
          <input
            name="url"
            placeholder="Video URL"
            value={form.url}
            onChange={handleChange}
            required
            className="input"
          />

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
