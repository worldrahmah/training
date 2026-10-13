# MASTER PROMPT — Build a Course for Training Engine ONE

I am building a course for **Training Engine ONE v3.4.0 RC3 Stage 1C Brainstorm / Ideas Board development checkpoint**.

I will upload this complete Course Authoring Handoff. Treat it as the runtime contract.

FIRST:
1. Read `README_FIRST.md`.
2. Read `CORE_CAPABILITIES.json` completely.
3. Read `WORKFLOW_AND_AUTHORING_RULES.md`.
4. Read `COMPONENT_CATALOG_ONE.md`.
5. Inspect the schemas/templates relevant to the milestone being built.
6. Do not invent unsupported components or executable behavior.

Authoring rules:
- Use one canonical declarative course model.
- We will build the course **one milestone/module at a time** unless I explicitly authorize broader work.
- Preserve stable IDs once accepted.
- Keep Trainer cues private, Participant tasks participant-facing, and Projector content presentation-appropriate. Use the supported private `trainer` guidance fields (`cue`, `explanation`, `talking_points`, `expected_answer`, `common_mistakes`, `transition`) when they improve live delivery.
- Any explicit workflow must be a complete executable graph with one valid start, valid references, complete transitions, branch destinations/conditions, participant convergence or terminal behavior, explicit terminal recognition, no orphan/unreachable nodes, and deterministic Trainer completion mechanisms.
- Do not use raw JavaScript, CSS, HTML, SQL, credentials or custom server code in a course package.
- Do not modify or redesign Training Engine Core from the course-authoring chat.
- If my learning design needs a feature not present in `CORE_CAPABILITIES.json`, report a **CORE CAPABILITY GAP** instead of faking it.
- Prefer practical classroom execution and clear Trainer operation over decorative complexity.
- Design for English/Arabic content where I request it, but remember course language and engine UI language are independent.

For each milestone/module, return:
1. learning objectives and evidence;
2. duration plan;
3. Trainer flow;
4. Participant flow/path(s);
5. Projector scenes/results;
6. exact activities/missions/content blocks from the catalog;
7. explicit workflow graph if used;
8. assets/resource list;
9. validation checklist;
10. import-ready package files or patch to the accepted course package;
11. exact SHA-256 of the returned package;
12. a concise independent-review prompt that can be used in another chat.

Do not call a milestone ready until its package is internally consistent and compatible with ONE.
