// SPDX-License-Identifier: MIT
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const { test } = require('node:test');
const sources = {
    clean: fs.readFileSync(path.join(__dirname, '../scripts/pulisci-diagramma.js'), 'utf8'),
    restore: fs.readFileSync(path.join(__dirname, '../scripts/ripristina.js'), 'utf8')
};
const initialGeometry = 'SX=17;SY=-5;EDGE=3;$LLB=CX=10:HDN=1:CLR=-1;LRB=HDN=1;LLT=HDN=0;LRT=;LMT=HDN=0:OX=55;LMB=;IRHS=;ILHS=;';
const freshGeometry = 'SX=17;SY=-5;EDGE=3;$LLB=;LRB=;LLT=;LRT=;LMT=;LMB=;IRHS=;ILHS=;';

function row(id, geometry = initialGeometry, hidden = false) {
    return { id, instance: 100 + id, guid: '{CONNECTOR-' + id + '}', geometry, style: 'Mode=3;Color=16;HideLabels=1;', hidden };
}
function fixture(rows = [row(1), row(2)], style = 'Other=1;SuppConnectorLabels=1;') {
    return { rows, style, files: new Map(), folders: new Set(['C:\\Local']), saveCalls: 0, updateCalls: 0,
        reloadCalls: 0, fsCalls: 0, serial: 0, inputCalls: 0, notices: [], outputs: [], failIds: new Set() };
}
function execute(state, command = 'clean', selectedId = 0, noDiagram = false) {
    const fso = {
        BuildPath: (a, b) => a + '\\' + b,
        FolderExists: p => state.folders.has(p),
        CreateFolder: p => { state.folders.add(p); state.fsCalls++; },
        FileExists: p => state.files.has(p),
        GetTempName: () => 'temp-' + (++state.serial),
        CreateTextFile: p => {
            state.fsCalls++;
            if (state.failWrite) throw new Error('write denied');
            state.files.set(p, '');
            return { Write: text => state.files.set(p, text), Close: () => {} };
        },
        OpenTextFile: p => { if (!state.files.has(p)) throw new Error('file missing'); return { ReadAll: () => state.files.get(p), Close: () => {} }; },
        DeleteFile: p => state.files.delete(p),
        MoveFile: (from, to) => {
            if (state.failMove && /temp-/.test(from) && !to.endsWith('.previous')) throw new Error('move denied');
            if (!state.files.has(from)) throw new Error('file missing');
            state.files.set(to, state.files.get(from)); state.files.delete(from);
        }
    };
    function diagram() {
        return {
            DiagramID: 7, DiagramGUID: '{DIAGRAM-7}', Name: 'Ordini', StyleEx: state.style,
            SelectedConnector: selectedId ? { ConnectorID: selectedId } : null,
            DiagramLinks: {
                Count: state.rows.length,
                GetAt: i => {
                    const r = state.rows[i];
                    const link = { ConnectorID: r.id, InstanceID: r.instance, Geometry: r.geometry, Style: r.style, IsHidden: r.hidden,
                        Update() {
                            if (state.failIds.has(r.id)) return false;
                            r.geometry = this.Geometry; r.style = this.Style; state.updateCalls++; return true;
                        }, GetLastError: () => 'access denied' };
                    Object.defineProperty(link, 'HiddenLabels', {
                        get() { return /(?:^|;)HideLabels=1(?:;|$)/.test(this.Style); },
                        set(hidden) {
                            this.Style = this.Style.replace(/(^|;)HideLabels=[^;]*/g, '$1') + 'HideLabels=' + (hidden ? '1' : '0') + ';';
                        }
                    });
                    return link;
                }
            },
            Update() { if (state.failDiagram) return false; state.style = this.StyleEx; state.updateCalls++; return true; },
            GetLastError: () => 'diagram locked'
        };
    }
    const context = {
        Repository: {
            ConnectionString: 'C:\\Models\\Sales.qea',
            GetCurrentDiagram: () => noDiagram ? null : diagram(),
            SaveDiagram: () => state.saveCalls++, GetDiagramByID: () => diagram(),
            GetConnectorByID: id => { const r = state.rows.find(r => r.id === id); if (!r) throw new Error('deleted'); return { ConnectorGUID: r.guid }; },
            ReloadDiagram: () => state.reloadCalls++
        },
        Session: { Input: () => { state.inputCalls++; throw new Error('Text input must not be requested'); },
            Output: text => state.outputs.push(text), Prompt: text => { state.notices.push(text); return 1; } },
        ActiveXObject: function (name) {
            if (name === 'Scripting.FileSystemObject') return fso;
            if (name === 'WScript.Shell') return { ExpandEnvironmentStrings: () => 'C:\\Local' };
            throw new Error('Unknown COM object');
        }
    };
    vm.createContext(context);
    vm.runInContext(sources[command], context);
    return context;
}
function backupPath(s) { return [...s.files.keys()].find(p => p.endsWith('.txt')); }
function flag(geometry, label) {
    const segment = new RegExp('(?:^|;)\\$?' + label + '=([^;]*)').exec(geometry);
    if (!segment) return null;
    const value = /(?:^|:)HDN=([^:]*)/.exec(segment[1]);
    return value ? value[1] : null;
}

test('No diagram produces a usable message without changing anything', () => {
    const s = fixture(); execute(s, 'clean', 0, true);
    assert.match(s.notices[0], /Apri il diagramma/); assert.equal(s.saveCalls, 0); assert.equal(s.fsCalls, 0);
});
test('Restore without a snapshot explains what happened without saving or updating', () => {
    const s = fixture(); execute(s, 'restore');
    assert.equal(s.saveCalls, 0); assert.equal(s.fsCalls, 0); assert.equal(s.updateCalls, 0);
    assert.equal(s.inputCalls, 0); assert.match(s.notices.at(-1), /Non c'e' un ripristino/);
});
test('All visible relations retain both cardinalities; hidden links stay unchanged', () => {
    const s = fixture([row(1), row(2, freshGeometry), row(3, initialGeometry, true)]);
    execute(s, 'clean');
    for (const r of s.rows.slice(0, 2)) {
        assert.equal(flag(r.geometry, 'LLB'), '0'); assert.equal(flag(r.geometry, 'LRB'), '0');
        for (const label of ['LLT', 'LRT', 'LMT', 'LMB', 'IRHS', 'ILHS']) assert.equal(flag(r.geometry, label), '1');
        assert.match(r.geometry, /SX=17;SY=-5;EDGE=3;/); assert.match(r.style, /Color=16/);
    }
    assert.equal(s.rows[2].geometry, initialGeometry); assert.match(s.style, /SuppConnectorLabels=0/);
    assert.ok(backupPath(s)); assert.match(s.notices.at(-1), /Relazioni aggiornate: 2/);
});
test('Clean always applies to the whole diagram even when a connector is selected', () => {
    const s = fixture(undefined, 'Other=1;'); execute(s, 'clean', 1);
    for (const r of s.rows) assert.equal(flag(r.geometry, 'LLB'), '0');
    assert.equal(s.style, 'Other=1;'); assert.match(s.notices.at(-1), /Relazioni aggiornate: 2/);
});
test('Both direct commands run without requesting text input', () => {
    const s = fixture(); execute(s, 'clean'); execute(s, 'restore');
    assert.equal(s.inputCalls, 0); assert.equal(flag(s.rows[0].geometry, 'LLB'), '1');
    assert.match(s.notices.at(-1), /Relazioni ripristinate: 2/);
});
test('Idempotent run preserves the previous undo file', () => {
    const s = fixture(); execute(s, 'clean'); const p = backupPath(s); const contents = s.files.get(p); const count = s.updateCalls;
    execute(s, 'clean'); assert.equal(s.files.get(p), contents); assert.equal(s.updateCalls, count); assert.match(s.notices.at(-1), /gia' solo/);
});
test('Restore recovers visibility while keeping later line moves, colors, and styles', () => {
    const s = fixture(); execute(s, 'clean');
    s.rows[0].geometry = s.rows[0].geometry.replace('SX=17', 'SX=999').replace('OX=55', 'OX=88');
    s.rows[0].style = s.rows[0].style.replace('Color=16', 'Color=55') + 'LWidth=3;';
    s.style += 'HandDraw=1;'; execute(s, 'restore');
    assert.equal(flag(s.rows[0].geometry, 'LLB'), '1'); assert.equal(flag(s.rows[0].geometry, 'LRB'), '1');
    assert.equal(flag(s.rows[0].geometry, 'LLT'), '0'); assert.equal(flag(s.rows[0].geometry, 'LRT'), null);
    assert.match(s.rows[0].geometry, /SX=999/); assert.match(s.rows[0].geometry, /OX=88/);
    assert.match(s.rows[0].style, /Color=55/); assert.match(s.rows[0].style, /LWidth=3/);
    assert.match(s.style, /SuppConnectorLabels=1/); assert.match(s.style, /HandDraw=1/); assert.equal(backupPath(s), undefined);
});
test('Restore respects manual label edits and keeps retry available', () => {
    const s = fixture(); execute(s, 'clean'); s.rows[0].geometry = s.rows[0].geometry.replace('LLT=HDN=1', 'LLT=HDN=0');
    execute(s, 'restore'); assert.equal(flag(s.rows[0].geometry, 'LLT'), '0'); assert.equal(flag(s.rows[0].geometry, 'LLB'), '0');
    assert.equal(flag(s.rows[1].geometry, 'LLB'), '1'); assert.ok(backupPath(s)); assert.match(s.style, /SuppConnectorLabels=0/);
});
test('Restore removes originally absent flags and preserves new coordinate values', () => {
    const s = fixture([row(1, freshGeometry)], 'Other=1;'); execute(s, 'clean');
    s.rows[0].geometry = s.rows[0].geometry.replace('$LLB=HDN=0', '$LLB=HDN=0:CX=123'); execute(s, 'restore');
    assert.equal(flag(s.rows[0].geometry, 'LLB'), null); assert.match(s.rows[0].geometry, /\$LLB=CX=123/); assert.equal(s.style, 'Other=1;');
});
test('Backup write failure prevents all label updates', () => {
    const s = fixture(); s.failWrite = true; execute(s, 'clean');
    assert.equal(s.updateCalls, 0); assert.equal(s.rows[0].geometry, initialGeometry); assert.match(s.notices.at(-1), /Nessuna etichetta/);
});
test('Failed backup replacement retains the previous undo', () => {
    const s = fixture(); execute(s, 'clean'); const p = backupPath(s); const contents = s.files.get(p);
    s.rows.push(row(3)); s.failMove = true; const count = s.updateCalls; execute(s, 'clean');
    assert.equal(s.files.get(p), contents); assert.equal(s.updateCalls, count); assert.equal(s.rows[2].geometry, initialGeometry);
});
test('Partial update failures can restore the links actually changed', () => {
    const s = fixture(); s.failIds.add(1); execute(s, 'clean'); assert.match(s.notices.at(-1), /Errori: 1/);
    s.failIds.clear(); execute(s, 'restore'); assert.equal(flag(s.rows[1].geometry, 'LLB'), '1'); assert.equal(backupPath(s), undefined);
});
test('Deleted or replaced connectors are not restored onto different relationships', () => {
    const s = fixture(); execute(s, 'clean'); s.rows[0].guid = '{NEW-CONNECTOR}'; execute(s, 'restore');
    assert.equal(flag(s.rows[0].geometry, 'LLB'), '0'); assert.equal(flag(s.rows[1].geometry, 'LLB'), '1'); assert.ok(backupPath(s));
});
test('No visible relations produces an explanatory result', () => {
    const s = fixture([]); execute(s, 'clean'); assert.equal(s.updateCalls, 0); assert.equal(s.fsCalls, 0); assert.match(s.notices.at(-1), /Non ci sono/);
});
test('Restore with no open diagram does not attempt file access', () => {
    const s = fixture(); execute(s, 'restore', 0, true);
    assert.match(s.notices.at(-1), /Apri il diagramma/);
    assert.equal(s.saveCalls, 0); assert.equal(s.fsCalls, 0); assert.equal(s.inputCalls, 0);
});
test('Invalid backup flags are rejected before restore writes', () => {
    const s = fixture(); execute(s, 'clean'); const p = backupPath(s);
    s.files.set(p, s.files.get(p).replace(/\t1\t1\t0\t/, '\t2\t1\t0\t'));
    const count = s.updateCalls; execute(s, 'restore');
    assert.equal(s.updateCalls, count); assert.match(s.notices.at(-1), /non valido/);
});
test('Multiple diagram-link instances of one connector restore independently', () => {
    const a = row(1); const b = row(1, freshGeometry); b.instance = 500;
    const s = fixture([a, b]); execute(s, 'clean'); execute(s, 'restore');
    assert.equal(flag(s.rows[0].geometry, 'LLB'), '1'); assert.equal(flag(s.rows[1].geometry, 'LLB'), null);
    assert.equal(backupPath(s), undefined);
});
test('A global-only change can be restored without changing relationship geometry', () => {
    const s = fixture(); execute(s, 'clean'); execute(s, 'restore');
    execute(s, 'clean'); const geometry = s.rows[0].geometry; s.style = 'Other=1;SuppConnectorLabels=1;';
    execute(s, 'clean'); assert.match(s.style, /SuppConnectorLabels=0/); execute(s, 'restore');
    assert.match(s.style, /SuppConnectorLabels=1/); assert.equal(s.rows[0].geometry, geometry);
});
test('A locked diagram prevents application and retains the recovery snapshot', () => {
    const s = fixture(); s.failDiagram = true; execute(s, 'clean');
    assert.equal(s.updateCalls, 0); assert.equal(s.rows[0].geometry, initialGeometry);
    assert.ok(backupPath(s)); assert.match(s.notices.at(-1), /diagram locked/);
});
test('The new Restore command reads an undo snapshot produced by v0.1.1', () => {
    const legacy = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/v0.1.1-undo.json'), 'utf8'));
    const s = fixture(legacy.rows, legacy.style); s.files = new Map(legacy.files);
    execute(s, 'restore');
    for (const label of ['LLB', 'LRB', 'LLT', 'LRT', 'LMT', 'LMB', 'IRHS', 'ILHS']) {
        assert.equal(flag(s.rows[0].geometry, label), flag(initialGeometry, label));
    }
    assert.match(s.style, /SuppConnectorLabels=1/);
    assert.match(s.rows[0].style, /HideLabels=1/);
    assert.equal(backupPath(s), undefined); assert.equal(s.inputCalls, 0);
});
