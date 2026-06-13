import { aboutText, site } from "@/data/site";

export function About() {
  return (
    <section id="nosotros" className="bg-stone-950 py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-amber-300/80">
            Quiénes somos
          </p>
          <h2 className="mt-3 font-serif text-3xl text-stone-50 sm:text-4xl">
            {site.name}
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-stone-400">{aboutText}</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-stone-900 to-stone-950 p-8">
          <h3 className="font-serif text-xl text-amber-100">Contáctanos</h3>
          <dl className="mt-6 space-y-4 text-stone-300">
            <div>
              <dt className="text-xs uppercase tracking-wider text-stone-500">Teléfono</dt>
              <dd className="mt-1">
                <a href={`tel:${site.phone}`} className="hover:text-amber-200">
                  {site.phoneDisplay}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-stone-500">Email</dt>
              <dd className="mt-1">
                <a href={`mailto:${site.email}`} className="hover:text-amber-200">
                  {site.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-stone-500">Ubicación</dt>
              <dd className="mt-1">{site.address}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
