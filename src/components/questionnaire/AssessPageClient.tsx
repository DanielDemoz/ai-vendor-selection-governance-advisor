"use client";

import Link from "next/link";
import { useAssessmentStore } from "@/store/assessment-store";
import { QuestionnaireWizard } from "@/components/questionnaire/QuestionnaireWizard";

export function AssessPageClient() {
  const step = useAssessmentStore((s) => s.step ?? 0);
  const reset = useAssessmentStore((s) => s.reset);
  const savedAt = useAssessmentStore((s) => s.savedAt);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">AI Tool Assessment</h1>
          <p className="mt-1 text-slate-600">Answer a few short questions, no long forms required.</p>
          {savedAt && (
            <p className="mt-1 text-xs text-slate-500">
              Progress saved, you can close this tab and continue later.
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {step > 0 && (
            <Link
              href="/results"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              View last results
            </Link>
          )}
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Clear all answers and start over?")) reset();
            }}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Start over
          </button>
        </div>
      </div>
      <QuestionnaireWizard />
    </div>
  );
}
