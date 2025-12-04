import { EquipmentSlot, EquipmentType } from '@/src/tli/gear_data_types'

export interface Legendary {
  name: string
  baseItem: string
  baseStat: string
  normalAffixes: string[]
  corruptionAffixes: string[]
  equipmentSlot: EquipmentSlot
  equipmentType: EquipmentType
}
