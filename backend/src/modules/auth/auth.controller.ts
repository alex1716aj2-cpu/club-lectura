import { CookieOptions, NextFunction, Request, Response } from "express";
import { config } from "../../config";
import { authService } from "./auth.service";
import { AUTH_COOKIE_NAME } from "./token";

const cookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: config.cookieSecure,
  path: "/",
};

function setAuthCookie(res: Response, token: string) {
  res.cookie(AUTH_COOKIE_NAME, token, {
    ...cookieOptions,
    maxAge: config.jwtExpiresInSeconds * 1000,
  });
}

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, token } = await authService.register(req.body);
      setAuthCookie(res, token);
      res.status(201).json({ user });
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, token } = await authService.login(req.body);
      setAuthCookie(res, token);
      res.json({ user });
    } catch (error) {
      next(error);
    }
  },

  logout(_req: Request, res: Response) {
    res.clearCookie(AUTH_COOKIE_NAME, cookieOptions);
    res.status(204).send();
  },

  async me(_req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getCurrentUser(res.locals.userId);
      res.json({ user });
    } catch (error) {
      next(error);
    }
  },
};
