# Aiuto

[Installazione e uso](../README.md) · [English](usage.en.md)

## Non trovo Scripts nel menu

La voce si trova in **clic destro sullo sfondo del diagramma → Specialize → Scripts**.

Se manca, apri la Script Library e fai **clic destro sul gruppo → Group Properties**. Imposta **Group Type = Diagram**.

Puoi anche lasciare il diagramma aperto e avviare il comando dalla Script Library con **clic destro su Pulisci diagramma → Run Script**.

## La pulizia non modifica alcune relazioni

Apri **Script Output** per leggere il riepilogo e gli errori. Controlla che il diagramma sia modificabile e che tu abbia i permessi necessari.

Una relazione non leggibile o non aggiornabile viene saltata; le altre vengono elaborate. Se EA impedisce di disattivare la soppressione generale delle etichette del diagramma, la pulizia si interrompe perché anche le cardinalità resterebbero nascoste.

Se la vista non mostra le modifiche, riapri il diagramma. Notazioni e shape script personalizzati possono gestire le etichette diversamente.

## Cosa viene modificato

Solo la visualizzazione delle etichette nel diagramma aperto. I valori delle cardinalità, le relazioni nascoste, le posizioni delle linee e gli altri stili vengono conservati.

Lo script salva il diagramma prima di modificare le etichette. Si avvia quando lo esegui e non offre un annullamento automatico.

[Dettagli tecnici](development.md)
