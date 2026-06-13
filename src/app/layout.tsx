import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";

const sans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const serif = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Reusch Models | Agencia de modelaje VIP en Temuco",
  description:
    "Agencia de modelaje profesional en Temuco. Modelos VIP para campañas comerciales, editoriales, pasarela y eventos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${sans.variable} ${serif.variable} scroll-smooth`}>
      <body className="min-h-full bg-stone-950 font-sans text-stone-200 antialiased">
        {children}
      </body>
    </html>
  );
}
