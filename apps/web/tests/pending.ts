// Known gaps the QA checks skip. Each issue removes its entry when it lands.
export const pending = {
  // Linked from the footer and Contact page but not built yet (BUILD-1397).
  routes: ["privacy"].flatMap((slug) => [`/en/${slug}/`, `/ar/${slug}/`]),
  // Canonical and hreflang tags arrive with BUILD-1404.
  seoLinks: true,
};
