"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ApiError, FieldErrors, getErrorMessage } from "@/lib/api";
import type { Book, BookPayload } from "@/lib/types";

type FormValues = {
  isbn: string;
  titulo: string;
  autor: string;
  genero: string;
  anio_publicacion: string;
  paginas: string;
  sinopsis: string;
};

type BookFormProps = {
  initialBook?: Book;
  submitLabel: string;
  onSubmit: (payload: BookPayload) => Promise<void>;
};

const GENRE_SUGGESTIONS = ["Novela", "Ciencia ficción", "Historia", "Ensayo", "Poesía", "Biografía"];

function toFormValues(book?: Book): FormValues {
  return {
    isbn: book?.isbn ?? "",
    titulo: book?.titulo ?? "",
    autor: book?.autor ?? "",
    genero: book?.genero ?? "",
    anio_publicacion: book ? String(book.anio_publicacion) : "",
    paginas: book ? String(book.paginas) : "",
    sinopsis: book?.sinopsis ?? "",
  };
}

function validate(values: FormValues): FieldErrors {
  const errors: FieldErrors = {};
  const requiredText: Array<[keyof FormValues, string]> = [
    ["isbn", "El ISBN es obligatorio"],
    ["titulo", "El título es obligatorio"],
    ["autor", "El autor es obligatorio"],
    ["genero", "El género es obligatorio"],
  ];

  for (const [field, message] of requiredText) {
    if (!values[field].trim()) errors[field] = message;
  }

  const year = Number(values.anio_publicacion);
  if (!values.anio_publicacion.trim() || !Number.isInteger(year)) {
    errors.anio_publicacion = "El año de publicación debe ser un número entero";
  } else if (year < 1 || year > new Date().getFullYear()) {
    errors.anio_publicacion = "El año debe estar entre 1 y el año actual";
  }

  const pages = Number(values.paginas);
  if (!values.paginas.trim() || !Number.isInteger(pages) || pages <= 0) {
    errors.paginas = "Las páginas deben ser un número entero mayor a 0";
  }

  return errors;
}

function toPayload(values: FormValues): BookPayload {
  return {
    isbn: values.isbn.trim(),
    titulo: values.titulo.trim(),
    autor: values.autor.trim(),
    genero: values.genero.trim(),
    anio_publicacion: Number(values.anio_publicacion),
    paginas: Number(values.paginas),
    sinopsis: values.sinopsis.trim() || null,
  };
}

export default function BookForm({ initialBook, submitLabel, onSubmit }: BookFormProps) {
  const [values, setValues] = useState<FormValues>(toFormValues(initialBook));
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function setValue(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const errors = validate(values);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      await onSubmit(toPayload(values));
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      if (err instanceof ApiError) {
        setFieldErrors(err.status === 409 ? { isbn: message } : err.fieldErrors);
      }
      setSubmitting(false);
    }
  }

  function renderInput(field: keyof FormValues, label: string, type = "text", listId?: string) {
    return (
      <div className="form-field">
        <label htmlFor={field}>{label}</label>
        <input
          id={field}
          type={type}
          list={listId}
          value={values[field]}
          onChange={(event) => setValue(field, event.target.value)}
        />
        {fieldErrors[field] && <span className="field-error">{fieldErrors[field]}</span>}
      </div>
    );
  }

  return (
    <form className="form card" onSubmit={handleSubmit} noValidate>
      {error && <div className="alert" role="alert">{error}</div>}

      <div className="form-grid">
        {renderInput("isbn", "ISBN")}
        {renderInput("titulo", "Título")}
        {renderInput("autor", "Autor")}
        {renderInput("genero", "Género", "text", "generos")}
        {renderInput("anio_publicacion", "Año de publicación", "number")}
        {renderInput("paginas", "Páginas", "number")}

        <div className="form-field full">
          <label htmlFor="sinopsis">Sinopsis (opcional)</label>
          <textarea
            id="sinopsis"
            rows={4}
            value={values.sinopsis}
            onChange={(event) => setValue("sinopsis", event.target.value)}
          />
          {fieldErrors.sinopsis && <span className="field-error">{fieldErrors.sinopsis}</span>}
        </div>
      </div>

      <datalist id="generos">
        {GENRE_SUGGESTIONS.map((genre) => (
          <option key={genre} value={genre} />
        ))}
      </datalist>

      <div className="actions">
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? "Guardando..." : submitLabel}
        </button>
        <Link className="btn" href="/libros">Cancelar</Link>
      </div>
    </form>
  );
}
