# Aiuto

[Installazione rapida](../README.md) · [English](usage.en.md)

## Aggiornare

Sostituisci **tutto** il codice del vecchio script con il nuovo `pulisci-diagramma.js`, salva e rinominalo **Pulisci diagramma**. Se avevi installato **Ripristina**, rimuovi quel vecchio script dal gruppo.

Scaricare il file non aggiorna automaticamente il codice salvato nel modello di EA.

## Non trovo il comando

Apri il diagramma e scegli **clic destro sullo sfondo → Specialize → Scripts → Pulisci diagramma**.

Nella Script Library, clic destro sul gruppo → **Group Properties**: **Group Type** deve essere **Diagram**. Il nome del gruppo da solo non ne determina il tipo.

Puoi anche lasciare il diagramma aperto e scegliere **clic destro sullo script nella Script Library → Run Script**.

## Compare ancora una finestra

È ancora installato il codice precedente. La versione 0.3.0 non usa caselle di testo, conferme o messaggi modali: sostituisci tutto il codice dello script e salva.

## Errori o etichette ancora visibili

Apri **Script Output**: contiene il riepilogo e fino a cinque dettagli di errore per esecuzione. Una relazione non leggibile o non aggiornabile viene saltata e le altre vengono elaborate. I permessi di EA possono impedire una modifica; il comando non li aggira.

Se il diagramma ha la soppressione globale delle etichette attiva e non può essere aggiornato, la pulizia si ferma: quella soppressione nasconderebbe anche le cardinalità. Se la vista non si aggiorna, riapri il diagramma.

Notazioni e shape script personalizzati possono gestire le etichette diversamente. Lo script non cambia i valori delle cardinalità e si avvia soltanto quando lo esegui.

## Cosa modifica

La visibilità delle etichette nel diagramma attivo. Conserva le relazioni nascoste, le posizioni delle linee, i colori e gli altri stili. Salva il diagramma prima di modificare le etichette e lo ricarica una volta quando necessario.

Non esiste un ripristino automatico. Il comando non legge, crea o cancella i file locali di backup delle vecchie versioni.

[Dettagli tecnici](development.md) · [Menu del diagramma in EA](https://sparxsystems.com/enterprise_architect_user_guide/17.2/modeling_fundamentals/diagramcontextmenu2.html)
