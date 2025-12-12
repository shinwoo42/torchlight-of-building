import { readdir, readFile } from "node:fs/promises";
import { basename, join } from "node:path";

const TLIDB_SKILL_BASE = join(process.cwd(), ".garbage", "tlidb", "skill");

export interface TlidbSkillFile {
  category: string;
  fileName: string;
  html: string;
}

const readTlidbSkillDirectory = async (
  category: string,
): Promise<TlidbSkillFile[]> => {
  const dirPath = join(TLIDB_SKILL_BASE, category);
  const files = await readdir(dirPath);
  const htmlFiles = files.filter((f) => f.endsWith(".html"));

  return Promise.all(
    htmlFiles.map(async (fileName) => ({
      category,
      fileName: basename(fileName, ".html"),
      html: await readFile(join(dirPath, fileName), "utf-8"),
    })),
  );
};

export const readAllTlidbSkills = async (): Promise<TlidbSkillFile[]> => {
  const categories = [
    "active",
    "passive",
    "support",
    "magnificent_support",
    "noble_support",
    "activation_medium",
  ];

  const results: TlidbSkillFile[] = [];

  for (const category of categories) {
    const files = await readTlidbSkillDirectory(category);
    results.push(...files);
  }

  return results;
};
