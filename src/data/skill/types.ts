export const SKILL_TYPES = [
  'Activation Medium',
  'Active',
  'Passive',
  'Support',
  'Support (Magnificent)',
  'Support (Noble)',
] as const

export type SkillType = (typeof SKILL_TYPES)[number]

export const SKILL_TAGS = [
  'Area',
  'Attack',
  'Aura',
  'Barrage',
  'Base Skill',
  'Beam',
  'Chain',
  'Channeled',
  'Cold',
  'Combo',
  'Curse',
  'Defensive',
  'Demolisher',
  'Dexterity',
  'Empower',
  'Enhanced Skill',
  'Erosion',
  'Fire',
  'Focus',
  'Horizontal',
  'Intelligence',
  'Lightning',
  'Melee',
  'Mobility',
  'Parabolic',
  'Persistent',
  'Physical',
  'Projectile',
  'Ranged',
  'Restoration',
  'Sentry',
  'Shadow Strike',
  'Slash-Strike',
  'Spell',
  'Spirit Magus',
  'Strength',
  'Summon',
  'Synthetic Troop',
  'Terra',
  'Ultimate',
  'Vertical',
  'Warcry',
] as const

export type SkillTag = (typeof SKILL_TAGS)[number]

export interface BaseSkill {
  type: SkillType
  name: string
  tags: readonly SkillTag[]
}
