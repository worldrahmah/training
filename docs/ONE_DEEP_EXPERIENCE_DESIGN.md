# Training Engine ONE — Deep Experience Design Baseline (RC4 inherited; Stage 0 carried forward)

## Purpose
This document records the inherited RC4 screenshot-driven deep UI/UX correction baseline. Stage 0 carries these accepted design rules forward while repairing the component-contract and Projector theme/preview architecture; it does not erase the RC4 provenance of the design work.

## Canonical typography
- English/LTR: **Montserrat** everywhere.
- Arabic/RTL: **Cairo** everywhere.
- Product typography is canonical across navigation, content, tables, forms, dialogs, Builder, Live Classroom and Projector. Historical course typography metadata remains readable for compatibility but does not fragment the ONE UI.
- Official Google Fonts assets can be cached locally using `npm run fonts:cache`; Windows/Linux launchers attempt this once opportunistically and continue safely offline if unavailable.

## Screenshot-driven corrections
- Content grids use auto-fit behavior and no longer leave a blank half-page when only one class/session/report item exists.
- Report cards have deliberate hierarchy, metric tiles, accent rules and hover elevation.
- Tables use contained rounded surfaces, sticky headers, improved row density and hover feedback.
- Student learning cards, transcript, sessions and activity history are rebuilt as a fluid learning canvas rather than disconnected white rectangles.
- Mission/practice panels use stronger hierarchy and presentation.
- Section boundaries are clear without excessive card-on-card nesting.
- Progress indicators use subtle animated gradients; pages/sections use restrained entrance motion.
- Motion honors `prefers-reduced-motion`.

## Live Classroom themes
RC3 hard-forced the Live Classroom dark. RC4 removes that defect. `Light`, `Dark` and `System` now drive real Live Classroom design tokens for header, metrics, Course Flow, stage, presenter notes, participants and controls. Projector remains presentation-specific rather than inheriting Trainer workspace chrome.

## Release acceptance
A screen can still fail owner acceptance even when automated UI gates pass. The current Stage-0 build must be judged on hierarchy, clarity, density, typography, movement, English/Arabic parity and role appropriateness in the owner's real browser, while preserving the inherited RC4 design baseline.
