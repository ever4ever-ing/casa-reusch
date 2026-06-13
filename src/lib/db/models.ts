import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { CatalogModel, ModelCategory, ModelDetail, Service } from "./types";

type ModelQueryRow = {
  id: string;
  name: string;
  label: string;
  category: ModelCategory;
  image_key: string | null;
  accent: string;
  sort_order: number;
  service_id: string | null;
  service_name: string | null;
  service_slug: string | null;
  service_description: string | null;
};

async function getDb() {
  const { env } = await getCloudflareContext({ async: true });
  return env.DB;
}

export function getMediaUrl(imageKey: string | null | undefined): string | undefined {
  if (!imageKey) return undefined;
  return `/api/media/${imageKey}`;
}

function mapRowsToCatalogModels(rows: ModelQueryRow[]): CatalogModel[] {
  const modelsMap = new Map<string, CatalogModel>();

  for (const row of rows) {
    let model = modelsMap.get(row.id);

    if (!model) {
      model = {
        id: row.id,
        name: row.name,
        label: row.label,
        category: row.category,
        accent: row.accent,
        imageUrl: getMediaUrl(row.image_key),
        services: [],
      };
      modelsMap.set(row.id, model);
    }

    if (row.service_id && row.service_name && row.service_slug) {
      const exists = model.services.some((service) => service.id === row.service_id);
      if (!exists) {
        model.services.push({
          id: row.service_id,
          name: row.service_name,
          slug: row.service_slug,
          description: row.service_description,
        });
      }
    }
  }

  return Array.from(modelsMap.values());
}

export async function getCatalogModels(): Promise<CatalogModel[]> {
  const db = await getDb();

  const { results } = await db
    .prepare(
      `
      SELECT
        m.id,
        m.name,
        m.label,
        m.category,
        m.image_key,
        m.accent,
        m.sort_order,
        s.id AS service_id,
        s.name AS service_name,
        s.slug AS service_slug,
        s.description AS service_description
      FROM models m
      LEFT JOIN model_services ms ON ms.model_id = m.id
      LEFT JOIN services s ON s.id = ms.service_id
      WHERE m.active = 1
      ORDER BY m.sort_order ASC, m.name ASC, s.sort_order ASC
    `,
    )
    .all<ModelQueryRow>();

  return mapRowsToCatalogModels(results ?? []);
}

export async function getModelById(id: string): Promise<ModelDetail | null> {
  const db = await getDb();

  const { results } = await db
    .prepare(
      `
      SELECT
        m.id,
        m.name,
        m.label,
        m.category,
        m.image_key,
        m.accent,
        m.sort_order,
        s.id AS service_id,
        s.name AS service_name,
        s.slug AS service_slug,
        s.description AS service_description
      FROM models m
      LEFT JOIN model_services ms ON ms.model_id = m.id
      LEFT JOIN services s ON s.id = ms.service_id
      WHERE m.id = ? AND m.active = 1
      ORDER BY s.sort_order ASC
    `,
    )
    .bind(id)
    .all<ModelQueryRow>();

  const models = mapRowsToCatalogModels(results ?? []);
  const model = models[0];
  if (!model) return null;

  const sortOrder = results?.[0]?.sort_order ?? 0;
  return { ...model, sortOrder };
}

export async function getAllServices(): Promise<Service[]> {
  const db = await getDb();

  const { results } = await db
    .prepare(
      `
      SELECT id, name, slug, description
      FROM services
      ORDER BY sort_order ASC, name ASC
    `,
    )
    .all<Service>();

  return results ?? [];
}
