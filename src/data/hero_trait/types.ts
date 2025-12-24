import type { HeroTraits } from "./hero_traits";

export interface BaseHeroTrait {
  hero: string;
  name: string;
  level: number;
  affix: string;
}

export type HeroTrait = (typeof HeroTraits)[number];
export type HeroTraitName = (typeof HeroTraits)[number]["name"];
