import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const targetPath = join(process.cwd(), "node_modules", "astro", "dist", "content", "utils.js");
const originalSnippet =
  "const { slug, ...unvalidatedData } = entry.unvalidatedData;\n    data = unvalidatedData;";
const patchedSnippet =
  "const { slug, ...unvalidatedData } = entry.unvalidatedData;\n    data = slug === undefined ? unvalidatedData : { slug, ...unvalidatedData };";

try {
  const source = await readFile(targetPath, "utf8");
  if (source.includes(patchedSnippet)) {
    console.log("Astro slug patch already applied.");
  } else if (source.includes(originalSnippet)) {
    const updated = source.replace(originalSnippet, patchedSnippet);
    await writeFile(targetPath, updated, "utf8");
    console.log("Applied Astro slug patch to preserve frontmatter slug field.");
  } else {
    console.warn("Unable to locate Astro slug patch target. Build may fail if slug is required in schema.");
  }
} catch (error) {
  if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
    console.warn("Astro utils file not found; skipping slug patch.");
  } else {
    throw error;
  }
}
