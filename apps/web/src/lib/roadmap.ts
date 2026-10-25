import { getEntry } from "astro:content";
import { langs, type Lang } from "@/i18n/ui";

// Returns one locale's phases. Throws (failing the build) when a locale is missing or the phase ids differ.
export async function getPhases(lang: Lang) {
  const entries = await Promise.all(langs.map(async (l) => [l, await getEntry("roadmap", l)] as const));
  const missing = entries.filter(([, entry]) => !entry).map(([l]) => `src/content/roadmap/${l}.json`);
  if (missing.length) throw new Error(`Missing roadmap content: ${missing.join(", ")}`);

  const ids = entries.map(([l, entry]) => [l, entry!.data.phases.map((phase) => phase.id).join(", ")] as const);
  if (new Set(ids.map(([, list]) => list)).size > 1) {
    throw new Error(`Roadmap phase ids differ between locales:\n${ids.map(([l, list]) => `${l}: ${list}`).join("\n")}`);
  }

  return entries.find(([l]) => l === lang)![1]!.data.phases;
}
