import type { HeroMemoryBaseStats } from "./types";

export const AllHeroMemoryBaseStats = [
  {
    source: "Origin",
    affixTemplate: "+{value} Intelligence",
    normal: { 1: 10, 10: 30 },
    magic: { 1: 17, 10: 33, 20: 50 },
    rare: { 1: 23, 10: 38, 20: 54, 30: 70 },
    epic: { 1: 30, 10: 44, 20: 59, 30: 75, 40: 90 },
    ultimate: { 1: 37, 10: 50, 20: 65, 30: 80, 40: 95, 50: 110 },
  },
] as const satisfies readonly HeroMemoryBaseStats[];
