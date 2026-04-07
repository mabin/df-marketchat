import { type NextRequest, NextResponse } from "next/server";

import { verifyToken } from "@/server/auth/cookie";
import { AUTH_COOKIE } from "@/server/auth/credentials";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  const ok = await verifyToken(token);
  if (ok) return NextResponse.next();

  const loginUrl = new URL("/login", req.url);
  const next = req.nextUrl.pathname + req.nextUrl.search;
  loginUrl.searchParams.set("next", next);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/workspace/:path*"],
};
