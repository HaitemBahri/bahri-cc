import type { Lang, UIKey } from "@/i18n/ui";

// One source for header, mobile menu and footer.
export const navItems = [
  { key: "nav.home", slug: "" },
  { key: "nav.about", slug: "about" },
  { key: "nav.experience", slug: "experience" },
  { key: "nav.workflow", slug: "workflow" },
  { key: "nav.roadmap", slug: "roadmap" },
  { key: "nav.services", slug: "services" },
  { key: "nav.contact", slug: "contact" },
] as const satisfies readonly { key: UIKey; slug: string }[];

export const contact = {
  email: "me@bahri.cc",
  github: "https://github.com/HaitemBahri",
};

export const pageHref = (lang: Lang, slug: string) => (slug ? `/${lang}/${slug}/` : `/${lang}/`);
