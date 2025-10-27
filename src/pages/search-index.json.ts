import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { resolveProjectSlug } from "../lib/projects";

const toDate = (value: unknown) => (value instanceof Date ? value : new Date(String(value)));

export const prerender = true;

const stripMarkdown = (value: string) =>
  value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
    .replace(/[#>*_~`-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const GET: APIRoute = async () => {
  const [projects, blog] = await Promise.all([
    getCollection("projects"),
    getCollection("blog"),
  ]);

  const projectDocs = projects.map((entry) => {
    const slug = resolveProjectSlug(entry);
    return {
      id: `project-${slug}`,
      type: "project" as const,
      title: entry.data.title,
      url: `/projects/${slug}/`,
      tags: entry.data.tags,
      summary: entry.data.problem,
      content: stripMarkdown(entry.body),
      date: entry.data.date,
    };
  });

  const blogDocs = blog.map((entry) => {
    const slug = entry.slug;
    return {
      id: `blog-${slug}`,
      type: "lab-note" as const,
      title: entry.data.title,
      url: `/blog/${slug}/`,
      tags: entry.data.tags ?? [],
      summary: entry.data.description ?? "",
      content: stripMarkdown(entry.body),
      date: toDate(entry.data.pubDate).toISOString(),
    };
  });

  const documents = [...projectDocs, ...blogDocs];

  const tokenize = (value: string) =>
    value
      .toLowerCase()
      .split(/[^a-z0-9]+/g)
      .map((token) => token.trim())
      .filter(Boolean);

  const index: Record<string, number[]> = {};

  documents.forEach((doc, idx) => {
    const tokens = new Set([
      ...tokenize(doc.title),
      ...tokenize(doc.content),
      ...doc.tags.flatMap((tag) => tokenize(tag)),
      doc.type,
    ]);
    tokens.forEach((token) => {
      if (!index[token]) {
        index[token] = [];
      }
      index[token].push(idx);
    });
  });

  const payload = {
    generatedAt: new Date().toISOString(),
    items: documents.map(({ content, ...rest }) => rest),
    index,
  };

  return new Response(JSON.stringify(payload), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=300, s-maxage=900",
    },
  });
};
