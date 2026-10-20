import { NextFunction, Request, Response } from "express";
import { booksService } from "./books.service";

export const booksController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json({ books: await booksService.list() });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      res.json({ book: await booksService.getById(req.params.id) });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(201).json({ book: await booksService.create(req.body) });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      res.json({ book: await booksService.update(req.params.id, req.body) });
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await booksService.remove(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
