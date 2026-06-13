import { NextResponse } from "next/server";
import { assertAdmin, isAdminAuthError } from "@/lib/auth/guard";
import { deleteModel, getAdminModels, updateModel, type ModelInput } from "@/lib/db/admin";
import type { ModelCategory } from "@/lib/db/types";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

const CATEGORIES: ModelCategory[] = ["VIP", "Editorial", "Comercial", "Pasarela"];

function parseModelInput(
  id: string,
  body: Record<string, unknown>,
): ModelInput | null {
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

  if (!name || !label || !CATEGORIES.includes(category)) return null;

  return { id, name, label, category, accent, active, sortOrder, serviceIds };
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const env = await assertAdmin();
    const { id } = await context.params;
    const body = (await request.json()) as Record<string, unknown>;
    const input = parseModelInput(id, body);

    if (!input) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const updated = await updateModel(env, input);
    if (!updated) {
      return NextResponse.json({ error: "Modelo no encontrada" }, { status: 404 });
    }

    const models = await getAdminModels(env);
    return NextResponse.json({ ok: true, models });
  } catch (error) {
    if (isAdminAuthError(error)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    console.error("PUT /api/admin/models/[id]", error);
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const env = await assertAdmin();
    const { id } = await context.params;
    const deleted = await deleteModel(env, id);

    if (!deleted) {
      return NextResponse.json({ error: "Modelo no encontrada" }, { status: 404 });
    }

    const models = await getAdminModels(env);
    return NextResponse.json({ ok: true, models });
  } catch (error) {
    if (isAdminAuthError(error)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    console.error("DELETE /api/admin/models/[id]", error);
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}
