import { execSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import * as cheerio from "cheerio";
import type { HeroMemory } from "../data/hero_memory/types";
import { cleanEffectText, readCodexHtml } from "./lib/codex";

const extractHeroMemoryData = (html: string): HeroMemory[] => {
  const $ = cheerio.load(html);
  const items: HeroMemory[] = [];

  const rows = $('#heroMemory tbody tr[class*="thing"]');
  console.log(`Found ${rows.length} hero memory rows`);

  rows.each((_, row) => {
    const tds = $(row).find("td");

    if (tds.length !== 3) {
      console.warn(`Skipping row with ${tds.length} columns (expected 3)`);
      return;
    }

    const item: HeroMemory = {
      type: $(tds[0]).text().trim(),
      item: $(tds[1]).text().trim(),
      affix: cleanEffectText($(tds[2]).html() || ""),
    };

    items.push(item);
  });

  return items;
};

const generateDataFile = (items: HeroMemory[]): string => {
  return `import type { HeroMemory } from "./types";

export const HeroMemories: readonly HeroMemory[] = ${JSON.stringify(items)};
`;
};

const main = async (): Promise<void> => {
  console.log("Reading HTML file...");
  const html = await readCodexHtml();

  console.log("Extracting hero memory data...");
  const items = extractHeroMemoryData(html);
  console.log(`Extracted ${items.length} hero memories`);

  const outDir = join(process.cwd(), "src", "data", "hero_memory");
  await mkdir(outDir, { recursive: true });

  const dataPath = join(outDir, "hero_memories.ts");
  await writeFile(dataPath, generateDataFile(items), "utf-8");
  console.log(`Generated hero_memories.ts (${items.length} items)`);

  console.log("\nCode generation complete!");
  execSync("pnpm format", { stdio: "inherit" });
};

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Script failed:", error);
      process.exit(1);
    });
}

export { main as generateHeroMemoryData };
