// CloudFront Function, viewer-response, runtime cloudfront-js-2.0.
// 404 pages are uploaded with x-amz-meta-error-page; serve them with status 404. Pre-launch: noindex everything.
// CONFIG is filled in by WebStack at deploy: { prelaunch: boolean }.
const CONFIG = __CONFIG__;

function handler(event) {
  const response = event.response;
  const headers = response.headers;

  if (headers["x-amz-meta-error-page"]) {
    // Only full responses: turning a 304 revalidation into 404 would send an empty body.
    if (response.statusCode === 200) {
      response.statusCode = 404;
      response.statusDescription = "Not Found";
    }
    delete headers["x-amz-meta-error-page"];
  }

  if (CONFIG.prelaunch) headers["x-robots-tag"] = { value: "noindex" };
  return response;
}
