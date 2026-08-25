"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAssessmentStore } from "@/store/assessment-store";
import { loadProducts } from "@/data/products/catalog";
import { runAssessment } from "@/engine/scorer";
import { ResultsView } from "@/components/results/ResultsView";
import { decodeProfileFromShare, getShareParamName } from "@/lib/share-export";
import type { UserProfile } from "@/lib/schemas";

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const getValidatedProfile = useAssessmentStore((s) => s.getValidatedProfile);
  const loadProfile = useAssessmentStore((s) => s.loadProfile);

  const shareParam = searchParams.get(getShareParamName());
  const sharedProfile = useMemo(() => {
    if (!shareParam) return null;
    return decodeProfileFromShare(shareParam);
  }, [shareParam]);

  const storeProfile = getValidatedProfile();
  const profile: UserProfile | null = sharedProfile ?? storeProfile;

  useEffect(() => {
    if (sharedProfile) {
      loadProfile(sharedProfile);
    }
  }, [sharedProfile, loadProfile]);

  useEffect(() => {
    if (!profile) {
      router.replace("/assess");
    }
  }, [profile, router]);

  const result = useMemo(() => {
    if (!profile) return null;
    return runAssessment(profile, loadProducts());
  }, [profile]);

  if (!profile || !result) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-600">
        Loading your recommendations…
      </div>
    );
  }

  return <ResultsView result={result} profile={profile} />;
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[40vh] items-center justify-center text-slate-600">
        Loading your recommendations…
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
