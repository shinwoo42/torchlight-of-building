import { useState } from "react";
import type { SaveData } from "@/src/app/lib/save-data";
import type { Loadout } from "@/src/tli/core";

type DebugView = "saveData" | "loadout";

interface JsonNodeProps {
  data: unknown;
  keyName?: string;
  isLast?: boolean;
  depth?: number;
  defaultExpanded?: boolean;
}

const JsonNode: React.FC<JsonNodeProps> = ({
  data,
  keyName,
  isLast = true,
  depth = 0,
  defaultExpanded = true,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const isObject = data !== null && typeof data === "object";
  const isArray = Array.isArray(data);
  const isEmpty = isObject && Object.keys(data as object).length === 0;

  const renderValue = (value: unknown): React.ReactNode => {
    if (value === null) {
      return <span className="text-zinc-500">null</span>;
    }
    if (value === undefined) {
      return <span className="text-zinc-500">undefined</span>;
    }
    if (typeof value === "string") {
      return <span className="text-green-400">"{value}"</span>;
    }
    if (typeof value === "number") {
      return <span className="text-amber-400">{value}</span>;
    }
    if (typeof value === "boolean") {
      return <span className="text-purple-400">{value.toString()}</span>;
    }
    return null;
  };

  const comma = isLast ? "" : ",";

  if (!isObject) {
    return (
      <div className="leading-5">
        {keyName !== undefined && (
          <span className="text-blue-300">"{keyName}"</span>
        )}
        {keyName !== undefined && <span className="text-zinc-400">: </span>}
        {renderValue(data)}
        <span className="text-zinc-400">{comma}</span>
      </div>
    );
  }

  const entries = Object.entries(data as object);
  const openBracket = isArray ? "[" : "{";
  const closeBracket = isArray ? "]" : "}";
  const itemCount = entries.length;
  const preview = isArray ? `${itemCount} items` : `${itemCount} keys`;

  if (isEmpty) {
    return (
      <div className="leading-5">
        {keyName !== undefined && (
          <span className="text-blue-300">"{keyName}"</span>
        )}
        {keyName !== undefined && <span className="text-zinc-400">: </span>}
        <span className="text-zinc-400">
          {openBracket}
          {closeBracket}
        </span>
        <span className="text-zinc-400">{comma}</span>
      </div>
    );
  }

  return (
    <div className="leading-5">
      <span
        onClick={() => setExpanded(!expanded)}
        onKeyDown={(e) => e.key === "Enter" && setExpanded(!expanded)}
        className="cursor-pointer select-none hover:bg-zinc-800 rounded inline-flex items-center"
        role="button"
        tabIndex={0}
      >
        <span className="text-zinc-500 w-4 inline-block text-center">
          {expanded ? "▼" : "▶"}
        </span>
        {keyName !== undefined && (
          <span className="text-blue-300">"{keyName}"</span>
        )}
        {keyName !== undefined && <span className="text-zinc-400">: </span>}
        <span className="text-zinc-400">{openBracket}</span>
        {!expanded && (
          <>
            <span className="text-zinc-500 text-xs mx-1">{preview}</span>
            <span className="text-zinc-400">{closeBracket}</span>
            <span className="text-zinc-400">{comma}</span>
          </>
        )}
      </span>
      {expanded && (
        <>
          <div className="ml-4 border-l border-zinc-700 pl-2">
            {entries.map(([key, value], index) => (
              <JsonNode
                key={key}
                keyName={isArray ? undefined : key}
                data={value}
                isLast={index === entries.length - 1}
                depth={depth + 1}
                defaultExpanded={depth < 1}
              />
            ))}
          </div>
          <div>
            <span className="text-zinc-400">
              {closeBracket}
              {comma}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

interface DebugPanelProps {
  saveData: SaveData;
  loadout: Loadout;
  debugPanelExpanded: boolean;
  setDebugPanelExpanded: (expanded: boolean) => void;
  onClose: () => void;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
  saveData,
  loadout,
  debugPanelExpanded,
  setDebugPanelExpanded,
  onClose,
}) => {
  const [view, setView] = useState<DebugView>("saveData");

  const currentData = view === "saveData" ? saveData : loadout;
  const title =
    view === "saveData" ? "Debug: SaveData (Raw)" : "Debug: Loadout (Parsed)";

  const copyDebugJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(currentData, null, 2));
      alert(
        `${view === "saveData" ? "SaveData" : "Loadout"} JSON copied to clipboard!`,
      );
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t-2 border-amber-500 shadow-2xl z-50">
      {/* Panel Header */}
      <div className="bg-zinc-950 px-4 py-2 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-zinc-50">{title}</h3>
          <span className="text-xs text-zinc-500">
            {JSON.stringify(currentData).length} bytes
          </span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() =>
              setView(view === "saveData" ? "loadout" : "saveData")
            }
            className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-50 text-sm rounded transition-colors"
            title="Toggle between SaveData and Loadout views"
          >
            {view === "saveData" ? "View Parsed" : "View Raw"}
          </button>
          <button
            type="button"
            onClick={copyDebugJson}
            className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-zinc-950 text-sm rounded transition-colors"
            title="Copy JSON to clipboard"
          >
            Copy JSON
          </button>
          <button
            type="button"
            onClick={() => setDebugPanelExpanded(!debugPanelExpanded)}
            className="px-3 py-1 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-50 text-sm rounded transition-colors"
          >
            {debugPanelExpanded ? "Minimize" : "Expand"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition-colors"
            title="Close debug panel"
          >
            Close
          </button>
        </div>
      </div>

      {/* Panel Content */}
      {debugPanelExpanded && (
        <div className="p-4 overflow-auto" style={{ maxHeight: "400px" }}>
          <div className="text-xs font-mono">
            <JsonNode data={currentData} defaultExpanded={true} />
          </div>
        </div>
      )}
    </div>
  );
};
