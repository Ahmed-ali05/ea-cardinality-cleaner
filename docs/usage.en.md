# EA Cardinality Cleaner

Hide table relationship labels in Enterprise Architect while keeping cardinalities visible.

**[Download the script](https://github.com/Ahmed-ali05/ea-cardinality-cleaner/releases/download/v0.3.0/pulisci-diagramma.js)** · [Italiano](../README.md)

## Requirements

Enterprise Architect on **Windows**, **Corporate, Unified, or Ultimate** edition. The script uses **JScript** and needs no additional installation.

## Install

1. Open **Specialize → Tools → Script Library**.
2. Create a **Diagram Group** named `Tables`.
3. Create a **JScript** named **Pulisci diagramma** (Clean diagram) in that group.
4. Open the downloaded file in a text editor, replace the entire script template with its contents, and save.

## Use

Open a diagram and choose:

**Right-click background → Specialize → Scripts → Pulisci diagramma**

The command cleans visible relationships in the open diagram. It preserves cardinalities, line positions, and colors. It runs without confirmation dialogs. Run it again after adding relationships. Results and errors appear in **Script Output**, in Italian.

## Help

- **Scripts missing?** In the Script Library, right-click the group → **Group Properties → Group Type: Diagram**. You can also right-click the script → **Run Script**, with the diagram open.
- **Some labels unchanged?** Check **Script Output** and editing permissions. Individual failures are skipped. If global label suppression cannot be disabled, cleaning stops because cardinalities would remain hidden.
- **Text still visible?** Reopen the diagram. Custom notations and shape scripts may render labels differently.

The script saves the diagram before modifying label visibility. Cardinality values are unchanged. There is no automatic undo.

Automated tests use simulated EA. Live validation inside Enterprise Architect is still pending.

[Technical details](development.md) · [MIT license](../LICENSE)
