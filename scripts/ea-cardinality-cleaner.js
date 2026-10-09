// EA Cardinality Cleaner 0.1.1
// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Ahmed Ali
// Standalone JScript for Sparx Systems Enterprise Architect.
// Menu: intero diagramma / relazione selezionata / ripristino.
// Cardinalita' sempre visibili durante la pulizia delle etichette.
// Inserire in un Diagram Group per avviarlo dal menu Scripts del diagramma.
// Il ripristino conserva le posizioni delle linee e gli altri stili.
// Salvataggio locale in %LOCALAPPDATA%\EA-EtichetteRelazioni.
//
// Riferimenti:
// https://sparxsystems.com/enterprise_architect_user_guide/17.2/add-ins___scripting/diagramlinks.html
// https://sparxsystems.com/forums/smf/index.php?topic=17431.0

var LABELS = ["LLB", "LRB", "LLT", "LRT", "LMT", "LMB", "IRHS", "ILHS"];
var CLEAN_FLAGS = ["0", "0", "1", "1", "1", "1", "1", "1"];

function errorText(error)
{
    return String(error.description || error.message || error);
}

function notify(message)
{
    Session.Output(message);
    // Valore ufficiale di promptOK; nessuna libreria da includere.
    Session.Prompt("Cardinality Cleaner\n\n" + message, 1);
}

function readStyleFlag(style, name)
{
    var match = new RegExp("(^|;)" + name + "=([^;]*)").exec(String(style || ""));
    return match ? match[2] : null;
}

function setStyleFlag(style, name, value)
{
    style = String(style || "");
    var pattern = new RegExp("(^|;)" + name + "=[^;]*", "g");
    if (value == null)
        return style.replace(pattern, "$1");
    if (pattern.test(style))
        return style.replace(pattern, "$1" + name + "=" + value);

    if (style.length > 0 && style.charAt(style.length - 1) != ";")
        style += ";";
    return style + name + "=" + value + ";";
}

function readLabelFlag(geometry, name)
{
    var match = new RegExp("(^|;)\\$?" + name + "=([^;]*)").exec(String(geometry || ""));
    if (!match) return null;
    var flag = /(^|:)HDN=([^:]*)/.exec(match[2]);
    return flag ? flag[2] : null;
}

function setLabelFlag(geometry, name, flag)
{
    geometry = String(geometry || "");
    // Accetta anche il prefisso '$', normalmente presente in '$LLB'.
    var pattern = new RegExp("(^|;)(\\$?" + name + "=)([^;]*)", "g");
    var found = false;

    var result = geometry.replace(pattern, function(match, separator, label, value)
    {
        found = true;
        if (flag == null)
            value = value.replace(/(^|:)HDN=[^:]*/g, "$1").replace(/^:|:$/g, "").replace(/::+/g, ":");
        else if (/(^|:)HDN=/.test(value))
            value = value.replace(/(^|:)HDN=[^:]*/g, "$1HDN=" + flag);
        else
            value += (value.length > 0 ? ":" : "") + "HDN=" + flag;
        return separator + label + value;
    });

    if (!found && flag != null)
    {
        if (result.length > 0 && result.charAt(result.length - 1) != ";")
            result += ";";
        result += (name == "LLB" ? "$LLB" : name) + "=HDN=" + flag + ";";
    }
    return result;
}

function getFlags(geometry)
{
    var flags = [];
    for (var i = 0; i < LABELS.length; i++) flags.push(readLabelFlag(geometry, LABELS[i]));
    return flags;
}

function applyFlags(geometry, flags)
{
    for (var i = 0; i < LABELS.length; i++) geometry = setLabelFlag(geometry, LABELS[i], flags[i]);
    return geometry;
}

function sameFlags(a, b)
{
    for (var i = 0; i < LABELS.length; i++) if (a[i] !== b[i]) return false;
    return true;
}

function fingerprint(text)
{
    // La stringa di connessione non viene scritta nel file di ripristino.
    var hash = 0;
    text = String(text);
    for (var i = 0; i < text.length; i++) hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
    return (hash >>> 0).toString(16);
}

function storageFor(diagram)
{
    var fso = new ActiveXObject("Scripting.FileSystemObject");
    var shell = new ActiveXObject("WScript.Shell");
    var base = String(shell.ExpandEnvironmentStrings("%LOCALAPPDATA%"));
    if (!base || base.indexOf("%") >= 0 || !fso.FolderExists(base))
        throw new Error("La cartella locale dei dati utente non e' disponibile.");
    var folder = fso.BuildPath(base, "EA-EtichetteRelazioni");
    var modelKey = fingerprint(Repository.ConnectionString);
    var guid = String(diagram.DiagramGUID);
    var filename = modelKey + "-" + guid.replace(/[^a-zA-Z0-9-]/g, "") + ".txt";
    return { fso: fso, folder: folder, path: fso.BuildPath(folder, filename), modelKey: modelKey, guid: guid };
}

function packFlag(flag)
{
    if (flag == null) return "-";
    if (flag != "0" && flag != "1") throw new Error("Formato di visibilita' non riconosciuto: " + flag);
    return flag;
}

function unpackFlag(flag)
{
    if (flag == "-") return null;
    if (flag != "0" && flag != "1") throw new Error("File di ripristino non valido.");
    return flag;
}

function writeBackup(store, diagramFlag, records)
{
    var lines = ["EA_LABELS_V2", store.modelKey, store.guid, packFlag(diagramFlag)];
    for (var i = 0; i < records.length; i++)
    {
        var item = records[i];
        var fields = [item.id, item.instance, item.guid, packFlag(item.hide), item.hidden ? "1" : "0"];
        for (var j = 0; j < LABELS.length; j++) fields.push(packFlag(item.flags[j]));
        lines.push(fields.join("\t"));
    }
    if (!store.fso.FolderExists(store.folder)) store.fso.CreateFolder(store.folder);
    var temp = store.fso.BuildPath(store.folder, store.fso.GetTempName());
    var stream = null;
    var previous = store.path + ".previous";
    try
    {
        stream = store.fso.CreateTextFile(temp, false, true);
        stream.Write(lines.join("\r\n"));
        stream.Close();
        stream = null;
        if (store.fso.FileExists(previous)) store.fso.DeleteFile(previous);
        if (store.fso.FileExists(store.path)) store.fso.MoveFile(store.path, previous);
        store.fso.MoveFile(temp, store.path);
    }
    catch (error)
    {
        if (stream != null) { try { stream.Close(); } catch (ignored) {} }
        if (!store.fso.FileExists(store.path) && store.fso.FileExists(previous))
            store.fso.MoveFile(previous, store.path);
        throw new Error("Impossibile salvare il ripristino. Nessuna etichetta e' stata modificata.\n" + errorText(error));
    }
    finally
    {
        if (store.fso.FileExists(temp)) { try { store.fso.DeleteFile(temp); } catch (ignored) {} }
    }
}

function readBackup(store)
{
    var stream = store.fso.OpenTextFile(store.path, 1, false, -1);
    var text;
    try { text = stream.ReadAll(); } finally { stream.Close(); }
    var lines = String(text).split(/\r?\n/);
    if (lines[0] != "EA_LABELS_V2" || lines[1] != store.modelKey || lines[2] != store.guid)
        throw new Error("Il file di ripristino non appartiene a questo diagramma.");
    var result = { diagramFlag: unpackFlag(lines[3]), records: [] };
    for (var i = 4; i < lines.length; i++)
    {
        if (!lines[i]) continue;
        var fields = lines[i].split("\t");
        if (fields.length != 13 || (fields[4] != "0" && fields[4] != "1") || !/^\d+$/.test(fields[0]) || !/^\d+$/.test(fields[1]) || !fields[2])
            throw new Error("File di ripristino non valido.");
        var item = { id: Number(fields[0]), instance: Number(fields[1]), guid: fields[2],
            hide: unpackFlag(fields[3]), hidden: fields[4] == "1", flags: [] };
        for (var j = 5; j < fields.length; j++) item.flags.push(unpackFlag(fields[j]));
        result.records.push(item);
    }
    return result;
}

function describeScope(diagram, selectedId, all)
{
    var targets = [];
    for (var i = 0; i < diagram.DiagramLinks.Count; i++)
    {
        var link = diagram.DiagramLinks.GetAt(i);
        if (!link.IsHidden && (all || link.ConnectorID == selectedId)) targets.push(link);
    }
    return targets;
}

function chooseAction(diagram, selectedId, store)
{
    var available = describeScope(diagram, selectedId, true).length;
    var canSelect = selectedId > 0 && readStyleFlag(diagram.StyleEx, "SuppConnectorLabels") != "1";
    var canRestore = store.fso.FileExists(store.path);
    var help = "Diagramma: " + diagram.Name + "\n\n" +
        "1 - Pulisci il diagramma (" + available + " relazioni)\n" +
        (canSelect ? "2 - Pulisci la relazione selezionata\n" : "") +
        (canRestore ? "3 - Annulla l'ultima pulizia\n" : "") +
        "\nLe cardinalita' restano visibili.\nDigita il numero, oppure Annulla per uscire.";
    if (selectedId > 0 && !canSelect)
        help += "\n\nIl diagramma nasconde tutte le etichette: usa 1 per mostrare le cardinalita'.";
    while (true)
    {
        var input = Session.Input(help);
        var choice = input == null ? "" : String(input).replace(/^\s+|\s+$/g, "");
        if (choice == "" || choice == "0") return "0";
        if (choice == "1" || (choice == "2" && canSelect) || (choice == "3" && canRestore)) return choice;
        help = "Scelta non disponibile.\n\n" + help.replace(/^Scelta non disponibile\.\n\n/, "");
    }
}

function cleanDiagram(diagram, selectedId, all, store)
{
    var targets = describeScope(diagram, selectedId, all);
    if (targets.length == 0)
    {
        notify(all ? "Non ci sono relazioni visibili da aggiornare." : "Seleziona una relazione visibile e riesegui lo script.");
        return;
    }
    var oldDiagramFlag = readStyleFlag(diagram.StyleEx, "SuppConnectorLabels");
    var changeDiagramFlag = oldDiagramFlag == "1";
    var records = [];
    for (var i = 0; i < targets.length; i++)
    {
        var link = targets[i];
        var flags = getFlags(link.Geometry);
        if (!sameFlags(flags, CLEAN_FLAGS) || link.HiddenLabels || readStyleFlag(link.Style, "HideLabels") == "1")
        {
            var connector = Repository.GetConnectorByID(link.ConnectorID);
            records.push({ id: link.ConnectorID, instance: link.InstanceID, guid: String(connector.ConnectorGUID),
                hide: readStyleFlag(link.Style, "HideLabels"), hidden: !!link.HiddenLabels, flags: flags, link: link });
        }
    }
    if (records.length == 0 && !changeDiagramFlag)
    {
        notify("Le relazioni scelte mostrano gia' solo le cardinalita'.\nIl ripristino precedente resta disponibile.");
        return;
    }
    // Salva prima di modificare le etichette; un errore qui interrompe l'operazione.
    writeBackup(store, oldDiagramFlag, records);
    if (changeDiagramFlag)
    {
        diagram.StyleEx = setStyleFlag(diagram.StyleEx, "SuppConnectorLabels", "0");
        if (!diagram.Update()) throw new Error("Impossibile aggiornare il diagramma: " + diagram.GetLastError());
    }
    var updated = 0;
    var errors = 0;
    for (var i = 0; i < records.length; i++)
    {
        var link = records[i].link;
        try
        {
            link.HiddenLabels = false;
            link.Style = setStyleFlag(link.Style, "HideLabels", "0");
            link.Geometry = applyFlags(String(link.Geometry || ""), CLEAN_FLAGS);
            if (!link.Update()) throw new Error(link.GetLastError());
            updated++;
        }
        catch (error)
        {
            errors++;
            Session.Output("Relazione " + link.ConnectorID + ": " + errorText(error));
        }
    }
    Repository.ReloadDiagram(diagram.DiagramID);
    notify("Relazioni aggiornate: " + updated + "\nCardinalita' visibili; altre etichette nascoste." +
        "\n\nPer annullare, riesegui e scegli 3." +
        (errors > 0 ? "\nErrori: " + errors + ". Dettagli in Script Output." : ""));
}

function restoreDiagram(diagram, store)
{
    var backup = readBackup(store);
    var links = {};
    for (var i = 0; i < diagram.DiagramLinks.Count; i++)
    {
        var link = diagram.DiagramLinks.GetAt(i);
        links["id" + link.ConnectorID + "instance" + link.InstanceID] = link;
    }
    var restored = 0;
    var skipped = 0;
    var errors = 0;
    for (var i = 0; i < backup.records.length; i++)
    {
        var item = backup.records[i];
        var link = links["id" + item.id + "instance" + item.instance];
        if (!link || link.InstanceID != item.instance) { skipped++; continue; }
        try
        {
            var connector = Repository.GetConnectorByID(item.id);
            if (String(connector.ConnectorGUID) != item.guid) { skipped++; continue; }
            var flags = getFlags(link.Geometry);
            var hide = readStyleFlag(link.Style, "HideLabels");
            if (sameFlags(flags, item.flags) && hide === item.hide && !!link.HiddenLabels === item.hidden)
                continue; // Gia' ripristinata, o modifica non applicata.
            if (!sameFlags(flags, CLEAN_FLAGS) || hide != "0" || link.HiddenLabels)
            {
                skipped++;
                Session.Output("Ripristino saltato per la relazione " + item.id + ": etichette modificate successivamente.");
                continue;
            }
            link.HiddenLabels = item.hidden;
            link.Style = setStyleFlag(link.Style, "HideLabels", item.hide);
            link.Geometry = applyFlags(String(link.Geometry || ""), item.flags);
            if (!link.Update()) throw new Error(link.GetLastError());
            restored++;
        }
        catch (error)
        {
            errors++;
            Session.Output("Ripristino della relazione " + item.id + ": " + errorText(error));
        }
    }
    var currentFlag = readStyleFlag(diagram.StyleEx, "SuppConnectorLabels");
    if (currentFlag !== backup.diagramFlag)
    {
        if (currentFlag == "0" && skipped == 0 && errors == 0)
        {
            diagram.StyleEx = setStyleFlag(diagram.StyleEx, "SuppConnectorLabels", backup.diagramFlag);
            if (!diagram.Update()) { errors++; Session.Output(diagram.GetLastError()); }
        }
        else skipped++;
    }
    Repository.ReloadDiagram(diagram.DiagramID);
    if (skipped == 0 && errors == 0)
    {
        try { store.fso.DeleteFile(store.path); }
        catch (error) { Session.Output("Ripristino completato; file locale conservato: " + errorText(error)); }
    }
    notify("Relazioni ripristinate: " + restored +
        (skipped > 0 ? "\nVoci saltate: " + skipped + ". Relazioni rimosse o etichette modificate.\nIl ripristino resta disponibile." : "") +
        (errors > 0 ? "\nErrori: " + errors + ". Dettagli in Script Output." : ""));
}

function main()
{
    var diagram = Repository.GetCurrentDiagram();
    if (diagram == null)
    {
        notify("Apri il diagramma delle tabelle, poi riesegui lo script.");
        return;
    }
    var selected = diagram.SelectedConnector;
    var selectedId = selected == null ? 0 : selected.ConnectorID;
    var store = storageFor(diagram);
    var action = chooseAction(diagram, selectedId, store);
    if (action == "0") return;
    // Conserva le modifiche del diagramma prima del successivo ReloadDiagram.
    Repository.SaveDiagram(diagram.DiagramID);
    diagram = Repository.GetDiagramByID(diagram.DiagramID);
    if (action == "3") restoreDiagram(diagram, store);
    else cleanDiagram(diagram, selectedId, action == "1", store);
}

try
{
    main();
}
catch (error)
{
    notify("Operazione interrotta.\n" + errorText(error));
}
