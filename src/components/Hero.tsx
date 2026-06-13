import { services, site } from "@/data/site";

export function Hero() {
  return (
    <section
      id="inicio"
      className="relative flex min-h-screen items-center overflow-hidden bg-stone-950 pt-20"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.12),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(120,113,108,0.25),transparent_50%)]" />
      <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-24">
        <div>
          <p className="mb-4 text-sm uppercase tracking-[0.3em] text-amber-300/80">
            {site.tagline}
          </p>
          <h1 className="font-serif text-4xl leading-tight text-stone-50 sm:text-5xl lg:text-6xl">
            Modelos VIP para tu próxima producción
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-stone-400">
            {site.reference}. Ofrecemos responsabilidad y calidad en servicios de
            modelaje profesional, dentro y fuera de Temuco.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
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

        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
          <h2 className="mb-6 font-serif text-2xl text-amber-100">Servicios de modelaje</h2>
          <ul className="space-y-4">
            {services.map((service) => (
              <li
                key={service}
                className="flex items-start gap-3 text-stone-300 before:mt-2 before:block before:h-1.5 before:w-1.5 before:shrink-0 before:rounded-full before:bg-amber-400"
              >
                {service}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
