import type { ModelCategory, Service } from "./types";
import { getMediaUrl } from "./models";

export type AdminModel = {
  id: string;
  name: string;
  label: string;
  category: ModelCategory;
  imageKey: string | null;
  imageUrl?: string;
  accent: string;
  active: boolean;
  sortOrder: number;
  serviceIds: string[];
};

type AdminModelRow = {
  id: string;
  name: string;
  label: string;
  category: ModelCategory;
  image_key: string | null;
  accent: string;
  active: number;
  sort_order: number;
  service_id: string | null;
};

async function getDbFrom(env: CloudflareEnv) {
  return env.DB;
}

function mapAdminRows(rows: AdminModelRow[]): AdminModel[] {
  const map = new Map<string, AdminModel>();

  for (const row of rows) {
    let model = map.get(row.id);
    if (!model) {
      model = {
        id: row.id,
        name: row.name,
        label: row.label,
        category: row.category,
        imageKey: row.image_key,
        imageUrl: getMediaUrl(row.image_key),
        accent: row.accent,
        active: row.active === 1,
        sortOrder: row.sort_order,
        serviceIds: [],
      };
      map.set(row.id, model);
    }
    if (row.service_id && !model.serviceIds.includes(row.service_id)) {
      model.serviceIds.push(row.service_id);
    }
  }

  return Array.from(map.values()).sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getAdminModels(env: CloudflareEnv): Promise<AdminModel[]> {
  const db = await getDbFrom(env);
  const { results } = await db
    .prepare(
      `
      SELECT
        m.id, m.name, m.label, m.category, m.image_key, m.accent,
        m.active, m.sort_order, ms.service_id
      FROM models m
      LEFT JOIN model_services ms ON ms.model_id = m.id
      ORDER BY m.sort_order ASC, m.name ASC
    `,
    )
    .all<AdminModelRow>();

  return mapAdminRows(results ?? []);
}

export type ModelInput = {
  id: string;
  name: string;
  label: string;
  category: ModelCategory;
  accent: string;
  active: boolean;
  sortOrder: number;
  serviceIds: string[];
  imageKey?: string | null;
};

export async function createModel(env: CloudflareEnv, input: ModelInput): Promise<void> {
  const db = await getDbFrom(env);

  await db
    .prepare(
      `
      INSERT INTO models (id, name, label, category, image_key, accent, active, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    )
    .bind(
      input.id,
      input.name,
      input.label,
      input.category,
      input.imageKey ?? null,
      input.accent,
      input.active ? 1 : 0,
      input.sortOrder,
    )
    .run();

  await syncModelServices(db, input.id, input.serviceIds);
}

export async function updateModel(env: CloudflareEnv, input: ModelInput): Promise<boolean> {
  const db = await getDbFrom(env);

  const result = await db
    .prepare(
      `
      UPDATE models
      SET name = ?, label = ?, category = ?, accent = ?, active = ?, sort_order = ?,
          image_key = COALESCE(?, image_key)
      WHERE id = ?
    `,
    )
    .bind(
      input.name,
      input.label,
      input.category,
      input.accent,
      input.active ? 1 : 0,
      input.sortOrder,
      input.imageKey ?? null,
      input.id,
    )
    .run();

  if ((result.meta.changes ?? 0) === 0) return false;

  await syncModelServices(db, input.id, input.serviceIds);
  return true;
}

export async function deleteModel(env: CloudflareEnv, id: string): Promise<boolean> {
  const db = await getDbFrom(env);
  const result = await db.prepare("DELETE FROM models WHERE id = ?").bind(id).run();
  return (result.meta.changes ?? 0) > 0;
}

export async function updateModelImageKey(
  env: CloudflareEnv,
  id: string,
  imageKey: string,
): Promise<boolean> {
  const db = await getDbFrom(env);
  const result = await db
    .prepare("UPDATE models SET image_key = ? WHERE id = ?")
    .bind(imageKey, id)
    .run();
  return (result.meta.changes ?? 0) > 0;
}

export async function getServices(env: CloudflareEnv): Promise<Service[]> {
  const db = await getDbFrom(env);
  const { results } = await db
    .prepare("SELECT id, name, slug, description FROM services ORDER BY sort_order ASC")
    .all<Service>();
  return results ?? [];
}

async function syncModelServices(
  db: CloudflareEnv["DB"],
  modelId: string,
  serviceIds: string[],
) {
  await db.prepare("DELETE FROM model_services WHERE model_id = ?").bind(modelId).run();

  for (const serviceId of serviceIds) {
    await db
      .prepare("INSERT INTO model_services (model_id, service_id) VALUES (?, ?)")
      .bind(modelId, serviceId)
      .run();
  }
}

export function slugifyId(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function imageKeyForModel(modelId: string, filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
  const safeExt = ["jpg", "jpeg", "png", "webp"].includes(ext) ? ext : "jpg";
  return `models/${modelId}.${safeExt === "jpeg" ? "jpg" : safeExt}`;
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
