# EA Cardinality Cleaner

Nasconde le etichette delle relazioni in Enterprise Architect e lascia visibili le cardinalità.

**[Scarica lo script](https://github.com/Ahmed-ali05/ea-cardinality-cleaner/releases/download/v0.1.1/ea-cardinality-cleaner.js)** · [English](docs/usage.en.md)

## Installa e usa

1. In EA apri **Specialize → Tools → Script Library** e crea un **Diagram Group** chiamato `Tabelle`.
2. Nel gruppo crea un **JScript** chiamato `Cardinality Cleaner`. Apri il file scaricato in un editor di testo, copia tutto il codice nello script e salva.
3. Apri il diagramma, clic destro sullo sfondo → **Specialize → Scripts → Cardinality Cleaner**. Digita **1**.

Se **Scripts** non compare: nella Script Library, clic destro sul gruppo → **Group Properties → Group Type: Diagram**. Per avviare subito: clic destro sullo script → **Run Script**, con il diagramma aperto.

Servono Enterprise Architect su Windows (Corporate, Unified o Ultimate) e il motore **JScript**. Nessuna dipendenza da installare.

## Le tre azioni

| Digita | Per |
| --- | --- |
| **1** | Pulire tutte le relazioni visibili del diagramma. |
| **2** | Pulire solo la relazione selezionata, quando disponibile. |
| **3** | Annullare l'ultima pulizia, quando disponibile. |

**Annulla** chiude senza modifiche. Dopo aver aggiunto relazioni, riesegui **1**. Il ripristino è locale e conserva un solo livello per diagramma.

Versione preliminare: i test automatici usano EA simulato; la verifica dentro Enterprise Architect resta da fare.

[Aiuto e ripristino](docs/usage.it.md) · [Dettagli tecnici](docs/development.md) · [MIT](LICENSE)
