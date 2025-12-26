import { t } from "../template";

// +6% [additional] attack speed
export const AspdPct = t`{value:dec%} [additional] attack speed`.output(
  "AspdPct",
  (c) => ({
    value: c.value as number,
    addn: c.additional !== undefined,
  }),
);

// +6% [additional] cast speed
export const CspdPct = t`{value:dec%} [additional] cast speed`.output(
  "CspdPct",
  (c) => ({
    value: c.value as number,
    addn: c.additional !== undefined,
  }),
);

// +6% [additional] attack and cast speed
export const AspdAndCspdPct =
  t`{value:dec%} [additional] attack and cast speed`.output(
    "AspdAndCspdPct",
    (c) => ({
      value: c.value as number,
      addn: c.additional !== undefined,
    }),
  );

// +6% [additional] minion attack and cast speed
export const MinionAspdAndCspdPct =
  t`{value:dec%} [additional] minion attack and cast speed`.output(
    "MinionAspdAndCspdPct",
    (c) => ({
      value: c.value as number,
      addn: c.additional !== undefined,
    }),
  );

// +8% gear Attack Speed
export const GearAspdPct = t`{value:dec%} gear attack speed`.output(
  "GearAspdPct",
  (c) => ({ value: c.value as number }),
);
