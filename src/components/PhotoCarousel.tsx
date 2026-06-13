"use client";

import { useCallback, useEffect, useState } from "react";

type PhotoCarouselProps = {
  photos: { id: string; imageUrl: string }[];
  modelName: string;
  accent: string;
};

export function PhotoCarousel({ photos, modelName, accent }: PhotoCarouselProps) {
  const [current, setCurrent] = useState(0);
  const total = photos.length;

  const goTo = useCallback(
    (index: number) => {
      if (total === 0) return;
      setCurrent((index + total) % total);
    },
    [total],
  );

  useEffect(() => {
    setCurrent(0);
  }, [photos]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") goTo(current - 1);
      if (e.key === "ArrowRight") goTo(current + 1);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [current, goTo]);

  if (total === 0) {
    return (
      <div
        className={`flex aspect-[3/4] w-full items-center justify-center rounded-2xl bg-gradient-to-br ${accent}`}
      >
        <span className="font-serif text-6xl text-white/20">{modelName.charAt(0)}</span>
      </div>
    );
  }

  const photo = photos[current];

  return (
    <div className="relative">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-stone-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={photo.id}
          src={photo.imageUrl}
          alt={`${modelName} - foto ${current + 1}`}
          className="h-full w-full object-cover"
        />

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(current - 1)}
              aria-label="Foto anterior"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition hover:bg-black/70"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => goTo(current + 1)}
              aria-label="Foto siguiente"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition hover:bg-black/70"
            >
              ›
            </button>
            <span className="absolute right-3 top-3 rounded-full bg-black/50 px-3 py-1 text-xs text-white backdrop-blur-sm">
              {current + 1} / {total}
            </span>
          </>
        )}
      </div>

      {total > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {photos.map((thumb, index) => (
            <button
              key={thumb.id}
              type="button"
              onClick={() => goTo(index)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                index === current ? "border-amber-400" : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={thumb.imageUrl} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
