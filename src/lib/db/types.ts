export type ModelCategory = "VIP" | "Editorial" | "Comercial" | "Pasarela";

export type Service = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

export type ModelRow = {
  id: string;
  name: string;
  label: string;
  category: ModelCategory;
  image_key: string | null;
  accent: string;
  active: number;
  sort_order: number;
};

export type CatalogModel = {
  id: string;
  name: string;
  label: string;
  category: ModelCategory;
  accent: string;
  imageUrl?: string;
  services: Service[];
};

export type ModelDetail = CatalogModel & {
  sortOrder: number;
};
