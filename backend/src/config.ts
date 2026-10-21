function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}`);
  }
  return value;
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: required("JWT_SECRET"),
  jwtExpiresInSeconds: Number(process.env.JWT_EXPIRES_HOURS ?? 24) * 60 * 60,
  cookieSecure: process.env.COOKIE_SECURE === "true",
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? "http://localhost:3000",
};
