import { defineCollection, z } from "astro:content";

// Blog posts (matches Astro blog starter frontmatter)
const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.coerce.date(),          // accepts "2025-08-17" strings
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),  // or use image() if you import assets
    tags: z.array(z.string()).optional(),
    draft: z.boolean().default(false),
  }),
});

// Pages (your editable homepage content)
const pages = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string().optional(),
    hero: z.object({
      headline: z.string().optional(),
      subheadline: z.string().optional(),
      badges: z.array(z.string()).optional(),
      ctas: z
        .array(
          z.object({
            text: z.string(),
            href: z.string(),
            variant: z.enum(["primary", "default"]).default("default"),
          })
        )
        .optional(),
    }).optional(),
    about: z.object({
      paragraphs: z.array(z.string()).optional(),
    }).optional(),
    status: z.object({
      blurb: z.string().optional(),
      note: z.string().optional(),
    }).optional(),
    contact: z.object({
      email: z.string().optional(),
      github: z.string().optional(),
      githubHandle: z.string().optional(),
    }).optional(),
  }),
});

export const collections = { blog, pages };


