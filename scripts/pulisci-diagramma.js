// EA Cardinality Cleaner 0.2.0 - Pulisci diagramma
// Standalone JScript: paste the complete file into an EA Diagram Group.
// Generated from src/cleaner.js. No includes or text input required.

// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Ahmed Ali
// Shared source; install the generated standalone scripts instead.

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

function visibleLinks(diagram)
{
    var targets = [];
    for (var i = 0; i < diagram.DiagramLinks.Count; i++)
    {
        var link = diagram.DiagramLinks.GetAt(i);
        if (!link.IsHidden) targets.push(link);
    }
    return targets;
}

function cleanDiagram(diagram, store)
{
    var targets = visibleLinks(diagram);
    if (targets.length == 0)
    {
        notify("Non ci sono relazioni visibili da aggiornare.");
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
        notify("Le relazioni mostrano gia' solo le cardinalita'." +
            (store.fso.FileExists(store.path) ? "\nIl ripristino precedente resta disponibile." : ""));
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
    notify("Relazioni aggiornate: " + updated +
        (errors > 0 ? "\nErrori: " + errors + ". Alcune relazioni non sono state aggiornate.\nDettagli in Script Output." :
            "\nCardinalita' visibili; altre etichette nascoste.") +
        "\n\nPer annullare, avvia Ripristina.");
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

function main(action)
{
    var diagram = Repository.GetCurrentDiagram();
    if (diagram == null)
    {
        notify("Apri il diagramma delle tabelle, poi riesegui lo script.");
        return;
    }
    var store = storageFor(diagram);
    if (action == "restore" && !store.fso.FileExists(store.path))
    {
        notify("Non c'e' un ripristino per questo diagramma.");
        return;
    }
    if (action == "clean" && visibleLinks(diagram).length == 0)
    {
        notify("Non ci sono relazioni visibili da aggiornare.");
        return;
    }
    // Conserva le modifiche del diagramma prima del successivo ReloadDiagram.
    Repository.SaveDiagram(diagram.DiagramID);
    diagram = Repository.GetDiagramByID(diagram.DiagramID);
    if (action == "restore") restoreDiagram(diagram, store);
    else cleanDiagram(diagram, store);
}

try
{
    main("clean");
}
catch (error)
{
    notify("Operazione interrotta.\n" + errorText(error));
}
