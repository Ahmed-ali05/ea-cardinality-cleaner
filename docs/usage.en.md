# EA Cardinality Cleaner

Hide relationship labels in Enterprise Architect while keeping both cardinalities visible.

**[Download the script](https://github.com/Ahmed-ali05/ea-cardinality-cleaner/releases/download/v0.1.1/ea-cardinality-cleaner.js)** · [Italiano](../README.md)

## Install and run

1. In EA, open **Specialize → Tools → Script Library** and create a **Diagram Group** called `Tables`.
2. Create a **JScript** named `Cardinality Cleaner` in that group. Open the downloaded file in a text editor, copy all its code into the script, and save.
3. Open a diagram, right-click its background → **Scripts → Cardinality Cleaner**. Enter **1**.

Requires Enterprise Architect on Windows (Corporate, Unified, or Ultimate) and the **JScript** engine. No extra dependencies. The script's menu is in Italian.

| Enter | Action |
| --- | --- |
| **1** | Clean all visible relationships in the diagram. |
| **2** | Clean the selected relationship, when available. |
| **3** | Undo the last changing run, when available. |

**Cancel** exits without changes. Run **1** again after adding relationships. Undo is local and has one level per diagram.

## Help

- **Script missing from the context menu?** Check that the group's type is **Diagram**. You can also run it from the Script Library.
- **Choice 2 missing?** Select a connector first and run from the Script Library. Diagram-wide label suppression must be off to clean only one relationship.
- **Choice 3 missing?** There is no undo snapshot for this diagram under the current Windows user.
- **An update failed?** Check **Script Output** and the diagram's editing permissions. The script stops before cleaning if it cannot save the undo snapshot.
- **Text still visible?** Custom notations or shape scripts may control it differently.

This is a preview: automated checks use simulated EA. Live visual behavior and COM integration still need validation.

[Technical details](development.md) · [Contributing](../CONTRIBUTING.md) · [MIT](../LICENSE)
