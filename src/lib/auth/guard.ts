import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cookies } from "next/headers";
import { requireAdmin, SESSION_COOKIE } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export async function getAdminEnv() {
  const { env } = await getCloudflareContext({ async: true });
  return env;
}

export async function assertAdmin(): Promise<CloudflareEnv> {
  const env = await getAdminEnv();
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const ok = await requireAdmin(env, token);

  if (!ok) {
    throw new AdminAuthError();
  }

  return env;
}

export class AdminAuthError extends Error {
  constructor() {
    super("No autorizado");
    this.name = "AdminAuthError";
  }
}

export function isAdminAuthError(error: unknown): error is AdminAuthError {
  return error instanceof AdminAuthError;
}
