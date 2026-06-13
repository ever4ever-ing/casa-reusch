import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireAdmin, SESSION_COOKIE } from "@/lib/auth/admin";
import { getAdminEnv } from "@/lib/auth/guard";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const env = await getAdminEnv();
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    const authenticated = await requireAdmin(env, token);

    return NextResponse.json({ authenticated });
  } catch (error) {
    console.error("GET /api/admin/me", error);
    return NextResponse.json({ authenticated: false });
  }
}
