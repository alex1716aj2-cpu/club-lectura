import { NextRequest, NextResponse } from "next/server";

const INTERNAL_API_URL = process.env.INTERNAL_API_URL ?? "http://backend:4000";
const AUTH_COOKIE_NAME = "token";

async function isSessionValid(cookieHeader: string): Promise<boolean> {
  try {
    const response = await fetch(`${INTERNAL_API_URL}/auth/me`, {
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);

  if (!request.cookies.has(AUTH_COOKIE_NAME)) {
    return NextResponse.redirect(loginUrl);
  }

  const valid = await isSessionValid(request.headers.get("cookie") ?? "");
  if (!valid) {
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/libros/:path*"],
};
