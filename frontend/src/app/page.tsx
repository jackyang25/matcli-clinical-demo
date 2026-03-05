"use client";

import { useState } from "react";
import { useSimulationState } from "@/components/providers/SimulationStateProvider";
import {
  ContextFactorsCard,
  QuantitativeProfileCard
} from "@/components/selection/ContextSection";
import { PillGroup } from "@/components/selection/PillGroup";
import { ProposedActionSection } from "@/components/selection/ProposedActionSection";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTokenRegistry } from "@/components/build/useTokenRegistry";
import { SCENARIO_PRESETS, type ScenarioPreset } from "@/lib/scenario-presets";

function ScenarioPresetSelector({
  onLoad,
}: {
  onLoad: (preset: ScenarioPreset) => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = SCENARIO_PRESETS.find((p) => p.id === activeId) ?? null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="inline-flex items-center gap-2 text-base">
          <span className="inline-flex size-5 items-center justify-center rounded-md bg-violet-100 text-[11px] font-bold text-violet-700">
            S
          </span>
          Scenario Presets
        </CardTitle>
        <p className="mt-1 text-sm text-slate-500">
          Load a clinical vignette to auto-fill all inputs, then run through the pipeline.
        </p>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <div className="flex flex-wrap gap-2">
          {SCENARIO_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() =>
                setActiveId((current) =>
                  current === preset.id ? null : preset.id
                )
              }
              className={`inline-flex items-center rounded-full border px-3.5 py-2 text-sm font-medium transition ${
                activeId === preset.id
                  ? "border-violet-600 bg-violet-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
                  : "border-slate-200 bg-slate-50/80 text-slate-800 hover:border-violet-300 hover:bg-violet-50"
              }`}
            >
              {preset.title}
            </button>
          ))}
        </div>

        <div
          className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${
            active ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <div className="overflow-hidden">
            {active ? (
              <div className="rounded-xl border border-violet-200 bg-violet-50/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-violet-900">
                      {active.title}
                    </div>
                    <div className="mt-0.5 text-xs font-medium text-violet-700">
                      {active.subtitle}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-700">
                      {active.description}
                    </p>
                    <div className="mt-2.5 flex items-center gap-2">
                      <Badge
                        className={
                          active.expectedOutcome === "verified"
                            ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border border-red-200 bg-red-50 text-red-700"
                        }
                      >
                        Expected: {active.expectedOutcome === "verified" ? "Verified" : "Rejected"}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        {active.outcomeReason}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onLoad(active);
                      setActiveId(null);
                    }}
                    className="shrink-0 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-violet-700"
                  >
                    Load Preset
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function HomePage() {
  const registry = useTokenRegistry();
  const opts = registry.inputOptions;

  const {
    state: {
      selectedDiagnoses,
      selectedDiagnosisAttributes,
      selectedComorbidities,
      selectedPhysiologicStates,
      gestationalWeeks,
      maternalAgeYears,
      bmi,
      selectedAction
    },
    toggleDiagnosis,
    toggleDiagnosisAttribute,
    toggleComorbidity,
    togglePhysiologicState,
    setGestationalWeeks,
    setMaternalAgeYears,
    setBmi,
    setSelectedAction,
    loadPreset,
  } = useSimulationState();

  const hasRequiredSimulatedInference =
    selectedDiagnoses.length > 0 && selectedAction !== null;
  const selectedActionLabel =
    opts.clinicalActions.find((action) => action.id === selectedAction)?.label ?? null;

  if (opts.diagnoses.length === 0) {
    return (
      <div className="flex w-full items-center justify-center p-12 text-sm text-slate-500">
        Loading clinical options...
      </div>
    );
  }

  return (
    <div className="grid w-full gap-6">
      <ScenarioPresetSelector onLoad={loadPreset} />

      <section className="flex flex-wrap items-center gap-2">
        {hasRequiredSimulatedInference ? (
          <Badge className="border border-emerald-200 bg-emerald-50 text-emerald-700">
            Ready
          </Badge>
        ) : (
          <Badge className="border border-amber-200 bg-amber-50 text-amber-800">
            Needs inputs
          </Badge>
        )}
        <Badge className="border-slate-200 bg-white text-slate-700">
          {selectedActionLabel ?? "No action"}
        </Badge>
        <span className="text-xs text-slate-400">
          Select at least 1 diagnosis and a proposed action.
        </span>
      </section>

      <PillGroup
        title="Bayesian Inference"
        description="Posterior over diagnosis candidates + a proposed clinical action."
        optionsLabel="Conformal Prediction"
        options={opts.diagnoses}
        selected={selectedDiagnoses}
        onToggle={toggleDiagnosis}
        attributeOptionsByOptionId={Object.fromEntries(
          opts.diagnoses
            .filter((diagnosis) => diagnosis.availableAttributes?.length)
            .map((diagnosis) => [
              diagnosis.id,
              diagnosis.availableAttributes ?? []
            ])
        )}
        selectedAttributesByOptionId={selectedDiagnosisAttributes}
        onToggleAttribute={toggleDiagnosisAttribute}
      >
        <>
          <ProposedActionSection
            actions={opts.clinicalActions}
            selectedAction={selectedAction}
            onSelectAction={setSelectedAction}
          />
        </>
      </PillGroup>

      <ContextFactorsCard
        comorbidities={opts.comorbidities}
        selectedComorbidities={selectedComorbidities}
        onToggleComorbidity={toggleComorbidity}
        physiologicStates={opts.physiologicStates}
        selectedPhysiologicStates={selectedPhysiologicStates}
        onTogglePhysiologicState={togglePhysiologicState}
      />

      <QuantitativeProfileCard
        gestationalWeeks={gestationalWeeks}
        gestationalAgeMarks={opts.gestationalAgeMarks}
        onChangeGestationalWeeks={setGestationalWeeks}
        maternalAgeYears={maternalAgeYears}
        maternalAgeMarks={opts.maternalAgeMarks}
        onChangeMaternalAgeYears={setMaternalAgeYears}
        bmi={bmi}
        bmiMarks={opts.bmiMarks}
        onChangeBmi={setBmi}
      />
    </div>
  );
}
