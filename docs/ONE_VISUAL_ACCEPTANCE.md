# Training Engine ONE v3.5.0 RC1R5 — Consolidated Visual / Browser Acceptance

This is the **single owner acceptance gate** for the Professional Interaction & Presentation Closure candidate. Automated tests do not replace this visual/browser gate.

## Product-wide baseline
- Admin, Trainer Management, Trainer Live, Participant, Projector and Builder remain distinct professional experiences.
- English is LTR/Montserrat; Arabic is RTL/Cairo.
- Existing Word Cloud, Q&A, Ideas Board, hierarchical Course Flow, Projector pairing/themes/result recall and historical course/class data remain intact.
- Projector is presentation-first and readable at room scale in Dark, Light and High Contrast.

## Representative closure checks
The owner is **not** required to manually retest all 36 Activity Types. RC1R4 includes deterministic 36/36 Activity Certification. Manual acceptance is a visual/browser sanity pass for professional UX and room readability.

0. Course Builder Activity Type transitions immediately replace the type-specific settings panel with the selected activity model, do not trigger a generic HTTP 422, and do not retain stale settings from the previous type. Leaving via Builder Back or switching courses persists the dirty draft first, so the selected Activity Type survives re-entry. Browser navigation with unsaved state warns instead of silently discarding it.
1. Builder can author 100 Points, Quick Interaction, Matching, Fill Blanks, Sorting, image pin/find/label/drag, Draw/Annotate, Collaborative Board and Interactive Video without dead controls.
2. Participant inputs are usable on desktop/mobile and never expose trainer-only answers/moderation/private identities.
3. Projector/results are clean, readable and use intentional presentation composition.
4. Local PDF/PPTX import, formulas and Interactive Video render truthfully; unsupported extraction never fakes success.
5. Hide → Reveal → Explain, professional Challenge mode, temporary result-view switching and pointer/annotation work without rewinding workflow.
6. Trainer-Paced, Participant-Paced and Front-of-Room behave distinctly; guests can only join when enabled.
7. Offline/reconnect synchronization does not create duplicate responses; Session Replay is read-only.
8. Live Insights expose meaningful difficulty/discrimination/timing/skips/confidence/cohort information when data exists.
9. One existing pre-v3.5 course/class still operates normally after upgrade.

10. Admin/Trainer collection pages use a consistent professional search/filter/sort/result-count pattern without cramped or overlapping controls; Participant/Projector remain free of management discovery chrome.
11. Admin and Trainer Reports expose the constrained Chart Builder; proposed dataset/metric selectors and Bar/Line/Pie/Table views are understandable, permission-safe and visually useful.

## Failure conditions
Any broken RTL, illegible Projector contrast, dead control, privacy leak, duplicate offline submission, workflow rewind, data loss, fake import success, or substantial unprofessional visual regression blocks FINAL promotion.
