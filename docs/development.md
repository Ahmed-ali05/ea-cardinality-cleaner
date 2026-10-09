# Development notes

## Runtime and test harness

The installable artifact is `scripts/ea-cardinality-cleaner.js`. It runs directly in Enterprise Architect's JScript engine, which supplies `Repository` and `Session`. It uses Windows COM through `ActiveXObject` to save local undo snapshots.

The Node.js test suite evaluates that exact source in a `vm` context. A mock repository, session, and file system exercise the complete menu/application/restore flows. Failed `Update()` calls do not persist mock records, matching the intended API contract.

## Visibility model

Three mechanisms interact:

| Mechanism | Location | Handling |
| --- | --- | --- |
| Suppress all connector labels | `Diagram.StyleEx`, `SuppConnectorLabels` | Disable only when currently enabled; record the previous value. |
| Hide all labels on one connector | `DiagramLink.HiddenLabels` / `Style`, `HideLabels` | Disable on targeted relationships. |
| Individual label visibility | `DiagramLink.Geometry`, per-label `HDN` | Set the required flags and preserve other fields. |

The cardinality labels are `LLB` and `LRB` (left/right bottom). Their `HDN` flags are set to `0`. `LLT`, `LRT`, `LMT`, `LMB`, `IRHS`, and `ILHS` are set to `1`. The geometry parser accepts both `LLB=` and the usual `$LLB=` spelling, including empty label blocks.

The Automation API exposes `Geometry` as a string. Its internal serialization is not completely documented. The label positions follow [Sparx staff guidance](https://sparxsystems.com/forums/smf/index.php?topic=17431.0), and the label identifiers are discussed in the [Sparx scripting forum](https://sparxsystems.com/forums/smf/index.php?topic=6125.0). Custom notations may use different behavior.

## Undo format

Each project/diagram has a local UTF-16 text file headed `EA_LABELS_V2`. It stores:

- A non-cryptographic connection-string fingerprint and diagram GUID.
- The previous `SuppConnectorLabels` flag.
- For each changed relationship: connector ID, diagram-link instance ID, connector GUID, the previous `HideLabels` flag, `HiddenLabels`, and eight individual label flags.

Flags are `0`, `1`, or `-` for an absent value. The reader validates record lengths and flags before any restore writes. Table names, cardinality values, and the connection string are omitted.

The snapshot is written to a temporary file before replacing the active undo file. If replacement fails, the previous snapshot is recovered when possible. Application starts only after a successful snapshot write.

## Restore behavior

Restore locates a link by connector ID and instance ID and verifies its connector GUID. It merges saved flags into the current geometry/style rather than restoring complete serialized objects, preserving later line positions and appearance changes.

A link is restored only if its labels still match the state produced by the cleaner, or are already in their original state. Other label states are treated as subsequent edits and skipped. Global suppression is restored only when there are no skipped entries or errors and the current global flag is still the expected value. A partial restore retains the snapshot.

Only the most recent changing run is available through the menu. The `.previous` file is an internal replacement fallback, not an additional undo level.

## Manual validation in Enterprise Architect

Use a disposable diagram with two or three tables and populated relationship cardinalities. Check that:

1. Choice **1** hides key names, stereotypes, and middle labels while keeping both cardinalities visible.
2. Choice **2** affects only the selected visible relationship.
3. Hidden relationships remain hidden.
4. A repeated run reports that the selected relationships are already configured.
5. Choice **3** restores the original labels after moving a line or changing its color.
6. A manually edited label after cleaning is skipped during restore.
7. Errors for a locked diagram are understandable and an undo-file write failure causes no label changes.

Record EA build, edition, notation, and the result of each check. No live EA validation has been recorded yet.
