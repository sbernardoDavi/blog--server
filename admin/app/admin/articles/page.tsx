"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import ArticleModal from "./ArticleModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { FaLongArrowAltDown, FaLongArrowAltUp } from "react-icons/fa";

type Article = {
  id: string;
  tema: string;
  autor: string;
  resumo: string;
  pdf_url?: string;
  created_at: string;
  updated_at?: string;
};

type SortOrder = "desc" | "asc";

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Article | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("artigos").select("*");
    setArticles(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const filtered = useMemo(() => {
    return articles
      .filter(
        (a) =>
          a.tema.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          a.autor.toLowerCase().includes(debouncedSearch.toLowerCase()),
      )
      .sort((a, b) => {
        const diff =
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        return sortOrder === "asc" ? diff : -diff;
      });
  }, [articles, debouncedSearch, sortOrder]);

  function openCreate() {
    setSelected(null);
    setModalOpen(true);
  }
  function openEdit(article: Article) {
    setSelected(article);
    setModalOpen(true);
  }

  function openDeleteModal(article: Article) {
    setArticleToDelete(article);
    setDeleteModalOpen(true);
  }

  async function handleDelete() {
    if (!articleToDelete) return;
    await supabase.from("artigos").delete().eq("id", articleToDelete.id);
    setDeleteModalOpen(false);
    setArticleToDelete(null);
    fetchArticles();
  }

  function handleSaved() {
    setModalOpen(false);
    fetchArticles();
  }
  function toggleSort() {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
  }
  return (
    <main>
      <header className="page-header">
        <h1 className="text-xl font-semibold">Articles</h1>
        <nav className="flex gap-2 flex-wrap" aria-label="Article controls">
          <input
            type="text"
            placeholder="Search by topic or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
            style={{ width: "220px" }}
          />
          <button onClick={openCreate} className="btn btn-primary">
            + New Article
          </button>
        </nav>
      </header>

      {modalOpen && (
        <ArticleModal
          article={selected}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        itemName={articleToDelete?.tema || ""}
        itemType="article"
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setArticleToDelete(null);
        }}
      />

      <section className="table-wrapper" aria-label="Articles list">
        <table>
          <thead>
            <tr>
              <th>Topic</th>
              <th>Author</th>
              <th>
                <button
                  onClick={toggleSort}
                  className="flex items-center gap-1 hover: transition-colors"
                >
                  Date{" "}
                  {sortOrder === "desc" ? (
                    <FaLongArrowAltDown size={12} />
                  ) : (
                    <FaLongArrowAltUp size={12} />
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
              filtered.map((article) => (
                <tr key={article.id}>
                  <td className="font-medium ">{article.tema}</td>
                  <td className="">{article.autor}</td>
                  <td className="text-zinc-500">
                    {new Date(article.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(article)}
                        className="btn btn-ghost px-2 py-1 text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteModal(article)}
                        className="btn btn-danger px-2 py-1 text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            {!loading && !filtered.length && (
              <tr>
                <td colSpan={4} className="text-center text-zinc-400 py-6">
                  {search ? "No results found." : "No articles found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}
