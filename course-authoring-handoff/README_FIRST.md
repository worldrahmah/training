# Training Engine ONE v3.5.0 RC1R5 — PROFESSIONAL CLOSURE DEVELOPMENT Authoring Contract

This in-tree package is the development authoring contract generated against the Professional Interaction & Presentation Closure candidate. The machine-readable `CORE_CAPABILITIES.json` remains authoritative. The separately packaged published authoring handoff v1.3 is historical RC4 authority and is intentionally unchanged.

## Authority order
1. `CORE_CAPABILITIES.json`
2. `WORKFLOW_AND_AUTHORING_RULES.md`
3. `COMPONENT_CATALOG_ONE.md`
4. `ONE_PLATFORM_CAPABILITIES.md`
5. `schemas/*` and `templates/*`
6. `examples/*` (reference only)
7. `CHATGPT_MASTER_COURSE_AUTHORING_PROMPT.md`

## Authoring rule
Use only capability IDs exposed by `CORE_CAPABILITIES.json`. Courses remain declarative; do not embed arbitrary executable code. Explicit workflows must be complete executable graphs. Preserve stable activity/objective IDs for analytics.

## Required course output
Return an importable course package, exact SHA-256, validation report, workflow simulation report when applicable, asset/reference coverage and known limitations.
