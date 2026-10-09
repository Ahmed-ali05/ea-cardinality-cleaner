# Development notes

## Runtime and test harness

The installable artifacts are `scripts/pulisci-diagramma.js` and `scripts/ripristina.js`. Each runs directly in Enterprise Architect's JScript engine, which supplies `Repository` and `Session`. It uses Windows COM through `ActiveXObject` to save local undo snapshots.

The Node.js test suite evaluates both standalone commands in a `vm` context. A mock repository, session, and file system exercise the complete application/restore flows, including no-text-input execution and compatibility with a snapshot produced by 0.1.1. Failed `Update()` calls do not persist mock records, matching the intended API contract.

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

Only the most recent changing run is available through the Restore command. The `.previous` file is an internal replacement fallback, not an additional undo level.

## Build the commands

`src/cleaner.js` contains the shared EA-compatible implementation. `tools/build.cjs` generates two complete scripts, each calling a fixed action. EA does not need to import the shared source or install another library.

```sh
npm run build
npm run check
npm test
```

Commit both generated scripts when changing the source. `npm run check` checks their syntax and fails if they are out of date. The test suite executes the generated scripts rather than just the shared source. No command calls `Session.Input`; `Session.Prompt` only displays the result.

The release ZIP contains both scripts, short installation instructions, and the MIT license. The local snapshot path and `EA_LABELS_V2` format remain unchanged from 0.1.x.

## Manual validation in Enterprise Architect

Use a disposable diagram with two or three tables and populated relationship cardinalities. Check that:

1. **Pulisci diagramma** runs directly, hiding other labels while keeping both cardinalities visible.
2. The command cleans all visible relationships even when one connector is selected; hidden relationships stay hidden.
3. A repeated run leaves the previous undo available.
4. **Ripristina** runs directly and restores labels after moving a line or changing its color.
5. A manually edited label after cleaning is skipped during restore.
6. Errors for a locked diagram, missing snapshot, or undo-file write failure are understandable.

Record EA build, edition, notation, and the result of each check. No live EA validation has been recorded yet.
