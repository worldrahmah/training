# Developing ONE courses externally with ChatGPT

Use the sealed `TRAINING_ENGINE_ONE_COURSE_AUTHORING_HANDOFF_v1.3.zip`. Start a fresh ChatGPT conversation, upload the handoff and instruct ChatGPT to read `README_FIRST.md`, the machine-readable `CORE_CAPABILITIES.json`, component catalog, workflow/authoring rules and schemas before creating course content.

Build one milestone/module at a time. Validate each milestone’s activity IDs, assets, private trainer notes, participant interaction, Projector presentation, workflow transitions/branches/convergence and terminal behavior before adding the next milestone. Do not invent unsupported components. The runtime capability catalog is authority.

Course packages should remain declarative. External authoring must not include server code or assumptions about internal database IDs. The Engine validates and imports the package into its canonical model.
