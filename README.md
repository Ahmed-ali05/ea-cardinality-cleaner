# EA Cardinality Cleaner

[![Checks](https://github.com/ahmed05idk/ea-cardinality-cleaner/actions/workflows/checks.yml/badge.svg)](https://github.com/ahmed05idk/ea-cardinality-cleaner/actions/workflows/checks.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Hide relationship labels in Sparx Systems Enterprise Architect while keeping source and target cardinalities visible.

Database diagrams can become difficult to read when relationships display long key names, role names, stereotypes, and column mappings. This standalone JScript keeps the two cardinality labels and hides the other standard connector labels in the active diagram.

[Guida in italiano](docs/usage.it.md) · [How it works](docs/development.md) · [Changelog](CHANGELOG.md)

## Features

- Apply to all visible relationships or a single selected relationship.
- Keep both cardinalities visible; leave hidden relationships hidden.
- Use a small Italian-language menu and a completion summary.
- Restore the previous label visibility with one local undo snapshot per diagram.
- Preserve line positions, colors, and other styles during restore.
- Skip relationships whose labels were edited after the script ran.
- Keep the existing undo snapshot when a repeated run makes no changes.

## Requirements and status

Run the script **inside Enterprise Architect on Windows**, using its **JScript** engine. The Script Library is available in the Corporate, Unified, and Ultimate editions. No Node.js installation or additional script library is required to use it.

**Version 0.1.0 is an initial release.** Syntax and application/restore behavior are covered by automated simulations. The visual result, COM integration, and compatibility with specific Enterprise Architect builds have **not yet been verified in a live EA session**. API references use the EA 17.2 documentation. Custom MDG technologies or connector shape scripts may render labels differently.

## Install

1. Open [`scripts/ea-cardinality-cleaner.js`](scripts/ea-cardinality-cleaner.js) and copy its full contents, using GitHub's **Raw** view or the downloaded file.
2. In Enterprise Architect, open **Specialize → Tools → Script Library**.
3. Create a **Diagram Group**, for example `Database tools`.
4. Inside it, create a **JScript** named `Cardinality Cleaner`.
5. Replace the generated template with the copied source and save.

Choose **JScript**, rather than JavaScript: this script uses `ActiveXObject` for its local undo file. Paste the entire file; there are no `!INC` dependencies.

## Use

Open a diagram. Right-click its background and choose **Scripts → Cardinality Cleaner**, or select the script in the Script Library and choose **Run Script**.

| Menu choice | Action |
| --- | --- |
| **1** | Show only cardinalities on all visible relationships in the current diagram. |
| **2** | Show only cardinalities on the selected relationship. Select the line first, then run from the Script Library. |
| **3** | Restore the previous label visibility for the last changing run on this diagram. |
| **0** or **Cancel** | Exit without changing labels. |

The menu only offers actions that are available. If **Suppress All Connector Labels** is enabled on the diagram, choice **2** is unavailable: disabling that diagram-wide override would also change unrelated relationships. Choice **1** disables the override and sets each visible relationship's label visibility.

Run the script again after adding new relationships. It is a manually invoked script and does not subscribe to connector-creation events.

## Undo and data handling

A changing run saves an undo snapshot **before** applying label changes. If it cannot save that file, it stops before modifying labels. The file is stored in:

```text
%LOCALAPPDATA%\EA-EtichetteRelazioni
```

There is **one undo level per diagram**. A later changing run replaces it. A successful restore consumes it. Undo is local to the current Windows user and is not shared through the EA repository. Moving or renaming a file-based EA project can make its previous snapshot unavailable.

Snapshots contain diagram/connector identifiers and visibility flags. They do not contain table names, notes, cardinality values, or connection strings. A connection-string fingerprint separates projects; it is an identity hint, not a cryptographic security mechanism. The script makes no network requests.

Restore merges the saved visibility flags into the current connector geometry and styles. It preserves subsequent line moves and other appearance changes. Relationships with subsequently edited labels, removed instances, or different connector GUIDs are skipped. A partial restore keeps the snapshot available for retry.

## Troubleshooting

| Symptom | What to do |
| --- | --- |
| No script in the diagram's **Scripts** menu | Check that its group type is **Diagram**. You can also run it from the Script Library. |
| Choice **2** is missing | Select a connector line. If diagram-wide label suppression is enabled, use choice **1**. |
| Choice **3** is missing | No undo snapshot exists for this project/diagram under the current Windows user. |
| Operation stops before changing labels | Check access to `%LOCALAPPDATA%` and the availability of `Scripting.FileSystemObject` and `WScript.Shell`. |
| Update or restore reports errors | Open **Script Output** for details and check the diagram's editing permissions. |
| Extra text remains visible | A custom shape script or MDG notation may control it. Report the EA version and notation with a minimal example. |

## Development

Node.js **22 or later** is needed only for development. The test suite has no third-party dependencies.

```sh
npm run check
npm test
```

Tests execute the same standalone source in a mocked EA environment and exercise cancellation, scope selection, cardinality visibility, undo, partial failures, and backup failures. CI runs these checks on Linux and Windows. It does not launch Enterprise Architect.

See [development notes](docs/development.md) and [contributing](CONTRIBUTING.md).

## References

- [Enterprise Architect: DiagramLink API](https://sparxsystems.com/enterprise_architect_user_guide/17.2/add-ins___scripting/diagramlinks.html)
- [Enterprise Architect: diagram styles](https://sparxsystems.com/enterprise_architect_user_guide/17.2/modeling_frameworks/attribute_values-stylex__pda.html)
- [Enterprise Architect: Session input and prompts](https://news.sparxsystems.com/enterprise_architect_user_guide/17.2/add-ins___scripting/session_object.html)
- [Sparx staff guidance on cardinality label positions](https://sparxsystems.com/forums/smf/index.php?topic=17431.0)

## License

[MIT](LICENSE). Enterprise Architect is a product of Sparx Systems. This community project is not affiliated with or endorsed by Sparx Systems.
