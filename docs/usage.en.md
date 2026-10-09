# EA Cardinality Cleaner

One command to hide relationship labels in Enterprise Architect while keeping both cardinalities visible.

**[Download Pulisci diagramma](https://github.com/Ahmed-ali05/ea-cardinality-cleaner/releases/download/v0.3.0/pulisci-diagramma.js)** · [Italiano](../README.md)

## Install and run

1. In EA, open **Specialize → Tools → Script Library** and create a **Diagram Group** called `Tables`.
2. Create a **JScript** named **Pulisci diagramma** (Clean diagram). Open the downloaded file in a text editor, replace the entire script template with its contents, and save.
3. Open the diagram → **right-click background → Specialize → Scripts → Pulisci diagramma**.

The command runs immediately, with no input boxes, confirmations, or modal dialogs. Run it again after adding relationships; already configured links are not rewritten. Results and errors go to **Script Output**.

Requires EA on Windows (Corporate, Unified, or Ultimate), using **JScript**. No extra libraries or local file storage. There is no automatic undo.

## Update

Replace the old script's entire source, save, and rename it **Pulisci diagramma**. Remove the old **Ripristina** script from the group if installed. Downloading the file alone does not update scripts stored in EA.

## Help

- **Scripts missing?** Check **Specialize → Scripts**. In the Script Library, right-click the group → **Group Properties → Group Type: Diagram**. You can also right-click the script → **Run Script**, with the diagram open.
- **A dialog still appears?** EA is still using the old script source.
- **An update failed?** Check **Script Output** and editing permissions. A failed relationship is skipped and processing continues. If global label suppression cannot be disabled, cleaning stops because it would still hide cardinalities.
- **Text remains visible?** Custom notations or shape scripts may control it differently.

The command preserves hidden relationships, line positions, colors, and other styles. Old local undo files are not accessed. Automated tests use simulated EA; live visual behavior still needs validation.

[Technical details](development.md) · [Contributing](../CONTRIBUTING.md) · [MIT](../LICENSE)
