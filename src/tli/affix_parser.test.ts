import { expect, test } from "vitest";
import { parseAffix } from "./affix_parser";

test("parse basic damage without type (global)", () => {
  const result = parseAffix("+9% damage");
  expect(result).toEqual({
    type: "DmgPct",
    value: 0.09,
    modType: "global",
    addn: false,
  });
});

test("parse typed damage", () => {
  const result = parseAffix("+18% fire damage");
  expect(result).toEqual({
    type: "DmgPct",
    value: 0.18,
    modType: "fire",
    addn: false,
  });
});

test("parse additional global damage", () => {
  const result = parseAffix("+9% additional damage");
  expect(result).toEqual({
    type: "DmgPct",
    value: 0.09,
    modType: "global",
    addn: true,
  });
});

test("parse additional typed damage", () => {
  const result = parseAffix("+9% additional attack damage");
  expect(result).toEqual({
    type: "DmgPct",
    value: 0.09,
    modType: "attack",
    addn: true,
  });
});

test("parse decimal damage", () => {
  const result = parseAffix("+12.5% fire damage");
  expect(result).toEqual({
    type: "DmgPct",
    value: 0.125,
    modType: "fire",
    addn: false,
  });
});

test("return undefined for invalid damage type", () => {
  const result = parseAffix("+10% invalid damage");
  expect(result).toBeUndefined();
});

test("parse global critical strike rating", () => {
  const result = parseAffix("+10% Critical Strike Rating");
  expect(result).toEqual({
    type: "CritRatingPct",
    value: 0.1,
    modType: "global",
  });
});

test("parse typed critical strike rating", () => {
  const result = parseAffix("+10% Attack Critical Strike Rating");
  expect(result).toEqual({
    type: "CritRatingPct",
    value: 0.1,
    modType: "attack",
  });
});

test("parse crit rating with decimal percentage", () => {
  const result = parseAffix("+12.5% Attack Critical Strike Rating");
  expect(result).toEqual({
    type: "CritRatingPct",
    value: 0.125,
    modType: "attack",
  });
});

test("return undefined for invalid crit rating mod type", () => {
  const result = parseAffix("+10% Fire Critical Strike Rating");
  expect(result).toBeUndefined();
});
