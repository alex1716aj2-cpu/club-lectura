import { prisma } from "../../lib/prisma";
import { BookInput } from "./books.schemas";

export const booksRepository = {
  findAll() {
    return prisma.book.findMany({ orderBy: { created_at: "desc" } });
  },

  findById(id: string) {
    return prisma.book.findUnique({ where: { id } });
  },

  create(data: BookInput) {
    return prisma.book.create({ data });
  },

  update(id: string, data: BookInput) {
    return prisma.book.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.book.delete({ where: { id } });
  },
};
