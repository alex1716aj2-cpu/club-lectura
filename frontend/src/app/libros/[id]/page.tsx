"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import DeleteBookDialog from "@/components/DeleteBookDialog";
import { formatDate } from "@/lib/format";
import { useBook } from "@/lib/useBook";

export default function DetalleLibroPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { book, error, loading } = useBook(id);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  if (loading) return <p className="muted">Cargando libro...</p>;
  if (error || !book) {
    return (
      <>
        <div className="alert" role="alert">{error || "Libro no encontrado"}</div>
        <p><Link href="/libros">Volver al catálogo</Link></p>
      </>
    );
  }

  return (
    <>
      <div className="page-title-row">
        <h1>{book.titulo}</h1>
        <div className="actions">
          <Link className="btn" href="/libros">Volver</Link>
          <Link className="btn btn-primary" href={`/libros/${book.id}/editar`}>Editar</Link>
          <button className="btn btn-danger" onClick={() => setConfirmingDelete(true)}>Eliminar</button>
        </div>
      </div>

      <div className="card">
        <dl className="detail-list">
          <dt>ISBN</dt>
          <dd>{book.isbn}</dd>
          <dt>Autor</dt>
          <dd>{book.autor}</dd>
          <dt>Género</dt>
          <dd>{book.genero}</dd>
          <dt>Año de publicación</dt>
          <dd>{book.anio_publicacion}</dd>
          <dt>Páginas</dt>
          <dd>{book.paginas}</dd>
          <dt>Sinopsis</dt>
          <dd>{book.sinopsis ?? <span className="muted">Sin sinopsis</span>}</dd>
          <dt>Creado</dt>
          <dd>{formatDate(book.created_at)}</dd>
          <dt>Última actualización</dt>
          <dd>{formatDate(book.updated_at)}</dd>
        </dl>
      </div>

      <DeleteBookDialog
        book={confirmingDelete ? book : null}
        onClose={() => setConfirmingDelete(false)}
        onDeleted={() => router.push("/libros")}
      />
    </>
  );
}
