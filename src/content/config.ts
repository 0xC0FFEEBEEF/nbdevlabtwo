import { defineCollection, z } from "astro:content";
import type { CollectionEntry } from "astro:content";

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

const slugPattern = /^[a-z0-9]+(?:[\-_][a-z0-9]+)*$/;

const projectSchema = z.object({
  title: z.string(),
  slug: z
    .string()
    .regex(slugPattern, "Slug must contain only lowercase letters, numbers, dashes, or underscores.")
    .optional(),
  date: z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Date must be ISO-8601 compliant.",
  }),
  status: z.enum(["shipped", "building", "research"]),
  tags: z.array(z.string()).min(1),
  problem: z.string(),
  constraints: z.array(z.string()).min(1),
  stack: z.array(z.string()).min(1),
  lessons: z.array(z.string()).min(1),
  links: z
    .object({
      repo: z.string().url().optional(),
      demo: z.string().url().optional(),
    })
    .optional(),
});

const projects = defineCollection({
  type: "content",
  schema: projectSchema,
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

export type ProjectCollectionEntry = CollectionEntry<"projects">;
export type ProjectFrontmatter = z.infer<typeof projectSchema>;

export const collections = { blog, projects, homepage };
