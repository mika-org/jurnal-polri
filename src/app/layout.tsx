import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { getSiteUrl } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const siteUrl = getSiteUrl();
const defaultOgImage = `${siteUrl}/api/og-image`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Jurnal Polisi - Portal Berita & Informasi Hukum Terpercaya",
    template: "%s | Jurnal Polisi",
  },
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
    icon: "/images/logo-icon.png",
    shortcut: "/images/logo-icon.png",
    apple: "/images/logo-icon.png",
  },
  openGraph: {
    title: "Jurnal Polisi - Portal Berita & Informasi Hukum Terpercaya",
    description:
      "Media berita independen menyajikan informasi akurat seputar kepolisian, penegakan hukum, dan kamtibmas.",
    url: siteUrl,
    siteName: "Jurnal Polisi",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: defaultOgImage,
        secureUrl: defaultOgImage,
        width: 1200,
        height: 630,
        type: "image/jpeg",
        alt: "Jurnal Polisi - Portal Berita & Informasi Hukum Terpercaya",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jurnal Polisi - Portal Berita & Informasi Hukum Terpercaya",
    description:
      "Portal berita independen menyajikan informasi akurat seputar kepolisian, penegakan hukum, dan kamtibmas.",
    images: [defaultOgImage],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/images/logo-icon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/images/logo-icon.png" />
        <link rel="image_src" href={defaultOgImage} />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col font-sans bg-white dark:bg-[#120808] text-stone-900 dark:text-stone-100 transition-colors"
      >
        {children}
      </body>
    </html>
  );
}
