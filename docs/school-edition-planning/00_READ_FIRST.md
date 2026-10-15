# School edition planning handoff from RC1R10

Prepared 2026-10-15. This is a planning handoff, not a school software release or an approved implementation specification.

The owner wants to evolve Training Engine ONE into a system for schools rather than a training-course management product. The intended age range remains unresolved: “undergraduate” may mean pupils before university or university undergraduates. Do not infer either meaning silently.

## Use in a separate chat

1. Upload **01_RC1R10_CURRENT_SYSTEM_BLUEPRINT.md** and **02_SCHOOL_EDITION_BLUEPRINT_DRAFT.md**. Alternatively upload the complete planning ZIP and ask the chat to read its contents.
2. Paste **03_NEW_CHAT_PLANNING_PROMPT.md** as the message. It requests product and architecture planning, not implementation.
3. Answer the material discovery questions. Review the resulting blueprint, scope, decisions and milestones.
4. Bring the complete planning response and your corrections back to the engineering chat. Planning recommendations are proposals until you approve them; they do not authorize destructive migrations or a rebuild.

The separate chat needs no database, account credentials, student records or environment secrets. If it cannot open GitHub, the attached blueprint and contract snapshots are sufficient for initial planning; it must identify anything requiring source verification.

## Contents and authority

- [Current RC1R10 blueprint](01_RC1R10_CURRENT_SYSTEM_BLUEPRINT.md): architecture, roles, learning model, 36 activities, operational capabilities, evidence and limits.
- [Proposed school blueprint](02_SCHOOL_EDITION_BLUEPRINT_DRAFT.md): school domain, role journeys, gap matrix, migration approach, staged roadmap, acceptance scenarios and unresolved decisions.
- [New-chat prompt](03_NEW_CHAT_PLANNING_PROMPT.md): copy-ready professional planning prompt with an explicit return format.
- **reference/**: frozen registry, capabilities, seven schemas and RC1R10 seal result. These describe the existing engine; they are not school schemas. `SOURCE_SNAPSHOT.json` identifies original paths and hashes.
- **SHA256SUMS.txt**: hashes of the handoff contents, excluding this manifest itself.

Current inspected repository: `worldrahmah/training`, branch `release/rc1r10-test`, commit `0197a9144631e90e8972119be52a388482f1b591`. Engineering source sealed in RC1R10: `bd1999eed31c0909b7cd21b4d7c4e8d28fa535bb`. Later planning-only commits do not change those release bytes.

Existing application: **3.5.0-rc.1.10**, core schema **3.2**, course schema **2.0**, status **OWNER_ACCEPTANCE_CANDIDATE_NOT_FINAL**. The school edition's name, version, audience and approved scope are deliberately undecided.

Existing application package: [RC1R10 ZIP](https://github.com/worldrahmah/training/raw/0197a9144631e90e8972119be52a388482f1b591/releases/rc1r10/TRAINING_ENGINE_ONE_v3.5.0_RC1R10.zip).

SHA-256: `503fd00ef6f89a6c7f6205b6cd1c4ec6754573db44147cbc2ab9a037ec61d105`.

No runtime, database, permission, release identity or sealed application ZIP was changed to prepare this handoff. Existing RC1R10 release test results are cited as historical evidence; they were not rerun as school-edition tests.
