import type { CritDmgModType, CritRatingModType } from "../../constants";
import type { PerStackable } from "../../mod";
import { multi, t } from "../template";

// +10% [Attack] Critical Strike Rating
export const CritRatingPct =
  t`{value:dec%} [{modType:CritRatingModType}] critical strike rating`.output(
    "CritRatingPct",
    (c) => ({
      value: c.value as number,
      modType: (c.modType as CritRatingModType | undefined) ?? "global",
    }),
  );

// +5% [additional] [Attack] Critical Strike Damage
export const CritDmgPct =
  t`{value:dec%} [additional] [{modType:CritDmgModType}] critical strike damage`.output(
    "CritDmgPct",
    (c) => ({
      value: c.value as number,
      addn: c.additional !== undefined,
      modType: (c.modType as CritDmgModType | undefined) ?? "global",
    }),
  );

// +5% Critical Strike Rating and Critical Strike Damage
export const CritRatingAndCritDmgPct =
  t`{value:dec%} critical strike rating and critical strike damage`.outputMany([
    {
      type: "CritRatingPct",
      mod: (c) => ({
        value: c.value as number,
        modType: "global" as const,
      }),
    },
    {
      type: "CritDmgPct",
      mod: (c) => ({
        value: c.value as number,
        modType: "global" as const,
        addn: false,
      }),
    },
  ]);

// +5% Critical Strike Rating and Critical Strike Damage for every 720 Mana consumed recently
export const CritRatingAndCritDmgPctPerMana =
  t`{value:dec%} critical strike rating and critical strike damage for every {amt:int} mana consumed recently`.outputMany(
    [
      {
        type: "CritRatingPct",
        mod: (c) => {
          const per: PerStackable = {
            stackable: "mana_consumed_recently",
            amt: c.amt as number,
          };
          return {
            value: c.value as number,
            modType: "global" as const,
            per,
          };
        },
      },
      {
        type: "CritDmgPct",
        mod: (c) => {
          const per: PerStackable = {
            stackable: "mana_consumed_recently",
            amt: c.amt as number,
          };
          return {
            value: c.value as number,
            modType: "global" as const,
            addn: false,
            per,
          };
        },
      },
    ],
  );

// Combined multi-mod parsers (more specific first)
export const CritMultiModParsers = multi([
  CritRatingAndCritDmgPctPerMana,
  CritRatingAndCritDmgPct,
]);
