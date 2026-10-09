# Aiuto e ripristino

[Installazione rapida](../README.md) · [English](usage.en.md)

## Aggiornare da 0.1.x

Non serve ricreare il gruppo in Enterprise Architect.

1. Scarica ed estrai il nuovo ZIP.
2. Apri il vecchio script `Cardinality Cleaner`, sostituisci **tutto** il codice con `pulisci-diagramma.js` e salvalo. Rinominalo **Pulisci diagramma**.
3. Nello stesso gruppo crea un **JScript** chiamato **Ripristina**, sostituisci il codice predefinito con tutto il contenuto di `ripristina.js` e salva.

Il formato dei ripristini è compatibile con 0.1.x. Se vuoi annullare la pulizia precedente, esegui **Ripristina** prima di fare una nuova pulizia.

## Non trovo il comando

Il percorso è **clic destro sullo sfondo del diagramma → Specialize → Scripts**.

Nella Script Library, clic destro sul gruppo → **Group Properties**: **Group Type** deve essere **Diagram**. Il nome del gruppo da solo non ne determina il tipo.

Per avviare subito, lascia il diagramma aperto e scegli **clic destro sullo script nella Script Library → Run Script**.

## Compare ancora una casella di testo

È ancora installato il codice 0.1.x. Scaricare i nuovi file non aggiorna gli script salvati nel modello di EA: sostituisci il codice come indicato sopra.

## Ripristina dice che non c'è un ripristino

Il ripristino esiste solo dopo una pulizia che ha cambiato le etichette. È salvato sul computer dell'utente in `%LOCALAPPDATA%\EA-EtichetteRelazioni` e non è condiviso con altri utenti.

Una nuova pulizia con modifiche sostituisce la precedente; una pulizia che non cambia nulla la conserva. Un ripristino completo consuma il file. Spostare o rinominare il file del progetto può rendere il vecchio ripristino non disponibile.

## Errori o etichette ancora visibili

Apri **Script Output** per i dettagli e controlla i permessi sul diagramma. Se il file di ripristino non può essere salvato, la pulizia si interrompe prima di modificare le etichette.

Il ripristino conserva spostamenti delle linee, colori e altri stili. Le relazioni rimosse o con etichette modificate dopo la pulizia vengono saltate e segnalate. Un ripristino parziale rimane disponibile.

Notazioni o shape script personalizzati possono gestire le etichette diversamente. Lo script non cambia i valori delle cardinalità e non si avvia automaticamente quando crei una relazione.

[Dettagli tecnici](development.md) · [Menu del diagramma in EA](https://sparxsystems.com/enterprise_architect_user_guide/17.2/modeling_fundamentals/diagramcontextmenu2.html)
