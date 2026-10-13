# UI/UX and design-system requirements

## Overall quality
All surfaces must feel like one professional product, not AI-generated pages or developer prototypes. Use a coherent design system, information hierarchy, spacing, typography, feedback, empty states, loading states, confirmations, and error handling.

## Responsive acceptance
Hard requirement across at least:
- 320px / 340px / 375px / 430px / 480px phones
- 768px tablet
- compact laptop/tablet landscape
- 1366x768 laptop
- 1920x1080 desktop
- large/ultrawide/projector displays
- short landscape mobile cases

No page-level horizontal overflow. Tables/graphs/trees may use their own intentional local scroll areas. Touch targets approximately 44px minimum. Inputs should avoid mobile browser zoom issues. Desktop-only hover must never be required for primary actions.

## Arabic and English
- Complete Arabic RTL across Super Admin, Trainer, Participant, Projector, Builder, reports, forms, validation, history, notifications, settings, and errors.
- Complete English LTR equivalent.
- Course content language is independent from engine UI language.

## Typography system
Support professional configurable typography roles:
- Arabic UI font
- English UI font
- presentation font
- title/headline font
- body/description font
- course-level safe overrides
- fallback stacks
- font-size/weight/line-height tokens rather than random component-specific values
Ensure every screen uses the appropriate role consistently.

## Theme
Light, Dark, and System preferences. Persist appropriately. Projector may have an independent presentation theme when useful. Course branding may choose controlled accent/cover/logo/background options without arbitrary CSS injection.

## Super Admin UX
Global dashboard with meaningful widgets and drill-down drawers/modals rather than long pages. Show live classes, counts/status, recent changes, upcoming classes, attention items, and quick management entry points. Live class observation is read-only unless the admin explicitly enters an authorized control mode (not default).

## Trainer UX
Trainer live screen prioritizes current activity, participant status, Help Queue, Course Flow/Next action, projector control, and class progress. Avoid admin clutter during delivery. Course/class management is available outside the live-control focus.

## Participant UX
Participant home opens with a wide hero/banner showing current learning focus or current course context, even if the content is very short. Scrolling down reveals Your Learning and then progress, continue-learning, upcoming sessions, missions, achievements, notifications, submissions, feedback, and profile/account functions. Must support sign out and self-service password/profile changes.

## Projector UX
Treat as Keynote/PowerPoint-style presentation stage. Audience should never see admin controls, internal labels, technical IDs, or normal web-dashboard chrome.

## Course Builder UX
Three primary modes: Tree/Flow, Edit, Preview/Simulation. Node editing should be visual and form-based for all ordinary authoring. Advanced raw JSON may exist only as an expert/debug escape hatch if retained, never as the required authoring path.
- drag/reorder where appropriate plus accessible non-drag alternatives
- autosave Drafts
- Undo/Redo for meaningful authoring changes
- validation while editing
- publish readiness indicator
- dependency warnings before deleting referenced assets/nodes
- searchable Asset Library
- reusable activity/content blocks where feasible

## Errors and status
Use human, actionable messages. Never show raw stack traces, enum codes, SQL/JSON errors, or backend error tokens to normal users.
