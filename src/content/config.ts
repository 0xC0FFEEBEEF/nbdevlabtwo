import { defineCollection, z } from "astro:content";

const pages = defineCollection({
  type: "data",
  schema: z.object({
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    hero: z.object({
      headline: z.string().optional(),
      subheadline: z.string().optional(),
      badges: z.array(z.string()).optional(),
      ctas: z.array(
        z.object({
          href: z.string(),
          text: z.string(),
          variant: z.enum(["primary","default"]).default("default"),
        })
      ).optional(),
    }).optional(),
    status: z.object({ blurb: z.string().optional(), note: z.string().optional() }).optional(),
    about: z.object({ paragraphs: z.array(z.string()).optional() }).optional(),
    contact: z.object({ email: z.string().optional(), github: z.string().optional(), githubHandle: z.string().optional() }).optional(),
  }),
});

export const collections = { pages };
