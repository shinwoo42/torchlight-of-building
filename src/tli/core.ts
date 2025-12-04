import { Mod } from './mod'

export interface Affix {
  mods: Mod[]
  maxDivinity?: number
  src?: string
  raw?: string
}

export interface DmgRange {
  // inclusive on both ends
  min: number
  max: number
}

export interface Configuration {
  fervor: {
    enabled: boolean
    points: number
  }
}

export interface ParsedDivinitySlate {
  affixes: Affix[]
}

export interface ParsedGear {
  gearType:
    | 'helmet'
    | 'chest'
    | 'neck'
    | 'gloves'
    | 'belt'
    | 'boots'
    | 'ring'
    | 'sword'
    | 'shield'
  affixes: Affix[]
}

export interface ParsedTalentPage {
  affixes: Affix[]
}

export interface ParsedDivinityPage {
  slates: ParsedDivinitySlate[]
}

export interface ParsedGearPage {
  helmet?: ParsedGear
  chest?: ParsedGear
  neck?: ParsedGear
  gloves?: ParsedGear
  belt?: ParsedGear
  boots?: ParsedGear
  leftRing?: ParsedGear
  rightRing?: ParsedGear
  mainHand?: ParsedGear
  offHand?: ParsedGear
}

export interface Loadout {
  equipmentPage: ParsedGearPage
  talentPage: ParsedTalentPage
  divinityPage: ParsedDivinityPage
  customConfiguration: Affix[]
}
