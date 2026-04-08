import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { verifyToken } from "@/server/auth/cookie";
import { AUTH_COOKIE } from "@/server/auth/credentials";

export default async function RootPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  const ok = await verifyToken(token);
  redirect(ok ? "/workspace" : "/login");
}
