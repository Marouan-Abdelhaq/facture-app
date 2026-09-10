import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mon Cahier",
    short_name: "Mon Cahier",
    description: "Application de gestion des factures et crédits",

    start_url: "/",
    display: "standalone",

    background_color: "#ffffff",
    theme_color: "#1e3a5f",

    lang: "fr",
    dir: "ltr",

    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
