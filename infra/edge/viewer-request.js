// CloudFront Function, viewer-request, runtime cloudfront-js-2.0.
// Order: www → apex, address redirects, pre-launch holding page, unknown pages → localized 404, /path/ → /path/index.html.
// CONFIG is filled in by WebStack at deploy: { routes: string[], prelaunch: boolean, previewToken: string }.
const CONFIG = __CONFIG__;
const HOST = "bahri.cc";
const PREVIEW_COOKIE = "Path=/; Max-Age=2592000; Secure; HttpOnly; SameSite=Lax";

function handler(event) {
  const request = event.request;
  const uri = request.uri;
  const host = request.headers.host ? request.headers.host.value : HOST;

  if (host === "www." + HOST) return redirect(301, "https://" + HOST + uri + queryString(request.querystring));

  // API, built assets and plain files (robots.txt, favicon.svg) pass through untouched.
  if (uri.startsWith("/api/") || uri.startsWith("/_astro/") || isFile(uri)) return request;

  if (uri === "/") return redirect(301, "/en/" + queryString(request.querystring));
  if (!uri.endsWith("/")) return redirect(301, uri + "/" + queryString(request.querystring));

  const lang = uri.startsWith("/ar/") ? "ar" : "en";

  if (CONFIG.prelaunch) {
    const preview = request.querystring.preview;
    if (preview && isPreviewToken(preview.value)) {
      // Set the cookie, then drop the token from the address.
      delete request.querystring.preview;
      const response = redirect(302, uri + queryString(request.querystring));
      response.cookies = { preview: { value: CONFIG.previewToken, attributes: PREVIEW_COOKIE } };
      return response;
    }
    const cookie = request.cookies.preview;
    if (!(cookie && isPreviewToken(cookie.value))) {
      request.uri = "/" + lang + "/coming-soon/index.html";
      return request;
    }
  }

  request.uri = (CONFIG.routes.includes(uri) ? uri : "/" + lang + "/404/") + "index.html";
  return request;
}

function isPreviewToken(value) {
  return CONFIG.previewToken.length > 0 && value === CONFIG.previewToken;
}

function isFile(uri) {
  return uri.slice(uri.lastIndexOf("/") + 1).includes(".");
}

function queryString(querystring) {
  const parts = [];
  for (const key in querystring) {
    const entry = querystring[key];
    const values = entry.multiValue ? entry.multiValue.map((v) => v.value) : [entry.value];
    for (const value of values) parts.push(value === "" ? key : key + "=" + value);
  }
  return parts.length ? "?" + parts.join("&") : "";
}

function redirect(statusCode, location) {
  return {
    statusCode,
    statusDescription: statusCode === 301 ? "Moved Permanently" : "Found",
    headers: { location: { value: location } },
  };
}
