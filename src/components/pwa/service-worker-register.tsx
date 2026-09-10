"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => {
          console.log("Service Worker enregistré avec succès");
        })
        .catch((error) => {
          console.error(
            "Erreur lors de l'enregistrement du Service Worker:",
            error,
          );
        });
    }
  }, []);

  return null;
}
