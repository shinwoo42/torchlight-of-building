import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { execSync } from "child_process";

interface RawHeroTrait {
  hero: string;
  name: string;
  level: number;
  effect: string;
}

const generateTypesFile = (): string => {
  return `export interface HeroTrait {
  hero: string;
  name: string;
  level: number;
  effect: string;
}
`;
};

const generateHeroTraitsFile = (traits: RawHeroTrait[]): string => {
  return `import type { HeroTrait } from "./types";

export const HeroTraits = ${JSON.stringify(traits, null, 2)} as const satisfies readonly HeroTrait[];

export type HeroTraitEntry = (typeof HeroTraits)[number];
`;
};

const generateIndexFile = (): string => {
  return `export * from "./types";
export * from "./hero_traits";
`;
};

const main = async (): Promise<void> => {
  console.log("Reading hero_trait.json...");
  const jsonPath = join(process.cwd(), "src", "data", "hero_trait.json");
  const rawData: RawHeroTrait[] = JSON.parse(await readFile(jsonPath, "utf-8"));

  console.log(`Processing ${rawData.length} hero traits...`);

  // Create output directory
  const outDir = join(process.cwd(), "src", "data", "hero_trait");
  await mkdir(outDir, { recursive: true });

  // Generate types.ts
  const typesPath = join(outDir, "types.ts");
  const typesContent = generateTypesFile();
  await writeFile(typesPath, typesContent, "utf-8");
  console.log(`Generated types.ts`);

  // Generate hero_traits.ts
  const heroTraitsPath = join(outDir, "hero_traits.ts");
  const heroTraitsContent = generateHeroTraitsFile(rawData);
  await writeFile(heroTraitsPath, heroTraitsContent, "utf-8");
  console.log(`Generated hero_traits.ts (${rawData.length} traits)`);

  // Generate index.ts
  const indexPath = join(outDir, "index.ts");
  const indexContent = generateIndexFile();
  await writeFile(indexPath, indexContent, "utf-8");
  console.log(`Generated index.ts`);

  console.log("\nCode generation complete!");
  console.log(`Generated 3 files with ${rawData.length} total hero traits`);

  console.log("\nRunning formatter...");
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

export { main as generateHeroTraitData };
