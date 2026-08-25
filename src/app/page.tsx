"use client";

import Link from "next/link";
import { useAssessmentStore } from "@/store/assessment-store";
import { getScenarioById } from "@/data/scenarios";
import { DEMO_SCENARIOS } from "@/lib/constants";

export default function HomePage() {
  const loadProfile = useAssessmentStore((s) => s.loadProfile);
  const reset = useAssessmentStore((s) => s.reset);

  const startScenario = (id: string) => {
    const scenario = getScenarioById(id);
    if (scenario) {
      loadProfile(scenario.profile);
    }
  };

  return (
    <div className="mx-auto max-w-3xl text-center">
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
        Find the AI Tool That Fits Your Business
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
        Answer a few questions about your business, priorities, budget, and data requirements.
        We&apos;ll compare suitable AI options and explain the trade-offs.
      </p>
      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <Link
          href="/assess"
          onClick={() => reset()}
          className="rounded-lg bg-teal-700 px-8 py-3.5 text-base font-medium text-white hover:bg-teal-800"
        >
          Start AI Tool Assessment
        </Link>
      </div>
      <p className="mt-6 text-sm text-slate-500">
        Vendor-neutral · Evidence-based · No sales call required
      </p>

      <section className="mt-16 text-left">
        <h2 className="mb-4 text-center text-lg font-semibold text-slate-900">
          Try a demo scenario
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {DEMO_SCENARIOS.map((s) => (
            <Link
              key={s.id}
              href="/assess"
              onClick={() => startScenario(s.id)}
              className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-teal-300 hover:shadow-md"
            >
              <p className="font-medium text-slate-900">{s.name}</p>
              <p className="mt-1 text-sm text-slate-600">{s.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <p className="mt-12 text-xs text-slate-400">
        Recommendations are decision-support information, not legal, privacy, security, or financial advice.
      </p>
    </div>
  );
}
