"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { User } from "@/lib/types";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    apiFetch<{ user: User }>("/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => setUser(null));
  }, []);

  async function handleLogout() {
    await apiFetch("/auth/logout", { method: "POST" }).catch(() => undefined);
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <Link href="/libros" className="brand">Club de Lectura</Link>
        <div className="header-user">
          {user && <span>{user.nombre}</span>}
          <button className="btn btn-small" onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </div>
    </header>
  );
}
