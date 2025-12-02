import { AllocatedTalentNode, PlacedPrism } from "@/src/app/lib/save-data";
import { TalentNodeData, TalentTreeData } from "./core";
import { TALENT_TREES } from "./talent_data";
import type { TreeName } from "./talent_tree_types";

// Re-export tree name constants and types
export {
  GOD_GODDESS_TREES,
  PROFESSION_TREES,
  isGodGoddessTree,
} from "./talent_tree_types";
export type { TreeName } from "./talent_tree_types";

// Re-export data types
export type { TalentNodeData, TalentTreeData };

// Check if a position has a placed prism
export const hasPrismAtPosition = (
  placedPrism: PlacedPrism | undefined,
  treeSlot: string,
  x: number,
  y: number,
): boolean => {
  if (!placedPrism) return false;
  return (
    placedPrism.treeSlot === treeSlot &&
    placedPrism.position.x === x &&
    placedPrism.position.y === y
  );
};

// Calculate total points in a specific column
export const calculateColumnPoints = (
  allocatedNodes: AllocatedTalentNode[],
  columnIndex: number,
): number => {
  return allocatedNodes
    .filter((node) => node.x === columnIndex)
    .reduce((sum, node) => sum + node.points, 0);
};

// Calculate total points allocated before a specific column
export const getTotalPointsBeforeColumn = (
  allocatedNodes: AllocatedTalentNode[],
  columnIndex: number,
): number => {
  let total = 0;
  for (let x = 0; x < columnIndex; x++) {
    total += calculateColumnPoints(allocatedNodes, x);
  }
  return total;
};

// Check if a column is unlocked based on point requirements
export const isColumnUnlocked = (
  allocatedNodes: AllocatedTalentNode[],
  columnIndex: number,
): boolean => {
  const requiredPoints = columnIndex * 3;
  const pointsAllocated = getTotalPointsBeforeColumn(
    allocatedNodes,
    columnIndex,
  );
  return pointsAllocated >= requiredPoints;
};

// Check if a prerequisite node is fully satisfied
// If the prerequisite node has a prism, the check is bypassed (considered satisfied)
export const isPrerequisiteSatisfied = (
  prerequisite: { x: number; y: number } | undefined,
  allocatedNodes: AllocatedTalentNode[],
  treeData: TalentTreeData,
  placedPrism?: PlacedPrism,
  treeSlot?: string,
): boolean => {
  if (!prerequisite) return true;

  // If prerequisite node has a prism, bypass the check
  if (
    placedPrism &&
    treeSlot &&
    hasPrismAtPosition(placedPrism, treeSlot, prerequisite.x, prerequisite.y)
  ) {
    return true;
  }

  const prereqNode = treeData.nodes.find(
    (n) => n.position.x === prerequisite.x && n.position.y === prerequisite.y,
  );
  if (!prereqNode) return false;

  const allocation = allocatedNodes.find(
    (n) => n.x === prerequisite.x && n.y === prerequisite.y,
  );

  return allocation !== undefined && allocation.points >= prereqNode.maxPoints;
};

// Check if a node can be allocated
export const canAllocateNode = (
  node: TalentNodeData,
  allocatedNodes: AllocatedTalentNode[],
  treeData: TalentTreeData,
  placedPrism?: PlacedPrism,
  treeSlot?: string,
): boolean => {
  // Cannot allocate to a node with a prism
  if (
    placedPrism &&
    treeSlot &&
    hasPrismAtPosition(placedPrism, treeSlot, node.position.x, node.position.y)
  ) {
    return false;
  }

  // Check column gating
  if (!isColumnUnlocked(allocatedNodes, node.position.x)) {
    return false;
  }

  // Check prerequisite
  if (
    !isPrerequisiteSatisfied(
      node.prerequisite,
      allocatedNodes,
      treeData,
      placedPrism,
      treeSlot,
    )
  ) {
    return false;
  }

  // Check if already at max
  const current = allocatedNodes.find(
    (n) => n.x === node.position.x && n.y === node.position.y,
  );
  if (current && current.points >= node.maxPoints) {
    return false;
  }

  return true;
};

// Check if a node can be deallocated
export const canDeallocateNode = (
  node: TalentNodeData,
  allocatedNodes: AllocatedTalentNode[],
  treeData: TalentTreeData,
  placedPrism?: PlacedPrism,
  treeSlot?: string,
): boolean => {
  // Must have points allocated
  const current = allocatedNodes.find(
    (n) => n.x === node.position.x && n.y === node.position.y,
  );
  if (!current || current.points === 0) {
    return false;
  }

  // Check if any other node depends on this one being fully allocated
  // Skip nodes that have a prism on them (prism nodes don't count as allocated dependents)
  const hasDependents = treeData.nodes.some((otherNode) => {
    if (!otherNode.prerequisite) return false;
    if (otherNode.prerequisite.x !== node.position.x) return false;
    if (otherNode.prerequisite.y !== node.position.y) return false;

    // If the dependent node has a prism, it doesn't count as a dependent
    if (
      placedPrism &&
      treeSlot &&
      hasPrismAtPosition(
        placedPrism,
        treeSlot,
        otherNode.position.x,
        otherNode.position.y,
      )
    ) {
      return false;
    }

    // Check if the dependent node is allocated
    const dependentAllocation = allocatedNodes.find(
      (n) => n.x === otherNode.position.x && n.y === otherNode.position.y,
    );
    return dependentAllocation !== undefined && dependentAllocation.points > 0;
  });

  // If deallocating would break the fully-allocated requirement for dependents
  if (hasDependents && current.points <= node.maxPoints) {
    return false;
  }

  return true;
};

// Check if a prism can be removed without causing invalid state
// A prism cannot be removed if any dependent node has allocated points
export const canRemovePrism = (
  placedPrism: PlacedPrism,
  allocatedNodes: AllocatedTalentNode[],
  treeData: TalentTreeData,
): boolean => {
  const { x, y } = placedPrism.position;

  // Find all nodes that depend on the prism's position
  const hasDependentsWithPoints = treeData.nodes.some((node) => {
    if (!node.prerequisite) return false;
    if (node.prerequisite.x !== x || node.prerequisite.y !== y) return false;

    // Check if this dependent node has allocated points
    const allocation = allocatedNodes.find(
      (n) => n.x === node.position.x && n.y === node.position.y,
    );
    return allocation !== undefined && allocation.points > 0;
  });

  // Cannot remove if there are dependents with allocated points
  return !hasDependentsWithPoints;
};

// Tree loading function - now synchronous since data is imported
export const loadTalentTree = (treeName: TreeName): TalentTreeData => {
  return TALENT_TREES[treeName];
};
