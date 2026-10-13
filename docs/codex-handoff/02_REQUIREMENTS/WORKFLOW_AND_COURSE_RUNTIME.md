# Workflow and course runtime requirements

## Native workflow model
Every milestone/module may define a visual executable workflow graph.

Supported runtime concepts include:
- trainer/class-level nodes
- participant-level independent paths
- branch conditions and vote-winner branches
- convergence nodes
- terminal nodes
- completion gates
- optional controlled skip/override

## Explicit workflow correctness
Any schema 2.x module declaring an explicit workflow must define a complete executable graph:
- exactly one valid start node unless an explicitly supported multi-start pattern exists
- every non-terminal trainer/class node has at least one valid outgoing transition
- every branch defines valid destinations/conditions
- participant branches define convergence or explicit terminal behavior
- terminal nodes are explicitly terminal
- every node references an existing scene/activity/mission/path
- no orphan/unreachable nodes
- every trainer-controlled node has a completion mechanism
- finishing a node must persist COMPLETED and activate the correct next valid node
- once an explicit graph exists, runtime must not guess missing transitions from visual order
- validator must block missing successors, unreachable nodes, broken references, impossible convergence, or unfinishable nodes
- preview tests Start -> Current -> Finish -> Done -> Next for every trainer path and participant branch

## Legacy/workflow-less modules
For schemas/modules without explicit workflow, generate a deterministic implicit linear workflow at runtime without mutating the original package:
first eligible node = Next; opening = Current; finishing = Done; following eligible node = Next; later nodes = Upcoming.

## Trainer Workflow Progress Tracker
Persist status per live-session node. Required states:
- Done/Completed
- Current
- Next
- Upcoming
- Blocked
- Skipped
- Working where participant-path aggregate state is useful

Never rely on color alone. Use icon + label + visual state. A reasonable visual convention is completed green/check, next orange/action, upcoming neutral/dark, blocked red, skipped grey, but themes must remain accessible.

Only the permitted Next action should be the normal progression control. Skip/override must be explicit, confirmed, persisted, and audited.

## Collapsible hierarchical Course Flow
Trainer must never scroll through the whole course to find the next step.
- Modules/milestones/sections are accordion groups.
- Completed groups auto-collapse by default.
- Current group and group containing Next auto-expand.
- Future groups remain collapsed by default.
- Header always shows title, status, compact progress such as 4/5, and expand/collapse affordance.
- Manual expansion does not change workflow state.
- Provide Jump to Current and Jump to Next.
- Expansion state may persist where practical across refresh; workflow state is authoritative.
- Must work on phone/tablet/desktop and Arabic RTL/English LTR.

## Class-level vs participant-level branching
Class-level branching changes the trainer/shared path, e.g. winning poll option selects the trainer demonstration.
Participant-level branching is independent per learner; multiple participants can simultaneously work in different paths without affecting each other or the projector.

## Guided participant activity paths
Participant paths support multiple steps/pages with:
- instructions
- images/media/resources
- external-tool links
- exact prompts
- Copy Prompt
- editable prompt templates/placeholders
- Back/Next
- completion conditions
- submissions
- scoring
- AI Judgment/safety notes
- achievements
- Internet-required flags and offline fallback
- resume after refresh/reconnect/restart

## NEED HELP
During applicable practice, participant can request help. Queue entry contains participant, class, module/path, current step, optional message, request time, state (waiting/helping/resolved), and resolver. Help requests must not interrupt other participants or alter their flow.

## Live Milestone Progress
Trainer sees each participant's selected path, current step, status (Not Started/Working/Need Help/Finished), completion time and relevant submission state, plus aggregate counts. Trainer deliberately decides when to close practice/continue.

## Projector runtime
Projector is a true big-screen presentation stage, not a normal webpage:
- 16:9-friendly composition
- presentation-scale title/body/results/chart/media typography
- minimal/hidden chrome during delivery
- no normal page scrolling for scene navigation
- Previous/Next controls
- keyboard arrows and clicker compatibility
- reveals/timers/results at room-readable scale
- correct Arabic RTL and English LTR typography
- presentation/title/body font roles and course-level overrides

## Content components
Core should natively cover common workshop/course needs so course authors do not need custom code. At minimum:
Presentation: hero, text, image, image+text, cards, steps, comparison, callout, quote, stat, table, timeline, checklist, asset/download, video/audio/link, reveal.
Interactions: single/multiple choice, true/false, short/long/numeric answer, rating, reaction, confidence, ranking/order, poll, timer, announcement, anonymous spotlight, team challenge, leaderboard.
Practice: mission, checklist, prompt/copy prompt/editable prompt template, external tool, download, URL/image/file submission, reflection, self-assessment, trainer-reviewed submission.
Results: vertical/horizontal/stacked bar, donut/pie, line, ranking, progress, cards/leaderboard.
