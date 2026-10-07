// Shared UI strings. Arabic placeholders start with TODO-AR (listed by `pnpm check:i18n`).
export const languages = { en: "English", ar: "العربية" } as const;
export type Lang = keyof typeof languages;
export const langs = Object.keys(languages) as Lang[];
export const dir = (lang: Lang) => (lang === "ar" ? "rtl" : "ltr");

const en = {
  "nav.home": "Home",
  "nav.about": "About",
  "nav.experience": "Experience",
  "nav.workflow": "Workflow",
  "nav.roadmap": "Roadmap",
  "nav.services": "Services",
  "nav.contact": "Contact",
  "nav.menu": "Menu",
  "nav.close": "Close menu",
  "nav.label": "Main",
  "nav.skip": "Skip to content",
  "footer.email": "Email",
  "footer.privacy": "Privacy notice",
  "theme.dark": "Dark mode",
  "lang.switch": "Language",
  "button.contact": "Get in touch",
  "form.name": "Name",
  "form.email": "Email",
  "form.message": "Message",
  "form.submit": "Send message",
  "form.sending": "Sending…",
  "form.success": "Thanks, your message has been sent.",
  "form.emailFallback": "You can also email me directly:",
  "field.required": "This field is required.",
  "field.too_long": "This is too long.",
  "field.too_short": "This is too short.",
  "field.invalid_email": "Enter a valid email address.",
  "error.validation_failed": "Please check the highlighted fields.",
  "error.captcha_failed": "The spam check failed. Please try again.",
  "error.payload_too_large": "Your message is too long.",
  "error.rate_limited": "Too many messages. Please try again in a few minutes.",
  "error.send_failed": "Your message couldn't be sent. Please try again later.",
  "error.unavailable": "The form is temporarily unavailable. Please try again later.",
  "error.network": "Couldn't reach the server. Check your connection and try again.",
} as const;

export type UIKey = keyof typeof en;

const ar: Record<UIKey, string> = {
  "nav.home": "الرئيسية",
  "nav.about": "نبذة عني",
  "nav.experience": "الخبرات",
  "nav.workflow": "أسلوب العمل",
  "nav.roadmap": "خارطة التعلّم",
  "nav.services": "الخدمات",
  "nav.contact": "تواصل معي",
  "nav.menu": "TODO-AR Menu",
  "nav.close": "TODO-AR Close menu",
  "nav.label": "TODO-AR Main",
  "nav.skip": "TODO-AR Skip to content",
  "footer.email": "TODO-AR Email",
  "footer.privacy": "TODO-AR Privacy notice",
  "theme.dark": "TODO-AR Dark mode",
  "lang.switch": "TODO-AR Language",
  "button.contact": "TODO-AR Get in touch",
  "form.name": "TODO-AR Name",
  "form.email": "TODO-AR Email",
  "form.message": "TODO-AR Message",
  "form.submit": "TODO-AR Send message",
  "form.sending": "TODO-AR Sending…",
  "form.success": "TODO-AR Thanks, your message has been sent.",
  "form.emailFallback": "TODO-AR You can also email me directly:",
  "field.required": "TODO-AR This field is required.",
  "field.too_long": "TODO-AR This is too long.",
  "field.too_short": "TODO-AR This is too short.",
  "field.invalid_email": "TODO-AR Enter a valid email address.",
  "error.validation_failed": "TODO-AR Please check the highlighted fields.",
  "error.captcha_failed": "TODO-AR The spam check failed. Please try again.",
  "error.payload_too_large": "TODO-AR Your message is too long.",
  "error.rate_limited": "TODO-AR Too many messages. Please try again in a few minutes.",
  "error.send_failed": "TODO-AR Your message couldn't be sent. Please try again later.",
  "error.unavailable": "TODO-AR The form is temporarily unavailable. Please try again later.",
  "error.network": "TODO-AR Couldn't reach the server. Check your connection and try again.",
};

const ui: Record<Lang, Record<UIKey, string>> = { en, ar };

export const t = (lang: Lang) => (key: UIKey) => ui[lang][key];
