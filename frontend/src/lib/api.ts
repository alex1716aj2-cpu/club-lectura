const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type FieldErrors = Record<string, string>;

type ErrorDetail = { campo: string; mensaje: string };

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly fieldErrors: FieldErrors = {},
  ) {
    super(message);
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
};

function toFieldErrors(details: unknown): FieldErrors {
  if (!Array.isArray(details)) {
    return {};
  }
  const fieldErrors: FieldErrors = {};
  for (const detail of details as ErrorDetail[]) {
    if (detail.campo && !fieldErrors[detail.campo]) {
      fieldErrors[detail.campo] = detail.mensaje;
    }
  }
  return fieldErrors;
}

export async function apiFetch<T = void>(path: string, options: RequestOptions = {}): Promise<T> {
  const hasBody = options.body !== undefined;
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method: options.method ?? "GET",
      credentials: "include",
      cache: "no-store",
      headers: hasBody ? { "Content-Type": "application/json" } : undefined,
      body: hasBody ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError(0, "No se pudo conectar con el servidor. Intenta de nuevo.");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401 && !path.startsWith("/auth/")) {
      window.location.assign("/login");
    }
    throw new ApiError(
      response.status,
      data?.error ?? "Ocurrió un error inesperado",
      toFieldErrors(data?.details),
    );
  }

  return data as T;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  return "Ocurrió un error inesperado";
}
