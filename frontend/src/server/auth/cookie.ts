import { AUTH_SECRET } from "./credentials";

// HMAC-SHA256 signing using Web Crypto so this works in the Edge runtime
// (Next.js middleware) as well as Node route handlers.

const encoder = new TextEncoder();

async function getKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(AUTH_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function bytesToBase64Url(bytes: Uint8Array | ArrayBuffer): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let str = "";
  for (const byte of arr) str += String.fromCharCode(byte);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(input: string): Uint8Array<ArrayBuffer> {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const bin = atob(padded + pad);
  const buffer = new ArrayBuffer(bin.length);
  const out = new Uint8Array(buffer);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function signToken(payload: string): Promise<string> {
  const key = await getKey();
  const payloadBytes = encoder.encode(payload);
  const sig = await crypto.subtle.sign("HMAC", key, payloadBytes);
  const payloadB64 = bytesToBase64Url(payloadBytes);
  const sigB64 = bytesToBase64Url(sig);
  return `${payloadB64}.${sigB64}`;
}

export async function verifyToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payloadB64, sigB64] = parts as [string, string];
  try {
    const key = await getKey();
    const payloadBytes = base64UrlToBytes(payloadB64);
    const sigBytes = base64UrlToBytes(sigB64);
    return await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes,
      payloadBytes,
    );
  } catch {
    return false;
  }
}
