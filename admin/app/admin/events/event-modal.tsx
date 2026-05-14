"use client";

import { useState, useEffect } from "react";
import type { Event, EventModalProps } from "@/app/types/types";

const empty: Event = {
  title: "",
  date: "",
  time: "",
  description: "",
  location: "",
  speaker: "",
};

export default function EventModal({
  event,
  onClose,
  onSaved,
}: EventModalProps) {
  const [form, setForm] = useState<Event>(empty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(event ?? empty);
  }, [event]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = form.id ? `/api/events/${form.id}` : "/api/events";
      const method = form.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error saving event");
      }

      onSaved();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error saving");
      setLoading(false);
    }
  }

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-modal-title"
    >
      <article className="modal">
        <header className="flex items-center justify-between mb-4">
          <h2 id="event-modal-title" className="text-lg font-semibold ">
            {form.id ? "Edit Event" : "New Event"}
          </h2>
          {event?.updated_at && (
            <time className="text-xs text-zinc-400" dateTime={event.updated_at}>
              Edited {new Date(event.updated_at).toLocaleDateString("pt-BR")}
            </time>
          )}
        </header>

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={handleChange}
            required
            className="input"
          />
          <input
            name="speaker"
            placeholder="Speaker"
            value={form.speaker}
            onChange={handleChange}
            className="input"
          />
          <div className="flex gap-2">
            <input
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              required
              className="input"
            />
            <input
              name="time"
              type="time"
              value={form.time}
              onChange={handleChange}
              className="input"
            />
          </div>
          <input
            name="location"
            placeholder="Location"
            value={form.location}
            onChange={handleChange}
            className="input"
          />
          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            rows={10}
            className="input resize-none"
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
