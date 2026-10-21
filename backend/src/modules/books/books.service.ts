import { Prisma } from "@prisma/client";
import { HttpError } from "../../lib/httpError";
import { booksRepository } from "./books.repository";
import { BookInput, bookIdSchema } from "./books.schemas";

const NOT_FOUND_MESSAGE = "Libro no encontrado";

function assertValidId(id: string) {
  if (!bookIdSchema.safeParse(id).success) {
    throw new HttpError(404, NOT_FOUND_MESSAGE);
  }
}

function translatePrismaError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      throw new HttpError(409, "Ya existe un libro con ese ISBN");
    }
    if (error.code === "P2025") {
      throw new HttpError(404, NOT_FOUND_MESSAGE);
    }
  }
  throw error;
}

export const booksService = {
  list() {
    return booksRepository.findAll();
  },

  async getById(id: string) {
    assertValidId(id);
    const book = await booksRepository.findById(id);
    if (!book) {
      throw new HttpError(404, NOT_FOUND_MESSAGE);
    }
    return book;
  },

  async create(input: BookInput) {
    try {
      return await booksRepository.create(input);
    } catch (error) {
      return translatePrismaError(error);
    }
  },

  async update(id: string, input: BookInput) {
    assertValidId(id);
    try {
      return await booksRepository.update(id, input);
    } catch (error) {
      return translatePrismaError(error);
    }
  },

  async remove(id: string) {
    assertValidId(id);
    try {
      await booksRepository.delete(id);
    } catch (error) {
      translatePrismaError(error);
    }
  },
};
