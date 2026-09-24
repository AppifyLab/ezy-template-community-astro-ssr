import cloudflare from '@astrojs/cloudflare';
import {defineConfig} from 'astro/config';

// Every page is rendered on request, on a Cloudflare Worker, so it always shows
// your community's latest brand and posts.
//
// No wrangler config is committed: the platform writes the deploy config at
// build time, so it can never be broken by an edit here.
export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    // Images are shown as they are, never resized on the Worker: on-demand image
    // transforms need a Cloudflare Images binding the platform does not give a Site.
    imageService: 'passthrough',
  }),
  // Sessions need a KV binding the platform does not give a Site either; with
  // them on, any `Astro.session` call would fail at request time.
  session: false,
});
