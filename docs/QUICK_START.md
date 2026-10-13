# Quick Start — Training Engine ONE v3.5.0 RC1R6

1. Extract the release to a writable folder.
2. Windows: run `START_TRAINING_ENGINE.bat`. Linux/macOS: run `./START_TRAINING_ENGINE.sh` or `npm start` with Node 22.5+.
3. Open `http://localhost:3000/admin` or the required role surface.
4. Use Course Builder to create/edit a draft, validate it, then publish before assigning it to a class.
5. Enter Trainer Live from a class; pair a Projector from the Live header. Participant devices join via their account/class flow, or via guest join only when the Trainer enables guest participation.

## New Professional Closure smoke path
Create one test course containing: 100 Points, Quick Interaction, Matching, Fill Blanks, Sorting, Image Interaction, Draw/Annotate, Collaborative Board and Interactive Video. Exercise Hide → Reveal → Explain, result-view switching, Projector pointer, a Participant-Paced class, a guest join, Session Replay and Live Insights.

Run `npm test` for the complete automated suite.

RC1R6 repair scope and authoritative current evidence: `RC1R6_REPAIR_AND_ACCEPTANCE.md`. Earlier gate descriptions are preserved for continuity.
