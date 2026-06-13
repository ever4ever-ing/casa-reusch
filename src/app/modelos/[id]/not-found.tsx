import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function ModelNotFound() {
  return (
    <>
      <Header />
      <main className="flex min-h-screen flex-col items-center justify-center bg-stone-950 px-4 pt-20 text-center">
        <h1 className="font-serif text-3xl text-stone-100">Modelo no encontrada</h1>
        <p className="mt-4 text-stone-400">La modelo que buscas no existe o no está disponible.</p>
        <Link
          href="/#catalogo"
          className="mt-8 rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-stone-950"
        >
          Ver catálogo
        </Link>
      </main>
      <Footer />
    </>
  );
}
