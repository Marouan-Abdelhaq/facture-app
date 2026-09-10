import type { Metadata } from "next";

import { DM_Serif_Display, Inter } from "next/font/google";

import { AppShell } from "@/components/layout/app-shell";

import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";

import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${dmSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <ServiceWorkerRegister />

        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
