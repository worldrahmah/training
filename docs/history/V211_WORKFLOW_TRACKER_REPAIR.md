# v2.1.1 Workflow Tracker Compatibility Repair

## Defect reproduced
The v2.1 Trainer Workflow Progress Tracker displayed status labels only for modules that already contained an explicit schema 2.0 `workflow`. Legacy/demo modules fell back to the old list where every item showed `Open`, so finishing an item did not visibly advance Done/Next state.

## Repair
For any module with activities or missions but no explicit workflow, the runtime derives a stable implicit linear workflow from the existing authored order. The course package is never edited. Persisted progress uses stable generated node IDs.

Normal Trainer behavior is now:
1. first eligible section = Next;
2. Start = Current;
3. Finish = Done;
4. following eligible section = Next;
5. later sections = Upcoming.

Existing explicit schema 2.0 workflows retain branch-aware behavior. Old direct launch endpoints remain compatible and are mapped into the tracker.
