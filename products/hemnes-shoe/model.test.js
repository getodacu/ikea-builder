import assert from 'node:assert/strict';
import test from 'node:test';
import { sample } from '../../src/timeline.js';
import { compile } from './model.js';
import { manual, pageLink, previewPages } from './manual.js';
import product from './product.js';

const printedPages=[7,7,7,8,8,9,9,10,10,11,11,12,12,13,13,14,14,15,15,16,17,18,18,19,19,20,20,21,21,22,22,22,22,23,23,23,24];
const added=record=>record.events.filter(e=>e.kind==='place').flatMap(e=>e.ids);

test('pinned 37-step route, source targets, warnings, and wall-dependent order',()=>{
  const t=compile({});
  assert.equal(manual.id,'AA-571176-10-100');
  assert.equal(manual.footer,'AA-571176-10');
  assert.equal(manual.pages,24);
  assert.equal(manual.date,'2024-04-08');
  assert.equal(manual.sha256,'2c81fc2435cbabf81f9ac781f5733417319d61bc4b8d657c580044dd3e56643d');
  assert.deepEqual(t.order,Array.from({length:38},(_,i)=>i));
  assert.deepEqual([...t.steps.values()].map(s=>s.page),printedPages);
  assert.deepEqual([...previewPages],Array.from({length:19},(_,i)=>i+6));
  assert.match(pageLink(t.steps.get(37).page),/white__AA-571176-10-100\.pdf#page=24$/);
  assert.match(product.unbox.warning.text,/fatal crushing/i);
  assert.equal(product.unbox.warning.page,2);
  assert.match(product.unbox.action,/two people/i);
  const anchor=t.steps.get(21);
  assert.match(anchor.warning.text,/not supplied.*suitable for your wall.*professional advice/i);
  assert.equal(anchor.warning.page,2);
  assert.match(anchor.action,/before fitting the bins/i);
  assert.match(pageLink(anchor.page),/#page=17$/);
  assert.match(pageLink(product.references[21][0][1]),/#page=2$/);
  assert.deepEqual(anchor.events.map(e=>e.kind),['move','place']);
  assert.deepEqual(anchor.events[1].op.prerequisites,['wallBrace']);
  assert.deepEqual(added(anchor),['wall-1','wall-2']);
  assert.deepEqual(added(t.steps.get(22)),['lowerLiner','lowerCheekR','upperLiner','upperCheekR']);
  assert.deepEqual(t.steps.get(28).events[0].op.prerequisites.slice(-2),['wall-1','wall-2']);
});

test('p. 6 packet stock, unnumbered pieces, tools, and external markers reconcile',()=>{
  const t=compile({}), counts={};
  for(const {family} of product.parts.values()) counts[family]=(counts[family]??0)+1;
  assert.deepEqual(counts,{frontStile:2,side:2,trim:4,rearStile:2,frontCross:4,rearCross:2,top:1,
    liner:2,cheek:4,partition:2,binFront:2,drawerFront:1,drawerSide:2,drawerBase:1,drawerRear:1,
    115917:4,100223:2,110519:4,118331:22,101350:24,100295:14,100414:6,151930:12,100347:12,116713:4,
    107271:2,106720:8,102533:14,110364:4,117615:6,100006:1,100092:1,108462:8,wall:2});
  const supplied=[...product.parts.values()].filter(p=>product.families[p.family].role!=='external');
  assert.equal(supplied.length,180);
  assert.equal(product.families.wall.group,'Required, not supplied');
  assert.deepEqual([...product.parts.values()].filter(p=>product.families[p.family].role==='external').map(p=>p.id),['wall-1','wall-2']);
  const placements=[...t.steps.values()].flatMap(added);
  assert.equal(placements.length,180);
  assert.equal(new Set(placements).size,180);
  assert.deepEqual([...product.parts.keys()].filter(id=>!placements.includes(id)),['100006-1','100092-1']);
  assert.deepEqual(sample(t,37,1).installed,placements);
  assert.deepEqual([...t.steps.values()].flatMap(r=>r.events).filter(e=>e.kind==='remove'),[]);
  assert.deepEqual(added(t.steps.get(8)),['caseRunnerL','108462-1','108462-2','caseRunnerR','108462-3','108462-4']);
  assert.deepEqual(added(t.steps.get(30)),['drawerFront','118331-19','118331-20','118331-21','118331-22']);
  assert.deepEqual(added(t.steps.get(34)),['drawerRear','110519-1','110519-2','110519-3','110519-4']);
  assert.deepEqual(added(t.steps.get(35)),['drawerRunnerL','108462-5','108462-6','drawerRunnerR','108462-7','108462-8']);
});

test('fresh compile, seek/back and sequential playback agree at each figure',()=>{
  const t=compile({}), fresh=compile({});
  const forward=t.order.map(n=>sample(t,n,1));
  for(const n of [...t.order].reverse()) {
    assert.deepEqual(sample(t,n,1),forward[n]);
    assert.deepEqual(sample(fresh,n,1),forward[n]);
    if(n>1) assert.deepEqual(t.steps.get(n).start,forward[n-1]);
  }
  for(const n of [21,25,28,29,37]) for(const e of t.steps.get(n).events) {
    const p=(e.t0+e.t1)/2;
    assert.deepEqual(sample(t,n,p),sample(fresh,n,p));
  }
  for(const b of ['lower','upper']) assert.equal(forward[25].captive[`${b}Partition`],1);
  assert.equal(t.steps.get(28).events.length,4);
  assert.ok(t.steps.get(28).events.every(e=>e.kind==='move'&&e.rigid&&e.ids.length===11));
  assert.equal(added(t.steps.get(28)).length,0);
  assert.equal(added(t.steps.get(37)).length,0);
  for(const b of ['lower','upper']) for(const part of ['Liner','CheekL','CheekR','Partition','Front']) {
    const id=`${b}${part}`;
    assert.deepEqual(forward[37].poses[id],forward[29].poses[id]);
  }
});
