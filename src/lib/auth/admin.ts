const SESSION_COOKIE = "admin_session";
const SESSION_MAX_AGE_SEC = 60 * 60 * 24;

function getAdminSecret(env: CloudflareEnv): string | undefined {
  return env.ADMIN_SECRET ?? env.ADMIN_PASSWORD;
}

async function importHmacKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

export async function createSessionToken(env: CloudflareEnv): Promise<string | null> {
  const secret = getAdminSecret(env);
  if (!secret) return null;

  const expires = Date.now() + SESSION_MAX_AGE_SEC * 1000;
  const payload = String(expires);
  const key = await importHmacKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));

  return `${payload}.${bufferToBase64(signature)}`;
}

export async function verifySessionToken(
  token: string | undefined,
  env: CloudflareEnv,
): Promise<boolean> {
  if (!token) return false;

  const secret = getAdminSecret(env);
  if (!secret) return false;

  const [payload, signatureB64] = token.split(".");
  if (!payload || !signatureB64) return false;

  const expires = Number(payload);
  if (!Number.isFinite(expires) || Date.now() > expires) return false;

  try {
    const key = await importHmacKey(secret);
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      base64ToBuffer(signatureB64),
      new TextEncoder().encode(payload),
    );
    return valid;
  } catch {
    return false;
  }
}

export function sessionCookieOptions() {
  return {
    name: SESSION_COOKIE,
    maxAge: SESSION_MAX_AGE_SEC,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}

export { SESSION_COOKIE };

export async function requireAdmin(
  env: CloudflareEnv,
  token: string | undefined,
): Promise<boolean> {
  if (!env.ADMIN_PASSWORD) return false;
  return verifySessionToken(token, env);
}

export function checkPassword(password: string, env: CloudflareEnv): boolean {
  if (!env.ADMIN_PASSWORD) return false;
  return password === env.ADMIN_PASSWORD;
}
