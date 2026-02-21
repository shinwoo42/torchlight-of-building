import { createFileRoute } from "@tanstack/react-router";
import { PactspiritTab } from "../../components/pactspirit/PactspiritTab";
import { useBuilderActions, useLoadout } from "../../stores/builderStore";

export const Route = createFileRoute("/builder/pactspirit")({
  component: PactspiritPage,
});

function PactspiritPage(): React.ReactNode {
  const loadout = useLoadout();
  const {
    resetPactspiritSlot,
    setPactspiritLevel,
    installDestiny,
    clearRingDestiny,
    installUndeterminedFate,
    removeUndeterminedFate,
    installUndeterminedFateDestiny,
    clearUndeterminedFateDestiny,
  } = useBuilderActions();

  return (
    <PactspiritTab
      pactspiritPage={loadout.pactspiritPage}
      onPactspiritSelect={resetPactspiritSlot}
      onLevelChange={setPactspiritLevel}
      onInstallDestiny={installDestiny}
      onRevertRing={clearRingDestiny}
      onInstallUndeterminedFate={installUndeterminedFate}
      onRemoveUndeterminedFate={removeUndeterminedFate}
      onInstallFateDestiny={installUndeterminedFateDestiny}
      onClearFateDestiny={clearUndeterminedFateDestiny}
    />
  );
}
