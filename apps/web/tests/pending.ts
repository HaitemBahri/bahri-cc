// Known gaps the QA checks skip. Each issue removes its entry when it lands.
export const pending = {
  // Linked but not built yet.
  routes: [] as string[],
  // Canonical and hreflang tags arrive with BUILD-1404.
  seoLinks: true,
};
