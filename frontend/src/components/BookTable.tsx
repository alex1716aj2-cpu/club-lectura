"use client";

import Link from "next/link";
import type { Book } from "@/lib/types";

type BookTableProps = {
  books: Book[];
  onDelete: (book: Book) => void;
};

export default function BookTable({ books, onDelete }: BookTableProps) {
  return (
    <div className="card table-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th>Título</th>
            <th>Autor</th>
            <th>Género</th>
            <th>Año</th>
            <th>Páginas</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book.id}>
              <td>{book.titulo}</td>
              <td>{book.autor}</td>
              <td>{book.genero}</td>
              <td>{book.anio_publicacion}</td>
              <td>{book.paginas}</td>
              <td>
                <div className="actions">
                  <Link className="btn btn-small" href={`/libros/${book.id}`}>Ver</Link>
                  <Link className="btn btn-small" href={`/libros/${book.id}/editar`}>Editar</Link>
                  <button className="btn btn-small btn-danger" onClick={() => onDelete(book)}>
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
