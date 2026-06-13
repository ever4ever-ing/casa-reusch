import { NextResponse } from "next/server";
import { assertAdmin, isAdminAuthError } from "@/lib/auth/guard";
import { getAdminModels } from "@/lib/db/admin";
import { deletePhotoFromModel } from "@/lib/db/photos";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const env = await assertAdmin();
    const { id: photoId } = await context.params;

    const deleted = await deletePhotoFromModel(env, photoId);
    if (!deleted) {
      return NextResponse.json({ error: "Foto no encontrada" }, { status: 404 });
    }

    try {
      await env.ASSETS_BUCKET.delete(deleted.deletedKey);
    } catch {
      // R2 delete is best-effort
    }

    const models = await getAdminModels(env);
    return NextResponse.json({ ok: true, models });
  } catch (error) {
    if (isAdminAuthError(error)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    console.error("DELETE /api/admin/photos/[id]", error);
    return NextResponse.json({ error: "Error al eliminar foto" }, { status: 500 });
  }
}
