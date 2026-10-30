# AI Vendor Selection & Governance Advisor

Vendor-neutral AI selection and governance advisor for SMBs. Compares AI tools based on business needs, priorities, cost, data considerations, integrations, and governance requirements.

> **There is no universally best AI tool. There is only a better fit for a particular business, use case, and set of priorities.**

This is a **decision-support system**, not a vendor ranking website.

## Philosophy

- **Vendor-neutral**: no commissions, no default bias toward famous or expensive products
- **Evidence-based**: product data includes sources, verification dates, and source types
- **Deterministic scoring**: recommendations use transparent weighted rules, not an LLM
- **Governance-aware**: sensitive data + high privacy triggers governance gates
- **Honest uncertainty**: missing evidence is never treated as proof of safety or risk

## Architecture

```text
Questionnaire answers
  → Normalized user profile (Zod validated)
  → Hard constraints (eliminate / flag)
  → Soft weights (scoring dimensions)
  → Category scores per product
  → Governance gate
  → Final ranking + explanations
```

### Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Logic:** TypeScript deterministic scoring engine
- **Data:** Structured product catalog (`src/data/products/`)
- **State:** Zustand + sessionStorage (save/restart within session)

### Key directories

| Path | Purpose |
|------|---------|
| `src/engine/` | Scoring, filters, governance, BRUKD CTA rules |
| `src/data/products/` | Vendor/product catalog (separate from UI) |
| `src/data/scenarios/` | Demo scenarios + golden test fixtures |
| `src/lib/schemas.ts` | Zod schemas for products and user profiles |
| `src/components/` | Questionnaire and results UI |

## Scoring methodology

### Ordinal rubric

| Level | Meaning |
|-------|---------|
| `unknown` | No verified evidence, excluded from weighted average |
| `limited` | Partial or basic capability |
| `moderate` | Meets typical need |
| `strong` | Well documented, good fit |
| `excellent` | Best-in-class for criterion |

### Priority weights

Users select 3–5 priorities. Weights use diminishing returns (e.g. 25%, 20%, 18%, 17%, 20% normalized).

### Hard filters

Examples:
- Canada data processing **required** + no official evidence → flagged, not ranked normally
- Training exclusion **required** + vendor cannot meet → requirement not met
- Open-source only + product not self-hostable → excluded

### Outcomes

The system can recommend:
1. Commercial AI products (top 3 when evidence exists)
2. Open-source / self-hosted
3. Custom / in-house (conservative rules, requires technical staff + drivers)
4. Hybrid multi-tool approach
5. No clear winner (top scores within 5 points, different strength profiles)
6. AI may not be appropriate yet
7. Insufficient evidence for confident recommendation

## Product catalog maintenance

Each product includes:
- `last_verified` date
- `sources[]` with type (`official`, `independent`, `community`), URL, topic
- `residency_evidence_level`: `official` | `inferred` | `unknown`
- Pros **and** cons (required)

Products older than 90 days are flagged in results UI.

## Phase 2: Governance & Explainability

- **Governance summary panel**: pre-recommendation checks for sensitive data, training exclusion, Canada requirements, and evidence freshness
- **"Why was this recommended?"**: per-product priority breakdown with optional "View how we calculated this"
- **Trade-offs panel**: why the top option won and what you give up
- **No clear winner**: side-by-side comparison of two strong options
- **Alternative approach cards**: custom/in-house, hybrid, open-source, or "AI not appropriate" with guidance
- **Evidence labeling**: vendor-stated vs independent vs unavailable on every source
- **Next steps**: actionable follow-up based on outcome type
- **Save & continue**: progress persisted in localStorage across sessions
- **Export / print / share**: download `.txt` results, print-friendly layout, shareable results URL (no account)

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # golden scenario tests
npm run build    # production build
```

## Demo scenarios

Five preset scenarios on the homepage:
1. Small Marketing Agency
2. Professional Services Firm
3. Small Retail Business
4. Data-Heavy SMB
5. Custom AI Candidate

## BRUKD Consultancy

When the assessment indicates custom development, hybrid complexity, governance gaps, or uncertain requirements, a contextual CTA links to [BRUKD Consultancy](https://brukdconsultancy.com/). It does **not** appear for clear commercial fits.

## Disclaimer

Recommendations are based on user inputs and product information available at assessment time. Product features, pricing, policies, and terms change. Results are decision-support information, not legal, privacy, security, or financial advice.

## License

Private / project-specific, see repository owner for terms.
