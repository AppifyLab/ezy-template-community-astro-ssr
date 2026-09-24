// The one var the platform hands the deployed Worker (read via `cloudflare:workers`).
declare namespace Cloudflare {
  interface Env {
    EZY_SITE_URL?: string;
  }
}
