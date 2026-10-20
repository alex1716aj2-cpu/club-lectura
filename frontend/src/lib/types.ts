export type User = {
  id: string;
  nombre: string;
  email: string;
};

export type Book = {
  id: string;
  isbn: string;
  titulo: string;
  autor: string;
  genero: string;
  anio_publicacion: number;
  paginas: number;
  sinopsis: string | null;
  created_at: string;
  updated_at: string;
};

export type BookPayload = Omit<Book, "id" | "created_at" | "updated_at">;
