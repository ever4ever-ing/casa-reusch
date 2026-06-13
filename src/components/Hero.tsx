import { site } from "@/data/site";

export function Hero() {
  return (
    <section
      id="inicio"
      className="relative flex min-h-screen items-center overflow-hidden bg-stone-950 pt-20"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.12),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(120,113,108,0.25),transparent_50%)]" />
      <div className="relative mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:py-24">
        <p className="mb-4 text-sm uppercase tracking-[0.3em] text-amber-300/80">
          {site.tagline}
        </p>
        <h1 className="font-serif text-4xl leading-tight text-stone-50 sm:text-5xl lg:text-6xl">
          Modelos VIP para tu próxima producción
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-stone-400">
          {site.reference}. Ofrecemos responsabilidad y calidad en servicios de
          modelaje profesional, dentro y fuera de Temuco.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <a
            href={`tel:${site.phone}`}
            className="inline-flex items-center justify-center rounded-full bg-amber-400 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-stone-950 transition hover:bg-amber-300"
          >
            {site.phoneDisplay}
          </a>
          <a
            href={`https://wa.me/${site.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-stone-600 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-stone-200 transition hover:border-amber-400/50 hover:text-amber-100"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
