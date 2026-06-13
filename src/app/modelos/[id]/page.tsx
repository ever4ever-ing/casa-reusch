import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ModelProfile } from "@/components/ModelProfile";
import { getModelById } from "@/lib/db/models";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const model = await getModelById(id);
  if (!model) return { title: "Modelo no encontrada" };

  return {
    title: `${model.name} | Reusch Models`,
    description: `Perfil de ${model.name} - ${model.category}. Agencia de modelaje VIP en Temuco.`,
  };
}

export default async function ModeloPage({ params }: PageProps) {
  const { id } = await params;
  const model = await getModelById(id);

  if (!model) notFound();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-950 pt-20">
        <ModelProfile model={model} />
      </main>
      <Footer />
    </>
  );
}
