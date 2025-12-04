import { Gear } from '@/src/app/lib/save-data'
import { GearSlot } from '../../lib/types'
import { SearchableSelect } from '@/src/app/components/ui/SearchableSelect'

interface EquipmentSlotDropdownProps {
  slot: GearSlot
  label: string
  selectedItemId: string | null
  compatibleItems: Gear[]
  onSelectItem: (slot: GearSlot, itemId: string | null) => void
}

export const EquipmentSlotDropdown: React.FC<EquipmentSlotDropdownProps> = ({
  slot,
  label,
  selectedItemId,
  compatibleItems,
  onSelectItem,
}) => {
  return (
    <div className="flex items-center gap-3 py-2">
      <label className="w-24 font-medium text-zinc-400 text-sm">{label}:</label>
      <SearchableSelect
        value={selectedItemId ?? undefined}
        onChange={(value) => onSelectItem(slot, value ?? null)}
        options={compatibleItems.map((item) => ({
          value: item.id,
          label: item.equipmentType ?? item.gearType,
          sublabel: `${item.affixes.length} affixes`,
        }))}
        placeholder="-- None --"
        className="flex-1"
      />
    </div>
  )
}
