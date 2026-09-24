# Rules for AI agents working in this app

This repo renders ONE community's public Site with Astro on a Cloudflare
Worker (`output: 'server'`, `@astrojs/cloudflare`): `/`, `/<slug…>`, `/blog`,
`/blog/<slug>` and a 404 for anything else. Every other path on the hostname
(`/login`, `/join`, `/feeds`, `/dashboard`, `/api`, `/_next`, `/robots.txt`,
`/sitemap.xml`…) is served by the EzyCommunity App and never reaches this
Worker — link to those with a plain `<a href>`.

- Keep the adapter `@astrojs/cloudflare` (14.x). `@astrojs/node|vercel|netlify`
  are refused by the platform. npm only: keep `package-lock.json` committed and
  no other lockfile.
- Commit NO wrangler config (`wrangler.json[c]`/`.toml`): the platform writes the
  deploy config at build time.
- NO `Astro.session` and NO on-demand image transforms (`imageService` stays
  `'passthrough'`): the platform strips the SESSION KV and IMAGES bindings, so
  both fail at request time.
- Never create pages under an App path (`src/pages/api/`, `src/pages/login.astro`…)
  or a `robots.txt` / `sitemap.xml` (as a page or in `public/`) — the App owns
  those URLs and visitors never see them.
- ALL data access goes through `src/lib/api.ts`, called from page frontmatter.
  Outbound fetches from the deployed Worker are allowlisted to the community's
  own hostname only; never fetch from a browser `<script>`.
- The API base is `EZY_SITE_URL` from `import {env} from 'cloudflare:workers'`
  (set by the platform; `.env` in dev), falling back to `Astro.url.origin`.
  `Astro.locals.runtime` no longer exists. Relative fetch URLs fail on the server.
- The community hostname is behind Cloudflare, which 403s a request with no
  `User-Agent`: server-side fetches send one plus `Accept: application/json`.
- NEVER let a member email reach the page — `src/lib/api.ts` re-projects every
  API response field by field for exactly this reason; keep that shape rather
  than spreading raw JSON.
- Brand = name + logo + favicon from `/api/public/site/v1/initial-data`. That
  payload has no description and no colours; don't invent fields for them.
- An unknown post sets `Astro.response.status = 404` and renders `NotFound`.
- Do not add a `base` or asset prefix: the site is served at `/` on its own
  origin.
- No `.github/workflows/` — the site deploys from the platform, not Actions.
