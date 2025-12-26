import type { Mod, ModOfType } from "../mod";

// Captures extracted from a template match
export interface Captures {
  [key: string]: string | number | boolean | undefined;
}

// A compiled template ready to parse
export interface CompiledTemplate {
  regex: RegExp;
  captureNames: string[];
  extractors: Map<string, (match: string) => string | number>;
  optionalFlags: Set<string>;
}

// Output specification for a single mod
export interface SingleOutput<TModType extends keyof ModTypeMap> {
  type: TModType;
  mod: (captures: Captures) => Omit<ModOfType<TModType>, "type">;
}

// Output specification for multi-mod templates
export interface MultiOutput {
  type: keyof ModTypeMap;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mod: (captures: Captures) => Record<string, any>;
}

// A parser that can parse input and return mods
export interface ModParser {
  parse(input: string): Mod[] | undefined;
}

// Builder for fluent API
export interface TemplateBuilder {
  // Define custom enum mapping for this template
  enum<TName extends string>(
    name: TName,
    mapping: Record<string, string>,
  ): TemplateBuilder;

  // Custom capture extractor
  capture<TName extends string>(
    name: TName,
    extractor: (match: RegExpMatchArray) => string | number | boolean,
  ): TemplateBuilder;

  // Output single mod
  output<TModType extends keyof ModTypeMap>(
    modType: TModType,
    mapper?: (captures: Captures) => Omit<ModOfType<TModType>, "type">,
  ): ModParser;

  // Output multiple mods from same template
  outputMany(specs: MultiOutput[]): ModParser;
}

// Multi-pattern builder (for alternate syntaxes)
export interface MultiTemplateBuilder {
  output<TModType extends keyof ModTypeMap>(
    modType: TModType,
    mapper?: (captures: Captures) => Omit<ModOfType<TModType>, "type">,
  ): ModParser;
}

// Map of mod type names to their definitions (for type safety)
export interface ModTypeMap {
  DmgPct: ModOfType<"DmgPct">;
  FlatDmgToAtks: ModOfType<"FlatDmgToAtks">;
  FlatDmgToSpells: ModOfType<"FlatDmgToSpells">;
  CritRatingPct: ModOfType<"CritRatingPct">;
  CritDmgPct: ModOfType<"CritDmgPct">;
  AspdPct: ModOfType<"AspdPct">;
  CspdPct: ModOfType<"CspdPct">;
  AspdAndCspdPct: ModOfType<"AspdAndCspdPct">;
  MinionAspdAndCspdPct: ModOfType<"MinionAspdAndCspdPct">;
  DoubleDmgChancePct: ModOfType<"DoubleDmgChancePct">;
  Stat: ModOfType<"Stat">;
  StatPct: ModOfType<"StatPct">;
  FervorEff: ModOfType<"FervorEff">;
  SteepStrikeChance: ModOfType<"SteepStrikeChance">;
  GearAspdPct: ModOfType<"GearAspdPct">;
  AttackBlockChancePct: ModOfType<"AttackBlockChancePct">;
  SpellBlockChancePct: ModOfType<"SpellBlockChancePct">;
  MaxLifePct: ModOfType<"MaxLifePct">;
  MaxEnergyShieldPct: ModOfType<"MaxEnergyShieldPct">;
  ArmorPct: ModOfType<"ArmorPct">;
  EvasionPct: ModOfType<"EvasionPct">;
  LifeRegainPct: ModOfType<"LifeRegainPct">;
  EnergyShieldRegainPct: ModOfType<"EnergyShieldRegainPct">;
  AddsDmgAs: ModOfType<"AddsDmgAs">;
  ResPenPct: ModOfType<"ResPenPct">;
  ArmorPenPct: ModOfType<"ArmorPenPct">;
  ShadowQuant: ModOfType<"ShadowQuant">;
  ShadowDmgPct: ModOfType<"ShadowDmgPct">;
  MaxMana: ModOfType<"MaxMana">;
  MaxManaPct: ModOfType<"MaxManaPct">;
}
