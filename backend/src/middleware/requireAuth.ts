import { NextFunction, Request, Response } from "express";
import { HttpError } from "../lib/httpError";
import { AUTH_COOKIE_NAME, verifyToken } from "../modules/auth/token";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[AUTH_COOKIE_NAME];
  if (!token) {
    next(new HttpError(401, "No autenticado"));
    return;
  }

  const userId = verifyToken(token);
  if (!userId) {
    next(new HttpError(401, "Sesión inválida o expirada"));
    return;
  }

  res.locals.userId = userId;
  next();
}
