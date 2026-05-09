"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/lib/useTheme";
import "./Navbar.css";

const NAV_LINKS = [
  { href: "/admin/articles", label: "Articles" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/videos", label: "Videos" },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { dark, toggle: toggleTheme } = useTheme();

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
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <>
      <nav className="navbar">
        <div className="flex items-center gap-2">
          <button
            className="hamburger-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menu"
          >
            <span />
            <span />
            <span />
          </button>

          <span className="ladp-gradient">LADP</span>

          <div className="nav-links desktop-only">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`nav-link ${pathname.startsWith(href) ? "active" : ""}`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label={dark ? "Ativar modo claro" : "Ativar modo escuro"}
            title={dark ? "Modo claro" : "Modo escuro"}
          >
            {dark ? "☀️" : "🌙"}
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center text-sm font-medium hover:bg-zinc-700 transition-colors"
            >
              {email.charAt(0).toUpperCase()}
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-xl py-2 z-50"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  boxShadow: "var(--shadow-modal)",
                }}
              >
                <p
                  className="px-4 py-2 text-xs truncate"
                  style={{ color: "var(--text-muted)" }}
                >
                  {email}
                </p>
                <hr
                  style={{
                    borderColor: "var(--border-subtle)",
                    margin: "0.25rem 0",
                  }}
                />
                <button
                  onClick={handleLogout}
                  className="btn btn-danger w-full text-left px-4 py-2 rounded-none"
                >
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Overlay da sidebar */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar mobile */}
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <span
            className="font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            LADP/UNIFAA
          </span>
          <button
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Fechar menu"
          >
            ✕
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`sidebar-link ${pathname.startsWith(href) ? "active" : ""}`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <p
            className="text-xs truncate mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            {email}
          </p>
          <button
            onClick={toggleTheme}
            className="theme-toggle w-full mb-2"
            style={{
              border: "1px solid var(--border)",
              borderRadius: "0.5rem",
            }}
            aria-label={dark ? "Ativar modo claro" : "Ativar modo escuro"}
          >
            {dark ? "☀️ Modo claro" : "🌙 Modo escuro"}
          </button>
          <button onClick={handleLogout} className="btn btn-danger w-full">
            Sair
          </button>
        </div>
      </aside>
    </>
  );
}
