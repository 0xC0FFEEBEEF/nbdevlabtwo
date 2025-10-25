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
    description: z.string().optional(),
    link: z.string().url().optional(),
    tags: z.array(z.string()).optional(),
    image: z.string().optional(),
    featured: z.boolean().optional(),
    weight: z.number().int().optional(),
    pubDate: z.coerce.date().optional(),
    draft: z.boolean().optional(),
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
