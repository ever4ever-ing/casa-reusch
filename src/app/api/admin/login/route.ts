import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  checkPassword,
  createSessionToken,
  sessionCookieOptions,
  SESSION_COOKIE,
} from "@/lib/auth/admin";
import { getAdminEnv } from "@/lib/auth/guard";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const env = await getAdminEnv();

    if (!env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Admin no configurado. Define ADMIN_PASSWORD en Cloudflare." },
        { status: 503 },
      );
    }

    const body = (await request.json()) as { password?: string };
    if (!body.password || !checkPassword(body.password, env)) {
      return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
    }

    const token = await createSessionToken(env);
    if (!token) {
      return NextResponse.json({ error: "No se pudo crear la sesión" }, { status: 500 });
    }

    const cookieStore = await cookies();
    const opts = sessionCookieOptions();
    cookieStore.set(opts.name, token, {
      httpOnly: opts.httpOnly,
      secure: opts.secure,
      sameSite: opts.sameSite,
      maxAge: opts.maxAge,
      path: opts.path,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/admin/login", error);
    return NextResponse.json({ error: "Error al iniciar sesión" }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}
