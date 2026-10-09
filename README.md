# EA Cardinality Cleaner

Nasconde le etichette delle relazioni in Enterprise Architect e lascia visibili le cardinalità. Due comandi, nessun numero da digitare.

**[Scarica i due script](https://github.com/Ahmed-ali05/ea-cardinality-cleaner/releases/download/v0.2.0/ea-cardinality-cleaner.zip)** · [English](docs/usage.en.md)

## Installa

1. Estrai lo ZIP. In EA apri **Specialize → Tools → Script Library** e crea un **Diagram Group** chiamato `Tabelle`.
2. Nel gruppo crea due **JScript**: **Pulisci diagramma** e **Ripristina**. Apri i file `.js` in un editor di testo e sostituisci il codice predefinito di ciascuno script con tutto il contenuto del file corrispondente.
3. Salva entrambi gli script. Apri il diagramma e scegli **clic destro sullo sfondo → Specialize → Scripts → Pulisci diagramma**.

Servono EA su Windows (Corporate, Unified o Ultimate) e il motore **JScript**. Non ci sono librerie aggiuntive da importare.

## Usa

- **Pulisci diagramma** nasconde le altre etichette su tutte le relazioni visibili, mantenendo le cardinalità.
- **Ripristina** annulla l'ultima pulizia. Si trova nello stesso menu.

I comandi partono subito e mostrano un breve risultato. Dopo aver aggiunto relazioni, esegui di nuovo **Pulisci diagramma**. Il ripristino è locale e ha un solo livello per diagramma.

**Non trovi Scripts?** Nella Script Library, clic destro sul gruppo → **Group Properties → Group Type: Diagram**. Puoi anche avviare ciascun comando con **clic destro sullo script → Run Script**.

[Passare dalla versione precedente](docs/usage.it.md#aggiornare-da-01x) · [Aiuto](docs/usage.it.md) · [MIT](LICENSE)

Versione preliminare: i test usano EA simulato; la verifica dentro Enterprise Architect resta da fare.
