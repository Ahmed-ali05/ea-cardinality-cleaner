# EA Cardinality Cleaner

Nasconde le etichette delle relazioni tra tabelle in Enterprise Architect e lascia visibili le cardinalità.

**[Scarica lo script](https://github.com/Ahmed-ali05/ea-cardinality-cleaner/releases/download/v0.3.0/pulisci-diagramma.js)** · [English](docs/usage.en.md)

## Cosa serve

Enterprise Architect su **Windows**, edizione **Corporate, Unified o Ultimate**. Lo script usa il motore **JScript** e non richiede installazioni aggiuntive.

## Installazione

1. Apri **Specialize → Tools → Script Library**.
2. Crea un gruppo di tipo **Diagram Group** e chiamalo `Tabelle`.
3. Nel gruppo crea un **JScript** chiamato **Pulisci diagramma**.
4. Apri il file scaricato in un editor di testo, copia tutto il contenuto nello script al posto del codice predefinito e salva.

## Uso

Apri il diagramma e scegli:

**Clic destro sullo sfondo → Specialize → Scripts → Pulisci diagramma**

Il comando lavora sulle relazioni visibili del diagramma aperto. Conserva le cardinalità, le posizioni delle linee e i colori. Non apre finestre da confermare.

Dopo aver aggiunto relazioni, eseguilo di nuovo. Il riepilogo e gli eventuali errori sono in **Script Output**.

[Aiuto](docs/usage.it.md) · [Licenza MIT](LICENSE)

I test automatici usano un ambiente EA simulato. La verifica dentro Enterprise Architect resta da fare.
