# Training Engine Component Catalog v2.0

This catalog is the contract between an externally authored course and Training Engine Core v2.0. Course packages are declarative. They may use only the components below; they must not contain executable HTML, JavaScript, CSS, server code, credentials, or database instructions.

## Presentation content blocks
Use `content.blocks` in the order they should appear.

| Type | Purpose | Key fields |
|---|---|---|
| `hero` | Large opening/current idea | `title`/`heading`, `eyebrow`, `body_md`, optional image `asset`, `align` |
| `text` | Rich explanatory text | `heading`, `body_md` |
| `image` | Image with optional caption | `asset` or safe `https` `src`, `alt`, `caption`, `fit` |
| `image_text` | Responsive image + text split | image fields + `heading`, `body_md`, `image_side` |
| `cards` | Concepts/options | `heading`, `items[{icon,title,body_md}]` |
| `steps` | Ordered steps | `heading`, `items[{title,body_md}]` |
| `comparison` | Two or more comparison columns | `heading`, `columns[{label,title,body_md}]` |
| `table` | Compact table | `heading`, `columns`, `rows` |
| `callout` | Emphasis/warning/success | `heading`, `body_md`, `icon`, `tone` |
| `statistic` | Large metric | `value`, `label`, optional `body_md` |
| `quote` | Quote/callout quotation | `quote`, optional `by` |
| `checklist` | Non-interactive checklist | `heading`, `items` |
| `asset` | Download/open packaged resource | `asset`, `label`, `description` |
| `chart` | Static authored chart | `chart_type`, `data`, `label_key`, `value_key` |
| `video` | Local packaged video or safe HTTPS video file | `asset` or `src`, optional `heading` |
| `audio` | Local packaged audio or safe HTTPS audio file | `asset` or `src`, optional `heading` |
| `divider` | Visual section break | none |
| `spacer` | Small bounded spacing | `size` (8–80) |

### Static chart types
`bar`, `horizontal_bar`, `stacked_bar`, `donut`, `pie`, `line`, `ranking`, `progress`.

For ordinary charts, `data` is an array of objects and `label_key` / `value_key` select fields. `stacked_bar` may use a `segments` array per row; if segments are not supplied the engine safely renders it as an ordinary bar comparison.

## Activity types
Activities live inside a module's `activities` array.

### Presentation and classroom control
- `presentation`
- `announcement`
- `timer`
- `reveal`

### Questions and responses
- `word_cloud`
- `q_and_a`
- `ideas_board`
- `poll`
- `single_choice`
- `multiple_choice`
- `true_false`
- `short_answer`
- `long_answer`
- `numeric_answer`
- `rating`
- `reaction`
- `confidence`
- `ranking`
- `checklist`
- `reflection`
- `self_assessment`

### Submission activities
- `url_submission`
- `file_submission`
- `image_submission`
- `practice_gate`

### Group work / branching
- `team_challenge` with `response_scope: "team"`
- `participant_choice`


### Professional interaction configuration
- `word_cloud`: configure bounded entries, optional pre-moderation, privacy, phrase allowance and `results_display: "word_cloud"`.
- `q_and_a`: configure bounded questions, optional pre-moderation, `public` / `trainer_only` / `anonymous` identity, upvoting/self-upvote policy and votes/newest order; use `results_display: "qa_board"`. Q&A currently requires `response_scope: "individual"`.
- `ideas_board`: configure bounded categorized ideas, optional pre-moderation, `public` / `trainer_only` / `anonymous` identity, upvoting/self-upvote policy and votes/newest order; use `results_display: "ideas_board"`. Highlight and non-destructive merge/unmerge are runtime-owned. Ideas Board currently requires `response_scope: "individual"`.

The runtime owns moderation, voting, aggregation, Projector rendering and result recall. Course packages remain declarative.

## Live result displays
Activities that collect responses may request:
- `word_cloud`
- `qa_board`
- `ideas_board`
- `bar`
- `horizontal_bar`
- `stacked_bar`
- `donut`
- `pie`
- `line`
- `ranking`
- `progress`
- `leaderboard`
- `cards`

The engine owns aggregation and display. Before the trainer reveals results, participant/projector views do not receive identified response details.

## Response scope
`individual` is the default. Use `team` for one response per assigned team.

## Trainer-only content
Put private facilitator notes in:

```json
"trainer": { "cue": "Private trainer cue" }
```

Trainer cues are not sent to participant/projector content renderers.

## Missions
A mission is a guided self-paced practice item. It supports:
- title / goal / estimated minutes
- objective references
- ordered steps
- prompt cards with copy support
- packaged resources
- safe external tool links
- completion score
- optional achievement
- one required submission mode: `none`, `text`, `url`, `file`, or `image`

## Flow and branching
Within one module, an activity may use:

```json
"flow": {
  "next_activity_id": "next-id",
  "branches": [
    { "when": { "winning_option": "Option A" }, "next_activity_id": "branch-a" }
  ]
}
```

The validator requires every referenced activity to exist in the same module. Trainer control remains authoritative; the engine may suggest the next item rather than silently advancing the classroom.

## Completion gates
A response activity may define one of:

```json
"completion_gate": { "minimum_responses": 15 }
```

or

```json
"completion_gate": { "minimum_response_rate": 0.75 }
```

The trainer can deliberately override a gate; that action remains part of delivery history.

## Safe assets
Packaged assets supported by v2.0:
- `.png`, `.jpg`, `.jpeg`, `.webp`
- `.pdf`, `.txt`, `.csv`
- `.docx`, `.xlsx`, `.pptx`
- `.mp4`, `.webm`
- `.mp3`, `.wav`, `.m4a`, `.ogg`

Active/executable package assets such as HTML, JavaScript, CSS, or SVG are intentionally rejected. Course JSON/Markdown text is data, not executable content.

## Markdown
Fields such as `body_md` may use the engine's safe Markdown subset. Raw HTML is escaped rather than executed.

## Responsive / localization contract
All supported components are rendered by the Core and are responsible for:
- mobile, tablet, desktop and projector reflow
- light/dark/system themes
- English LTR and Arabic RTL
- touch-friendly controls
- accessible labels and keyboard focus

Course packages specify content language/direction independently from the user's interface language.

## Rule for AI course authors
Never invent a component, activity type, result display, submission type or executable behavior that is not listed here. If a learning design genuinely requires a new interaction, the Core must be extended and versioned before the course uses it.

---

# v2.0 workflow and guided-practice additions

The v2.0 Core keeps every v1.1 component and adds first-class milestone workflows and independent participant paths.

## Additional presentation blocks
- `gallery` — responsive image gallery.
- `prompt` — fixed prompt shown safely as course content.
- `editable_prompt` — participant-editable prompt template; Projector renders a read-only form.
- `resource_list` — one or more safe local assets or HTTP/HTTPS resources.

## Additional activities
- `participant_choice` — lets each participant choose an independent path.
- `practice_gate` — trainer-controlled opening/closing of personal practice.

## Participant path
A module may contain `paths[]`. Each path contains multiple guided `steps[]`. Supported step completion types are:
- `acknowledge`
- `text`
- `url`
- `file`
- `image`
- `checklist`
- `external`
- `none`

A path may declare objectives, scoring, achievement, `internet_required`, and an `offline_fallback`.

## Milestone workflow
A module may contain a `workflow` graph. Supported node types:
- `trainer_scene`
- `class_interaction`
- `trainer_walkthrough`
- `practice_start`
- `participant_choice`
- `participant_path`
- `convergence`
- `closing`
- `activity`
- `mission`

Every workflow edge declares `scope: "class"` or `scope: "participant"`. Class-scoped branching affects the trainer-led classroom; participant-scoped branching is evaluated independently for each learner.

## Live operations supplied by Core
Course authors do not implement these in custom code. The Core supplies:
- participant resume state
- Back / Next / Finished navigation
- NEED HELP
- Trainer Help Queue
- live path / step / status progress
- Projector slide navigation
- results charts
- immutable published versions and editable Drafts

Do not add executable JavaScript, CSS, SQL, or arbitrary HTML to course packages.
