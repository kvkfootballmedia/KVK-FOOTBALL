import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  weight: ["300", "400", "700", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KVK Football | Actualité, Analyse et Culture Football",
  description: "Média éditorial indépendant dédié au football francophone. Analyses tactiques, longs formats et actualité décryptée.",
  openGraph: {
    title: "KVK Football",
    description: "Le football raconté avec sérieux et passion.",
    type: "website",
    locale: "fr_FR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${inter.variable} ${merriweather.variable} font-sans antialiased bg-gray-100 text-gray-900 min-h-screen flex flex-col`}
      >
        <Navbar />

        <main className="flex-grow">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
