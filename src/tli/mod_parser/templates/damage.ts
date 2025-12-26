import type { DmgModType } from "../../constants";
import type { DmgChunkType, PerStackable } from "../../mod";
import { multi, t } from "../template";

// +9% [additional] [fire] damage
export const DmgPct =
  t`{value:dec%} [additional] [{modType:DmgModType}] damage`.output(
    "DmgPct",
    (c) => ({
      value: c.value as number,
      modType: (c.modType as DmgModType | undefined) ?? "global",
      addn: c.additional !== undefined,
    }),
  );

// +7% Spell Damage for every 100 Mana consumed recently, up to 432%
export const DmgPctPerMana =
  t`{value:dec%} {modType:DmgModType} damage for every {amt:int} mana consumed recently, up to {limit:dec%}`.output(
    "DmgPct",
    (c) => {
      const per: PerStackable = {
        stackable: "mana_consumed_recently",
        amt: c.amt as number,
        valueLimit: c.limit as number,
      };
      return {
        value: c.value as number,
        modType: c.modType as DmgModType,
        addn: false,
        per,
      };
    },
  );

// Adds 9 - 15 Fire Damage to Attacks
export const FlatDmgToAtks =
  t`adds {min:int} - {max:int} {dmgType:DmgChunkType} damage to attacks`.output(
    "FlatDmgToAtks",
    (c) => ({
      value: { min: c.min as number, max: c.max as number },
      dmgType: c.dmgType as DmgChunkType,
    }),
  );

// Adds 9 - 15 Fire Damage to Spells
export const FlatDmgToSpells =
  t`adds {min:int} - {max:int} {dmgType:DmgChunkType} damage to spells`.output(
    "FlatDmgToSpells",
    (c) => ({
      value: { min: c.min as number, max: c.max as number },
      dmgType: c.dmgType as DmgChunkType,
    }),
  );

// Adds 9 - 15 Fire Damage to Attacks and Spells
export const FlatDmgToAtksAndSpells =
  t`adds {min:int} - {max:int} {dmgType:DmgChunkType} damage to attacks and spells`.outputMany(
    [
      {
        type: "FlatDmgToAtks",
        mod: (c) => ({
          value: { min: c.min as number, max: c.max as number },
          dmgType: c.dmgType as DmgChunkType,
        }),
      },
      {
        type: "FlatDmgToSpells",
        mod: (c) => ({
          value: { min: c.min as number, max: c.max as number },
          dmgType: c.dmgType as DmgChunkType,
        }),
      },
    ],
  );

// Adds 22 - 27 Physical Damage to Attacks and Spells for every 1034 Mana consumed recently. Stacks up to 200 time(s)
export const FlatDmgToAtksAndSpellsPer =
  t`adds {min:int} - {max:int} {dmgType:DmgChunkType} damage to attacks and spells for every {amt:int} mana consumed recently. stacks up to {limit:int} time\\(s\\)`.outputMany(
    [
      {
        type: "FlatDmgToAtks",
        mod: (c) => {
          const per: PerStackable = {
            stackable: "mana_consumed_recently",
            amt: c.amt as number,
            limit: c.limit as number,
          };
          return {
            value: { min: c.min as number, max: c.max as number },
            dmgType: c.dmgType as DmgChunkType,
            per,
          };
        },
      },
      {
        type: "FlatDmgToSpells",
        mod: (c) => {
          const per: PerStackable = {
            stackable: "mana_consumed_recently",
            amt: c.amt as number,
            limit: c.limit as number,
          };
          return {
            value: { min: c.min as number, max: c.max as number },
            dmgType: c.dmgType as DmgChunkType,
            per,
          };
        },
      },
    ],
  );

// Adds 18% of Physical Damage to/as Cold Damage
export const AddsDmgAs =
  t`adds {value:dec%} of {from:DmgChunkType} damage (to|as) {to:DmgChunkType} damage`.output(
    "AddsDmgAs",
    (c) => ({
      from: c.from as DmgChunkType,
      to: c.to as DmgChunkType,
      value: c.value as number,
    }),
  );

// +57% Gear Attack Speed. -12% additional Attack Damage
export const GearAspdWithDmgPenalty =
  t`{aspd:dec%} gear attack speed. {dmg:dec%} additional attack damage`.outputMany(
    [
      {
        type: "GearAspdPct",
        mod: (c) => ({ value: c.aspd as number }),
      },
      {
        type: "DmgPct",
        mod: (c) => ({
          value: c.dmg as number,
          addn: true,
          modType: "attack" as const,
        }),
      },
    ],
  );

// Combined damage multi-mod parsers (more specific first)
export const DamageMultiModParsers = multi([
  GearAspdWithDmgPenalty,
  FlatDmgToAtksAndSpellsPer,
  FlatDmgToAtksAndSpells,
]);

// Single damage parsers (more specific first)
export const DamageSingleParsers = multi([DmgPctPerMana, DmgPct]);
