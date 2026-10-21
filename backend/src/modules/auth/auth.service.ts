import bcrypt from "bcryptjs";
import { Prisma, User } from "@prisma/client";
import { HttpError } from "../../lib/httpError";
import { authRepository } from "./auth.repository";
import { LoginInput, RegisterInput } from "./auth.schemas";
import { signToken } from "./token";

const BCRYPT_ROUNDS = 10;
const DUMMY_HASH = bcrypt.hashSync("contrasena-de-relleno", BCRYPT_ROUNDS);

export type PublicUser = { id: string; nombre: string; email: string };

function toPublicUser(user: User): PublicUser {
  return { id: user.id, nombre: user.nombre, email: user.email };
}

export const authService = {
  async register(input: RegisterInput) {
    const existing = await authRepository.findByEmail(input.email);
    if (existing) {
      throw new HttpError(409, "Ya existe una cuenta con ese correo");
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

    try {
      const user = await authRepository.create({
        nombre: input.nombre,
        email: input.email,
        passwordHash,
      });
      return { user: toPublicUser(user), token: signToken(user.id) };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new HttpError(409, "Ya existe una cuenta con ese correo");
      }
      throw error;
    }
  },

  async login(input: LoginInput) {
    const user = await authRepository.findByEmail(input.email);
    const passwordIsValid = await bcrypt.compare(input.password, user?.passwordHash ?? DUMMY_HASH);

    if (!user || !passwordIsValid) {
      throw new HttpError(401, "Correo o contraseña incorrectos");
    }

    return { user: toPublicUser(user), token: signToken(user.id) };
  },

  async getCurrentUser(userId: string) {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw new HttpError(401, "Sesión inválida o expirada");
    }
    return toPublicUser(user);
  },
};
