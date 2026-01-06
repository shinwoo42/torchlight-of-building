import { describe, expect, test } from "vitest";
import { parseSupportAffixes } from "./support-mod-templates";

describe("parseSupportAffixes", () => {
  test("parse Overload damage per focus blessing stack", () => {
    const result = parseSupportAffixes([
      "4% additional damage for the supported skill for every stack of Focus Blessing, stacking up to 8 times",
    ]);
    expect(result).toEqual([
      [
        {
          mod: {
            type: "DmgPct",
            value: 4,
            dmgModType: "global",
            addn: true,
            per: { stackable: "focus_blessing", limit: 8 },
          },
        },
      ],
    ]);
  });
});
