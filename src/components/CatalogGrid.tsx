"use client";

import { modelFilters } from "@/data/site";
import type { CatalogModel } from "@/lib/db/types";
import { site } from "@/data/site";
import Image from "next/image";
import { useState } from "react";

type CatalogGridProps = {
  models: CatalogModel[];
};

function CatalogTile({ model }: { model: CatalogModel }) {
  const [imageError, setImageError] = useState(false);
  const showImage = model.imageUrl && !imageError;

  return (
    <a
      href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(`Hola, me interesa contratar a ${model.name} para modelaje`)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col overflow-hidden rounded-lg border border-stone-700/80 bg-stone-950 transition hover:border-amber-400/50 hover:shadow-lg hover:shadow-amber-950/20"
    >
      <div
        className={`relative aspect-square w-full overflow-hidden bg-gradient-to-br ${model.accent}`}
      >
        {showImage ? (
          <Image
            src={model.imageUrl!}
            alt={`Modelo ${model.name}`}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-serif text-4xl text-white/20">{model.name.charAt(0)}</span>
          </div>
        )}
        <span className="absolute left-2 top-2 rounded bg-black/50 px-2 py-0.5 text-[10px] uppercase tracking-wider text-amber-100 backdrop-blur-sm">
          {model.category}
        </span>
      </div>
      <div className="border-t border-stone-800 px-3 py-3 text-center">
        <h3 className="font-serif text-sm leading-tight text-stone-100 sm:text-base">
          {model.name}
        </h3>
        <p className="mt-1 text-[11px] uppercase tracking-widest text-stone-500">{model.label}</p>
        {model.services.length > 0 && (
          <div className="mt-2 flex flex-wrap justify-center gap-1">
            {model.services.slice(0, 3).map((service) => (
              <span
                key={service.id}
                className="rounded bg-stone-800 px-1.5 py-0.5 text-[10px] text-stone-400"
              >
                {service.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </a>
  );
}

export function CatalogGrid({ models }: CatalogGridProps) {
  const [activeFilter, setActiveFilter] =
    useState<(typeof modelFilters)[number]>("Todos");

  const filtered =
    activeFilter === "Todos"
      ? models
      : models.filter((model) => model.category === activeFilter);

  return (
    <section id="catalogo" className="bg-stone-900 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-10 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-300/80">Catálogo</p>
          <h2 className="mt-3 font-serif text-3xl text-stone-50 sm:text-4xl">
            Conoce nuestras modelos VIP
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-stone-400">
            Selecciona una modelo para consultar tarifas, servicios y disponibilidad
            por WhatsApp.
          </p>
        </div>

        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {modelFilters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`rounded-full px-4 py-2 text-xs uppercase tracking-wider transition ${
                activeFilter === filter
                  ? "bg-amber-400 text-stone-950"
                  : "border border-stone-700 text-stone-400 hover:border-amber-400/40 hover:text-stone-200"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {models.length === 0 ? (
          <p className="py-16 text-center text-stone-500">
            No hay modelos activas en el catálogo. Agrega registros en D1 con{" "}
            <code className="text-amber-300">active = 1</code>.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {filtered.map((model) => (
              <CatalogTile key={model.id} model={model} />
            ))}
          </div>
        )}

        {models.length > 0 && filtered.length === 0 && (
          <p className="py-16 text-center text-stone-500">
            No hay modelos en esta categoría por ahora.
          </p>
        )}
      </div>
    </section>
  );
}
