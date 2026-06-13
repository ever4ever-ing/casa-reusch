import { NextResponse } from "next/server";
import { assertAdmin, isAdminAuthError } from "@/lib/auth/guard";
import { getAdminModels } from "@/lib/db/admin";
import { addPhotoToModel, contentTypeForExt, galleryImageKey } from "@/lib/db/photos";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const env = await assertAdmin();
    const formData = await request.formData();
    const modelId = formData.get("modelId");
    const file = formData.get("file");

    if (typeof modelId !== "string" || !modelId.trim()) {
      return NextResponse.json({ error: "modelId requerido" }, { status: 400 });
    }

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Archivo inválido" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Máximo 5 MB por imagen" }, { status: 400 });
    }

    const imageKey = galleryImageKey(modelId, file.name);
    const ext = imageKey.split(".").pop() ?? "jpg";
    const arrayBuffer = await file.arrayBuffer();

    await env.ASSETS_BUCKET.put(imageKey, arrayBuffer, {
      httpMetadata: { contentType: contentTypeForExt(ext) },
    });

    const photoId = await addPhotoToModel(env, modelId, imageKey);
    const models = await getAdminModels(env);

    return NextResponse.json({
      ok: true,
      photoId,
      imageKey,
      imageUrl: `/api/media/${imageKey}`,
      models,
    });
  } catch (error) {
    if (isAdminAuthError(error)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    console.error("POST /api/admin/upload", error);
    return NextResponse.json({ error: "Error al subir imagen" }, { status: 500 });
  }
}
