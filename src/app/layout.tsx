import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jurnal Polisi - Portal Berita & Informasi Hukum Terpercaya",
  description:
    "Portal berita independen menyajikan informasi akurat seputar kepolisian, penegakan hukum, kamtibmas, dan pelayanan masyarakat.",
  keywords: [
    "Jurnal Polisi",
    "Berita Polisi",
    "Kamtibmas",
    "Hukum",
    "Polri Presisi",
    "ETLE",
    "Patroli",
  ],
  authors: [{ name: "Redaksi Jurnal Polisi" }],
  icons: {
    icon: "/images/logo.svg",
  },
  openGraph: {
    title: "Jurnal Polisi - Portal Berita & Informasi Hukum Terpercaya",
    description:
      "Media berita independen menyajikan informasi akurat seputar kepolisian dan kamtibmas.",
    url: "https://jurnalpolisi.id",
    siteName: "Jurnal Polisi",
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <head>
        <link rel="icon" href="/images/logo.svg" type="image/svg+xml" />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-white dark:bg-[#120808] text-stone-900 dark:text-stone-100 transition-colors">
        {children}
      </body>
    </html>
  );
}
