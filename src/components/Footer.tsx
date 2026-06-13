import { site } from "@/data/site";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-stone-950 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center sm:px-6">
        <p className="font-serif text-lg text-amber-100">{site.name}</p>
        <p className="max-w-xl text-sm text-stone-500">
          Si desea recibir mayor información sobre nuestros servicios de modelaje o
          contratar talentos, contáctenos.
        </p>
        <a
          href={`tel:${site.phone}`}
          className="text-lg font-medium text-stone-200 transition hover:text-amber-200"
        >
          {site.phone}
        </a>
        <p className="text-xs text-stone-600">
          © {new Date().getFullYear()} {site.name}. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
