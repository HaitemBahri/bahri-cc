import { getCollection, type CollectionEntry } from "astro:content";
import facts from "@/data/experience.json";
import { langs, type Lang } from "@/i18n/ui";

type Fact = { id: string; company?: string; start: string; end?: string };
export type Role = Fact & { entry: CollectionEntry<"experience"> };

// Joins the untranslated facts with one locale's text, newest role first.
// Throws (failing the build) when a fact lacks a file in any locale or a file has no fact.
export async function getRoles(lang: Lang): Promise<Role[]> {
  const entries = await getCollection("experience");
  const ids = new Set((facts as Fact[]).map((fact) => fact.id));
  const problems = [
    ...entries.filter((entry) => !ids.has(entry.id.split("/")[1])).map((entry) => `${entry.id}.md has no entry in experience.json`),
    ...[...ids].flatMap((id) =>
      langs.filter((l) => !entries.some((entry) => entry.id === `${l}/${id}`)).map((l) => `experience.json "${id}" has no ${l}/${id}.md`),
    ),
  ];
  if (problems.length) throw new Error(`Experience content mismatch:\n${problems.join("\n")}`);

  return (facts as Fact[])
    .map((fact) => ({ ...fact, entry: entries.find((entry) => entry.id === `${lang}/${fact.id}`)! }))
    .sort((a, b) => b.start.localeCompare(a.start));
}
