"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BookTable from "@/components/BookTable";
import DeleteBookDialog from "@/components/DeleteBookDialog";
import { apiFetch, getErrorMessage } from "@/lib/api";
import type { Book } from "@/lib/types";

export default function LibrosPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

  useEffect(() => {
    let cancelled = false;

    apiFetch<{ books: Book[] }>("/books")
      .then((data) => {
        if (!cancelled) setBooks(data.books);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function handleDeleted(deleted: Book) {
    setBooks((current) => current.filter((book) => book.id !== deleted.id));
    setBookToDelete(null);
  }

  return (
    <>
      <div className="page-title-row">
        <h1>Catálogo de libros</h1>
        <Link className="btn btn-primary" href="/libros/nuevo">Nuevo libro</Link>
      </div>

      {loading && <p className="muted">Cargando libros...</p>}
      {error && <div className="alert" role="alert">{error}</div>}
      {!loading && !error && books.length === 0 && (
        <div className="card">Todavía no hay libros. Agrega el primero con “Nuevo libro”.</div>
      )}
      {books.length > 0 && <BookTable books={books} onDelete={setBookToDelete} />}

      <DeleteBookDialog
        book={bookToDelete}
        onClose={() => setBookToDelete(null)}
        onDeleted={handleDeleted}
      />
    </>
  );
}
