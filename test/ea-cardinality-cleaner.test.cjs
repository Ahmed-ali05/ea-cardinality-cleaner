// SPDX-License-Identifier: MIT
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const { test } = require('node:test');
const source = fs.readFileSync(path.join(__dirname, '../scripts/pulisci-diagramma.js'), 'utf8');
const geometry = 'SX=17;SY=-5;EDGE=3;$LLB=CX=10:HDN=1:CLR=-1;LRB=HDN=1;LLT=HDN=0;LRT=;LMT=HDN=0:OX=55;LMB=;IRHS=;ILHS=;';
const labels = ['LLB','LRB','LLT','LRT','LMT','LMB','IRHS','ILHS'];
function row(id, hidden=false) { return {id,geometry,style:'Mode=3;Color=16;HideLabels=1;',hidden}; }
function fixture(rows=[row(1),row(2)], style='Other=1;SuppConnectorLabels=1;') {
    return {rows,style,outputs:[],calls:[],linkUpdates:0,diagramUpdates:0,reloads:0,
        dialogs:0,input:0,files:0,failIds:new Set(),readFailIds:new Set(),indexFail:new Set()};
}
function flag(text,label) {
    const segment = new RegExp('(?:^|;)\\$?'+label+'=([^;]*)').exec(text);
    const match = segment && /(?:^|:)HDN=([^:]*)/.exec(segment[1]);
    return match ? match[1] : null;
}
function execute(s) {
    function diagram() {
        return {
            DiagramID:7,StyleEx:s.style,
            get SelectedConnector() { throw Error('Selection must not change scope'); },
            DiagramLinks:{Count:s.rows.length,GetAt(i) {
                if (s.indexFail.has(i)) throw Error('unreadable instance');
                const r=s.rows[i];
                const link={ConnectorID:r.id,Style:r.style,IsHidden:r.hidden,
                    Update() {
                        if (s.failIds.has(r.id)) return false;
                        r.geometry=this.Geometry;r.style=this.Style;s.linkUpdates++;return true;
                    },GetLastError:()=> 'access denied'};
                let current=r.geometry;
                Object.defineProperty(link,'Geometry',{
                    get() {if(s.readFailIds.has(r.id)) throw Error('geometry unreadable');return current;},
                    set(v) {current=v;}
                });
                Object.defineProperty(link,'HiddenLabels',{
                    get() {return /(?:^|;)HideLabels=1(?:;|$)/.test(this.Style);},
                    set(hidden) {this.Style=this.Style.replace(/(^|;)HideLabels=[^;]*/g,'$1')+'HideLabels='+(hidden?'1':'0')+';';}
                });
                return link;
            }},
            Update() {if(s.failDiagram) return false;s.style=this.StyleEx;s.diagramUpdates++;return true;},
            GetLastError:()=> 'diagram locked'
        };
    }
    const context={
        Repository:{
            GetCurrentDiagram:()=>s.noDiagram?null:diagram(),
            SaveDiagram() {s.calls.push('save');if(s.failSave) throw Error('save failed');if(s.onSave)s.onSave();},
            GetDiagramByID() {s.calls.push('read');return s.missingAfterSave?null:diagram();},
            GetConnectorByID() {throw Error('Must not read or edit model connector objects');},
            ReloadDiagram() {s.calls.push('reload');s.reloads++;if(s.failReload)throw Error('refresh failed');}
        },
        Session:{Output(text) {if(s.failLog)throw Error('output unavailable');s.outputs.push(text);},
            Input() {s.input++;throw Error('No input allowed');},Prompt() {s.dialogs++;throw Error('No dialogs allowed');}},
        ActiveXObject() {s.files++;throw Error('No file or shell COM access allowed');}
    };
    vm.runInNewContext(source,context);
    assert.equal(s.input,0);assert.equal(s.dialogs,0);assert.equal(s.files,0);
}
function assertClean(r) {
    for(const label of labels)assert.equal(flag(r.geometry,label),['LLB','LRB'].includes(label)?'0':'1');
}

test('No open diagram logs guidance without modal UI or saves',()=>{
    const s=fixture();s.noDiagram=true;execute(s);
    assert.equal(s.calls.length,0);assert.match(s.outputs[0],/Apri un diagramma/);
});
test('Clean keeps both cardinalities and preserves hidden relationships, positions and styles',()=>{
    const s=fixture([row(1),row(2),row(3,true)]);execute(s);
    for(const r of s.rows.slice(0,2)) {
        assertClean(r);assert.match(r.geometry,/SX=17;SY=-5;EDGE=3;/);assert.match(r.geometry,/OX=55/);
        assert.match(r.style,/Color=16/);assert.match(r.style,/Mode=3/);
    }
    assert.equal(s.rows[2].geometry,geometry);assert.match(s.rows[2].style,/HideLabels=1/);
    assert.match(s.style,/Other=1;SuppConnectorLabels=0/);assert.equal(s.reloads,1);
    assert.match(s.outputs.at(-1),/Aggiornate: 2/);
});
test('Repeated clean makes no database updates or diagram reloads',()=>{
    const s=fixture();execute(s);const updates=s.linkUpdates;const diagramUpdates=s.diagramUpdates;const reloads=s.reloads;
    execute(s);assert.equal(s.linkUpdates,updates);assert.equal(s.diagramUpdates,diagramUpdates);assert.equal(s.reloads,reloads);
    assert.match(s.outputs.at(-1),/Aggiornate: 0; gia' corrette: 2/);
});
test('Absent or empty geometry gets the required flags',()=>{
    const s=fixture([row(1),row(2)],'Other=1;');s.rows[0].geometry=null;s.rows[1].geometry='';execute(s);
    s.rows.forEach(assertClean);assert.equal(s.diagramUpdates,0);assert.equal(s.style,'Other=1;');
});
test('Dollar-prefixed and plain LLB geometries keep unrelated fields',()=>{
    const s=fixture([row(1),row(2)]);s.rows[1].geometry=geometry.replace('$LLB=','LLB=');execute(s);
    s.rows.forEach(assertClean);assert.match(s.rows[0].geometry,/\$LLB=CX=10:HDN=0:CLR=-1/);
    assert.match(s.rows[1].geometry,/;LLB=CX=10:HDN=0:CLR=-1/);
});
test('One failed Update does not prevent later relationships from cleaning',()=>{
    const s=fixture();s.failIds.add(1);execute(s);
    assert.equal(s.rows[0].geometry,geometry);assertClean(s.rows[1]);assert.equal(s.reloads,1);
    assert.match(s.outputs.at(-1),/Aggiornate: 1; gia' corrette: 0; errori: 1/);
});
test('Unreadable geometry on one link does not prevent cleaning the next',()=>{
    const s=fixture();s.readFailIds.add(1);execute(s);
    assert.equal(s.rows[0].geometry,geometry);assertClean(s.rows[1]);assert.match(s.outputs.at(-1),/errori: 1/);
});
test('An unreadable collection entry is skipped, without aborting the remaining entries',()=>{
    const s=fixture();s.indexFail.add(0);execute(s);
    assert.equal(s.rows[0].geometry,geometry);assertClean(s.rows[1]);assert.match(s.outputs.at(-1),/errori: 1/);
});
test('A locked diagram with global label suppression prevents ineffective link writes',()=>{
    const s=fixture();s.failDiagram=true;execute(s);
    assert.equal(s.linkUpdates,0);assert.equal(s.diagramUpdates,0);assert.equal(s.rows[0].geometry,geometry);
    assert.equal(s.reloads,1);assert.match(s.outputs.at(-1),/diagram locked/);
});
test('No visible relationships leave global settings unchanged',()=>{
    const s=fixture([row(1,true)]);execute(s);
    assert.equal(s.linkUpdates,0);assert.equal(s.diagramUpdates,0);assert.equal(s.reloads,0);
    assert.match(s.outputs[0],/Nessuna relazione visibile/);
});
test('Save failure stops before modifying labels',()=>{
    const s=fixture();s.failSave=true;execute(s);
    assert.equal(s.linkUpdates,0);assert.equal(s.diagramUpdates,0);assert.equal(s.reloads,0);
    assert.match(s.outputs.at(-1),/save failed/);
});
test('Diagram disappearing after save produces a diagnostic without writes',()=>{
    const s=fixture();s.missingAfterSave=true;execute(s);
    assert.equal(s.linkUpdates,0);assert.equal(s.diagramUpdates,0);assert.match(s.outputs.at(-1),/non e' disponibile/);
});
test('Pending diagram edits are saved before reading links and reloading once',()=>{
    const s=fixture();s.onSave=()=>{s.rows.push(row(3));};execute(s);
    assert.equal(s.rows.length,3);s.rows.forEach(assertClean);assert.deepEqual(s.calls,['save','read','reload']);
});
test('Refresh failure leaves successful updates intact and logs the limitation',()=>{
    const s=fixture();s.failReload=true;execute(s);
    s.rows.forEach(assertClean);assert.match(s.outputs.at(-1),/Aggiornate: 2.*errori: 1/);
});
test('A broken output pane cannot prevent cleanup',()=>{
    const s=fixture();s.failLog=true;s.failIds.add(1);execute(s);
    assertClean(s.rows[1]);assert.equal(s.reloads,1);
});
test('Many failures cap diagnostic output without stopping the iteration',()=>{
    const s=fixture(Array.from({length:25},(_,i)=>row(i+1)),'Other=1;');
    s.rows.forEach(r=>s.failIds.add(r.id));execute(s);
    assert.equal(s.outputs.length,6);assert.match(s.outputs.at(-1),/errori: 25.*primi 5/);
});
test('A larger diagram updates only new links after the first run',()=>{
    const s=fixture(Array.from({length:400},(_,i)=>row(i+1)));execute(s);
    assert.equal(s.linkUpdates,400);assert.equal(s.reloads,1);
    s.rows.push(row(401));execute(s);assert.equal(s.linkUpdates,401);assert.equal(s.reloads,2);
    assert.match(s.outputs.at(-1),/Aggiornate: 1; gia' corrette: 400/);
});
