import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// Entry ids are "<lang>/<page>", e.g. "en/home".
const pages = defineCollection({
  loader: glob({ pattern: "{en,ar}/*.md", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    // Home page only.
    heading: z.string().optional(),
    intro: z.string().optional(),
    skills: z.array(z.string()).optional(),
    links: z.array(z.object({ slug: z.string(), audience: z.string(), text: z.string() })).optional(),
    cta: z.object({ text: z.string() }).optional(),
  }),
});

// Entry ids are "<lang>/<role id>"; untranslated facts live in src/data/experience.json.
const experience = defineCollection({
  loader: glob({ pattern: "{en,ar}/*.md", base: "./src/content/experience" }),
  schema: z.object({
    title: z.string(),
    location: z.string(),
  }),
});

// One entry per locale ("en", "ar"); src/lib/roadmap.ts checks both list the same phase ids.
const roadmapItem = z.object({
  label: z.string().optional(),
  text: z.string().optional(),
  items: z.array(z.object({ label: z.string().optional(), text: z.string() })).optional(),
});
const roadmap = defineCollection({
  loader: glob({ pattern: "{en,ar}.json", base: "./src/content/roadmap" }),
  schema: z.object({
    phases: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        period: z.string(),
        // Short line for the phase card.
        summary: z.string(),
        // Longer line under the phase heading.
        overview: z.string(),
        sections: z.array(z.object({ heading: z.string(), items: z.array(roadmapItem) })),
        // Paragraphs of the collapsible full story.
        prose: z.array(z.string()),
      }),
    ),
  }),
});

export const collections = { pages, experience, roadmap };
