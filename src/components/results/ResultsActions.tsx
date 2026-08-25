"use client";

import { useState } from "react";
import Link from "next/link";
import type { UserProfile } from "@/lib/schemas";
import type { AssessmentResult } from "@/engine/scorer";
import { formatResultsAsText } from "@/engine/explainability";
import {
  buildShareUrl,
  downloadTextFile,
  printResults,
} from "@/lib/share-export";
import { useAssessmentStore } from "@/store/assessment-store";

export function ResultsActions({
  profile,
  result,
}: {
  profile: UserProfile;
  result: AssessmentResult;
}) {
  const reset = useAssessmentStore((s) => s.reset);
  const [shareCopied, setShareCopied] = useState(false);
  const [shareError, setShareError] = useState("");

  const handleExport = () => {
    const text = formatResultsAsText({
      topThree: result.topThree,
      explainability: result.explainability,
      noClearWinner: result.noClearWinner,
      noClearWinnerExplanation: result.noClearWinnerExplanation,
      alternativeApproach: result.alternativeApproach,
    });
    const date = new Date().toISOString().slice(0, 10);
    downloadTextFile(text, `ai-vendor-assessment-${date}.txt`);
  };

  const handleShare = async () => {
    setShareError("");
    try {
      const url = buildShareUrl(profile);
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 3000);
    } catch {
      setShareError("Could not copy link. Try exporting instead.");
    }
  };

  return (
    <div className="mb-8 flex flex-wrap gap-3 no-print">
      <Link
        href="/assess"
        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        Edit answers
      </Link>
      <button
        type="button"
        onClick={() => {
          reset();
          window.location.href = "/assess";
        }}
        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        Start over
      </button>
      <button
        type="button"
        onClick={handleExport}
        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        Export results
      </button>
      <button
        type="button"
        onClick={printResults}
        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        Print
      </button>
      <button
        type="button"
        onClick={handleShare}
        className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
      >
        {shareCopied ? "Link copied!" : "Copy share link"}
      </button>
      {shareError && <p className="w-full text-sm text-red-600">{shareError}</p>}
    </div>
  );
}
