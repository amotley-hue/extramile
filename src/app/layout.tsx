import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { business } from "@/lib/business";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { LocalBusinessSchema } from "@/components/local-business-schema";
import { Reveal } from "@/components/reveal";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(business.url),
  title: {
    default: `${business.fullName} — Private Chauffeur Service in Atlanta`,
    template: `%s · ${business.fullName}`,
  },
  description:
    "Atlanta private chauffeur and black car service. Airport transfers, corporate travel, and hourly charters — quoted instantly, driven personally by owner Craig Mason.",
  keywords: [
    "Atlanta limo service",
    "Atlanta chauffeur service",
    "ATL airport car service",
    "black car service Atlanta",
    "Atlanta corporate transportation",
    "Hartsfield-Jackson airport transfer",
  ],
  authors: [{ name: business.owner }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: business.fullName,
    url: business.url,
    title: `${business.fullName} — Private Chauffeur Service in Atlanta`,
    description:
      "Airport transfers, corporate travel, and hourly charters across metro Atlanta. Quoted instantly. Driven personally.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${business.fullName} — Atlanta Chauffeur Service`,
    description:
      "Airport transfers, corporate travel, and hourly charters across metro Atlanta. Quoted instantly. Driven personally.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0c0e",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ink text-cream">
        <Reveal />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-brass focus:px-4 focus:py-2 focus:font-medium focus:text-ink"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <LocalBusinessSchema />
      </body>
    </html>
  );
}
