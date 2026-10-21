"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ApiError, FieldErrors, apiFetch, getErrorMessage } from "@/lib/api";

type AuthFormProps = {
  mode: "login" | "registro";
};

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const isRegister = mode === "registro";

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);

    try {
      if (isRegister) {
        await apiFetch("/auth/register", { method: "POST", body: { nombre, email, password } });
      } else {
        await apiFetch("/auth/login", { method: "POST", body: { email, password } });
      }
      router.push("/libros");
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err));
      if (err instanceof ApiError) {
        setFieldErrors(err.fieldErrors);
      }
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="card card-narrow">
        <h1>{isRegister ? "Crear cuenta" : "Iniciar sesión"}</h1>
        <p className="muted">Club de Lectura · Catálogo de libros</p>

        <form className="form" onSubmit={handleSubmit} noValidate>
          {error && <div className="alert" role="alert">{error}</div>}

          {isRegister && (
            <div className="form-field">
              <label htmlFor="nombre">Nombre</label>
              <input
                id="nombre"
                value={nombre}
                onChange={(event) => setNombre(event.target.value)}
                autoComplete="name"
              />
              {fieldErrors.nombre && <span className="field-error">{fieldErrors.nombre}</span>}
            </div>
          )}

          <div className="form-field">
            <label htmlFor="email">Correo</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />
            {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={isRegister ? "new-password" : "current-password"}
            />
            {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Enviando..." : isRegister ? "Registrarme" : "Entrar"}
          </button>
        </form>

        <p className="muted">
          {isRegister ? (
            <>¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link></>
          ) : (
            <>¿No tienes cuenta? <Link href="/registro">Regístrate</Link></>
          )}
        </p>
      </div>
    </div>
  );
}
