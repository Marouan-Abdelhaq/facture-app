import type { Metadata, Viewport } from "next";

import { Inter } from "next/font/google";

import { AppShell } from "@/components/layout/app-shell";

import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";

import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mon Cahier | Gestion Factures",
  description: "Application de gestion des factures et crédits",

  applicationName: "Mon Cahier",

  manifest: "/manifest.webmanifest",

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mon Cahier",
  },

  icons: {
    icon: [
      {
        url: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],

    apple: [
      {
        url: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1B365D",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full">
        <ServiceWorkerRegister />

        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
