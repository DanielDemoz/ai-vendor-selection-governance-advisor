import { AssessPageClient } from "@/components/questionnaire/AssessPageClient";

export const metadata = {
  title: "AI Tool Assessment",
  description: "Answer questions about your business needs to receive vendor-neutral AI recommendations.",
};

export default function AssessPage() {
  return <AssessPageClient />;
}
