# Community site — Astro (SSR)

A starter for your community's **public website**, built with
[Astro](https://astro.build) and rendered on request on a Cloudflare Worker:
every page is built fresh for each visitor, from your community's live data.

## Put it live

Make your own copy first — this repository is a template, you never edit it
directly:

- **Upload a zip** — download this template as a zip, change what you like and
  upload the zip (the project folder, not `dist/`) on the **Custom code** page
  of your EzyCommunity dashboard. Every new upload replaces the live site.
- **Or connect GitHub** — click **Use this template** on GitHub to copy it into
  your own account, then pick that repository and a branch on the dashboard.
  Every push to that branch redeploys your site.

The platform sees `astro` and `@astrojs/cloudflare` in `package.json`, installs
with `npm ci` (so keep `package-lock.json` committed), runs `npm run build` and
deploys the Worker.

## What this site controls — and what it doesn't

Your community lives on one address (for example
`https://intel.ezycommunity.com`). Two things serve it, and the split is fixed:

| Address                   | Served by        |
| ------------------------- | ---------------- |
| `/` (home)                | **this site**    |
| any page slug             | **this site**    |
| `/blog`, `/blog/a-post`   | **this site**    |
| `/login`, `/join`         | EzyCommunity     |
| `/feeds`, `/dashboard`    | EzyCommunity     |
| `/api`, other app paths   | EzyCommunity     |

So your public, marketing pages live here; the community product itself
(sign-up, log in, the feed, courses, events, settings) is run by EzyCommunity.
Link to it with ordinary links (`<a href="/feeds">`), as these pages do. A page
you add under an app path (say `src/pages/api/…` or `src/pages/login.astro`) is
never reached by visitors — the dashboard lists any it finds.

## Your content comes from your community

Nothing is hard-coded. The pages read your **live** community data on the
server, over your site's own public API:

- your name, logo and favicon (`/api/public/site/v1/initial-data`)
- your published blog posts (`/api/public/blog/post/...`)

Edit a post in your dashboard and it shows here on the next visit — no
redeploy needed.

### `EZY_SITE_URL`

`EZY_SITE_URL` is your site's own address. The deployed site is given it
automatically; you only need it when running the site on your own machine. It is
the **only** address this site is allowed to call — outbound requests to any
other host are blocked, so keep all data fetching pointed at your own community.

## Running it on your machine

```bash
cp .env.example .env     # then set EZY_SITE_URL to your community's address
npm install
npm run dev              # http://localhost:4321
```

```bash
npm run build            # the Worker, into dist/
```

## Where things are

```
src/
  pages/
    index.astro          the home page
    blog/index.astro     the blog list (?page=2 for older posts)
    blog/[slug].astro    a single blog post
    404.astro            any address that has no page
  layouts/Base.astro     header, footer, <title>, favicon — wraps every page
  components/            small pieces shared by the pages
  lib/api.ts             every call to your community's API lives here
  styles/global.css      all the styling, plain CSS
```

Two rules worth keeping:

1. **Fetch data in page frontmatter through `src/lib/api.ts`**, never from a
   `<script>` in the browser — this template keeps every API call on the
   server.
2. Don't use `Astro.session` or on-demand image resizing: the platform gives
   your Worker neither a session store nor an image service.

## Getting help

Broke something? Your recent deploys are kept, so you can redeploy an earlier one
from your dashboard while you fix it.
