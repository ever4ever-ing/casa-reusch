import { About } from "@/components/About";
import { CatalogGrid } from "@/components/CatalogGrid";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { getCatalogModels } from "@/lib/db/models";

export const dynamic = "force-dynamic";

export default async function Home() {
  const models = await getCatalogModels();

  return (
    <>
      <Header />
      <main>
        <Hero />
        <CatalogGrid models={models} />
        <About />
      </main>
      <Footer />
    </>
  );
}
