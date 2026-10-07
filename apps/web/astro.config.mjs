// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  // Production sends a 301 at the edge (BUILD-1389); this covers dev and preview.
  redirects: { '/': '/en/' },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ar'],
    routing: { prefixDefaultLocale: true }
  },
  vite: {
    plugins: [tailwindcss()]
  }
});
