import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Club de Lectura",
  description: "Catálogo de libros del club de lectura",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
