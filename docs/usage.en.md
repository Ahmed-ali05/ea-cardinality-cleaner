# EA Cardinality Cleaner

Hide relationship labels in Enterprise Architect while keeping both cardinalities visible. Two direct commands, no text input.

**[Download the two scripts](https://github.com/Ahmed-ali05/ea-cardinality-cleaner/releases/download/v0.2.0/ea-cardinality-cleaner.zip)** · [Italiano](../README.md)

## Install

1. Extract the ZIP. In EA, open **Specialize → Tools → Script Library** and create a **Diagram Group** called `Tables`.
2. Create two **JScript** scripts named **Pulisci diagramma** (Clean diagram) and **Ripristina** (Restore). Open each `.js` file in a text editor and replace the corresponding script's entire template with that file's contents.
3. Save both scripts. Open a diagram and choose **right-click background → Specialize → Scripts → Pulisci diagramma**.

Requires EA on Windows (Corporate, Unified, or Ultimate), using **JScript**. Each file is standalone; no extra libraries to import. Messages are in Italian.

## Use

- **Pulisci diagramma** cleans all visible relationships and keeps cardinalities visible, including when a connector is selected.
- **Ripristina** restores the previous label visibility from the last changing run.

Commands run immediately and display a short result. Run the cleaner again after adding relationships. Undo is local and has one level per diagram.

## Updating from 0.1.x

Replace the old `Cardinality Cleaner` script's entire source with `pulisci-diagramma.js`, save it, and rename it **Pulisci diagramma**. Add **Ripristina** as a second JScript containing `ripristina.js`.

Existing undo snapshots remain compatible. Run **Ripristina** before another changing clean if you want to undo the previous run. If a text input box still opens, EA is still using the old source.

## Help

- **Scripts missing?** Look under **Specialize → Scripts**. In the Script Library, right-click the group → **Group Properties → Group Type: Diagram**. You can also right-click either script → **Run Script**, with the diagram open.
- **No snapshot to restore?** It exists only after a changing clean, for the same project, diagram, and Windows user. A complete restore consumes it.
- **Update failed?** Check **Script Output** and editing permissions. The cleaner stops before changing labels if it cannot save the snapshot.
- **Text still visible?** Custom notations or shape scripts may control it differently.

This is a preview: automated checks use simulated EA. Live visual behavior and COM integration still need validation.

[Technical details](development.md) · [Contributing](../CONTRIBUTING.md) · [MIT](../LICENSE)
