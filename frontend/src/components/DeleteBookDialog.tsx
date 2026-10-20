"use client";

import { useState } from "react";
import { apiFetch, getErrorMessage } from "@/lib/api";
import type { Book } from "@/lib/types";
import ConfirmDialog from "./ConfirmDialog";

type DeleteBookDialogProps = {
  book: Book | null;
  onClose: () => void;
  onDeleted: (book: Book) => void;
};

export default function DeleteBookDialog({ book, onClose, onDeleted }: DeleteBookDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function close() {
    setError("");
    onClose();
  }

  async function confirmDelete() {
    if (!book) return;
    setLoading(true);
    setError("");

    try {
      await apiFetch(`/books/${book.id}`, { method: "DELETE" });
      onDeleted(book);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ConfirmDialog
      open={book !== null}
      title="Eliminar libro"
      message={book ? `¿Seguro que quieres eliminar "${book.titulo}"? Esta acción no se puede deshacer.` : ""}
      confirmLabel="Eliminar"
      loading={loading}
      error={error}
      onConfirm={confirmDelete}
      onCancel={close}
    />
  );
}
