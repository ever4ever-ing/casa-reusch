import Link from "next/link";
import { PhotoCarousel } from "@/components/PhotoCarousel";
import { site } from "@/data/site";
import type { ModelDetail } from "@/lib/db/types";

type ModelProfileProps = {
  model: ModelDetail;
};

export function ModelProfile({ model }: ModelProfileProps) {
  const whatsappMessage = `Hola, me interesa contratar a ${model.name} para modelaje`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <Link
        href="/#catalogo"
        className="mb-8 inline-flex text-sm text-stone-400 transition hover:text-amber-200"
      >
        ← Volver al catálogo
      </Link>

      <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
        <PhotoCarousel
          photos={model.photos}
          modelName={model.name}
          accent={model.accent}
        />

        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-amber-300/80">{model.label}</p>
          <h1 className="mt-2 font-serif text-4xl text-stone-50 sm:text-5xl">{model.name}</h1>
          <span className="mt-4 inline-block rounded-full bg-amber-400/10 px-4 py-1 text-sm uppercase tracking-wider text-amber-200">
            {model.category}
          </span>

          {model.services.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xs uppercase tracking-wider text-stone-500">Servicios</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {model.services.map((service) => (
                  <span
                    key={service.id}
                    className="rounded-full border border-stone-700 px-4 py-1.5 text-sm text-stone-300"
                  >
                    {service.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-amber-400 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-stone-950 transition hover:bg-amber-300"
            >
              Consultar por WhatsApp
            </a>
            <a
              href={`tel:${site.phone}`}
              className="inline-flex items-center justify-center rounded-full border border-stone-600 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-stone-200 transition hover:border-amber-400/50 hover:text-amber-100"
            >
              {site.phoneDisplay}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
