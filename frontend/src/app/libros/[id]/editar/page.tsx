"use client";

import { useParams, useRouter } from "next/navigation";
import BookForm from "@/components/BookForm";
import { apiFetch } from "@/lib/api";
import type { BookPayload } from "@/lib/types";
import { useBook } from "@/lib/useBook";

export default function EditarLibroPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { book, error, loading } = useBook(id);

  async function updateBook(payload: BookPayload) {
    await apiFetch(`/books/${id}`, { method: "PUT", body: payload });
    router.push(`/libros/${id}`);
    router.refresh();
  }

  if (loading) return <p className="muted">Cargando libro...</p>;
  if (error || !book) return <div className="alert" role="alert">{error || "Libro no encontrado"}</div>;

  return (
    <>
      <h1>Editar libro</h1>
      <BookForm initialBook={book} submitLabel="Guardar cambios" onSubmit={updateBook} />
    </>
  );
}
