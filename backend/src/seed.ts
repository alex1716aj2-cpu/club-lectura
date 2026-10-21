import bcrypt from "bcryptjs";
import { prisma } from "./lib/prisma";

const TEST_USER = {
  nombre: "Usuario de Prueba",
  email: "prueba@club.com",
  password: "Prueba123!",
};

const BOOKS = [
  {
    isbn: "978-0-307-47472-8",
    titulo: "Cien años de soledad",
    autor: "Gabriel García Márquez",
    genero: "Novela",
    anioPublicacion: 1967,
    paginas: 471,
    sinopsis: "La historia de la familia Buendía a lo largo de siete generaciones en Macondo.",
  },
  {
    isbn: "978-0-14-118776-1",
    titulo: "1984",
    autor: "George Orwell",
    genero: "Ciencia ficción",
    anioPublicacion: 1949,
    paginas: 328,
    sinopsis: "Una distopía sobre un estado totalitario que vigila a todos sus ciudadanos.",
  },
  {
    isbn: "978-0-06-231609-7",
    titulo: "Sapiens: de animales a dioses",
    autor: "Yuval Noah Harari",
    genero: "Historia",
    anioPublicacion: 2011,
    paginas: 498,
    sinopsis: "Un recorrido por la historia de la humanidad desde la prehistoria hasta hoy.",
  },
  {
    isbn: "978-84-663-0425-0",
    titulo: "Fundación",
    autor: "Isaac Asimov",
    genero: "Ciencia ficción",
    anioPublicacion: 1951,
    paginas: 255,
    sinopsis: null,
  },
  {
    isbn: "978-607-31-0003-1",
    titulo: "Pedro Páramo",
    autor: "Juan Rulfo",
    genero: "Novela",
    anioPublicacion: 1955,
    paginas: 128,
    sinopsis: "Juan Preciado viaja a Comala en busca de su padre y encuentra un pueblo de fantasmas.",
  },
];

async function main() {
  const passwordHash = await bcrypt.hash(TEST_USER.password, 10);

  await prisma.user.upsert({
    where: { email: TEST_USER.email },
    update: {},
    create: { nombre: TEST_USER.nombre, email: TEST_USER.email, passwordHash },
  });

  for (const book of BOOKS) {
    await prisma.book.upsert({
      where: { isbn: book.isbn },
      update: {},
      create: book,
    });
  }

  console.log("Seed completado");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
