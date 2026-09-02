// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Static output. A Cloudflare adapter is only needed for SSR/on-demand
// rendering — a blog is fully prerenderable, so we ship plain files to
// Cloudflare's edge and skip the Worker invocation entirely.
export default defineConfig({
  site: 'https://lawsonbh.org',
  integrations: [sitemap()],
  build: { format: 'directory' },
  markdown: {
    shikiConfig: { theme: 'github-dark', wrap: true },
  },
});
