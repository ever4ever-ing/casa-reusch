export type ModelCategory = "VIP" | "Editorial" | "Comercial" | "Pasarela";

export type Service = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

export type ModelPhoto = {
  id: string;
  imageUrl: string;
  sortOrder: number;
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
  photos: ModelPhoto[];
};
