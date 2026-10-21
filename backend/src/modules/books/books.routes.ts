import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth";
import { validateBody } from "../../middleware/validate";
import { booksController } from "./books.controller";
import { bookSchema } from "./books.schemas";

export const booksRouter = Router();

booksRouter.use(requireAuth);

booksRouter.get("/", booksController.list);
booksRouter.get("/:id", booksController.getById);
booksRouter.post("/", validateBody(bookSchema), booksController.create);
booksRouter.put("/:id", validateBody(bookSchema), booksController.update);
booksRouter.delete("/:id", booksController.remove);
