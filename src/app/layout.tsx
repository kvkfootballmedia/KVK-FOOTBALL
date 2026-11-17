import type { Metadata } from "next";
import { Oswald, Roboto } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KVK Football | L'Actualité du Football au Carré",
  description: "L'actualité du Football comme nulle part ailleurs.",
  icons: {
    icon: [
      { url: '/LOGO KVK.png', sizes: '32x32', type: 'image/png' },
      { url: '/LOGO KVK.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/LOGO KVK.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'icon', url: '/LOGO KVK.png', sizes: '192x192' },
      { rel: 'icon', url: '/LOGO KVK.png', sizes: '512x512' },
    ],
  },
  openGraph: {
    title: "KVK Football | L'Actualité du Football au Carré",
    description: "L'actualité du Football comme nulle part ailleurs.",
    type: "website",
    locale: "fr_FR",
    url: "https://kvk-football.com",
    siteName: "KVK Football",
    images: [
      {
        url: "https://kvk-football.com/LOGO KVK.png",
        width: 512,
        height: 512,
        alt: "KVK Football",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "KVK Football | L'Actualité du Football au Carré",
    description: "L'actualité du Football comme nulle part ailleurs.",
    images: ["https://kvk-football.com/LOGO KVK.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        {/* Google Analytics */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script
          async
          src="https://www.googletagmanager.com/gtm.js?id=GTM-MG3RQPK6"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());`,
          }}
        />
        <meta name="google-adsense-account" content="ca-pub-2960298571069732" />
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2960298571069732"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${oswald.variable} ${roboto.variable} font-sans antialiased bg-gray-50 text-gray-900 min-h-screen flex flex-col`}
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
