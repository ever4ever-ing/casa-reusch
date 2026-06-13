import { getMediaUrl } from "./models";
import type { ModelPhoto } from "./types";

type PhotoRow = {
  id: string;
  image_key: string;
  sort_order: number;
};

export async function getPhotosForModel(
  db: CloudflareEnv["DB"],
  modelId: string,
): Promise<ModelPhoto[]> {
  const { results } = await db
    .prepare(
      `
      SELECT id, image_key, sort_order
      FROM model_photos
      WHERE model_id = ?
      ORDER BY sort_order ASC, created_at ASC
    `,
    )
    .bind(modelId)
    .all<PhotoRow>();

  return (results ?? []).map((row: PhotoRow) => ({
    id: row.id,
    imageUrl: getMediaUrl(row.image_key)!,
    sortOrder: row.sort_order,
  }));
}

export async function addPhotoToModel(
  env: CloudflareEnv,
  modelId: string,
  imageKey: string,
): Promise<string> {
  const db = env.DB;
  const photoId = crypto.randomUUID();

  const maxRow = await db
    .prepare("SELECT COALESCE(MAX(sort_order), -1) AS max_order FROM model_photos WHERE model_id = ?")
    .bind(modelId)
    .first<{ max_order: number }>();

  const sortOrder = (maxRow?.max_order ?? -1) + 1;

  await db
    .prepare(
      "INSERT INTO model_photos (id, model_id, image_key, sort_order) VALUES (?, ?, ?, ?)",
    )
    .bind(photoId, modelId, imageKey, sortOrder)
    .run();

  const model = await db
    .prepare("SELECT image_key FROM models WHERE id = ?")
    .bind(modelId)
    .first<{ image_key: string | null }>();

  if (!model?.image_key) {
    await db.prepare("UPDATE models SET image_key = ? WHERE id = ?").bind(imageKey, modelId).run();
  }

  return photoId;
}

export async function deletePhotoFromModel(
  env: CloudflareEnv,
  photoId: string,
): Promise<{ modelId: string; deletedKey: string } | null> {
  const db = env.DB;

  const photo = await db
    .prepare("SELECT model_id, image_key FROM model_photos WHERE id = ?")
    .bind(photoId)
    .first<{ model_id: string; image_key: string }>();

  if (!photo) return null;

  await db.prepare("DELETE FROM model_photos WHERE id = ?").bind(photoId).run();

  const cover = await db
    .prepare(
      "SELECT image_key FROM model_photos WHERE model_id = ? ORDER BY sort_order ASC LIMIT 1",
    )
    .bind(photo.model_id)
    .first<{ image_key: string }>();

  await db
    .prepare("UPDATE models SET image_key = ? WHERE id = ?")
    .bind(cover?.image_key ?? null, photo.model_id)
    .run();

  return { modelId: photo.model_id, deletedKey: photo.image_key };
}

export function galleryImageKey(modelId: string, filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
  const safeExt = ["jpg", "jpeg", "png", "webp"].includes(ext) ? ext : "jpg";
  const normalized = safeExt === "jpeg" ? "jpg" : safeExt;
  return `models/${modelId}/${crypto.randomUUID()}.${normalized}`;
}

export function contentTypeForExt(ext: string): string {
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
  };
  return map[ext.toLowerCase()] ?? "image/jpeg";
}
