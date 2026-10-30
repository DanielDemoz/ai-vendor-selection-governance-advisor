import type { UserProfile } from "@/lib/schemas";

export const USE_CASE_OPTIONS = [
  { id: "general_productivity", label: "General business productivity" },
  { id: "writing_content", label: "Writing and content" },
  { id: "marketing", label: "Marketing" },
  { id: "research", label: "Research" },
  { id: "customer_service", label: "Customer service" },
  { id: "sales", label: "Sales" },
  { id: "document_analysis", label: "Document analysis" },
  { id: "data_analysis", label: "Data analysis" },
  { id: "coding", label: "Coding / software development" },
  { id: "meeting_notes", label: "Meeting notes / transcription" },
  { id: "workflow_automation", label: "Workflow automation" },
  { id: "internal_knowledge", label: "Internal knowledge / search" },
  { id: "image_generation", label: "Image generation / design" },
  { id: "video_audio", label: "Video / audio" },
  { id: "hr_recruitment", label: "HR / recruitment" },
  { id: "finance_accounting", label: "Finance / accounting" },
  { id: "other_operations", label: "Other business operations" },
] as const;

export const ORG_SIZE_OPTIONS = [
  { id: "1_5", label: "1–5 employees" },
  { id: "6_20", label: "6–20" },
  { id: "21_50", label: "21–50" },
  { id: "51_100", label: "51–100" },
  { id: "101_250", label: "101–250" },
  { id: "250_plus", label: "250+" },
] as const;

export const USER_COUNT_OPTIONS = [
  { id: "1", label: "1" },
  { id: "2_5", label: "2–5" },
  { id: "6_20", label: "6–20" },
  { id: "21_50", label: "21–50" },
  { id: "50_plus", label: "50+" },
] as const;

export const ORG_TYPE_OPTIONS = [
  "Professional services", "Retail", "Healthcare", "Education",
  "Construction / trades", "Finance / accounting", "Marketing / creative",
  "Technology", "Manufacturing", "Non-profit", "Other",
];

export const TOOL_OPTIONS = [
  { id: "microsoft_365", label: "Microsoft 365" },
  { id: "google_workspace", label: "Google Workspace" },
  { id: "apple", label: "Apple" },
  { id: "slack", label: "Slack" },
  { id: "salesforce", label: "Salesforce" },
  { id: "hubspot", label: "HubSpot" },
  { id: "shopify", label: "Shopify" },
  { id: "quickbooks", label: "QuickBooks" },
  { id: "other", label: "Other" },
  { id: "none", label: "None / not sure" },
];

export const DATA_TYPE_OPTIONS = [
  { id: "public", label: "Public information" },
  { id: "general_business", label: "General business information" },
  { id: "internal_business", label: "Internal business information" },
  { id: "customer_information", label: "Customer information" },
  { id: "employee_information", label: "Employee information" },
  { id: "financial_information", label: "Financial information" },
  { id: "personal_information", label: "Personal information" },
  { id: "sensitive_information", label: "Sensitive information" },
  { id: "confidential_proprietary", label: "Confidential / proprietary information" },
  { id: "unsure", label: "Unsure" },
];

export const PRIORITY_OPTIONS = [
  { id: "price", label: "Price" },
  { id: "ease_of_use", label: "Ease of use" },
  { id: "privacy", label: "Privacy" },
  { id: "security", label: "Security" },
  { id: "data_controls", label: "Data controls" },
  { id: "microsoft_integration", label: "Microsoft integration" },
  { id: "google_integration", label: "Google integration" },
  { id: "collaboration", label: "Collaboration" },
  { id: "writing", label: "Writing" },
  { id: "research", label: "Research" },
  { id: "data_analysis", label: "Data analysis" },
  { id: "coding", label: "Coding" },
  { id: "automation", label: "Automation" },
  { id: "customization", label: "Customization" },
  { id: "scalability", label: "Scalability" },
  { id: "vendor_support", label: "Vendor support" },
  { id: "canadian_considerations", label: "Canadian considerations" },
  { id: "open_source", label: "Open-source / self-hosting" },
  { id: "avoid_lock_in", label: "Avoiding vendor lock-in" },
] as const;

export const TOTAL_STEPS = 7;

export const STEP_TITLES = [
  "What do you need AI for?",
  "Business context",
  "Technology ecosystem",
  "Data & privacy",
  "Budget",
  "What matters most?",
  "Implementation preferences",
];

export type QuestionnaireState = Partial<UserProfile> & {
  step: number;
};

export const INITIAL_STATE: QuestionnaireState = {
  step: 0,
  useCases: [],
  existingTools: [],
  dataTypes: [],
  priorities: [],
  approachOpenness: [],
};

export const DEMO_SCENARIOS: { id: string; name: string; description: string }[] = [
  { id: "marketing-agency", name: "Small Marketing Agency", description: "Writing, research, marketing, 5 users, low budget, Google Workspace" },
  { id: "professional-services", name: "Professional Services Firm", description: "Document analysis, customer data, high privacy, Microsoft 365" },
  { id: "retail-business", name: "Small Retail Business", description: "Customer support, marketing, automation, Shopify, low budget" },
  { id: "data-heavy", name: "Data-Heavy SMB", description: "Data analysis, confidential data, technical users" },
  { id: "custom-candidate", name: "Custom AI Candidate", description: "Unique workflow, strong customization, internal systems" },
];
