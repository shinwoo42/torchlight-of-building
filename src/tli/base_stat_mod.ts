export type BaseStatMod =
  | { type: "FlatPhysDmg"; value: number; src?: string }
  | { type: "CritRating"; value: number; src?: string }
  | { type: "AttackSpeed"; value: number; src?: string };

type BaseStatModOfType<T> = Extract<BaseStatMod, { type: T }>;

const parseFlatPhysDmg = (
  input: string,
): BaseStatModOfType<"FlatPhysDmg"> | undefined => {
  const pattern = /^(\d+)\s*-\s*(\d+)\s+physical damage$/;
  const match = input.match(pattern);

  if (!match) {
    return undefined;
  }

  const minValue = parseFloat(match[1]);
  const maxValue = parseFloat(match[2]);
  const value = (minValue + maxValue) / 2;

  return { type: "FlatPhysDmg", value };
};

const parseCritRating = (
  input: string,
): BaseStatModOfType<"CritRating"> | undefined => {
  const pattern = /^(\d+)\s+critical strike rating$/;
  const match = input.match(pattern);

  if (!match) {
    return undefined;
  }

  const value = parseFloat(match[1]);
  return { type: "CritRating", value };
};

const parseAttackSpeed = (
  input: string,
): BaseStatModOfType<"AttackSpeed"> | undefined => {
  const pattern = /^(\d+(?:\.\d+)?)\s+attack speed$/;
  const match = input.match(pattern);

  if (!match) {
    return undefined;
  }

  const value = parseFloat(match[1]);
  return { type: "AttackSpeed", value };
};

export const parseBaseStatMod = (input: string): BaseStatMod | undefined => {
  const normalized = input.trim().toLocaleLowerCase();

  const parsers = [parseFlatPhysDmg, parseCritRating, parseAttackSpeed];

  for (const parser of parsers) {
    const result = parser(normalized);
    if (result !== undefined) {
      return result;
    }
  }

  return undefined;
};
