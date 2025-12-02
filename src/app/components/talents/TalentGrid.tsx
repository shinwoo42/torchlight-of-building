import {
  TalentTreeData,
  canAllocateNode,
  canDeallocateNode,
  isPrerequisiteSatisfied,
  hasPrismAtPosition,
  canRemovePrism,
} from "@/src/tli/talent_tree";
import {
  AllocatedTalentNode,
  PlacedPrism,
  CraftedPrism,
} from "@/src/app/lib/save-data";
import { TalentNodeDisplay } from "./TalentNodeDisplay";

interface TalentGridProps {
  treeData: TalentTreeData;
  allocatedNodes: AllocatedTalentNode[];
  onAllocate: (x: number, y: number) => void;
  onDeallocate: (x: number, y: number) => void;
  treeSlot: string;
  placedPrism?: PlacedPrism;
  selectedPrism?: CraftedPrism;
  onPlacePrism?: (x: number, y: number) => void;
  onRemovePrism?: () => void;
}

// Helper to calculate node center positions for SVG lines
const getNodeCenter = (x: number, y: number) => ({
  cx: x * (80 + 80) + 40, // 80px node + 80px gap, center at 40px
  cy: y * (80 + 80) + 40,
});

export const TalentGrid: React.FC<TalentGridProps> = ({
  treeData,
  allocatedNodes,
  onAllocate,
  onDeallocate,
  treeSlot,
  placedPrism,
  selectedPrism,
  onPlacePrism,
  onRemovePrism,
}) => {
  // Grid dimensions: 7 cols × 5 rows, 80px nodes, 80px gaps
  const gridWidth = 7 * 80 + 6 * 80; // 1040px
  const gridHeight = 5 * 80 + 4 * 80; // 720px

  return (
    <div className="overflow-x-auto">
      <div
        className="relative"
        style={{ width: gridWidth, height: gridHeight }}
      >
        {/* SVG for prerequisite lines */}
        <svg
          className="absolute inset-0 pointer-events-none"
          style={{ width: gridWidth, height: gridHeight, zIndex: 0 }}
        >
          {treeData.nodes
            .filter((node) => node.prerequisite)
            .map((node, idx) => {
              // Don't draw lines from prism nodes (prerequisite is bypassed)
              if (
                hasPrismAtPosition(
                  placedPrism,
                  treeSlot,
                  node.prerequisite!.x,
                  node.prerequisite!.y,
                )
              ) {
                return null;
              }

              const from = getNodeCenter(
                node.prerequisite!.x,
                node.prerequisite!.y,
              );
              const to = getNodeCenter(node.position.x, node.position.y);

              const isSatisfied = isPrerequisiteSatisfied(
                node.prerequisite,
                allocatedNodes,
                treeData,
                placedPrism,
                treeSlot,
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
        <div
          className="relative grid"
          style={{
            zIndex: 1,
            gridTemplateColumns: "repeat(7, 80px)",
            gridTemplateRows: "repeat(5, 80px)",
            gap: "80px",
          }}
        >
          {[0, 1, 2, 3, 4].map((y) =>
            [0, 1, 2, 3, 4, 5, 6].map((x) => {
              const node = treeData.nodes.find(
                (n) => n.position.x === x && n.position.y === y,
              );

              if (!node) {
                return <div key={`${x}-${y}`} className="w-20 h-20" />;
              }

              const allocation = allocatedNodes.find(
                (n) => n.x === x && n.y === y,
              );
              const allocated = allocation?.points ?? 0;
              const nodeHasPrism = hasPrismAtPosition(
                placedPrism,
                treeSlot,
                x,
                y,
              );

              // Check if prism can be removed (only relevant if this node has the prism)
              const prismCanBeRemoved =
                nodeHasPrism && placedPrism
                  ? canRemovePrism(placedPrism, allocatedNodes, treeData)
                  : false;

              return (
                <TalentNodeDisplay
                  key={`${x}-${y}`}
                  node={node}
                  allocated={allocated}
                  canAllocate={canAllocateNode(
                    node,
                    allocatedNodes,
                    treeData,
                    placedPrism,
                    treeSlot,
                  )}
                  canDeallocate={canDeallocateNode(
                    node,
                    allocatedNodes,
                    treeData,
                    placedPrism,
                    treeSlot,
                  )}
                  onAllocate={() => onAllocate(x, y)}
                  onDeallocate={() => onDeallocate(x, y)}
                  hasPrism={nodeHasPrism}
                  prism={nodeHasPrism ? placedPrism?.prism : undefined}
                  isSelectingPrism={!!selectedPrism}
                  onPlacePrism={
                    onPlacePrism ? () => onPlacePrism(x, y) : undefined
                  }
                  onRemovePrism={nodeHasPrism ? onRemovePrism : undefined}
                  canRemovePrism={prismCanBeRemoved}
                />
              );
            }),
          )}
        </div>
      </div>
    </div>
  );
};
