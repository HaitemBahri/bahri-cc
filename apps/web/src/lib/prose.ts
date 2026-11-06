// No typography plugin, so rendered Markdown pages (About, Privacy) are styled with these classes.
export const prose = [
  "max-w-3xl py-8 md:py-16",
  "[&_h1]:text-4xl [&_h1]:font-semibold [&_h1]:text-balance md:[&_h1]:text-5xl",
  "[&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-semibold",
  "[&_h3]:mt-10 [&_h3]:text-xl [&_h3]:font-semibold",
  "[&_p]:text-muted-foreground [&_p]:mt-6 [&_p]:text-lg",
  "[&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:ps-5",
  "[&_a]:text-primary-accent [&_a]:rounded-sm [&_a]:underline [&_a]:underline-offset-4 [&_a]:outline-none [&_a]:focus-visible:ring-3 [&_a]:focus-visible:ring-outline",
].join(" ");
