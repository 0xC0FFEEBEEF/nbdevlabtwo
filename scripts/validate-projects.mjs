import { readdir, readFile } from "node:fs/promises";
import { join, basename } from "node:path";

const PROJECT_DIR = join(process.cwd(), "src", "content", "projects");
const REQUIRED_FIELDS = [
  "title",
  "date",
  "status",
  "tags",
  "problem",
  "constraints",
  "stack",
  "lessons",
];

const SLUG_PATTERN = /^[a-z0-9]+(?:[\-_][a-z0-9]+)*$/;

const sanitizeSlug = (value) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\-_]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");

const files = await readdir(PROJECT_DIR, { withFileTypes: true });
const seen = new Map();
let issues = 0;

for (const entry of files) {
  if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
  const filePath = join(PROJECT_DIR, entry.name);
  const source = await readFile(filePath, "utf8");
  const match = source.match(/^---\n([\s\S]*?)\n---/);

  if (!match) {
    console.warn(`⚠️  ${entry.name}: missing front-matter block.`);
    issues++;
    continue;
  }

  const frontmatter = match[1];

  const readField = (field) => {
    const regex = new RegExp(`^${field}:\s*(.+)$`, "m");
    const fieldMatch = frontmatter.match(regex);
    if (!fieldMatch) return undefined;
    return fieldMatch[1].trim().replace(/^"|"$/g, "");
  };

  const hasArrayField = (field) => {
    const regex = new RegExp(`^${field}:\s*\n(\s*-\s+.+\n?)+`, "m");
    return regex.test(frontmatter);
  };

  const slugSource = readField("slug") || basename(entry.name, ".md");
  const derivedSlug = sanitizeSlug(slugSource);

  if (!readField("title")) {
    console.warn(`⚠️  ${entry.name}: missing required field "title".`);
    issues++;
  }

  if (!SLUG_PATTERN.test(derivedSlug)) {
    console.warn(`⚠️  ${entry.name}: slug "${derivedSlug}" does not match ${SLUG_PATTERN}.`);
    issues++;
  }

  for (const field of REQUIRED_FIELDS) {
    if (["tags", "constraints", "stack", "lessons"].includes(field)) {
      if (!hasArrayField(field)) {
        console.warn(`⚠️  ${entry.name}: field "${field}" must list at least one item.`);
        issues++;
      }
    } else if (!readField(field)) {
      console.warn(`⚠️  ${entry.name}: missing required field "${field}".`);
      issues++;
    }
  }

  const key = derivedSlug;
  if (seen.has(key)) {
    console.warn(`⚠️  Duplicate slug detected between ${entry.name} and ${seen.get(key)}.`);
    issues++;
  } else {
    seen.set(key, entry.name);
  }
}

if (issues > 0) {
  console.warn(`\n⚠️  Project validation completed with ${issues} warning${issues === 1 ? "" : "s"}.`);
} else {
  console.log("✅ Project front-matter looks good.");
}
