import { NextResponse } from "next/server";
import { assertAdmin, isAdminAuthError } from "@/lib/auth/guard";
import {
  createModel,
  getAdminModels,
  getServices,
  slugifyId,
  type ModelInput,
} from "@/lib/db/admin";
import type { ModelCategory } from "@/lib/db/types";

export const dynamic = "force-dynamic";

const CATEGORIES: ModelCategory[] = ["VIP", "Editorial", "Comercial", "Pasarela"];

function parseModelInput(body: Record<string, unknown>, requireId: boolean): ModelInput | null {
  const id = typeof body.id === "string" ? body.id.trim() : slugifyId(String(body.name ?? ""));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const label = typeof body.label === "string" ? body.label.trim() : "";
  const category = body.category as ModelCategory;
  const accent =
    typeof body.accent === "string" ? body.accent.trim() : "from-amber-700/90 to-stone-900";
  const active = body.active !== false;
  const sortOrder = typeof body.sortOrder === "number" ? body.sortOrder : Number(body.sortOrder) || 0;
  const serviceIds = Array.isArray(body.serviceIds)
    ? body.serviceIds.filter((s): s is string => typeof s === "string")
    : [];

  if ((requireId && !id) || !name || !label || !CATEGORIES.includes(category)) {
    return null;
  }

  return { id, name, label, category, accent, active, sortOrder, serviceIds };
}

export async function GET() {
  try {
    const env = await assertAdmin();
    const [models, services] = await Promise.all([getAdminModels(env), getServices(env)]);
    return NextResponse.json({ models, services });
  } catch (error) {
    if (isAdminAuthError(error)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    console.error("GET /api/admin/models", error);
    return NextResponse.json({ error: "Error al cargar modelos" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const env = await assertAdmin();
    const body = (await request.json()) as Record<string, unknown>;
    const input = parseModelInput(body, false);

    if (!input) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    await createModel(env, input);
    const models = await getAdminModels(env);
    return NextResponse.json({ ok: true, models });
  } catch (error) {
    if (isAdminAuthError(error)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    console.error("POST /api/admin/models", error);
    return NextResponse.json({ error: "Error al crear modelo" }, { status: 500 });
  }
}
