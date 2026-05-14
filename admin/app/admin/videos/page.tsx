"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import VideoModal from "./video-modal";
import DeleteConfirmModal from "../components/delete-confirm-modal";
import { FaLongArrowAltDown, FaLongArrowAltUp } from "react-icons/fa";
import type { Video, VideoWithDates, SortOrder } from "@/app/types/types";

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoWithDates[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Video | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<VideoWithDates | null>(
    null,
  );

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/videos");
      if (!response.ok) throw new Error("Failed to fetch videos");
      const data = await response.json();
      setVideos(data ?? []);
    } catch (error) {
      console.error("Error fetching videos:", error);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const sorted = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return [...videos]
      .filter(
        (v) =>
          v.titulo.toLowerCase().includes(q) || v.url.toLowerCase().includes(q),
      )
      .sort((a, b) => {
        const diff =
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        return sortOrder === "asc" ? diff : -diff;
      });
  }, [videos, debouncedSearch, sortOrder]);

  function toggleSort() {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  }
  function openCreate() {
    setSelected(null);
    setModalOpen(true);
  }
  function openEdit(video: VideoWithDates) {
    setSelected(video);
    setModalOpen(true);
  }

  function openDeleteModal(video: VideoWithDates) {
    setVideoToDelete(video);
    setDeleteModalOpen(true);
  }

  async function handleDelete() {
    if (!videoToDelete) return;

    try {
      const response = await fetch(`/api/videos/${videoToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete video");
      }

      setDeleteModalOpen(false);
      setVideoToDelete(null);
      fetchVideos();
    } catch (error) {
      console.error("Error deleting video:", error);
      alert(error instanceof Error ? error.message : "Failed to delete video");
    }
  }

  function handleSaved() {
    setModalOpen(false);
    fetchVideos();
  }

  return (
    <main>
      <header className="page-header">
        <h1 className="text-xl font-semibold ">Videos</h1>
        <nav className="flex gap-2 flex-wrap" aria-label="Video controls">
          <input
            type="text"
            placeholder="Search by title or URL..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
            style={{ width: "220px" }}
          />
          <button onClick={openCreate} className="btn btn-primary">
            + New Video
          </button>
        </nav>
      </header>

      {modalOpen && (
        <VideoModal
          video={selected}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        itemName={videoToDelete?.titulo || ""}
        itemType="video"
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setVideoToDelete(null);
        }}
      />

      <section className="table-wrapper" aria-label="Videos list">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>URL</th>
              <th>
                <button
                  onClick={toggleSort}
                  className="flex items-center gap-1 hover: transition-colors"
                >
                  Date{" "}
                  {sortOrder === "asc" ? (
                    <FaLongArrowAltUp size={12} />
                  ) : (
                    <FaLongArrowAltDown size={12} />
                  )}
                </button>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={4} className="text-center text-zinc-400 py-6">
                  Loading...
                </td>
              </tr>
            )}
            {!loading &&
              sorted.map((video) => (
                <tr key={video.id}>
                  <td className="font-medium ">{video.titulo}</td>
                  <td className="">
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline truncate block max-w-xs"
                    >
                      {video.url}
                    </a>
                  </td>
                  <td className="text-zinc-500">
                    {new Date(video.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(video)}
                        className="btn btn-ghost px-2 py-1 text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteModal(video)}
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
                <td colSpan={4} className="text-center text-zinc-400 py-6">
                  {debouncedSearch ? "No results found." : "No videos found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}
