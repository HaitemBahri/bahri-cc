// Known gaps the QA checks skip. Each issue removes its entry when it lands.
export const pending = {
  // Linked from the nav or footer but not built yet (BUILD-1394 to BUILD-1397).
  routes: ["roadmap", "services", "contact", "privacy"].flatMap((slug) => [
    `/en/${slug}/`,
    `/ar/${slug}/`,
  ]),
  // Canonical and hreflang tags arrive with BUILD-1404.
  seoLinks: true,
};
