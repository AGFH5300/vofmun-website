import type React from "react";
import type { Metadata, Viewport } from "next";
import { DM_Sans, DM_Serif_Display, Lato, Poppins } from "next/font/google";
import "./globals.css";
import { ScrollRestoration } from "@/components/scroll-restoration";
import { Toaster } from "@/components/ui/sonner";

const lato = Lato({
  subsets: ["latin"],
  variable: "--font-lato",
  display: "swap",
  weight: ["300", "400", "700", "900"],
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  variable: "--font-dm-serif-display",
  display: "swap",
  weight: ["400"],
});

const metadataBase = new URL("https://vofmun.org")
const ogImage = "/logo.svg"

export const metadata: Metadata = {
  metadataBase,
  title: "VOFMUN - Voices of the Future Model United Nations",
  description:
    "Join VOFMUN - A youth-driven platform bringing together tomorrow's leaders to debate, collaborate, and create solutions for global challenges.",
  keywords: [
    "Model UN",
    "MUN",
    "VOFMUN",
    "Youth Leadership",
    "Diplomacy",
    "Global Issues",
  ],
  authors: [{ name: "VOFMUN Team" }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "VOFMUN - Voices of the Future Model United Nations",
    description: "Join VOFMUN - A youth-driven platform for tomorrow's leaders",
    type: "website",
    url: "https://vofmun.org",
    siteName: "VOFMUN",
    images: [
      {
        url: ogImage,
        width: 512,
        height: 512,
        alt: "VOFMUN logo",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "VOFMUN - Voices of the Future Model United Nations",
    description:
      "Youth-driven platform empowering tomorrow's leaders to debate and collaborate on global solutions.",
    images: [ogImage],
  },

  icons: {
    icon: [
      { url: "/favicons/favicon-16x16.png", sizes: "16x16" },
      { url: "/favicons/favicon-32x32.png", sizes: "32x32" },
      { url: "/favicons/android-chrome-192x192.png", sizes: "192x192" },
      { url: "/favicons/android-chrome-512x512.png", sizes: "512x512" },
    ],
    apple: [{ url: "/favicons/apple-touch-icon.png" }],
    shortcut: "/favicons/favicon.ico",
  },
  manifest: "/favicons/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Voices of the Future Model United Nations (VOFMUN)",
    url: "https://vofmun.org",
    logo: "https://vofmun.org/logo.svg",
    description:
      "Youth-driven Model United Nations conference fostering diplomacy, collaboration, and leadership.",
  };

  return (
    <html lang="en" className={`${dmSerifDisplay.variable} ${dmSans.variable}`}>
      <body className="font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <ScrollRestoration />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
