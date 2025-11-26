"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  RawLoadout,
  RawGearPage,
  RawGear,
  RawAllocatedTalentNode,
} from "@/src/tli/core";
import { Skill, AVAILABLE_SKILLS } from "@/src/tli/offense";
import {
  TalentTreeData,
  TalentNodeData,
  GOD_GODDESS_TREES,
  PROFESSION_TREES,
  TreeName,
  isGodGoddessTree,
  loadTalentTree,
  canAllocateNode,
  canDeallocateNode,
  isPrerequisiteSatisfied,
} from "@/src/tli/talent_tree";
import {
  EquipmentType,
  EquipmentSlot,
  BaseGearAffix,
} from "@/src/tli/gear_affix_data/types";
import { ALL_GEAR_AFFIXES } from "@/src/tli/gear_affix_data/all_affixes";
import { craft } from "@/src/tli/crafting/craft";

type GearSlot = keyof RawGearPage;

const GEAR_SLOTS: { key: GearSlot; label: string }[] = [
  { key: "helmet", label: "Helmet" },
  { key: "chest", label: "Chest" },
  { key: "neck", label: "Neck" },
  { key: "gloves", label: "Gloves" },
  { key: "belt", label: "Belt" },
  { key: "boots", label: "Boots" },
  { key: "leftRing", label: "Left Ring" },
  { key: "rightRing", label: "Right Ring" },
  { key: "mainHand", label: "Main Hand" },
  { key: "offHand", label: "Off Hand" },
];

const SLOT_TO_EQUIPMENT_SLOT: Record<GearSlot, EquipmentSlot[]> = {
  helmet: ["Helmet"],
  chest: ["Chest Armor"],
  gloves: ["Gloves"],
  boots: ["Boots"],
  belt: ["Trinket"],
  neck: ["Trinket"],
  leftRing: ["Trinket"],
  rightRing: ["Trinket"],
  mainHand: ["One-Handed", "Two-Handed"],
  offHand: ["Shield", "One-Handed"],
};

const SLOT_TO_VALID_EQUIPMENT_TYPES: Record<GearSlot, EquipmentType[]> = {
  helmet: ["Helmet (DEX)", "Helmet (INT)", "Helmet (STR)"],
  chest: ["Chest Armor (DEX)", "Chest Armor (INT)", "Chest Armor (STR)"],
  gloves: ["Gloves (DEX)", "Gloves (INT)", "Gloves (STR)"],
  boots: ["Boots (DEX)", "Boots (INT)", "Boots (STR)"],
  belt: ["Belt"],
  neck: ["Necklace"],
  leftRing: ["Ring", "Spirit Ring"],
  rightRing: ["Ring", "Spirit Ring"],
  mainHand: [
    "Bow",
    "Cane",
    "Claw",
    "Crossbow",
    "Cudgel",
    "Dagger",
    "Fire Cannon",
    "Musket",
    "One-Handed Axe",
    "One-Handed Hammer",
    "One-Handed Sword",
    "Pistol",
    "Rod",
    "Scepter",
    "Tin Staff",
    "Two-Handed Axe",
    "Two-Handed Hammer",
    "Two-Handed Sword",
    "Wand",
  ],
  offHand: [
    "Shield (DEX)",
    "Shield (INT)",
    "Shield (STR)",
    "Cane",
    "Claw",
    "Cudgel",
    "Dagger",
    "One-Handed Axe",
    "One-Handed Hammer",
    "One-Handed Sword",
    "Pistol",
    "Rod",
    "Scepter",
    "Wand",
  ],
};

const getValidEquipmentTypes = (slot: GearSlot): EquipmentType[] => {
  const validEquipSlots = SLOT_TO_EQUIPMENT_SLOT[slot];
  const types = new Set<EquipmentType>();

  ALL_GEAR_AFFIXES.forEach((affix) => {
    if (validEquipSlots.includes(affix.equipmentSlot)) {
      types.add(affix.equipmentType);
    }
  });

  return Array.from(types).sort();
};

const getCompatibleItems = (itemsList: RawGear[], slot: GearSlot): RawGear[] => {
  const validTypes = SLOT_TO_VALID_EQUIPMENT_TYPES[slot];
  return itemsList.filter(
    (item) => item.equipmentType && validTypes.includes(item.equipmentType)
  );
};

const generateItemId = (): string => crypto.randomUUID();

const getFilteredAffixes = (
  equipmentType: EquipmentType,
  affixType: "Prefix" | "Suffix",
): BaseGearAffix[] => {
  return ALL_GEAR_AFFIXES.filter(
    (affix) =>
      affix.equipmentType === equipmentType && affix.affixType === affixType,
  );
};

const formatAffixOption = (affix: BaseGearAffix): string => {
  let display = affix.craftableAffix;
  display = display.replace(/\n/g, "/")
  if (display.length > 80) {
    display = display.substring(0, 77) + "...";
  }
  return display;
};

const STORAGE_KEY = "tli-planner-loadout";
const DEBUG_MODE_STORAGE_KEY = "tli-planner-debug-mode";

const loadDebugModeFromStorage = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    const stored = localStorage.getItem(DEBUG_MODE_STORAGE_KEY);
    return stored === "true";
  } catch (error) {
    console.error("Failed to load debug mode from localStorage:", error);
    return false;
  }
};

const saveDebugModeToStorage = (enabled: boolean): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DEBUG_MODE_STORAGE_KEY, enabled.toString());
  } catch (error) {
    console.error("Failed to save debug mode to localStorage:", error);
  }
};

const createEmptyLoadout = (): RawLoadout => ({
  equipmentPage: {},
  talentPage: {
    tree1: { name: "Warrior", allocatedNodes: [] },
    tree2: { name: "Warrior", allocatedNodes: [] },
    tree3: { name: "Warrior", allocatedNodes: [] },
    tree4: { name: "Warrior", allocatedNodes: [] },
  },
  skillPage: {
    skills: [],
  },
  itemsList: [],
});

const loadFromStorage = (): RawLoadout => {
  if (typeof window === "undefined") return createEmptyLoadout();

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return createEmptyLoadout();
    const parsed = JSON.parse(stored) as RawLoadout;

    // Migration: ensure itemsList exists
    if (!parsed.itemsList) {
      parsed.itemsList = [];
    }

    // Migration: ensure all items have IDs
    parsed.itemsList = parsed.itemsList.map((item) => ({
      ...item,
      id: item.id || generateItemId(),
    }));

    // Migration: ensure equipped items have IDs
    const slots: GearSlot[] = [
      "helmet", "chest", "neck", "gloves", "belt",
      "boots", "leftRing", "rightRing", "mainHand", "offHand"
    ];
    slots.forEach((slot) => {
      const gear = parsed.equipmentPage[slot];
      if (gear && !gear.id) {
        gear.id = generateItemId();
      }
    });

    return parsed;
  } catch (error) {
    console.error("Failed to load from localStorage:", error);
    return createEmptyLoadout();
  }
};

const saveToStorage = (loadout: RawLoadout): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loadout));
  } catch (error) {
    console.error("Failed to save to localStorage:", error);
  }
};

interface AffixSlotState {
  affixIndex: number | null;
  percentage: number;
}

interface AffixSlotProps {
  slotIndex: number;
  affixType: "Prefix" | "Suffix";
  affixes: BaseGearAffix[];
  selection: AffixSlotState;
  onAffixSelect: (slotIndex: number, value: string) => void;
  onSliderChange: (slotIndex: number, value: string) => void;
  onClear: (slotIndex: number) => void;
}

const AffixSlotComponent: React.FC<AffixSlotProps> = ({
  slotIndex,
  affixType,
  affixes,
  selection,
  onAffixSelect,
  onSliderChange,
  onClear,
}) => {
  const selectedAffix =
    selection.affixIndex !== null ? affixes[selection.affixIndex] : null;
  const craftedText = selectedAffix
    ? craft(selectedAffix, selection.percentage)
    : "";

  return (
    <div className="bg-zinc-50 dark:bg-zinc-700 p-4 rounded-lg">
      {/* Affix Dropdown */}
      <select
        value={selection.affixIndex !== null ? selection.affixIndex : ""}
        onChange={(e) => onAffixSelect(slotIndex, e.target.value)}
        className="w-full px-3 py-2 mb-3 border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">&lt;Select {affixType}&gt;</option>
        {affixes.map((affix, idx) => (
          <option key={idx} value={idx}>
            {formatAffixOption(affix)}
          </option>
        ))}
      </select>

      {/* Slider and Preview (only show if affix selected) */}
      {selectedAffix && (
        <>
          {/* Quality Slider */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs text-zinc-600 dark:text-zinc-400">
                Quality
              </label>
              <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                {selection.percentage}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={selection.percentage}
              onChange={(e) => onSliderChange(slotIndex, e.target.value)}
              className="w-full h-2 bg-zinc-300 dark:bg-zinc-600 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Crafted Preview */}
          <div className="bg-white dark:bg-zinc-800 p-3 rounded border border-zinc-200 dark:border-zinc-600">
            <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
              {craftedText}
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              Tier {selectedAffix.tier}
              {selectedAffix.craftingPool && ` | ${selectedAffix.craftingPool}`}
            </div>
          </div>

          {/* Clear Button */}
          <button
            onClick={() => onClear(slotIndex)}
            className="mt-2 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
          >
            Clear
          </button>
        </>
      )}
    </div>
  );
};

interface EquipmentSlotDropdownProps {
  slot: GearSlot;
  label: string;
  selectedItemId: string | null;
  compatibleItems: RawGear[];
  onSelectItem: (slot: GearSlot, itemId: string | null) => void;
}

const EquipmentSlotDropdown: React.FC<EquipmentSlotDropdownProps> = ({
  slot,
  label,
  selectedItemId,
  compatibleItems,
  onSelectItem,
}) => {
  const getItemTooltip = (item: RawGear): string => {
    const lines = [`${item.equipmentType || item.gearType}`];
    if (item.affixes.length > 0) {
      lines.push("---");
      item.affixes.forEach((affix) => lines.push(affix));
    }
    return lines.join("\n");
  };

  return (
    <div className="flex items-center gap-3 py-2">
      <label className="w-24 font-medium text-zinc-700 dark:text-zinc-300 text-sm">
        {label}:
      </label>
      <select
        value={selectedItemId || ""}
        onChange={(e) => onSelectItem(slot, e.target.value || null)}
        className="flex-1 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">-- None --</option>
        {compatibleItems.map((item) => (
          <option key={item.id} value={item.id} title={getItemTooltip(item)}>
            {item.equipmentType} ({item.affixes.length} affixes)
          </option>
        ))}
      </select>
    </div>
  );
};

interface InventoryItemProps {
  item: RawGear;
  isEquipped: boolean;
  onCopy: (item: RawGear) => void;
  onDelete: (id: string) => void;
}

const InventoryItem: React.FC<InventoryItemProps> = ({
  item,
  isEquipped,
  onCopy,
  onDelete,
}) => {
  return (
    <div className="group relative flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-700 rounded-lg">
      <div className="flex items-center gap-2">
        <span className="font-medium text-zinc-900 dark:text-zinc-100 text-sm">
          {item.equipmentType}
        </span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          ({item.affixes.length} affixes)
        </span>
        {isEquipped && (
          <span className="text-xs text-green-600 dark:text-green-400 font-medium">
            Equipped
          </span>
        )}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onCopy(item)}
          className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
          title="Copy item"
        >
          Copy
        </button>
        <button
          onClick={() => onDelete(item.id)}
          className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs"
          title="Delete item"
        >
          Delete
        </button>
      </div>

      {/* Hover tooltip showing item details */}
      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50 w-72 pointer-events-none">
        <div className="bg-zinc-900 dark:bg-zinc-950 text-white p-3 rounded-lg shadow-xl border border-zinc-700">
          <div className="font-semibold text-sm mb-2 text-blue-400">
            {item.equipmentType}
          </div>
          {item.affixes.length > 0 ? (
            <ul className="space-y-1">
              {item.affixes.map((affix, idx) => (
                <li key={idx} className="text-xs text-zinc-300">
                  {affix}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-zinc-500 italic">No affixes</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [loadout, setLoadout] = useState<RawLoadout>(createEmptyLoadout);
  const [mounted, setMounted] = useState(false);
  const [activePage, setActivePage] = useState<
    "equipment" | "talents" | "skills"
  >("equipment");
  const [activeTreeSlot, setActiveTreeSlot] = useState<
    "tree1" | "tree2" | "tree3" | "tree4"
  >("tree1");
  const [treeData, setTreeData] = useState<
    Record<string, TalentTreeData | null>
  >({
    tree1: null,
    tree2: null,
    tree3: null,
    tree4: null,
  });
  const [selectedEquipmentType, setSelectedEquipmentType] =
    useState<EquipmentType | null>(null);
  const [affixSelections, setAffixSelections] = useState<AffixSlotState[]>(
    Array(6)
      .fill(null)
      .map(() => ({ affixIndex: null, percentage: 50 })),
  );
  const [debugMode, setDebugMode] = useState<boolean>(false);
  const [debugPanelExpanded, setDebugPanelExpanded] = useState<boolean>(true);

  useEffect(() => {
    setMounted(true);
    setLoadout(loadFromStorage());
    setDebugMode(loadDebugModeFromStorage());
  }, []);

  // Load talent trees when names change
  useEffect(() => {
    if (activePage !== "talents") return;

    const loadTree = async (slot: "tree1" | "tree2" | "tree3" | "tree4") => {
      const treeName = loadout.talentPage[slot].name;
      try {
        const data = await loadTalentTree(treeName as TreeName);
        setTreeData((prev) => ({ ...prev, [slot]: data }));
      } catch (error) {
        console.error(`Failed to load tree ${treeName}:`, error);
      }
    };

    loadTree("tree1");
    loadTree("tree2");
    loadTree("tree3");
    loadTree("tree4");
  }, [
    activePage,
    loadout.talentPage.tree1.name,
    loadout.talentPage.tree2.name,
    loadout.talentPage.tree3.name,
    loadout.talentPage.tree4.name,
  ]);

  const prefixAffixes = useMemo(
    () =>
      selectedEquipmentType
        ? getFilteredAffixes(selectedEquipmentType, "Prefix")
        : [],
    [selectedEquipmentType],
  );

  const suffixAffixes = useMemo(
    () =>
      selectedEquipmentType
        ? getFilteredAffixes(selectedEquipmentType, "Suffix")
        : [],
    [selectedEquipmentType],
  );


  const getCraftedText = (slotIndex: number): string => {
    const selection = affixSelections[slotIndex];
    if (selection.affixIndex === null) return "";

    const affixType = slotIndex < 3 ? "Prefix" : "Suffix";
    const filteredAffixes =
      affixType === "Prefix" ? prefixAffixes : suffixAffixes;
    const selectedAffix = filteredAffixes[selection.affixIndex];

    return craft(selectedAffix, selection.percentage);
  };

  const getSelectedAffix = (slotIndex: number): BaseGearAffix | null => {
    const selection = affixSelections[slotIndex];
    if (selection.affixIndex === null) return null;

    const affixType = slotIndex < 3 ? "Prefix" : "Suffix";
    const filteredAffixes =
      affixType === "Prefix" ? prefixAffixes : suffixAffixes;
    return filteredAffixes[selection.affixIndex];
  };

  const getGearTypeFromEquipmentType = (equipmentType: EquipmentType): RawGear["gearType"] => {
    if (equipmentType.includes("Helmet")) return "helmet";
    if (equipmentType.includes("Chest")) return "chest";
    if (equipmentType.includes("Gloves")) return "gloves";
    if (equipmentType.includes("Boots")) return "boots";
    if (equipmentType === "Belt") return "belt";
    if (equipmentType === "Necklace") return "neck";
    if (equipmentType === "Ring" || equipmentType === "Spirit Ring") return "ring";
    if (equipmentType.includes("Shield")) return "shield";
    return "sword"; // All weapons
  };

  // Inventory handlers
  const handleSaveToInventory = () => {
    if (!selectedEquipmentType) return;

    const affixes: string[] = [];
    affixSelections.forEach((selection, idx) => {
      if (selection.affixIndex === null) return;
      const affixType = idx < 3 ? "Prefix" : "Suffix";
      const filteredAffixes = affixType === "Prefix" ? prefixAffixes : suffixAffixes;
      const selectedAffix = filteredAffixes[selection.affixIndex];
      affixes.push(craft(selectedAffix, selection.percentage));
    });

    const newItem: RawGear = {
      id: generateItemId(),
      gearType: getGearTypeFromEquipmentType(selectedEquipmentType),
      affixes,
      equipmentType: selectedEquipmentType,
    };

    setLoadout((prev) => ({
      ...prev,
      itemsList: [...prev.itemsList, newItem],
    }));

    // Reset crafting UI
    setSelectedEquipmentType(null);
    setAffixSelections(
      Array(6)
        .fill(null)
        .map(() => ({ affixIndex: null, percentage: 50 }))
    );
  };

  const handleCopyItem = (item: RawGear) => {
    const newItem: RawGear = {
      ...item,
      id: generateItemId(),
    };
    setLoadout((prev) => ({
      ...prev,
      itemsList: [...prev.itemsList, newItem],
    }));
  };

  const handleDeleteItem = (itemId: string) => {
    setLoadout((prev) => {
      // Remove from inventory
      const newItemsList = prev.itemsList.filter((item) => item.id !== itemId);

      // Also unequip from any slots that have this item
      const newEquipmentPage = { ...prev.equipmentPage };
      const slots: GearSlot[] = [
        "helmet", "chest", "neck", "gloves", "belt",
        "boots", "leftRing", "rightRing", "mainHand", "offHand"
      ];
      slots.forEach((slot) => {
        if (newEquipmentPage[slot]?.id === itemId) {
          delete newEquipmentPage[slot];
        }
      });

      return {
        ...prev,
        itemsList: newItemsList,
        equipmentPage: newEquipmentPage,
      };
    });
  };

  const handleSelectItemForSlot = (slot: GearSlot, itemId: string | null) => {
    setLoadout((prev) => {
      if (!itemId) {
        // Unequip
        const newEquipmentPage = { ...prev.equipmentPage };
        delete newEquipmentPage[slot];
        return { ...prev, equipmentPage: newEquipmentPage };
      }

      // Find the item and equip it
      const item = prev.itemsList.find((i) => i.id === itemId);
      if (!item) return prev;

      return {
        ...prev,
        equipmentPage: {
          ...prev.equipmentPage,
          [slot]: item,
        },
      };
    });
  };

  const isItemEquipped = (itemId: string): boolean => {
    const slots: GearSlot[] = [
      "helmet", "chest", "neck", "gloves", "belt",
      "boots", "leftRing", "rightRing", "mainHand", "offHand"
    ];
    return slots.some((slot) => loadout.equipmentPage[slot]?.id === itemId);
  };

  const handleEquipmentTypeChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const newType = e.target.value as EquipmentType;
    setSelectedEquipmentType(newType);

    setAffixSelections(
      Array(6)
        .fill(null)
        .map(() => ({ affixIndex: null, percentage: 50 })),
    );
  };

  const handleAffixSelect = (slotIndex: number, value: string) => {
    const affixIndex = value === "" ? null : parseInt(value);

    setAffixSelections((prev) => {
      const updated = [...prev];
      updated[slotIndex] = {
        affixIndex,
        percentage: affixIndex === null ? 50 : updated[slotIndex].percentage,
      };
      return updated;
    });
  };

  const handleSliderChange = (slotIndex: number, value: string) => {
    const percentage = parseInt(value);

    setAffixSelections((prev) => {
      const updated = [...prev];
      updated[slotIndex] = { ...updated[slotIndex], percentage };
      return updated;
    });
  };

  const handleClearAffix = (slotIndex: number) => {
    setAffixSelections((prev) => {
      const updated = [...prev];
      updated[slotIndex] = { affixIndex: null, percentage: 50 };
      return updated;
    });
  };

  const handleSave = () => {
    saveToStorage(loadout);
    alert("Loadout saved!");
  };

  // Talent page handlers
  const handleTreeChange = (
    slot: "tree1" | "tree2" | "tree3" | "tree4",
    newTreeName: string,
  ) => {
    // Prevent changing tree if points are allocated
    if (loadout.talentPage[slot].allocatedNodes.length > 0) {
      return;
    }

    // Validate god/goddess trees only in slot 1
    if (slot !== "tree1" && isGodGoddessTree(newTreeName)) {
      return;
    }

    setLoadout((prev) => ({
      ...prev,
      talentPage: {
        ...prev.talentPage,
        [slot]: {
          name: newTreeName,
          allocatedNodes: [],
        },
      },
    }));
  };

  const handleResetTree = (slot: "tree1" | "tree2" | "tree3" | "tree4") => {
    if (loadout.talentPage[slot].allocatedNodes.length === 0) return;

    if (confirm("Reset all points in this tree? This cannot be undone.")) {
      setLoadout((prev) => ({
        ...prev,
        talentPage: {
          ...prev.talentPage,
          [slot]: {
            ...prev.talentPage[slot],
            allocatedNodes: [],
          },
        },
      }));
    }
  };

  const handleAllocate = (
    slot: "tree1" | "tree2" | "tree3" | "tree4",
    x: number,
    y: number,
  ) => {
    setLoadout((prev) => {
      const tree = prev.talentPage[slot];
      const existing = tree.allocatedNodes.find((n) => n.x === x && n.y === y);
      const nodeData = treeData[slot]?.nodes.find(
        (n) => n.position.x === x && n.position.y === y,
      );
      if (!nodeData) return prev;

      let updatedNodes: RawAllocatedTalentNode[];

      if (existing) {
        if (existing.points >= nodeData.maxPoints) return prev;
        updatedNodes = tree.allocatedNodes.map((n) =>
          n.x === x && n.y === y ? { ...n, points: n.points + 1 } : n,
        );
      } else {
        updatedNodes = [...tree.allocatedNodes, { x, y, points: 1 }];
      }

      return {
        ...prev,
        talentPage: {
          ...prev.talentPage,
          [slot]: { ...tree, allocatedNodes: updatedNodes },
        },
      };
    });
  };

  const handleDeallocate = (
    slot: "tree1" | "tree2" | "tree3" | "tree4",
    x: number,
    y: number,
  ) => {
    setLoadout((prev) => {
      const tree = prev.talentPage[slot];
      const existing = tree.allocatedNodes.find((n) => n.x === x && n.y === y);
      if (!existing) return prev;

      let updatedNodes: RawAllocatedTalentNode[];

      if (existing.points > 1) {
        updatedNodes = tree.allocatedNodes.map((n) =>
          n.x === x && n.y === y ? { ...n, points: n.points - 1 } : n,
        );
      } else {
        updatedNodes = tree.allocatedNodes.filter(
          (n) => !(n.x === x && n.y === y),
        );
      }

      return {
        ...prev,
        talentPage: {
          ...prev.talentPage,
          [slot]: { ...tree, allocatedNodes: updatedNodes },
        },
      };
    });
  };

  // Skill page handlers
  const handleAddSkill = (skill: Skill): void => {
    setLoadout((prev) => {
      const currentSkills = prev.skillPage.skills;

      // Prevent duplicates
      if (currentSkills.some((s) => s.skill === skill)) {
        return prev;
      }

      // Enforce 4-skill limit
      if (currentSkills.length >= 4) {
        return prev;
      }

      return {
        ...prev,
        skillPage: {
          skills: [...currentSkills, { skill, enabled: true }],
        },
      };
    });
  };

  const handleRemoveSkill = (index: number): void => {
    setLoadout((prev) => ({
      ...prev,
      skillPage: {
        skills: prev.skillPage.skills.filter((_, i) => i !== index),
      },
    }));
  };

  const handleToggleSkill = (index: number): void => {
    setLoadout((prev) => ({
      ...prev,
      skillPage: {
        skills: prev.skillPage.skills.map((s, i) =>
          i === index ? { ...s, enabled: !s.enabled } : s,
        ),
      },
    }));
  };

  // Helper component for talent nodes
  const TalentNodeDisplay = ({
    node,
    allocated,
    canAllocate,
    canDeallocate,
    onAllocate,
    onDeallocate,
  }: {
    node: TalentNodeData;
    allocated: number;
    canAllocate: boolean;
    canDeallocate: boolean;
    onAllocate: () => void;
    onDeallocate: () => void;
  }) => {
    const isFullyAllocated = allocated >= node.maxPoints;
    const isLocked = !canAllocate && allocated === 0;

    return (
      <div
        className={`
          relative w-20 h-20 rounded-lg border-2 transition-all
          ${
            isFullyAllocated
              ? "border-green-500 bg-green-50 dark:bg-green-900/20"
              : allocated > 0
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : isLocked
                  ? "border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800 opacity-50"
                  : "border-zinc-400 dark:border-zinc-500 bg-white dark:bg-zinc-700 hover:border-blue-400"
          }
        `}
        title={`${
          node.nodeType === "micro"
            ? "Micro Talent"
            : node.nodeType === "medium"
              ? "Medium Talent"
              : "Legendary Talent"
        }\n${node.rawAffix}`}
      >
        {/* Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src={`/tli/talents/${node.iconName}.webp`}
            alt={node.iconName}
            className="w-12 h-12 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>

        {/* Points Display */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs text-center py-0.5 rounded-b-md">
          {allocated}/{node.maxPoints}
        </div>

        {/* Allocation Buttons */}
        <div className="absolute -top-2 -right-2 flex gap-1">
          <button
            onClick={onAllocate}
            disabled={!canAllocate}
            className={`
              w-5 h-5 rounded-full text-white text-xs font-bold
              ${
                canAllocate
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-zinc-400 dark:bg-zinc-600 cursor-not-allowed"
              }
            `}
          >
            +
          </button>
          <button
            onClick={onDeallocate}
            disabled={!canDeallocate}
            className={`
              w-5 h-5 rounded-full text-white text-xs font-bold
              ${
                canDeallocate
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-zinc-400 dark:bg-zinc-600 cursor-not-allowed"
              }
            `}
          >
            -
          </button>
        </div>
      </div>
    );
  };

  // Helper to calculate node center positions for SVG lines
  const getNodeCenter = (x: number, y: number) => ({
    cx: x * (80 + 8) + 40, // 80px node + 8px gap, center at 40px
    cy: y * (80 + 8) + 40,
  });

  const handleDebugToggle = () => {
    setDebugMode((prev) => {
      const newValue = !prev;
      saveDebugModeToStorage(newValue);
      return newValue;
    });
  };

  const copyDebugJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(loadout, null, 2));
      alert("Loadout JSON copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            TLI Character Build Planner
          </h1>

          <button
            onClick={handleDebugToggle}
            className={`
              px-3 py-1 rounded-lg text-sm font-medium transition-colors
              ${
                debugMode
                  ? "bg-yellow-600 text-white hover:bg-yellow-700"
                  : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600"
              }
            `}
            title="Toggle Debug Mode"
          >
            {debugMode ? "🐛 Debug ON" : "🐛 Debug"}
          </button>
        </div>

        {/* Page Tabs */}
        <div className="mb-8 flex gap-4 border-b border-zinc-300 dark:border-zinc-700">
          <button
            onClick={() => setActivePage("equipment")}
            className={`px-6 py-3 font-medium transition-colors ${
              activePage === "equipment"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            Equipment
          </button>
          <button
            onClick={() => setActivePage("talents")}
            className={`px-6 py-3 font-medium transition-colors ${
              activePage === "talents"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            Talents
          </button>
          <button
            onClick={() => setActivePage("skills")}
            className={`px-6 py-3 font-medium transition-colors ${
              activePage === "skills"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            Skills
          </button>
        </div>

        {/* Equipment Page */}
        {activePage === "equipment" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Equipment Slots */}
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow">
              <h2 className="text-xl font-semibold mb-4 text-zinc-800 dark:text-zinc-200">
                Equipment Slots
              </h2>
              <div className="space-y-1">
                {GEAR_SLOTS.map(({ key, label }) => (
                  <EquipmentSlotDropdown
                    key={key}
                    slot={key}
                    label={label}
                    selectedItemId={loadout.equipmentPage[key]?.id || null}
                    compatibleItems={getCompatibleItems(loadout.itemsList, key)}
                    onSelectItem={handleSelectItemForSlot}
                  />
                ))}
              </div>
            </div>

            {/* Right Column: Crafting + Inventory */}
            <div className="space-y-6">
              {/* Crafting UI */}
              <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow">
                <h2 className="text-xl font-semibold mb-4 text-zinc-800 dark:text-zinc-200">
                  Craft New Item
                </h2>

                {/* Equipment Type Selector */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2 text-zinc-800 dark:text-zinc-200">
                    Equipment Type
                  </label>
                  <select
                    value={selectedEquipmentType || ""}
                    onChange={handleEquipmentTypeChange}
                    className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select equipment type...</option>
                    {getValidEquipmentTypes("mainHand")
                      .concat(getValidEquipmentTypes("helmet"))
                      .concat(getValidEquipmentTypes("chest"))
                      .concat(getValidEquipmentTypes("gloves"))
                      .concat(getValidEquipmentTypes("boots"))
                      .concat(getValidEquipmentTypes("belt"))
                      .concat(getValidEquipmentTypes("neck"))
                      .concat(getValidEquipmentTypes("leftRing"))
                      .concat(getValidEquipmentTypes("offHand"))
                      .filter((v, i, a) => a.indexOf(v) === i)
                      .sort()
                      .map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                  </select>
                </div>

                {selectedEquipmentType ? (
                  <>
                    {/* Prefix Section */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3 text-zinc-800 dark:text-zinc-200">
                        Prefixes (3 max)
                      </h3>
                      <div className="space-y-4">
                        {[0, 1, 2].map((slotIndex) => (
                          <AffixSlotComponent
                            key={slotIndex}
                            slotIndex={slotIndex}
                            affixType="Prefix"
                            affixes={prefixAffixes}
                            selection={affixSelections[slotIndex]}
                            onAffixSelect={handleAffixSelect}
                            onSliderChange={handleSliderChange}
                            onClear={handleClearAffix}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Suffix Section */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3 text-zinc-800 dark:text-zinc-200">
                        Suffixes (3 max)
                      </h3>
                      <div className="space-y-4">
                        {[3, 4, 5].map((slotIndex) => (
                          <AffixSlotComponent
                            key={slotIndex}
                            slotIndex={slotIndex}
                            affixType="Suffix"
                            affixes={suffixAffixes}
                            selection={affixSelections[slotIndex]}
                            onAffixSelect={handleAffixSelect}
                            onSliderChange={handleSliderChange}
                            onClear={handleClearAffix}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Save to Inventory Button */}
                    <button
                      onClick={handleSaveToInventory}
                      className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Save to Inventory
                    </button>
                  </>
                ) : (
                  <p className="text-zinc-500 dark:text-zinc-400 italic text-center py-8">
                    Select an equipment type to begin crafting
                  </p>
                )}
              </div>

              {/* Inventory */}
              <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow">
                <h2 className="text-xl font-semibold mb-4 text-zinc-800 dark:text-zinc-200">
                  Inventory ({loadout.itemsList.length} items)
                </h2>
                {loadout.itemsList.length === 0 ? (
                  <p className="text-zinc-500 dark:text-zinc-400 italic text-center py-4">
                    No items in inventory. Craft items above to add them here.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {loadout.itemsList.map((item) => (
                      <InventoryItem
                        key={item.id}
                        item={item}
                        isEquipped={isItemEquipped(item.id)}
                        onCopy={handleCopyItem}
                        onDelete={handleDeleteItem}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Talents Page */}
        {activePage === "talents" && (
          <div>
            {/* Tree Slot Selector */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4 text-zinc-800 dark:text-zinc-200">
                Tree Slots
              </h2>
              <div className="grid grid-cols-4 gap-2">
                {(["tree1", "tree2", "tree3", "tree4"] as const).map((slot) => {
                  const totalPoints = loadout.talentPage[
                    slot
                  ].allocatedNodes.reduce((sum, node) => sum + node.points, 0);

                  return (
                    <button
                      key={slot}
                      onClick={() => setActiveTreeSlot(slot)}
                      className={`
                        px-4 py-3 rounded-lg font-medium transition-colors
                        ${
                          activeTreeSlot === slot
                            ? "bg-blue-600 text-white"
                            : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                        }
                      `}
                    >
                      <div className="font-semibold">
                        {slot === "tree1"
                          ? "Slot 1 (God/Goddess)"
                          : `Slot ${slot.slice(-1)}`}
                      </div>
                      <div className="text-sm mt-1 truncate">
                        {loadout.talentPage[slot].name.replace(/_/g, " ")}
                      </div>
                      <div className="text-xs mt-1">{totalPoints} points</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tree Selection Dropdown with Reset Button */}
            <div className="mb-6 bg-white dark:bg-zinc-800 rounded-lg p-4 shadow">
              <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">
                Select Tree for{" "}
                {activeTreeSlot === "tree1"
                  ? "Slot 1"
                  : `Slot ${activeTreeSlot.slice(-1)}`}
              </label>
              <div className="flex gap-2">
                <select
                  value={loadout.talentPage[activeTreeSlot].name}
                  onChange={(e) =>
                    handleTreeChange(activeTreeSlot, e.target.value)
                  }
                  disabled={
                    loadout.talentPage[activeTreeSlot].allocatedNodes.length > 0
                  }
                  className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {activeTreeSlot === "tree1" && (
                    <optgroup label="God/Goddess Trees">
                      {GOD_GODDESS_TREES.map((tree) => (
                        <option key={tree} value={tree}>
                          {tree.replace(/_/g, " ")}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  <optgroup label="Profession Trees">
                    {PROFESSION_TREES.map((tree) => (
                      <option key={tree} value={tree}>
                        {tree.replace(/_/g, " ")}
                      </option>
                    ))}
                  </optgroup>
                </select>

                <button
                  onClick={() => handleResetTree(activeTreeSlot)}
                  disabled={
                    loadout.talentPage[activeTreeSlot].allocatedNodes.length ===
                    0
                  }
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:bg-zinc-400 disabled:cursor-not-allowed"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Talent Grid */}
            {treeData[activeTreeSlot] ? (
              <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow">
                <h2 className="text-xl font-semibold mb-4 text-zinc-800 dark:text-zinc-200">
                  {treeData[activeTreeSlot]!.name.replace(/_/g, " ")} Tree
                </h2>

                {/* Column Headers */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {[0, 3, 6, 9, 12, 15, 18].map((points, idx) => (
                    <div
                      key={idx}
                      className="text-center text-sm font-medium text-zinc-600 dark:text-zinc-400"
                    >
                      {points} pts
                    </div>
                  ))}
                </div>

                {/* Grid Container with SVG */}
                <div className="relative">
                  {/* SVG for prerequisite lines */}
                  <svg
                    className="absolute inset-0 pointer-events-none"
                    style={{ width: "100%", height: "100%", zIndex: 0 }}
                  >
                    {treeData[activeTreeSlot]!.nodes.filter(
                      (node) => node.prerequisite,
                    ).map((node, idx) => {
                      const from = getNodeCenter(
                        node.prerequisite!.x,
                        node.prerequisite!.y,
                      );
                      const to = getNodeCenter(
                        node.position.x,
                        node.position.y,
                      );

                      const isSatisfied = isPrerequisiteSatisfied(
                        node.prerequisite,
                        loadout.talentPage[activeTreeSlot].allocatedNodes,
                        treeData[activeTreeSlot]!,
                      );

                      return (
                        <line
                          key={idx}
                          x1={from.cx}
                          y1={from.cy}
                          x2={to.cx}
                          y2={to.cy}
                          stroke={isSatisfied ? "#22c55e" : "#71717a"}
                          strokeWidth="2"
                          opacity="0.5"
                        />
                      );
                    })}
                  </svg>

                  {/* Node Grid */}
                  <div className="relative" style={{ zIndex: 1 }}>
                    {[0, 1, 2, 3, 4].map((y) => (
                      <div key={y} className="grid grid-cols-7 gap-2 mb-2">
                        {[0, 1, 2, 3, 4, 5, 6].map((x) => {
                          const node = treeData[activeTreeSlot]!.nodes.find(
                            (n) => n.position.x === x && n.position.y === y,
                          );

                          if (!node) {
                            return <div key={x} className="w-20 h-20" />;
                          }

                          const allocation = loadout.talentPage[
                            activeTreeSlot
                          ].allocatedNodes.find((n) => n.x === x && n.y === y);
                          const allocated = allocation?.points ?? 0;

                          return (
                            <TalentNodeDisplay
                              key={`${x}-${y}`}
                              node={node}
                              allocated={allocated}
                              canAllocate={canAllocateNode(
                                node,
                                loadout.talentPage[activeTreeSlot]
                                  .allocatedNodes,
                                treeData[activeTreeSlot]!,
                              )}
                              canDeallocate={canDeallocateNode(
                                node,
                                loadout.talentPage[activeTreeSlot]
                                  .allocatedNodes,
                                treeData[activeTreeSlot]!,
                              )}
                              onAllocate={() =>
                                handleAllocate(activeTreeSlot, x, y)
                              }
                              onDeallocate={() =>
                                handleDeallocate(activeTreeSlot, x, y)
                              }
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
                Loading tree...
              </div>
            )}
          </div>
        )}

        {/* Skills Page */}
        {activePage === "skills" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold mb-4 text-zinc-800 dark:text-zinc-200">
              Skill Selection
            </h2>

            {/* Skill List */}
            <div className="space-y-3">
              {loadout.skillPage.skills.length === 0 ? (
                <p className="text-zinc-500 dark:text-zinc-400">
                  No skills selected. Add a skill below.
                </p>
              ) : (
                loadout.skillPage.skills.map((skillEntry, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-zinc-800 p-4 rounded-lg shadow flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={skillEntry.enabled}
                        onChange={() => handleToggleSkill(index)}
                        className="w-5 h-5"
                      />
                      <span
                        className={
                          skillEntry.enabled
                            ? "text-zinc-900 dark:text-zinc-100"
                            : "text-zinc-500 dark:text-zinc-500"
                        }
                      >
                        {skillEntry.skill}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveSkill(index)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm text-white"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add Skill Section */}
            <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-3 text-zinc-800 dark:text-zinc-200">
                Add Skill
              </h3>

              {loadout.skillPage.skills.length >= 4 ? (
                <p className="text-yellow-600 dark:text-yellow-500">
                  Maximum of 4 skills reached
                </p>
              ) : (
                <div className="flex gap-2">
                  <select
                    className="flex-1 bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-zinc-900 dark:text-zinc-100"
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddSkill(e.target.value as Skill);
                        e.target.value = ""; // Reset selection
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select a skill...
                    </option>
                    {AVAILABLE_SKILLS.filter(
                      (skill) =>
                        !loadout.skillPage.skills.some(
                          (s) => s.skill === skill,
                        ),
                    ).map((skill) => (
                      <option key={skill} value={skill}>
                        {skill}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-8">
          <button
            onClick={handleSave}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors"
          >
            Save to LocalStorage
          </button>
        </div>

        {/* Debug Panel */}
        {debugMode && (
          <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-800 border-t-2 border-blue-500 shadow-2xl z-50">
            {/* Panel Header */}
            <div className="bg-zinc-100 dark:bg-zinc-900 px-4 py-2 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Debug: RawLoadout
                </h3>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {JSON.stringify(loadout).length} bytes
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={copyDebugJson}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                  title="Copy JSON to clipboard"
                >
                  Copy JSON
                </button>
                <button
                  onClick={() => setDebugPanelExpanded((prev) => !prev)}
                  className="px-3 py-1 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-900 dark:text-zinc-100 text-sm rounded transition-colors"
                >
                  {debugPanelExpanded ? "▼ Minimize" : "▲ Expand"}
                </button>
                <button
                  onClick={handleDebugToggle}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                  title="Close debug panel"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Panel Content */}
            {debugPanelExpanded && (
              <div className="p-4 overflow-auto" style={{ maxHeight: "400px" }}>
                <pre className="text-xs font-mono text-zinc-900 dark:text-zinc-100 whitespace-pre-wrap break-words">
                  {JSON.stringify(loadout, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
