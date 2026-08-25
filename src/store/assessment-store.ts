"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { UserProfile } from "@/lib/schemas";
import type { QuestionnaireState } from "@/lib/constants";
import { INITIAL_STATE } from "@/lib/constants";
import { UserProfileSchema } from "@/lib/schemas";

type AssessmentStore = QuestionnaireState & {
  savedAt?: string;
  setField: <K extends keyof QuestionnaireState>(key: K, value: QuestionnaireState[K]) => void;
  toggleArrayField: (key: "useCases" | "existingTools" | "dataTypes" | "priorities" | "approachOpenness", value: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  loadProfile: (profile: Partial<UserProfile>) => void;
  reset: () => void;
  getValidatedProfile: () => UserProfile | null;
  touchSaved: () => void;
};

export const useAssessmentStore = create<AssessmentStore>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      setField: (key, value) =>
        set((s) => ({ ...s, [key]: value, savedAt: new Date().toISOString() })),

      touchSaved: () => set({ savedAt: new Date().toISOString() }),

      toggleArrayField: (key, value) => {
        const current = (get()[key] as string[]) ?? [];
        const next = current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value];
        set((s) => ({ ...s, [key]: next, savedAt: new Date().toISOString() }));
      },

      nextStep: () =>
        set((s) => ({ ...s, step: Math.min(6, s.step + 1), savedAt: new Date().toISOString() })),
      prevStep: () =>
        set((s) => ({ ...s, step: Math.max(0, s.step - 1), savedAt: new Date().toISOString() })),
      goToStep: (step) => set((s) => ({ ...s, step, savedAt: new Date().toISOString() })),

      loadProfile: (profile) => {
        set({
          ...INITIAL_STATE,
          ...profile,
          step: 0,
          savedAt: new Date().toISOString(),
        });
      },

      reset: () => set({ ...INITIAL_STATE, savedAt: undefined }),

      getValidatedProfile: () => {
        const state = get();
        const useCases = state.useCases ?? [];
        if (useCases.length === 0) return null;

        const profile = {
          useCases,
          primaryUseCase: useCases[0],
          orgSize: state.orgSize ?? "6_20",
          userCount: state.userCount ?? "2_5",
          orgType: state.orgType ?? "Other",
          existingTools: state.existingTools ?? [],
          integrationImportance: state.integrationImportance ?? "somewhat",
          dataTypes: state.dataTypes ?? [],
          privacyImportance: state.privacyImportance ?? "moderate",
          trainingExclusion: state.trainingExclusion ?? "not_sure",
          dataProcessingPreference: state.dataProcessingPreference ?? "not_sure",
          budget: state.budget ?? "not_sure",
          budgetPriority: state.budgetPriority ?? "balanced",
          priorities: state.priorities ?? [],
          approachOpenness: state.approachOpenness ?? ["not_sure"],
          lockInImportance: state.lockInImportance ?? "somewhat",
          technicalStaff: state.technicalStaff ?? "not_sure",
          uniqueWorkflow: state.uniqueWorkflow,
          highCustomization: state.highCustomization,
        };

        const result = UserProfileSchema.safeParse(profile);
        return result.success ? result.data : null;
      },
    }),
    {
      name: "ai-vendor-assessment",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
