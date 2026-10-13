# Training Engine repository instructions

This repository is a production modernization of Training Engine Core v2.1.1 FINAL.

Hard rules:
- Preserve backward compatibility with the exact v2.1.1 data model, course packages, historical deliveries, users, reports, and backups unless the owner explicitly approves a breaking change.
- Never silently reset or replace the SQLite database during an upgrade. Use deterministic migrations and test migration from a populated legacy database.
- Keep the product local-first and Windows/LAN friendly. Cloud services may be optional, never required for classroom delivery.
- Keep Trainer, Super Admin, Participant, and Projector as distinct UX surfaces with distinct permissions and needs.
- Do not expose internal IDs, state names, JSON keys, debug labels, or development terminology in end-user UI.
- Arabic must be a complete RTL experience; English must be complete LTR. Both must remain fully responsive.
- Published/delivered course versions are immutable. Edits create Drafts/new versions.
- Course import and in-app visual authoring must converge on one canonical course model.
- Explicit workflow graphs must be executable, validated graphs. Never infer missing transitions once an explicit workflow exists.
- For major refactors or multi-hour changes, maintain an ExecPlan as described in .agent/PLANS.md.
- Run baseline tests before major edits, add tests for every new behavior, and run full regression before release.
- If a requirement conflicts with an existing behavior, document the conflict and choose the behavior that preserves owner-approved product intent and historical compatibility.
