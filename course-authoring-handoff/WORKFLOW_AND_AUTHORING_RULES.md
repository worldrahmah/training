# Current RC1R12 authoring boundary

Training Engine ONE 3.5.0-rc.1.12. Read GUIDED_EXPERIENCE.md and CREATOR_GAP_MATRIX.md first; they supersede older guided limitations below. Current canonical schemas, registry and portable validator are authoritative. The standalone handoff includes the entire current course-creator-kit; use its validator and six samples without npm installation. No mandatory master-prompt engineering feature is deferred. Owner classroom/Windows/assistive acceptance is a separate unrun gate.

# Training Engine ONE — Workflow and Authoring Rules

## One canonical model
Visual Builder courses and externally authored/imported courses use the same declarative course model. External authoring must not create a parallel format.

## Declarative-only safety
Course packages may contain structured data and safe packaged assets. They must not contain executable JavaScript, arbitrary HTML, CSS, SQL, credentials, access tokens or server code.

## Published versions
Published/delivered versions are immutable. Change content by deriving a Draft/new version.

## Explicit workflow is an executable graph
If a schema-2 module declares an explicit workflow, it must define a complete executable graph.

Hard requirements:
- exactly one valid start node;
- every workflow node has a unique stable ID;
- every node references an existing activity/mission/path/scene as required by its type;
- no orphan or unreachable nodes;
- every non-terminal Trainer/class node has at least one valid outgoing transition;
- every branch defines every allowed destination and its condition/rule;
- participant-level branches define convergence or terminal behavior;
- terminal nodes are explicitly recognizable as terminal (`terminal:true` or supported terminal semantic such as closing/convergence where allowed);
- every reachable route can eventually reach a terminal state;
- every Trainer-controlled node has a completion mechanism so Finish/advance can occur deterministically;
- class-scoped and participant-scoped transitions are not silently conflated;
- runtime progress must be resumable and map to Done / Current / Next / Upcoming / Blocked / Skipped.

The validator must reject incomplete explicit workflows. It must not silently infer missing transitions.

## Legacy compatibility
A module that does not declare an explicit workflow may use the Core's deterministic implicit linear compatibility flow. Do not add an incomplete workflow merely to look modern.

## Course Flow authoring consequence
Design milestones/modules as meaningful groups. Trainers navigate a hierarchical collapsible Course Flow, so node titles must be clear enough to operate live without inspecting raw IDs.

## Participant paths
Participant paths may branch independently. Each path needs:
- stable path ID;
- clear participant-facing title;
- ordered steps;
- completion type per step;
- optional scoring/achievement;
- internet requirement/fallback where relevant;
- defined convergence/terminal behavior in an explicit workflow.

## Role-aware content
Use one course definition; the Core renders it differently:
- Trainer receives private cues/control;
- Participant receives learning/task controls;
- Projector receives presentation-only content;
- Super Admin governs the version but does not replace Trainer runtime.

## Private Trainer presenter notes
For activities that need delivery guidance, use the declarative `trainer` object. Supported guidance includes `cue`, `explanation`, `talking_points`, `expected_answer`, `common_mistakes`, and `transition`. These fields are for the private Trainer Live Classroom only. Do not duplicate private notes into participant-facing or Projector blocks unless that text is intentionally public.


## Live interaction integrity
`word_cloud`, `q_and_a` and `ideas_board` are runtime-owned interactions. Course authors configure them declaratively and must not emulate moderation, voting, identity masking, reveal control or historical result recall with custom code. Q&A and Ideas Board currently use individual response scope only. Public/trainer-only/anonymous identity settings are privacy contracts and must be authored deliberately.

## Assets
Use safe local assets and the package asset references documented by the schema/catalog. All referenced assets must exist. Never depend on the Internet for a mandatory classroom asset unless the course also defines an acceptable fallback.

## Validation rule
A course is ready only when it validates on a clean ONE Core, all explicit workflows simulate successfully, and it can be previewed for Trainer, Participant and Projector without Core edits.

## RC1R6 privacy/reveal contract
All trainer fields remain private in every audience phase, including trainer.explanation. Use activity.explanation for intentionally public post-Reveal teaching explanations. Private notes are never an Explain fallback. Audience payloads withhold solution mappings, accepted answers, target coordinates and score definitions before Reveal. Response acknowledgements confirm submission without correctness/score; feedback arrives after authorized Reveal. Matching choices and learner-submitted work remain usable. No stored course is rewritten during this repair.
