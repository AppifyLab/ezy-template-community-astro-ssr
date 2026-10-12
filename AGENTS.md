# Rules for AI agents working in this app

This repo renders ONE community's public Site with Astro on a Cloudflare
Worker (`output: 'server'`, `@astrojs/cloudflare`): `/`, `/<slug…>`, `/blog`,
`/blog/<slug>` and a 404 for anything else. Every other path on the hostname
(`/login`, `/join`, `/feeds`, `/dashboard`, `/api`, `/_next`, `/robots.txt`,
`/sitemap.xml`…) is served by the EzyCommunity App and never reaches this
Worker — link to those with a plain `<a href>`.

- Keep the adapter `@astrojs/cloudflare` (this Template pins 14.x; the platform
  needs 13 or later). `@astrojs/node|vercel|netlify` are refused by the
  platform.
- This Template uses npm: keep `package-lock.json` committed (the Build then
  runs `npm ci`) and add no second lockfile. That is the Template's choice —
  the platform picks npm, pnpm or yarn from the lockfile, and refuses bun.
- Commit NO wrangler config (`wrangler.json[c]`/`.toml`): the platform writes the
  deploy config at build time.
- NO `Astro.session` and NO on-demand image transforms (`imageService` stays
  `'passthrough'`): the platform strips the SESSION KV and IMAGES bindings, so
  both fail at request time.
- Never create pages under an App path (`src/pages/api/`, `src/pages/login.astro`…)
  or a `robots.txt` / `sitemap.xml` (as a page or in `public/`) — the App owns
  those URLs and visitors never see them.
- This Template does ALL data access in `src/lib/api.ts`, called from page
  frontmatter at request time, so `api.ts` decides field by field what reaches
  the page. Keep it that way — never fetch from a browser `<script>`. (The
  platform itself also allows browser fetches to relative `/api/public/...`;
  server-only is this Template's choice.)
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

## Platform rules

True for any code on an EzyCommunity Site, not only this Template:

- **What is built is detected from the files, and the verdict is final:**
  TanStack Start (`@tanstack/react-start`), Astro (static, or SSR with
  `@astrojs/cloudflare` only), or a root `index.html` published as-is.
  Next.js, Nuxt, SvelteKit, Remix, React Router (framework mode), Gatsby,
  Angular and un-built Vite / CRA / Eleventy source are refused. The project
  sits at the repository root (a zip may wrap it in one folder); a Node project
  has one lockfile (npm, pnpm or yarn; bun is refused). Server code runs on
  Cloudflare Workers (`nodejs_compat`), not Node.
- **The App owns** `/api`, `/login`, `/join`, `/feeds`, `/dashboard`,
  `/settings`, `/_next`, `/robots.txt`, `/sitemap.xml`,
  `/<product>/<id>/checkout` and more: a file or route there is never served
  (the dashboard lists it as a shadowed path). Link to App pages with a plain
  `<a href>`.
- **Community data comes from its own hostname.** The public API
  (`/api/public/...`): server code builds the URL from `EZY_SITE_URL` (a plain
  variable, not a secret), browser code uses relative URLs. Server code may
  also read as the community, at member level, from `/api/site/v1/...` with
  `Authorization: Bearer ${env.EZY_COMMUNITY_KEY}` — never emails or payment
  data. Data fetched during the Build is frozen until the next Build (a
  Redeploy reuses the old output) — fetch at request time or in the browser.
- **Secrets are platform-provided only.** The platform sets `DATABASE_URL`
  (the Site Database) and `EZY_COMMUNITY_KEY` as Worker secrets: read them
  from `env` (`import {env} from 'cloudflare:workers'`) in server code only.
  Never send them to the browser, log them, write them to a file (`.env`,
  `.dev.vars`, config) or commit them. You cannot add secrets: never hardcode
  a key, token or password, never ask the owner for one. Never send a
  member's email address to the browser.
- **Network.** Deployed server code reaches ONLY the community's own hostname
  and its Site Database (`db.prisma.io`); every other host fails `403 Egress
  blocked`. Raw TCP (`pg`, `postgres`, `node:net`) does not work at all.
- **Site API and Site Database** (optional; this Template uses neither): one
  Hono app at `/site-api/*`, mounted by `src/pages/site-api/[...path].ts`
  (`ALL`, `prerender = false`), on Prisma 7 Postgres. The Astro app Template
  (`AppifyLab/ezy-template-community-astro-app`) shows both. Server code
  calls the Site API in-process (`hc<AppType>(url, {fetch: app.request})` or
  `app.request(path)`); never `fetch()` the own hostname for `/site-api/…` or
  a page: deployed, it reaches the App (a 404), not this Worker. Server
  fetches of `/api/…` are fine.
- **No deploy config.** Don't commit `wrangler.*`: the platform writes the
  Worker config and drops any KV, R2, D1 or other binding.
