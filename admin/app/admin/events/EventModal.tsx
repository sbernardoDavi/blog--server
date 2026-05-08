"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import "../../styles.css";

type Event = {
  id?: string;
  title: string;
  date: string;
  time: string;
  description: string;
  location: string;
  speaker: string;
  updated_at?: string;
};

type Props = {
  event?: Event | null;
  onClose: () => void;
  onSaved: () => void;
};

const empty: Event = { title: "", date: "", time: "", description: "", location: "", speaker: "" };

export default function EventModal({ event, onClose, onSaved }: Props) {
  const [form, setForm] = useState<Event>(empty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { setForm(event ?? empty); }, [event]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { id, ...data } = form;
    const query = id
      ? supabase.from("eventos").update({ ...data, updated_at: new Date().toISOString() }).eq("id", id)
      : supabase.from("eventos").insert(data);

    const { error } = await query;

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      onSaved();
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-800">
            {form.id ? "Edit Event" : "New Event"}
          </h2>
          {event?.updated_at && (
            <span className="text-xs text-zinc-400">
              Edited {new Date(event.updated_at).toLocaleDateString("pt-BR")}
            </span>
          )}
        </div>

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required className="input" />
          <input name="speaker" placeholder="Speaker" value={form.speaker} onChange={handleChange} className="input" />
          <div className="flex gap-2">
            <input name="date" type="date" value={form.date} onChange={handleChange} required className="input" />
            <input name="time" type="time" value={form.time} onChange={handleChange} className="input" />
          </div>
          <input name="location" placeholder="Location" value={form.location} onChange={handleChange} className="input" />
          <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} rows={4} className="input resize-none" />

          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
