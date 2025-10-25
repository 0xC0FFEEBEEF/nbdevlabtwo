import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().optional(),
  }),
});

const projects = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    date: z.string(),
    status: z.enum(["shipped", "building", "research"]),
    tags: z.array(z.string()),
    problem: z.string(),
    constraints: z.array(z.string()),
    stack: z.array(z.string()),
    lessons: z.array(z.string()),
    links: z
      .object({
        repo: z.string().url().optional(),
        demo: z.string().url().optional(),
      })
      .optional(),
  }),
});

const homepage = defineCollection({
  type: "data",
  schema: z.object({
    highlightCards: z.array(
      z.object({
        title: z.string(),
        description: z.string(),
        href: z.string(),
        badge: z.string(),
        accent: z.string().optional(),
      })
    ),
    nowItems: z.array(
      z.object({
        label: z.string(),
        detail: z.string(),
      })
    ),
    timeline: z.array(
      z.object({
        date: z.string(),
        title: z.string(),
        detail: z.string(),
      })
    ),
    activityCard: z.object({
      title: z.string(),
      description: z.string(),
      href: z.string(),
      badge: z.string(),
      accent: z.string().optional(),
      repo: z.string(),
      timestamp: z.string(),
      meta: z.string().optional(),
    }),
  }),
});

export const collections = { blog, projects, homepage };
