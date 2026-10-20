import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { HttpError } from "../lib/httpError";

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction) {
  next(new HttpError(404, "Ruta no encontrada"));
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    const details = error.issues.map((issue) => ({
      campo: issue.path.join("."),
      mensaje: issue.message,
    }));
    res.status(400).json({ error: "Datos inválidos", details });
    return;
  }

  if (error instanceof HttpError) {
    res.status(error.status).json({ error: error.message, details: error.details });
    return;
  }

  if (error instanceof SyntaxError && "body" in error) {
    res.status(400).json({ error: "El cuerpo de la petición no es un JSON válido" });
    return;
  }

  console.error(error);
  res.status(500).json({ error: "Error interno del servidor" });
}
