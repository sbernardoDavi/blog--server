"use client";

import { useState } from "react";
import type { DeleteConfirmModalProps } from "@/app/types/types";

export default function DeleteConfirmModal({
  isOpen,
  itemName,
  itemType,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  const [inputValue, setInputValue] = useState("");

  if (!isOpen) return null;

  const isValid = inputValue.toLowerCase() === "delete";

  function handleConfirm() {
    if (isValid) {
      onConfirm();
      setInputValue("");
    }
  }

  function handleCancel() {
    onCancel();
    setInputValue("");
  }

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      onClick={handleCancel}
    >
      <article
        className="modal"
        style={{ maxWidth: "500px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="mb-4">
          <h2
            id="delete-modal-title"
            className="text-lg font-semibold text-red-600"
          >
            Confirm Deletion
          </h2>
        </header>

        <div className="mb-4">
          <p className="text-sm mb-2" style={{ color: "var(--text-primary)" }}>
            You are about to delete the {itemType}:
          </p>
          <p
            className="text-sm font-semibold mb-4 p-2 rounded"
            style={{
              backgroundColor: "var(--bg-page)",
              color: "var(--text-primary)",
            }}
          >
            "{itemName}"
          </p>
          <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
            This action cannot be undone. To confirm, please type{" "}
            <strong className="text-red-600">DELETE</strong>.
          </p>

          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type DELETE to confirm"
            className="input w-full"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && isValid) {
                handleConfirm();
              } else if (e.key === "Escape") {
                handleCancel();
              }
            }}
          />
        </div>

        <footer className="flex justify-end gap-2">
          <button onClick={handleCancel} className="btn btn-ghost">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isValid}
            className="btn btn-danger"
            style={{
              opacity: isValid ? 1 : 0.5,
              cursor: isValid ? "pointer" : "not-allowed",
            }}
          >
            Delete {itemType}
          </button>
        </footer>
      </article>
    </div>
  );
}
