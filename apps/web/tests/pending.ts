// Known gaps the QA checks skip. Each issue removes its entry when it lands.
export const pending = {
  // Linked from the nav but not built yet (BUILD-1391 to BUILD-1396).
  routes: ["about", "experience", "workflow", "roadmap", "services", "contact"].flatMap((slug) => [
    `/en/${slug}/`,
    `/ar/${slug}/`,
  ]),
  // Canonical and hreflang tags arrive with BUILD-1404.
  seoLinks: true,
};
