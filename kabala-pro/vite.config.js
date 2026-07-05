import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({

   server: {
  host: "0.0.0.0",
  allowedHosts: [
    "desktop-sbd4jj7.taila368f5.ts.net"
  ],
  proxy: {
    "/api": {
      target: "http://127.0.0.1:4000",
      changeOrigin: true
    },
    "/health": {
      target: "http://127.0.0.1:4000",
      changeOrigin: true
    }
  }
},
  
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      devOptions: {
        enabled: false,
      },
      includeAssets: [
        "icon-192.png",
        "icon-512.png",
        "maskable-icon-192.png",
        "maskable-icon-512.png",
        "assets/**/*",
        "fonts/**/*",
        "angeles/**/*",
        "mentores/**/*",
        "signos/**/*"
      ],
      workbox: {
        globPatterns: [
          "**/*.{html,js,css,ico,png,jpg,jpeg,webp,svg,ttf,woff,woff2}"
        ],
        maximumFileSizeToCacheInBytes: 30 * 1024 * 1024,
        navigateFallback: "/index.html"
      },
      manifest: {
  id: "/",

  name: "Kabala Pro - Sistema Angelical",

  short_name: "Kabala Pro",

  description: "Generador de Cartas Angelicales",

  theme_color: "#e7d1ad",

  background_color: "#f4e6cf",

  display: "standalone",

  orientation: "portrait",

  start_url: "/",

 icons: [
  {
    src: "/icon-192.png",
    sizes: "192x192",
    type: "image/png",
    purpose: "any",
  },
  {
    src: "/icon-512.png",
    sizes: "512x512",
    type: "image/png",
    purpose: "any",
  },
  {
    src: "/maskable-icon-192.png",
    sizes: "192x192",
    type: "image/png",
    purpose: "maskable",
  },
  {
    src: "/maskable-icon-512.png",
    sizes: "512x512",
    type: "image/png",
    purpose: "maskable",
  },
]
}
    }),
  ],
});
