import type { UserProfile } from "@/lib/schemas";
import { UserProfileSchema } from "@/lib/schemas";

const SHARE_PARAM = "share";

/** Encode profile for shareable URL (no account required) */
export function encodeProfileForShare(profile: UserProfile): string {
  const json = JSON.stringify(profile);
  if (typeof btoa !== "undefined") {
    return btoa(unescape(encodeURIComponent(json)));
  }
  return Buffer.from(json, "utf-8").toString("base64");
}

export function decodeProfileFromShare(encoded: string): UserProfile | null {
  try {
    let json: string;
    if (typeof atob !== "undefined") {
      json = decodeURIComponent(escape(atob(encoded)));
    } else {
      json = Buffer.from(encoded, "base64").toString("utf-8");
    }
    const parsed = JSON.parse(json);
    const result = UserProfileSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export function buildShareUrl(profile: UserProfile): string {
  if (typeof window === "undefined") return `/results?${SHARE_PARAM}=`;
  const encoded = encodeProfileForShare(profile);
  return `${window.location.origin}/results?${SHARE_PARAM}=${encodeURIComponent(encoded)}`;
}

export function getShareParamName(): string {
  return SHARE_PARAM;
}

export function downloadTextFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function printResults(): void {
  window.print();
}
