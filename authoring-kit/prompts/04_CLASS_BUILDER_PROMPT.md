# MASTER PROMPT — CLASS BUILDER (Training Engine v2.0)

Create a Training Engine class setup using `CLASS_TEMPLATE.json` and `STUDENT_ROSTER_TEMPLATE.csv`.

Inputs may include:
- installed course slug and exact version
- class title/cohort
- location
- lifecycle status
- start/end dates
- daily times
- sessions
- capacity
- participant roster
- optional team count

Return:
1. one valid class JSON using `format: training-engine-class`, schema `1.1`
2. one UTF-8 CSV roster with unique usernames
3. a concise import order: course version → class → assign trainer(s) → roster → teams → classroom readiness

Do not invent an installed course version. Do not include unnecessary/sensitive personal information. Never reuse a staff username for a participant.
