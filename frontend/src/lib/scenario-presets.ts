/**
 * Demo scenario presets for the Inputs page.
 *
 * Each preset maps a clinical vignette to the exact frontend IDs defined in
 * the backend ontology (normalize.py) so that loading a preset auto-fills
 * the entire SimulationState input surface.
 */

export type ScenarioPreset = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  expectedOutcome: "verified" | "rejected";
  outcomeReason: string;
  inputs: {
    selectedDiagnoses: string[];
    selectedDiagnosisAttributes: Record<string, string[]>;
    selectedComorbidities: string[];
    selectedPhysiologicStates: string[];
    gestationalWeeks: number;
    maternalAgeYears: number;
    bmi: number;
    selectedAction: string | null;
  };
};

export const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    id: "gray-zone-preterm",
    title: "Gray Zone Preterm",
    subtitle: "33 weeks, BP 155/100, labs normal",
    description:
      "Elevated BP not yet in the severe range. Conformal set contains Gestational HTN and Preeclampsia — the system should verify expectant management to avoid prematurity cost while monitoring for progression.",
    expectedOutcome: "verified",
    outcomeReason: "Prematurity penalty at 33w outweighs uncertain diagnosis; wait is indicated.",
    inputs: {
      selectedDiagnoses: ["dx_gestational_hypertension", "dx_preeclampsia"],
      selectedDiagnosisAttributes: {},
      selectedComorbidities: ["ctx_family_history_hypertensive_disorders"],
      selectedPhysiologicStates: [],
      gestationalWeeks: 33,
      maternalAgeYears: 29,
      bmi: 30,
      selectedAction: "action_expectant_management",
    },
  },
  {
    id: "hellp-vs-aflp",
    title: "HELLP vs AFLP",
    subtitle: "36 weeks, platelets dropping, nausea",
    description:
      "Diagnostic ambiguity between HELLP and Acute Fatty Liver, but both conditions share the same dominant strategy: immediate delivery. The system should verify delivery without requiring further diagnostic workup.",
    expectedOutcome: "verified",
    outcomeReason: "Action is robust across both top diagnoses (therapeutic certainty).",
    inputs: {
      selectedDiagnoses: ["dx_hellp_syndrome", "dx_acute_fatty_liver_pregnancy"],
      selectedDiagnosisAttributes: {},
      selectedComorbidities: [],
      selectedPhysiologicStates: ["ctx_platelets_lt_100k", "ctx_ast_alt_elevated"],
      gestationalWeeks: 36,
      maternalAgeYears: 32,
      bmi: 28,
      selectedAction: "action_immediate_delivery",
    },
  },
  {
    id: "severe-preeclampsia-delivery",
    title: "Severe Preeclampsia",
    subtitle: "Severe features confirmed, 37 weeks",
    description:
      "Confirmed severe preeclampsia with proteinuria and severe-range BP. At 37 weeks the system should verify immediate delivery as the indicated action.",
    expectedOutcome: "verified",
    outcomeReason:
      "Severe features confirmed at term — delivery is obligated per guideline rules.",
    inputs: {
      selectedDiagnoses: ["dx_preeclampsia"],
      selectedDiagnosisAttributes: {
        dx_preeclampsia: ["severe_features"],
      },
      selectedComorbidities: [],
      selectedPhysiologicStates: [
        "ctx_sbp_160",
        "ctx_proteinuria",
      ],
      gestationalWeeks: 37,
      maternalAgeYears: 30,
      bmi: 29,
      selectedAction: "action_immediate_delivery",
    },
  },
];
