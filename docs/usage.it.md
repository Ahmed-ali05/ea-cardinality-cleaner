# Aiuto e ripristino

[Installazione rapida](../README.md) · [English](usage.en.md)

## Installazione, una sola volta

1. In Enterprise Architect apri **Specialize → Tools → Script Library**.
2. Crea un gruppo di tipo **Diagram Group**, chiamato `Tabelle`.
3. Nel gruppo crea uno script **JScript**, chiamato `Cardinality Cleaner`.
4. Apri lo [script](../scripts/ea-cardinality-cleaner.js), copia **tutto** il contenuto, sostituisci il codice predefinito dello script e salva.

Scegli **JScript**: il ripristino usa i componenti COM disponibili su Windows. Non sono richieste librerie aggiuntive.

## Uso quotidiano

Apri il diagramma, fai clic destro sullo sfondo e scegli **Scripts → Cardinality Cleaner**. Si apre un menu in italiano:

| Scelta | Risultato |
| --- | --- |
| **1** | Nasconde le altre etichette di tutte le relazioni visibili nel diagramma e mostra le cardinalità. |
| **2** | Applica la stessa visualizzazione alla sola relazione selezionata. Seleziona prima la linea; poi avvia lo script dalla Script Library. |
| **3** | Ripristina la visualizzazione precedente all'ultima esecuzione che ha modificato le etichette. |
| **0** o **Annulla** | Esce senza modificare le etichette. |

La scelta **2** compare quando una relazione è selezionata. Se il diagramma ha attivo **Suppress All Connector Labels**, compare solo la scelta per l'intero diagramma: disattivare quell'opzione per una singola relazione cambierebbe anche le altre.

La scelta **3** compare quando esiste un ripristino per quel diagramma. Un'esecuzione che non cambia nulla conserva il ripristino precedente. Una nuova esecuzione con modifiche lo sostituisce: è disponibile **un solo livello di ripristino per diagramma**.

Alla fine una finestra mostra quante relazioni sono state aggiornate e gli eventuali errori. I dettagli degli errori si trovano nella finestra **Script Output**.

Dopo aver creato nuove relazioni, riesegui la scelta **1**. Lo script non si avvia automaticamente alla creazione di una relazione.

## Cosa conserva il ripristino

Il ripristino recupera la visibilità precedente delle etichette e l'eventuale soppressione generale del diagramma. Conserva le posizioni delle linee, i colori e gli altri stili presenti al momento del ripristino. Se le etichette di una relazione sono state modificate manualmente dopo l'esecuzione, quella relazione viene saltata e segnalata.

Il file di ripristino è salvato sul computer dell'utente in `%LOCALAPPDATA%\EA-EtichetteRelazioni`, prima di modificare le etichette. Non è condiviso con altri utenti. Se non può essere salvato, l'operazione si interrompe. La stringa di connessione del progetto non viene salvata nel file. Spostare o rinominare il file del progetto può rendere il vecchio ripristino non disponibile.

Lo script mantiene visibili le etichette inferiori ai due estremi, usate per le cardinalità nelle relazioni standard tra tabelle. Non cambia i valori delle cardinalità. Notazioni o stereotipi personalizzati possono gestire diversamente le etichette.

## Verifica

Sintassi e flussi di applicazione/ripristino verificati con un ambiente simulato. La visualizzazione e i componenti COM devono ancora essere verificati dentro Enterprise Architect su Windows.

## Riferimenti

- [Menu contestuale degli script](https://smtp.sparxsystems.com/enterprise_architect_user_guide/17.2/add-ins___scripting/script_group_properties.html)
- [Finestre di input e messaggi](https://news.sparxsystems.com/enterprise_architect_user_guide/17.2/add-ins___scripting/session_object.html)
- [DiagramLink API](https://sparxsystems.com/enterprise_architect_user_guide/17.2/add-ins___scripting/diagramlinks.html)
- [Indicazioni Sparx sulle etichette delle cardinalità](https://sparxsystems.com/forums/smf/index.php?topic=17431.0)
