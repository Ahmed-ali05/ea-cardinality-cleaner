# Changelog

## 0.2.0 — 2026-10-09

- Replace the text-input menu with two direct commands: **Pulisci diagramma** and **Ripristina**.
- Clean all visible relationships with one command; remove the selected-only menu action.
- Provide one ZIP containing two standalone scripts, installation instructions, and the MIT license.
- Keep existing 0.1.x undo snapshots compatible and explain how to update scripts already saved in EA.
- Generate both commands from one shared source and test the actual installable files.
- Report partial failures without claiming all cardinalities are visible.

## 0.1.1 — 2026-10-09

- Replace the long README with a direct download and three setup steps.
- Add a short English guide and keep support details in separate documents.
- Shorten the action menu and completion messages; show error and skipped counts only when needed.
- Publish under Ahmed-ali05 after the ownership transfer.

## 0.1.0 — 2026-10-09

Initial open-source release.

- Keep source and target cardinalities visible while hiding other standard connector labels.
- Apply to the current diagram's visible relationships or one selected relationship.
- Provide an Italian-language action menu and completion summaries.
- Save one local undo snapshot per diagram and preserve it on no-op runs.
- Merge restored visibility with the current geometry and appearance.
- Skip subsequently edited labels and deleted or replaced relationship instances.
- Include dependency-free simulated tests and Linux/Windows CI.

Live Enterprise Architect validation is pending.
