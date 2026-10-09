// EA Cardinality Cleaner 0.3.0 - Pulisci diagramma
// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Ahmed Ali
// Standalone EA JScript. Paste the entire file into a Diagram Group script.
// One action, no dialogs, local files or automatic undo.

(function()
{
    var LABELS = ["LLB", "LRB", "LLT", "LRT", "LMT", "LMB", "IRHS", "ILHS"];
    var FLAGS = ["0", "0", "1", "1", "1", "1", "1", "1"];

    function log(message)
    {
        try { Session.Output("[Cardinality Cleaner] " + message); }
        catch (ignored) {} // Logging must not prevent the remaining updates.
    }

    function errorText(error)
    {
        return String(error.description || error.message || error);
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
        if (pattern.test(style)) return style.replace(pattern, "$1" + name + "=" + value);
        return style + (style.length && style.charAt(style.length - 1) != ";" ? ";" : "") + name + "=" + value + ";";
    }

    function setLabelFlag(geometry, name, flag)
    {
        var found = false;
        var pattern = new RegExp("(^|;)(\\$?" + name + "=)([^;]*)", "g");
        var result = geometry.replace(pattern, function(match, separator, label, value)
        {
            found = true;
            if (/(^|:)HDN=/.test(value)) value = value.replace(/(^|:)HDN=[^:]*/g, "$1HDN=" + flag);
            else value += (value.length ? ":" : "") + "HDN=" + flag;
            return separator + label + value;
        });
        if (!found)
            result += (result.length && result.charAt(result.length - 1) != ";" ? ";" : "") +
                (name == "LLB" ? "$LLB" : name) + "=HDN=" + flag + ";";
        return result;
    }

    function main()
    {
        var diagram = Repository.GetCurrentDiagram();
        if (diagram == null) { log("Apri un diagramma e riesegui Pulisci diagramma."); return; }
        var id = diagram.DiagramID;
        // SaveDiagram is a void API; a thrown failure prevents any label writes.
        Repository.SaveDiagram(id);
        diagram = Repository.GetDiagramByID(id);
        if (diagram == null || diagram.DiagramID != id)
            throw new Error("Il diagramma non e' disponibile. Nessuna etichetta modificata.");

        var targets = [];
        var errors = 0;
        var details = 0;
        function report(message)
        {
            errors++;
            if (details < 5) { log(message); details++; }
        }
        for (var i = 0; i < diagram.DiagramLinks.Count; i++)
        {
            try
            {
                var item = diagram.DiagramLinks.GetAt(i);
                if (!item.IsHidden) targets.push(item);
            }
            catch (error) { report("Lettura relazione " + (i + 1) + ": " + errorText(error)); }
        }
        if (targets.length == 0)
        {
            log(errors ? "Nessuna relazione leggibile. Errori: " + errors + "." : "Nessuna relazione visibile da pulire.");
            return;
        }

        var refresh = false;
        var updated = 0;
        var unchanged = 0;
        try
        {
            if (readStyleFlag(diagram.StyleEx, "SuppConnectorLabels") == "1")
            {
                refresh = true;
                diagram.StyleEx = setStyleFlag(diagram.StyleEx, "SuppConnectorLabels", "0");
                if (!diagram.Update()) throw new Error("Diagramma non aggiornabile: " + diagram.GetLastError());
            }
            for (var i = 0; i < targets.length; i++)
            {
                var link = targets[i];
                try
                {
                    var geometry = String(link.Geometry || "");
                    for (var j = 0; j < LABELS.length; j++) geometry = setLabelFlag(geometry, LABELS[j], FLAGS[j]);
                    var style = setStyleFlag(link.Style, "HideLabels", "0");
                    if (geometry == String(link.Geometry || "") && style == String(link.Style || "") && !link.HiddenLabels)
                    {
                        unchanged++;
                        continue;
                    }
                    refresh = true;
                    link.HiddenLabels = false;
                    link.Style = style;
                    link.Geometry = geometry;
                    if (!link.Update()) throw new Error(link.GetLastError());
                    updated++;
                }
                catch (error) { report("Relazione " + (i + 1) + ": " + errorText(error)); }
            }
        }
        finally
        {
            if (refresh)
            {
                try { Repository.ReloadDiagram(id); }
                catch (error) { report("Aggiornamento vista: " + errorText(error)); }
            }
        }
        log("Aggiornate: " + updated + "; gia' corrette: " + unchanged + "; errori: " + errors + "." +
            (errors > details ? " Mostrati i primi " + details + " dettagli." : ""));
    }

    try { main(); }
    catch (error) { log("Pulizia interrotta: " + errorText(error)); }
})();
