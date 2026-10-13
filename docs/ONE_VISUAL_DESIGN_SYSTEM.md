# Training Engine ONE — Visual Experience System

## Product standard
Training Engine ONE must feel like a finished professional product, not a generic administration template. Visual quality is a release gate alongside functional correctness.

## Experience separation
- **Super Admin**: operations-oriented workspace for governance, people, courses, classes, reports, backups and platform health.
- **Trainer**: teaching-preparation workspace centered on today, courses, classes and participants.
- **Live Classroom**: dedicated distraction-free control room bound to one class only. It deliberately excludes administration and general dashboard work.
- **Participant**: calm, encouraging learning surface with minimal operational complexity.
- **Projector**: cinematic presentation surface optimized for room-scale viewing.
- **Course Builder**: creative authoring workstation with hierarchy, editing and preview surfaces.

## Design principles
1. Clear hierarchy before decoration.
2. One obvious primary action per context where possible.
3. Fewer nested boxes; use spacing, typography and surface contrast for grouping.
4. Role identity without fragmenting the product brand.
5. Strong accessibility, keyboard focus and reduced-motion behavior.
6. Arabic RTL is a first-class mirror, not a translated LTR layout.
7. No remote fonts, icon CDNs or visual dependencies; the product stays local-first.
8. Presentation surfaces prioritize readability at distance over dashboard density.
9. Responsive layouts must preserve all important actions instead of hiding them.
10. The visual layer is kept separate from runtime/business logic so future upgrades are safer.

## Design-system architecture
`app/public/styles.css` remains the stable functional/layout compatibility layer.
`app/public/one-ui.css` is the premium visual product layer loaded after it.

This separation allows a future visual refresh without rewriting the course engine, APIs, database model or authoring runtime.

## Visual language
- Premium neutral canvas with restrained role accents.
- Dark high-contrast navigation on desktop Admin/Trainer workspaces.
- Native local vector icons rather than decorative Unicode navigation symbols.
- Strong title typography and deliberate whitespace.
- Soft depth, restrained gradients and status color used only where it communicates meaning.
- Modern rounded controls with consistent focus, hover and disabled states.
- Large, immersive Student and Projector presentation regions.
- Dark command-center treatment for Live Classroom.
- Creative-workstation treatment for Course Builder.

## Final manual acceptance
A human must inspect the exact release candidate in a normal browser before FINAL at the required desktop, tablet, phone and projector sizes in both English LTR and Arabic RTL. Automated tests protect structure and regressions but do not replace visual judgment.
