// Runs the edge functions with test config: `node --test` from infra/.
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const TOKEN = "s3cret";
const ROUTES = ["/en/", "/ar/", "/en/about/", "/ar/about/", "/en/404/", "/ar/404/"];

const load = (file, config) => {
  const code = readFileSync(new URL(file, import.meta.url), "utf8").replace("__CONFIG__", JSON.stringify(config));
  return new Function(`${code}; return handler;`)();
};
const viewerRequest = (config) => load("./viewer-request.js", { routes: ROUTES, previewToken: TOKEN, ...config });
const viewerResponse = (config) => load("./viewer-response.js", config);

const request = (uri, { host = "bahri.cc", query = {}, cookies = {} } = {}) => ({
  request: {
    uri,
    headers: { host: { value: host } },
    querystring: Object.fromEntries(Object.entries(query).map(([k, v]) => [k, { value: v }])),
    cookies: Object.fromEntries(Object.entries(cookies).map(([k, v]) => [k, { value: v }])),
  },
});

const live = viewerRequest({ prelaunch: false });
const prelaunch = viewerRequest({ prelaunch: true });

test("www redirects to the apex, keeping path and query", () => {
  const r = live(request("/en/about/", { host: "www.bahri.cc", query: { a: "1" } }));
  assert.equal(r.statusCode, 301);
  assert.equal(r.headers.location.value, "https://bahri.cc/en/about/?a=1");
});

test("/ redirects to /en/", () => {
  const r = live(request("/"));
  assert.equal(r.statusCode, 301);
  assert.equal(r.headers.location.value, "/en/");
});

test("a page without trailing slash redirects, keeping the query", () => {
  const r = live(request("/en/contact", { query: { x: "y" } }));
  assert.equal(r.statusCode, 301);
  assert.equal(r.headers.location.value, "/en/contact/?x=y");
});

test("known pages are rewritten to index.html", () => {
  assert.equal(live(request("/en/about/")).uri, "/en/about/index.html");
  assert.equal(live(request("/ar/")).uri, "/ar/index.html");
});

test("unknown pages get the 404 page of their language", () => {
  assert.equal(live(request("/en/nope/")).uri, "/en/404/index.html");
  assert.equal(live(request("/ar/nope/")).uri, "/ar/404/index.html");
  assert.equal(live(request("/fr/")).uri, "/en/404/index.html");
});

test("assets, API and files pass through untouched", () => {
  for (const uri of ["/_astro/app.abc.js", "/_astro/missing.css", "/api/contact", "/robots.txt", "/favicon.svg"]) {
    for (const fn of [live, prelaunch]) assert.equal(fn(request(uri)).uri, uri);
  }
});

test("pre-launch shows the holding page in the right language", () => {
  assert.equal(prelaunch(request("/en/about/")).uri, "/en/coming-soon/index.html");
  assert.equal(prelaunch(request("/ar/")).uri, "/ar/coming-soon/index.html");
  assert.equal(prelaunch(request("/en/nope/")).uri, "/en/coming-soon/index.html");
});

test("pre-launch still applies the address redirects first", () => {
  assert.equal(prelaunch(request("/")).headers.location.value, "/en/");
  assert.equal(prelaunch(request("/en/about")).headers.location.value, "/en/about/");
});

test("the preview link sets the cookie and drops the token from the address", () => {
  const r = prelaunch(request("/en/about/", { query: { preview: TOKEN, a: "1" } }));
  assert.equal(r.statusCode, 302);
  assert.equal(r.headers.location.value, "/en/about/?a=1");
  assert.equal(r.cookies.preview.value, TOKEN);
  assert.match(r.cookies.preview.attributes, /Secure; HttpOnly; SameSite=Lax/);
  assert.match(r.cookies.preview.attributes, /Max-Age=2592000/);
});

test("the preview cookie shows the real site", () => {
  assert.equal(prelaunch(request("/en/about/", { cookies: { preview: TOKEN } })).uri, "/en/about/index.html");
  assert.equal(prelaunch(request("/ar/nope/", { cookies: { preview: TOKEN } })).uri, "/ar/404/index.html");
});

test("a wrong or empty token does not bypass", () => {
  assert.equal(prelaunch(request("/en/", { query: { preview: "wrong" } })).uri, "/en/coming-soon/index.html");
  assert.equal(prelaunch(request("/en/", { cookies: { preview: "wrong" } })).uri, "/en/coming-soon/index.html");
  const noToken = viewerRequest({ prelaunch: true, previewToken: "" });
  assert.equal(noToken(request("/en/", { query: { preview: "" } })).uri, "/en/coming-soon/index.html");
  assert.equal(noToken(request("/en/", { cookies: { preview: "" } })).uri, "/en/coming-soon/index.html");
});

const response = (statusCode, headers = {}) => ({
  response: {
    statusCode,
    statusDescription: "OK",
    headers: Object.fromEntries(Object.entries(headers).map(([k, v]) => [k, { value: v }])),
  },
});

test("error pages are served with status 404 and the marker header removed", () => {
  const r = viewerResponse({ prelaunch: false })(response(200, { "x-amz-meta-error-page": "true" }));
  assert.equal(r.statusCode, 404);
  assert.equal(r.headers["x-amz-meta-error-page"], undefined);
});

test("a 304 revalidation of an error page stays 304", () => {
  const r = viewerResponse({ prelaunch: false })(response(304, { "x-amz-meta-error-page": "true" }));
  assert.equal(r.statusCode, 304);
  assert.equal(r.headers["x-amz-meta-error-page"], undefined);
});

test("normal pages keep their status; noindex only in pre-launch", () => {
  const liveResponse = viewerResponse({ prelaunch: false })(response(200));
  assert.equal(liveResponse.statusCode, 200);
  assert.equal(liveResponse.headers["x-robots-tag"], undefined);
  assert.equal(viewerResponse({ prelaunch: true })(response(200)).headers["x-robots-tag"].value, "noindex");
});
