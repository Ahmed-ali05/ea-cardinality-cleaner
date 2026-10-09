# Development

The only installable file is `scripts/pulisci-diagramma.js`. It runs directly inside EA's JScript engine with `Repository` and `Session`. There is no build step, shared runtime, filesystem access, or undo dependency.

## Visibility

| Mechanism | Handling |
| --- | --- |
| `Diagram.StyleEx`, `SuppConnectorLabels` | Disable when enabled and visible links exist. If the update fails, stop. |
| `DiagramLink.HiddenLabels` / `Style`, `HideLabels` | Disable on visible links that need changing. |
| `DiagramLink.Geometry`, per-label `HDN` | Set `LLB` and `LRB` to `0`; set `LLT`, `LRT`, `LMT`, `LMB`, `IRHS`, and `ILHS` to `1`. |

The parser handles both `LLB=` and `$LLB=` and preserves other geometry fields. Cardinality positions follow [Sparx staff guidance](https://sparxsystems.com/forums/smf/index.php?topic=17431.0). EA does not fully document this serialization; custom notations can behave differently.

## Execution

Save the open diagram and read it again before changing label visibility. Iterate visible instances independently, skip unchanged links, and catch per-link read/update errors so later links are still processed. No model connector objects or cardinality values are changed.

Reload the diagram once after attempted changes, including failed writes that may leave modified COM objects in memory. A no-op run does not issue `Update()` or reload. Do not change global UI settings.

`Session.Output` is the only feedback channel. It reports counts and at most five error details; logging failure does not abort cleanup. The script does not call `Session.Input`, `Session.Prompt`, or `ActiveXObject`.

## Checks

Node.js 22 or later is required only for development. There are no third-party dependencies.

```sh
npm run check
npm test
```

Tests execute the exact standalone source in a mocked EA environment. They cover visibility, hidden links, unchanged geometry/styles, repeated runs, partial failures, save/reload failures, no modal UI or file access, and a larger diagram. They do not prove COM behavior or actual EA performance.

For live validation, use a disposable standard database diagram. Verify both cardinalities, line positions, hidden links, a repeated run, and diagnostic output on a locked diagram. Record EA edition, version, and build. Live validation is still pending.

## References

- [DiagramLink API](https://sparxsystems.com/enterprise_architect_user_guide/17.2/add-ins___scripting/diagramlinks.html)
- [Repository API](https://www.sparxsystems.com/enterprise_architect_user_guide/17.2/add-ins___scripting/repository3.html)
- [Script groups](https://sparxsystems.com/enterprise_architect_user_guide/17.2/add-ins___scripting/script_group_properties.html)
