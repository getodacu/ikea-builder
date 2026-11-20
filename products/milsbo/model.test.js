import assert from 'node:assert/strict';
import test from 'node:test';
import { sample } from '../../src/timeline.js';
import { manual, pageLink, previewPages } from './manual.js';
import { compile } from './model.js';
import product from './product.js';

const printedPages=[8,9,9,10,10,11,12,12,13,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33];
const ends=(t,n)=>sample(t,n,1);
const placeIds=record=>record.events.filter(e=>e.kind==='place').flatMap(e=>e.ids);

test('exact printed pages, warnings and reconciled stock in the 30-step edition',()=>{
  const t=compile({});
  assert.deepEqual(t.order,Array.from({length:31},(_,i)=>i));
  assert.deepEqual([...t.steps.values()].map(s=>s.page),printedPages);
  assert.equal(manual.id,'AA-2094158-9-100');
  assert.equal(manual.footer,'AA-2094158-9');
  assert.equal(manual.date,'2024-03-14');
  assert.equal(manual.pages,36);
  assert.equal(manual.sha256,'531fa0a5e67132a5b1b18bb79e9167693304f9d820ad6438fe6071ba63cf1e95');
  assert.deepEqual([...previewPages],Array.from({length:27},(_,i)=>i+7));
  assert.equal(pageLink(t.steps.get(30).page),'https://www.ikea.com/us/en/assembly_instructions/milsbo-glass-door-cabinet-anthracite__AA-2094158-9-100.pdf#page=33');
  assert.deepEqual(product.references[30].map(([,page])=>page),[32,34]);
  assert.match(pageLink(product.references[30][1][1]),/\.pdf#page=34$/);
  assert.match(product.unbox.warning.text,/fatal crushing/);
  assert.equal(product.unbox.warning.page,2);
  for(const n of [13,14,15,16,17,18,19,20]) assert.equal(t.steps.get(n).warning.page,16);
  assert.equal(t.steps.get(28).warning.page,31);
  assert.equal(t.steps.get(30).warning.page,32);
  assert.deepEqual(product.references[0].map(([,page])=>page),[2,6]);
  assert.deepEqual(product.references[29].map(([,page])=>page),[2]);

  const inventory={}, external=[];
  for(const {id,family} of product.parts.values()) {
    inventory[family]=(inventory[family]??0)+1;
    if(product.families[family].role==='external') external.push(id);
  }
  assert.deepEqual(inventory,{leg:4,longRail:2,endRail:2,tray:1,floor:1,post:4,mullion:1,roof:1,rearPane:2,sidePane:2,door:2,shelf:3,
    195313:4,115461:18,105103:4,100404:23,100408:4,10003221:3,10003241:12,195311:2,151059:2,195362:2,10002580:2,10002394:2,
    106989:2,130445:1,wallPoint:2});
  assert.deepEqual(external,['wallPoint-1','wallPoint-2']);
  assert.equal(product.parts.size-external.length,106);
  const placed=[...t.steps.values()].flatMap(placeIds);
  assert.equal(placed.length,106);
  assert.equal(new Set(placed).size,106);
  assert.deepEqual([...product.parts.keys()].filter(id=>!placed.includes(id)),['10002394-2','130445-1']);
  assert.deepEqual(ends(t,30).installed,placed);
  assert.equal(Object.keys(ends(t,30).poses).length,placed.length);
});

test('every boundary replays identically on forward, back, seek and fresh compile',()=>{
  const t=compile({}), fresh=compile({});
  const after=t.order.map(n=>ends(t,n));
  assert.deepEqual(t.steps.get(1).start,{poses:{},installed:[],active:[],joint:null,captive:{}});
  for(const n of [...t.order].reverse()) {
    assert.deepEqual(ends(t,n),after[n]);
    assert.deepEqual(ends(fresh,n),after[n]);
    if(n>1) assert.deepEqual(t.steps.get(n).start,after[n-1]);
  }
  for(const n of [9,13,24,26,29,30]) {
    const a=sample(t,n,.52);
    assert.deepEqual(sample(fresh,n,.52),a);
    assert.deepEqual(sample(t,n,.52),a);
  }
  const turn=t.steps.get(13).events[0];
  assert.equal(turn.kind,'move');
  assert.deepEqual(new Set(turn.ids),new Set(ends(t,12).installed));
  assert.equal(turn.before.poses.mullion[2],194);
  assert.equal(turn.after.poses.mullion[2],-194);
  assert.deepEqual(placeIds(t.steps.get(13)),['rearL','rearR']);
  for(const n of [16,18,19]) assert.equal(placeIds(t.steps.get(n)).filter(id=>id.startsWith('10003241-')).length,4);
  assert.deepEqual(t.steps.get(20).events.filter(e=>e.kind==='adjust').flatMap(e=>e.ids),['115461-15','115461-16','115461-17','115461-18']);
  assert.deepEqual(t.steps.get(21).events.flatMap(e=>e.ids),['100404-2']);
});

test('door bolts travel with the left frame, one pull goes on each door, and anchoring precedes shelving',()=>{
  const t=compile({});
  const [left,right]=t.steps.get(24).events;
  assert.deepEqual(left.ids,['doorL','195311-1','100408-1','100408-2','195311-2','100408-3','100408-4']);
  assert.deepEqual(right.ids,['doorR']);
  assert.deepEqual(left.op.prerequisites,['151059-1']);
  assert.deepEqual(right.op.prerequisites,['151059-2']);
  const separation=({poses})=>Math.hypot(...poses['195311-1'].slice(0,3).map((value,i)=>value-poses.doorL[i]));
  const inFlight=sample(t,24,(left.t0+left.t1)/2);
  assert.ok(Math.abs(separation(inFlight)-separation(left.before))<1e-7);
  assert.ok(Math.abs(separation(left.after)-separation(left.before))<1e-7);

  const handles=t.steps.get(26);
  assert.equal(handles.page,29);
  assert.deepEqual(handles.events.map(e=>e.ids[0]),['10002580-1','100404-18','100404-19','10002580-2','100404-20','100404-21']);
  assert.deepEqual(handles.events.filter(e=>e.ids[0].startsWith('10002580')).map(e=>e.op.prerequisites),[['doorL'],['doorR']]);
  for(const n of [25,26,27,28,29,30]) assert.equal(ends(t,n).installed.filter(id=>/^door[LR]$/.test(id)).length,2);
  assert.deepEqual(t.steps.get(28).events.filter(e=>e.kind==='adjust').flatMap(e=>e.ids),['195313-1','195313-2','195313-3','195313-4']);
  assert.deepEqual(ends(t,29).installed.filter(id=>id.startsWith('wallPoint-')),['wallPoint-1','wallPoint-2']);
  assert.ok(ends(t,29).installed.every(id=>!id.startsWith('shelf-')));
  assert.match(t.steps.get(29).warning.text,/not included/);
  assert.equal(t.steps.get(29).warning.page,2);
  assert.deepEqual(placeIds(t.steps.get(30)),['shelf-1','shelf-2','shelf-3']);
  assert.ok(t.steps.get(30).events.every(e=>['wallPoint-1','wallPoint-2'].every(id=>e.op.prerequisites.includes(id))));
});
