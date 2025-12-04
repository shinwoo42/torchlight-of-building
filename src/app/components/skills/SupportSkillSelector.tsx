import { SupportSkills } from '@/src/data/skill'
import {
  SearchableSelect,
  SearchableSelectOption,
} from '@/src/app/components/ui/SearchableSelect'

interface SupportSkillSelectorProps {
  selectedSkill?: string
  excludedSkills: string[]
  onChange: (skillName: string | undefined) => void
}

export const SupportSkillSelector: React.FC<SupportSkillSelectorProps> = ({
  selectedSkill,
  excludedSkills,
  onChange,
}) => {
  const availableSkills = SupportSkills.filter(
    (skill) =>
      skill.name === selectedSkill || !excludedSkills.includes(skill.name),
  )

  const options: SearchableSelectOption<string>[] = availableSkills.map(
    (skill) => ({
      value: skill.name,
      label: skill.name,
    }),
  )

  return (
    <SearchableSelect
      value={selectedSkill}
      onChange={onChange}
      options={options}
      placeholder="<Empty slot>"
      size="sm"
    />
  )
}
