"use client";

import { useEffect, useState } from "react";
import { apiFetch, getErrorMessage } from "./api";
import type { Book } from "./types";

export function useBook(id: string) {
  const [book, setBook] = useState<Book | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    apiFetch<{ book: Book }>(`/books/${id}`)
      .then((data) => {
        if (!cancelled) setBook(data.book);
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
  }, [id]);

  return { book, error, loading };
}
