"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import VideoModal from "./VideoModal";
import { FaLongArrowAltDown, FaLongArrowAltUp } from "react-icons/fa";
import "../../styles.css";
import "./videos.css";

type Video = {
  id: string;
  titulo: string;
  conteudo: string;
  url: string;
  created_at: string;
  updated_at?: string;
};

type SortOrder = "asc" | "desc";

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Video | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("videos").select("*");
    setVideos(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchVideos(); }, [fetchVideos]);

  const sorted = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return [...videos]
      .filter((v) =>
        v.titulo.toLowerCase().includes(q) ||
        v.url.toLowerCase().includes(q)
      )
      .sort((a, b) => {
        const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        return sortOrder === "asc" ? diff : -diff;
      });
  }, [videos, debouncedSearch, sortOrder]);

  function toggleSort() { setSortOrder((prev) => (prev === "asc" ? "desc" : "asc")); }
  function openCreate() { setSelected(null); setModalOpen(true); }
  function openEdit(video: Video) { setSelected(video); setModalOpen(true); }

  async function handleDelete(id: string) {
    if (!confirm("Delete this video?")) return;
    await supabase.from("videos").delete().eq("id", id);
    fetchVideos();
  }

  function handleSaved() { setModalOpen(false); fetchVideos(); }

  return (
    <div>
      <div className="page-header">
        <h1 className="text-xl font-semibold text-zinc-800">Videos</h1>
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Search by title or URL..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
            style={{ width: "220px" }}
          />
          <button onClick={openCreate} className="btn btn-primary">+ New Video</button>
        </div>
      </div>

      {modalOpen && (
        <VideoModal
          video={selected}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>URL</th>
              <th>
                <button onClick={toggleSort} className="flex items-center gap-1 hover:text-zinc-800 transition-colors">
                  Date {sortOrder === "asc" ? <FaLongArrowAltUp size={12} /> : <FaLongArrowAltDown size={12} />}
                </button>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={4} className="text-center text-zinc-400 py-6">Loading...</td>
              </tr>
            )}
            {!loading && sorted.map((video) => (
              <tr key={video.id}>
                <td className="font-medium text-zinc-800">{video.titulo}</td>
                <td className="text-zinc-600">
                  <a href={video.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate block max-w-xs">
                    {video.url}
                  </a>
                </td>
                <td className="text-zinc-500">
                  {new Date(video.created_at).toLocaleDateString("pt-BR")}
                </td>
                <td>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(video)} className="btn btn-ghost px-2 py-1 text-xs">Edit</button>
                    <button onClick={() => handleDelete(video.id)} className="btn btn-danger px-2 py-1 text-xs">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && !sorted.length && (
              <tr>
                <td colSpan={4} className="text-center text-zinc-400 py-6">{debouncedSearch ? "No results found." : "No videos found."}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
