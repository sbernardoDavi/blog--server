"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import EventModal from "./event-modal";
import DeleteConfirmModal from "../components/delete-confirm-modal";
import { FaLongArrowAltDown, FaLongArrowAltUp } from "react-icons/fa";

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
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);

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

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const sorted = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return [...events]
      .filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.speaker.toLowerCase().includes(q),
      )
      .sort((a, b) => {
        const valA = sortField === "date" ? a.date : (a.time ?? "");
        const valB = sortField === "date" ? b.date : (b.time ?? "");
        return sortOrder === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
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

  function openCreate() {
    setSelected(null);
    setModalOpen(true);
  }
  function openEdit(event: Event) {
    setSelected(event);
    setModalOpen(true);
  }

  function openDeleteModal(event: Event) {
    setEventToDelete(event);
    setDeleteModalOpen(true);
  }

  async function handleDelete() {
    if (!eventToDelete) return;
    await supabase.from("eventos").delete().eq("id", eventToDelete.id);
    setDeleteModalOpen(false);
    setEventToDelete(null);
    fetchEvents();
  }

  function handleSaved() {
    setModalOpen(false);
    fetchEvents();
  }

  const SortIcon = ({ field }: { field: SortField }) =>
    sortField === field ? (
      sortOrder === "asc" ? (
        <FaLongArrowAltUp size={12} />
      ) : (
        <FaLongArrowAltDown size={12} />
      )
    ) : (
      <FaLongArrowAltDown size={12} style={{ opacity: 0.3 }} />
    );

  return (
    <main>
      <header className="page-header">
        <h1 className="text-xl font-semibold ">Events</h1>
        <nav className="flex gap-2 flex-wrap" aria-label="Event controls">
          <input
            type="text"
            placeholder="Search by title or speaker..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
            style={{ width: "220px" }}
          />
          <button onClick={openCreate} className="btn btn-primary">
            + New Event
          </button>
        </nav>
      </header>

      {modalOpen && (
        <EventModal
          event={selected}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        itemName={eventToDelete?.title || ""}
        itemType="event"
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setEventToDelete(null);
        }}
      />

      <section className="table-wrapper" aria-label="Events list">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Speaker</th>
              <th>
                <button
                  onClick={() => toggleSort("date")}
                  className="flex items-center gap-1 hover: transition-colors"
                >
                  Date <SortIcon field="date" />
                </button>
              </th>
              <th>
                <button
                  onClick={() => toggleSort("time")}
                  className="flex items-center gap-1 hover: transition-colors"
                >
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
                <td colSpan={6} className="text-center text-zinc-400 py-6">
                  Loading...
                </td>
              </tr>
            )}
            {!loading &&
              sorted.map((event) => (
                <tr key={event.id}>
                  <td className="font-medium ">{event.title}</td>
                  <td className="">{event.speaker}</td>
                  <td className="">
                    {new Date(event.date + "T00:00:00").toLocaleDateString(
                      "pt-BR",
                    )}
                  </td>
                  <td className="">{event.time}</td>
                  <td className="">{event.location}</td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(event)}
                        className="btn btn-ghost px-2 py-1 text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteModal(event)}
                        className="btn btn-danger px-2 py-1 text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            {!loading && !sorted.length && (
              <tr>
                <td colSpan={6} className="text-center text-zinc-400 py-6">
                  {debouncedSearch ? "No results found." : "No events found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}
