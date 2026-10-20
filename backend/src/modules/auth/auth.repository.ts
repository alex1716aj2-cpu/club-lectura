import { prisma } from "../../lib/prisma";

export const authRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  create(data: { nombre: string; email: string; passwordHash: string }) {
    return prisma.user.create({ data });
  },
};
