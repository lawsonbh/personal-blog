# Blog

Astro static site, deployed to Cloudflare Pages via GitHub Actions.

## Adding a post

Create `src/content/posts/my-post.md`:

```markdown
---
title: "My post"
description: "One-line summary — used on the index card and in RSS."
pubDate: 2026-09-10
draft: false
---

Body copy here.
```

That's the whole workflow. The index list, RSS feed, sitemap, reading time, and
the post URL (`/posts/my-post/`) are all derived from the file. Frontmatter is
schema-validated in `src/content.config.ts`, so a typo fails the build rather
than silently shipping.

`draft: true` hides a post from production builds but keeps it visible in
`npm run dev`.

## Commands

    npm run dev       # local dev server, hot reload
    npm run build     # build to ./dist
    npm run preview   # serve ./dist locally
    npm run check     # typecheck .astro files

## Deployment

Push to `main` → GitHub Actions builds and deploys to Cloudflare Pages.
Pull requests deploy to a Cloudflare preview URL, commented on the PR.

One-time setup:

1. Cloudflare dashboard → Workers & Pages → Create → Pages → **Direct Upload**.
   Name the project `blog` (must match `--project-name` in the workflow).
   Do *not* also connect Git integration — the two deploy paths conflict.
2. Repo secrets: `CLOUDFLARE_API_TOKEN` (needs the *Cloudflare Pages: Edit*
   permission) and `CLOUDFLARE_ACCOUNT_ID`.
3. Set your real domain in `astro.config.mjs` (`site`) and `public/robots.txt`.
   RSS links, canonical URLs, and the sitemap are all built from it.

## Layout

    src/content/posts/     Markdown posts — the only files you edit routinely
    src/content.config.ts  Frontmatter schema
    src/layouts/Base.astro Nav, footer, <head> metadata
    src/pages/             index, about, 404, /posts/[...slug], rss.xml
    src/styles/style.css   All styling
    public/_headers        Security + cache headers applied at Cloudflare's edge
    public/_redirects      301s from the old hand-written URLs
