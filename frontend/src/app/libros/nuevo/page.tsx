"use client";

import { useRouter } from "next/navigation";
import BookForm from "@/components/BookForm";
import { apiFetch } from "@/lib/api";
import type { BookPayload } from "@/lib/types";

export default function NuevoLibroPage() {
  const router = useRouter();

  async function createBook(payload: BookPayload) {
    await apiFetch("/books", { method: "POST", body: payload });
    router.push("/libros");
    router.refresh();
  }

  return (
    <>
      <h1>Nuevo libro</h1>
      <BookForm submitLabel="Crear libro" onSubmit={createBook} />
    </>
  );
}
