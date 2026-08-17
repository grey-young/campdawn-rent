// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: ["@nuxt/icon", "@nuxt/image", "@nuxt/fonts", "@nuxtjs/seo"],

  css: ["~/assets/css/main.css"],
  ssr: false,

  site: {
    url: "https://rent.campdawnesports.com",
    name: "Campdawn",
    description:
      "Rent consoles, screens, headsets and every piece of gear a great gaming night needs, anywhere in Accra. Delivered, set up and ready to play.",
    defaultLocale: "en-GH",
  },

  app: {
    head: {
      htmlAttrs: { lang: "en-GH" },
      meta: [
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1, viewport-fit=cover",
        },
        { name: "theme-color", content: "#06070A" },
      ],
      link: [
        { rel: "icon", type: "image/png", href: "/icon.png" },
        { rel: "apple-touch-icon", href: "/icon.png" },
        { rel: "mask-icon", href: "/icon.png", color: "#f8c93f" },
      ],
    },
  },

  fonts: {
    families: [
      // Self-hosted from public/fonts/Robus.otf — single Regular weight only
      { name: "Robus", provider: "local", weights: [400] },
      {
        name: "Space Grotesk",
        provider: "google",
        weights: [400, 500, 600, 700],
      },
      { name: "Inter", provider: "google", weights: [400, 500, 600] },
      // Self-hosted from public/fonts/KnightWarrior.otf — single Regular weight, no italic
      { name: "Knight Warrior", provider: "local", weights: [400] },
      {
        name: "Instrument Serif",
        provider: "google",
        weights: [400],
        styles: ["normal", "italic"],
      },
      { name: "JetBrains Mono", provider: "google", weights: [400, 500] },
    ],
  },

  // Static/SPA deploy (ssr: false) has no Nitro server, so the default IPX
  // provider's /_ipx/* routes 404 in production. Sources in public/ are already
  // optimized .webp — serve them directly.
  image: {
    provider: "none",
  },

  icon: {
    mode: "svg",
    serverBundle: "local",
    clientBundle: {
      scan: true,
      includeCustomCollections: true,
    },
  },

  experimental: {
    viewTransition: false,
  },

  vite: {
    build: {
      target: "esnext",
    },
  },

  nitro: {
    compressPublicAssets: true,
  },
});
