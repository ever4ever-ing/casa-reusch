import { NextResponse } from "next/server";
import { getCatalogModels } from "@/lib/db/models";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const models = await getCatalogModels();
    return NextResponse.json({ models });
  } catch (error) {
    console.error("GET /api/models failed:", error);
    return NextResponse.json({ error: "No se pudo cargar el catálogo" }, { status: 500 });
  }
}
