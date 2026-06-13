import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ key: string[] }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { key } = await context.params;
    const objectKey = key.join("/");

    if (!objectKey || objectKey.includes("..")) {
      return NextResponse.json({ error: "Clave inválida" }, { status: 400 });
    }

    const { env } = await getCloudflareContext({ async: true });
    const object = await env.ASSETS_BUCKET.get(objectKey);

    if (!object) {
      return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("Cache-Control", "public, max-age=86400");

    return new Response(object.body, { headers });
  } catch (error) {
    console.error("GET /api/media failed:", error);
    return NextResponse.json({ error: "No se pudo cargar la imagen" }, { status: 500 });
  }
}
