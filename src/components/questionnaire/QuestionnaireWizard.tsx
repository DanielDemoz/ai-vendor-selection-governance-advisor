"use client";

import { useAssessmentStore } from "@/store/assessment-store";
import {
  Card,
  ErrorMessage,
  FieldLabel,
  OptionGrid,
  ProgressBar,
  RadioGroup,
  SectionTitle,
} from "@/components/ui/primitives";
import {
  DATA_TYPE_OPTIONS,
  ORG_SIZE_OPTIONS,
  ORG_TYPE_OPTIONS,
  PRIORITY_OPTIONS,
  STEP_TITLES,
  TOOL_OPTIONS,
  TOTAL_STEPS,
  USE_CASE_OPTIONS,
  USER_COUNT_OPTIONS,
} from "@/lib/constants";
import type { Priority } from "@/lib/schemas";
import { useRouter } from "next/navigation";
import { useState } from "react";

function NavButtons({
  onBack,
  onContinue,
  continueLabel = "Continue",
  disableContinue = false,
}: {
  onBack?: () => void;
  onContinue: () => void;
  continueLabel?: string;
  disableContinue?: boolean;
}) {
  return (
    <div className="mt-8 flex justify-between gap-4">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Back
        </button>
      ) : (
        <div />
      )}
      <button
        type="button"
        onClick={onContinue}
        disabled={disableContinue}
        className="rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {continueLabel}
      </button>
    </div>
  );
}

export function QuestionnaireWizard() {
  const router = useRouter();
  const store = useAssessmentStore();
  const [error, setError] = useState("");
  const step = store.step ?? 0;

  const validate = (): boolean => {
    setError("");
    switch (step) {
      case 0:
        if (!store.useCases?.length) {
          setError("Select at least one use case.");
          return false;
        }
        return true;
      case 1:
        if (!store.orgSize || !store.userCount || !store.orgType) {
          setError("Please answer all business context questions.");
          return false;
        }
        return true;
      case 2:
        if (!store.integrationImportance) {
          setError("Please indicate how important integration is.");
          return false;
        }
        return true;
      case 3:
        if (!store.dataTypes?.length || !store.privacyImportance || !store.trainingExclusion || !store.dataProcessingPreference) {
          setError("Please complete all data and privacy questions.");
          return false;
        }
        return true;
      case 4:
        if (!store.budget || !store.budgetPriority) {
          setError("Please answer both budget questions.");
          return false;
        }
        return true;
      case 5: {
        const count = store.priorities?.length ?? 0;
        if (count < 3 || count > 5) {
          setError("Select 3 to 5 priorities.");
          return false;
        }
        return true;
      }
      case 6:
        if (!store.approachOpenness?.length || !store.lockInImportance || !store.technicalStaff) {
          setError("Please complete all implementation preference questions.");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleContinue = () => {
    if (!validate()) return;
    if (step >= TOTAL_STEPS - 1) {
      const profile = store.getValidatedProfile();
      if (!profile) {
        setError("Unable to validate your answers. Please review all steps.");
        return;
      }
      router.push("/results");
      return;
    }
    store.nextStep();
  };

  const priorityToggle = (id: string) => {
    const priority = id as Priority;
    const current = store.priorities ?? [];
    if (current.includes(priority)) {
      store.setField("priorities", current.filter((p) => p !== priority));
    } else if (current.length < 5) {
      store.setField("priorities", [...current, priority]);
    }
  };

  return (
    <Card>
      <ProgressBar step={step} total={TOTAL_STEPS} />
      <div className="mt-8">
        <SectionTitle title={STEP_TITLES[step]} />

        {step === 0 && (
          <>
            <FieldLabel>What would you primarily like AI to help with?</FieldLabel>
            <OptionGrid
              options={[...USE_CASE_OPTIONS]}
              selected={store.useCases ?? []}
              onToggle={(id) => store.toggleArrayField("useCases", id)}
            />
          </>
        )}

        {step === 1 && (
          <div className="space-y-8">
            <div>
              <FieldLabel>How large is your organization?</FieldLabel>
              <RadioGroup
                name="orgSize"
                options={[...ORG_SIZE_OPTIONS]}
                value={store.orgSize}
                onChange={(v) => store.setField("orgSize", v as typeof store.orgSize)}
              />
            </div>
            <div>
              <FieldLabel>How many people will use the AI tool?</FieldLabel>
              <RadioGroup
                name="userCount"
                options={[...USER_COUNT_OPTIONS]}
                value={store.userCount}
                onChange={(v) => store.setField("userCount", v as typeof store.userCount)}
              />
            </div>
            <div>
              <FieldLabel>What type of organization are you?</FieldLabel>
              <RadioGroup
                name="orgType"
                options={ORG_TYPE_OPTIONS.map((o) => ({ id: o, label: o }))}
                value={store.orgType}
                onChange={(v) => store.setField("orgType", v)}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <div>
              <FieldLabel>Which tools does your business already use?</FieldLabel>
              <OptionGrid
                options={TOOL_OPTIONS}
                selected={store.existingTools ?? []}
                onToggle={(id) => store.toggleArrayField("existingTools", id)}
              />
            </div>
            <div>
              <FieldLabel>How important is integration with your existing tools?</FieldLabel>
              <RadioGroup
                name="integrationImportance"
                options={[
                  { id: "not_important", label: "Not important" },
                  { id: "somewhat", label: "Somewhat important" },
                  { id: "important", label: "Important" },
                  { id: "very_important", label: "Very important" },
                  { id: "critical", label: "Critical" },
                ]}
                value={store.integrationImportance}
                onChange={(v) => store.setField("integrationImportance", v as typeof store.integrationImportance)}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8">
            <div>
              <FieldLabel>What type of information will the AI work with?</FieldLabel>
              <OptionGrid
                options={DATA_TYPE_OPTIONS}
                selected={store.dataTypes ?? []}
                onToggle={(id) => store.toggleArrayField("dataTypes", id)}
              />
            </div>
            <div>
              <FieldLabel>How important is privacy/data protection to your decision?</FieldLabel>
              <RadioGroup
                name="privacyImportance"
                options={[
                  { id: "low", label: "Low" },
                  { id: "moderate", label: "Moderate" },
                  { id: "high", label: "High" },
                  { id: "very_high", label: "Very high" },
                  { id: "critical", label: "Critical" },
                ]}
                value={store.privacyImportance}
                onChange={(v) => store.setField("privacyImportance", v as typeof store.privacyImportance)}
              />
            </div>
            <div>
              <FieldLabel>Exclude business inputs from model training where applicable?</FieldLabel>
              <RadioGroup
                name="trainingExclusion"
                options={[
                  { id: "not_sure", label: "Not sure" },
                  { id: "not_concern", label: "Not a major concern" },
                  { id: "prefer", label: "Prefer this" },
                  { id: "required", label: "Required" },
                ]}
                value={store.trainingExclusion}
                onChange={(v) => store.setField("trainingExclusion", v as typeof store.trainingExclusion)}
              />
            </div>
            <div>
              <FieldLabel>Where would you prefer business data to be processed?</FieldLabel>
              <RadioGroup
                name="dataProcessingPreference"
                options={[
                  { id: "no_requirement", label: "No specific requirement" },
                  { id: "canada_preferred", label: "Canada preferred" },
                  { id: "canada_required", label: "Canada required" },
                  { id: "specific_jurisdiction", label: "Specific jurisdiction required" },
                  { id: "not_sure", label: "Not sure" },
                ]}
                value={store.dataProcessingPreference}
                onChange={(v) => store.setField("dataProcessingPreference", v as typeof store.dataProcessingPreference)}
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8">
            <div>
              <FieldLabel>What is your approximate budget?</FieldLabel>
              <RadioGroup
                name="budget"
                options={[
                  { id: "free", label: "Free" },
                  { id: "under_10", label: "Under $10/user/month" },
                  { id: "10_25", label: "$10–25/user/month" },
                  { id: "25_50", label: "$25–50/user/month" },
                  { id: "50_100", label: "$50–100/user/month" },
                  { id: "100_plus", label: "$100+/user/month" },
                  { id: "project", label: "Project-based budget" },
                  { id: "not_sure", label: "Not sure" },
                ]}
                value={store.budget}
                onChange={(v) => store.setField("budget", v as typeof store.budget)}
              />
            </div>
            <div>
              <FieldLabel>What matters more?</FieldLabel>
              <RadioGroup
                name="budgetPriority"
                options={[
                  { id: "lowest_cost", label: "Lowest possible cost" },
                  { id: "best_value", label: "Best value" },
                  { id: "best_capability", label: "Best capability regardless of price" },
                  { id: "balanced", label: "Balanced approach" },
                ]}
                value={store.budgetPriority}
                onChange={(v) => store.setField("budgetPriority", v as typeof store.budgetPriority)}
              />
            </div>
          </div>
        )}

        {step === 5 && (
          <>
            <FieldLabel>Select your top 3–5 priorities (in order of importance)</FieldLabel>
            <p className="mb-4 text-sm text-slate-600">
              Selected: {store.priorities?.length ?? 0} / 5 (minimum 3)
            </p>
            <OptionGrid
              options={[...PRIORITY_OPTIONS]}
              selected={store.priorities ?? []}
              onToggle={priorityToggle}
            />
          </>
        )}

        {step === 6 && (
          <div className="space-y-8">
            <div>
              <FieldLabel>Which approach are you open to?</FieldLabel>
              <OptionGrid
                options={[
                  { id: "commercial", label: "Commercial AI tool" },
                  { id: "open_source", label: "Open-source AI" },
                  { id: "custom", label: "Custom / in-house development" },
                  { id: "combination", label: "Combination of tools" },
                  { id: "not_sure", label: "Not sure" },
                ]}
                selected={store.approachOpenness ?? []}
                onToggle={(id) => store.toggleArrayField("approachOpenness", id)}
              />
            </div>
            <div>
              <FieldLabel>How important is avoiding vendor lock-in?</FieldLabel>
              <RadioGroup
                name="lockInImportance"
                options={[
                  { id: "not_important", label: "Not important" },
                  { id: "somewhat", label: "Somewhat important" },
                  { id: "important", label: "Important" },
                  { id: "very_important", label: "Very important" },
                ]}
                value={store.lockInImportance}
                onChange={(v) => store.setField("lockInImportance", v as typeof store.lockInImportance)}
              />
            </div>
            <div>
              <FieldLabel>Do you have technical staff who could maintain an AI system?</FieldLabel>
              <RadioGroup
                name="technicalStaff"
                options={[
                  { id: "yes", label: "Yes" },
                  { id: "some", label: "Some technical support" },
                  { id: "no", label: "No" },
                  { id: "not_sure", label: "Not sure" },
                ]}
                value={store.technicalStaff}
                onChange={(v) => store.setField("technicalStaff", v as typeof store.technicalStaff)}
              />
            </div>
            <div>
              <FieldLabel>Do you have a highly unique or specialized workflow?</FieldLabel>
              <RadioGroup
                name="uniqueWorkflow"
                options={[
                  { id: "yes", label: "Yes" },
                  { id: "no", label: "No" },
                ]}
                value={store.uniqueWorkflow ? "yes" : store.uniqueWorkflow === false ? "no" : undefined}
                onChange={(v) => store.setField("uniqueWorkflow", v === "yes")}
              />
            </div>
            <div>
              <FieldLabel>Do you require strong customization beyond standard features?</FieldLabel>
              <RadioGroup
                name="highCustomization"
                options={[
                  { id: "yes", label: "Yes" },
                  { id: "no", label: "No" },
                ]}
                value={store.highCustomization ? "yes" : store.highCustomization === false ? "no" : undefined}
                onChange={(v) => store.setField("highCustomization", v === "yes")}
              />
            </div>
          </div>
        )}

        {error && <ErrorMessage message={error} />}

        <NavButtons
          onBack={step > 0 ? () => store.prevStep() : undefined}
          onContinue={handleContinue}
          continueLabel={step >= TOTAL_STEPS - 1 ? "See recommendations" : "Continue"}
        />
      </div>
    </Card>
  );
}
