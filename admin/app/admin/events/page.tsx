"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import EventModal from "./EventModal";
import { FaLongArrowAltDown, FaLongArrowAltUp } from "react-icons/fa";
import "../../styles.css";

type Event = {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  location: string;
  speaker: string;
  created_at: string;
  updated_at?: string;
};

type SortField = "date" | "time";
type SortOrder = "asc" | "desc";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Event | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("eventos").select("*");
    setEvents(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const sorted = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return [...events]
      .filter((e) =>
        e.title.toLowerCase().includes(q) ||
        e.speaker.toLowerCase().includes(q)
      )
      .sort((a, b) => {
      const valA = sortField === "date" ? a.date : (a.time ?? "");
      const valB = sortField === "date" ? b.date : (b.time ?? "");
      return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
  }, [events, sortField, sortOrder]);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  }

  function openCreate() { setSelected(null); setModalOpen(true); }
  function openEdit(event: Event) { setSelected(event); setModalOpen(true); }

  async function handleDelete(id: string) {
    if (!confirm("Delete this event?")) return;
    await supabase.from("eventos").delete().eq("id", id);
    fetchEvents();
  }

  function handleSaved() { setModalOpen(false); fetchEvents(); }

  const SortIcon = ({ field }: { field: SortField }) =>
    sortField === field
      ? sortOrder === "asc" ? <FaLongArrowAltUp size={12} /> : <FaLongArrowAltDown size={12} />
      : <FaLongArrowAltDown size={12} style={{ opacity: 0.3 }} />;

  return (
    <div>
      <div className="page-header">
        <h1 className="text-xl font-semibold text-zinc-800">Events</h1>
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Search by title or speaker..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
            style={{ width: "220px" }}
          />
          <button onClick={openCreate} className="btn btn-primary">+ New Event</button>
        </div>
      </div>

      {modalOpen && (
        <EventModal
          event={selected}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Speaker</th>
              <th>
                <button onClick={() => toggleSort("date")} className="flex items-center gap-1 hover:text-zinc-800 transition-colors">
                  Date <SortIcon field="date" />
                </button>
              </th>
              <th>
                <button onClick={() => toggleSort("time")} className="flex items-center gap-1 hover:text-zinc-800 transition-colors">
                  Time <SortIcon field="time" />
                </button>
              </th>
              <th>Location</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="text-center text-zinc-400 py-6">Loading...</td>
              </tr>
            )}
            {!loading && sorted.map((event) => (
              <tr key={event.id}>
                <td className="font-medium text-zinc-800">{event.title}</td>
                <td className="text-zinc-600">{event.speaker}</td>
                <td className="text-zinc-600">
                  {new Date(event.date + "T00:00:00").toLocaleDateString("pt-BR")}
                </td>
                <td className="text-zinc-600">{event.time}</td>
                <td className="text-zinc-600">{event.location}</td>
                <td>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(event)} className="btn btn-ghost px-2 py-1 text-xs">Edit</button>
                    <button onClick={() => handleDelete(event.id)} className="btn btn-danger px-2 py-1 text-xs">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && !sorted.length && (
              <tr>
                <td colSpan={6} className="text-center text-zinc-400 py-6">{debouncedSearch ? "No results found." : "No events found."}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
