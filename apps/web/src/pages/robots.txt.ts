import type { APIRoute } from "astro";

// Closed unless PUBLIC_PRELAUNCH is explicitly "false", so a misconfigured build never opens the site.
const prelaunch = import.meta.env.PUBLIC_PRELAUNCH !== "false";

export const GET: APIRoute = () =>
  new Response(prelaunch ? "User-agent: *\nDisallow: /\n" : "User-agent: *\nAllow: /\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
