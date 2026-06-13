import { navLinks, site } from "@/data/site";

export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-stone-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <a href="#inicio" className="font-serif text-xl tracking-wide text-amber-100">
          {site.name}
        </a>
        <nav className="hidden items-center gap-8 sm:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm uppercase tracking-widest text-stone-300 transition hover:text-amber-200"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <a
          href={`tel:${site.phone}`}
          className="rounded-full border border-amber-400/40 px-4 py-2 text-xs font-medium uppercase tracking-wider text-amber-100 transition hover:bg-amber-400/10 sm:text-sm"
        >
          Llamar
        </a>
      </div>
    </header>
  );
}
