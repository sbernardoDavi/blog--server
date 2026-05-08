"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import "../styles.css";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth
      .getUser()
      .then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <nav className="navbar">
        <div className="nav-links">
          <span className="brand font-semibold text-zinc-800 mr-2">
            LADP/UNIFAA
          </span>
          <Link
            href="/admin/articles"
            className={`nav-link ${pathname.startsWith("/admin/articles") ? "active" : ""}`}
          >
            Articles
          </Link>
          <Link
            href="/admin/events"
            className={`nav-link ${pathname.startsWith("/admin/events") ? "active" : ""}`}
          >
            Events
          </Link>
          <Link
            href="/admin/videos"
            className={`nav-link ${pathname.startsWith("/admin/videos") ? "active" : ""}`}
          >
            Videos
          </Link>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center text-sm font-medium hover:bg-zinc-700 transition-colors"
          >
            {email.charAt(0).toUpperCase()}
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-zinc-200 rounded-xl shadow-lg py-2 z-50">
              <p className="px-4 py-2 text-xs text-zinc-400 truncate">
                {email}
              </p>
              <hr className="border-zinc-100 my-1" />
              <button
                onClick={handleLogout}
                className="btn btn-danger w-full text-left px-4 py-2 rounded-none"
              >
                Sair
              </button>
            </div>
          )}
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
