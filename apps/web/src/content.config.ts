import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// Entry ids are "<lang>/<page>", e.g. "en/home".
const pages = defineCollection({
  loader: glob({ pattern: "{en,ar}/*.md", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
  }),
});

export const collections = { pages };
