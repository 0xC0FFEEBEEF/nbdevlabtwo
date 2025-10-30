import { defineCollection, z } from "astro:content";

const projects = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    // Optional: if omitted, we derive from file path via entry.slug
    slug: z.string().optional(),
    // Keep 'date' as STRING to match existing content
    date: z.string(),
    status: z.enum(["draft", "published"]).default("published"),
    tags: z.array(z.string()).min(1),
    constraints: z.array(z.string()).min(1),
    stack: z.array(z.string()).min(1),
    lessons: z.array(z.string()).min(1),
    links: z
      .object({
        repo: z.string().url().optional(),
        demo: z.string().url().optional(),
      })
      .optional(), // allow omitting links entirely
  }),
});

// Define 'pages' explicitly to avoid auto-generation deprecation
const pages = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string().optional(),
  }),
});

export const collections = { projects, pages };
