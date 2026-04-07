import { NextResponse } from "next/server";

import { signToken } from "@/server/auth/cookie";
import {
  AUTH_COOKIE,
  AUTH_COOKIE_MAX_AGE,
  AUTH_PASSWORD,
  AUTH_USERNAME,
} from "@/server/auth/credentials";

export async function POST(req: Request) {
  let body: { username?: unknown; password?: unknown };
  try {
    body = (await req.json()) as { username?: unknown; password?: unknown };
  } catch {
    return NextResponse.json(
      { ok: false, error: "请求格式错误" },
      { status: 400 },
    );
  }

  const username = typeof body.username === "string" ? body.username : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (username !== AUTH_USERNAME || password !== AUTH_PASSWORD) {
    return NextResponse.json(
      { ok: false, error: "用户名或密码错误" },
      { status: 401 },
    );
  }

  const token = await signToken(`ok:${Date.now()}`);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: AUTH_COOKIE_MAX_AGE,
  });
  return res;
}
