import type { Mod } from "@/src/tli/mod";

interface ModRowProps {
  mod: Mod;
}

export const ModRow: React.FC<ModRowProps> = ({ mod }) => {
  return (
    <div className="border-l-2 border-zinc-600 py-1 pl-3 text-sm">
      <pre className="overflow-x-auto font-mono text-xs text-zinc-300">
        {JSON.stringify(mod, null)}
      </pre>
    </div>
  );
};
