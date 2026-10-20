import { z } from "zod";

const requiredText = (label: string, max: number) =>
  z
    .string({ required_error: `${label} es obligatorio`, invalid_type_error: `${label} debe ser texto` })
    .trim()
    .min(1, `${label} es obligatorio`)
    .max(max, `${label} no puede superar ${max} caracteres`);

const wholeNumber = (label: string) =>
  z
    .number({ required_error: `${label} es obligatorio`, invalid_type_error: `${label} debe ser un número` })
    .int(`${label} debe ser un número entero`);

export const bookSchema = z.object({
  isbn: requiredText("El ISBN", 40),
  titulo: requiredText("El título", 200),
  autor: requiredText("El autor", 150),
  genero: requiredText("El género", 80),
  anio_publicacion: wholeNumber("El año de publicación")
    .min(1, "El año de publicación debe ser mayor a 0")
    .refine((year) => year <= new Date().getFullYear(), "El año de publicación no puede ser mayor al año actual"),
  paginas: wholeNumber("Las páginas").positive("Las páginas deben ser mayores a 0"),
  sinopsis: z
    .string({ invalid_type_error: "La sinopsis debe ser texto" })
    .trim()
    .max(5000, "La sinopsis no puede superar 5000 caracteres")
    .nullish()
    .transform((value) => (value ? value : null)),
});

export const bookIdSchema = z.string().uuid();

export type BookInput = z.infer<typeof bookSchema>;
