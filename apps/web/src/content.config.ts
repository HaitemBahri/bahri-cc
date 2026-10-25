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

export const collections = { pages };
