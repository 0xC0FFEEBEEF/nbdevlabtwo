import { readdir, readFile } from "node:fs/promises";
import { join, basename } from "node:path";

const PROJECT_DIR = join(process.cwd(), "src", "content", "projects");
const REQUIRED_FIELDS = [
  "title",
  "slug",
  "date",
  "status",
  "tags",
  "constraints",
  "stack",
  "lessons",
];

const STATUS_VALUES = new Set(["draft", "published"]);
const SLUG_PATTERN = /^[a-z0-9]+(?:[\-_][a-z0-9]+)*$/;

const sanitizeSlug = (value = "") =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\-_]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");

const parseFrontmatter = (source) => {
  const match = source.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    return { data: null, raw: null };
  }

  const raw = match[1];
  const data = {};
  let currentArray = null;

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (trimmed === "" || trimmed.startsWith("#")) {
      continue;
    }

    const arrayItemMatch = line.match(/^\s*-\s+(.+)$/);
    if (arrayItemMatch && currentArray) {
      const value = arrayItemMatch[1].trim().replace(/^"|"$/g, "");
      data[currentArray].push(value);
      continue;
    }

    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) {
      currentArray = null;
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const rawValue = line.slice(separatorIndex + 1).trim();

    if (rawValue === "") {
      currentArray = key;
      data[key] = [];
      continue;
    }

    currentArray = null;

    if (rawValue.startsWith("[") && rawValue.endsWith("]")) {
      const items = rawValue
        .slice(1, -1)
        .split(",")
        .map((item) => item.trim().replace(/^"|"$/g, ""))
        .filter(Boolean);
      data[key] = items;
    } else {
      data[key] = rawValue.replace(/^"|"$/g, "");
    }
  }

  return { data, raw };
};

const files = await readdir(PROJECT_DIR, { withFileTypes: true });
const seen = new Map();
let issues = 0;

for (const entry of files) {
  if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
  const filePath = join(PROJECT_DIR, entry.name);
  const source = await readFile(filePath, "utf8");
  const { data, raw } = parseFrontmatter(source);

  if (!data) {
    console.warn(`⚠️  ${entry.name}: missing front-matter block.`);
    issues++;
    continue;
  }

  const slugSource = data.slug || basename(entry.name, ".md");
  const derivedSlug = sanitizeSlug(slugSource);

  if (!data.title) {
    console.warn(`⚠️  ${entry.name}: missing required field "title".`);
    issues++;
  }

  if (!SLUG_PATTERN.test(derivedSlug)) {
    console.warn(`⚠️  ${entry.name}: slug "${derivedSlug}" does not match ${SLUG_PATTERN}.`);
    issues++;
  }

  for (const field of REQUIRED_FIELDS) {
    const value = data[field];

    if (["tags", "constraints", "stack", "lessons"].includes(field)) {
      if (!Array.isArray(value) || value.length === 0) {
        console.warn(`⚠️  ${entry.name}: field "${field}" must list at least one item.`);
        issues++;
      }
    } else if (!value) {
      console.warn(`⚠️  ${entry.name}: missing required field "${field}".`);
      issues++;
    }
  }

  if (data.status && !STATUS_VALUES.has(data.status)) {
    console.warn(
      `⚠️  ${entry.name}: status "${data.status}" must be one of ${Array.from(STATUS_VALUES).join(", ")}.`
    );
    issues++;
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
