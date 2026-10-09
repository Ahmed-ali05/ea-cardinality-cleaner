# EA Cardinality Cleaner

Un comando per nascondere le etichette delle relazioni in Enterprise Architect e lasciare visibili le cardinalità.

**[Scarica Pulisci diagramma](https://github.com/Ahmed-ali05/ea-cardinality-cleaner/releases/download/v0.3.0/pulisci-diagramma.js)** · [English](docs/usage.en.md)

## Installa e usa

1. In EA apri **Specialize → Tools → Script Library** e crea un **Diagram Group** chiamato `Tabelle`.
2. Crea un **JScript** chiamato **Pulisci diagramma**. Apri il file scaricato in un editor di testo, incolla tutto il contenuto al posto del codice predefinito e salva.
3. Apri il diagramma → **clic destro sullo sfondo → Specialize → Scripts → Pulisci diagramma**.

La pulizia parte subito, senza finestre o conferme. Rieseguila dopo aver aggiunto relazioni: quelle già corrette non vengono riscritte. Eventuali errori sono in **Script Output**.

**Aggiorni una vecchia versione?** Sostituisci tutto il codice dello script esistente e rinominalo **Pulisci diagramma**. Rimuovi il vecchio script **Ripristina** dal gruppo, se presente.

Servono EA su Windows (Corporate, Unified o Ultimate) e **JScript**. Nessuna libreria aggiuntiva o gestione di file locali. La pulizia non offre un annullamento automatico.

[Aiuto](docs/usage.it.md) · [MIT](LICENSE)

Test automatici con EA simulato; la verifica dentro Enterprise Architect resta da fare.
