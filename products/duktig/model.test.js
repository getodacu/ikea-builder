import assert from 'node:assert/strict';
import test from 'node:test';
import { sample } from '../../src/timeline.js';
import { compile } from './model.js';
import { manual, pageLink, previewPages } from './manual.js';
import product from './product.js';

const byFigure=[9,9,10,10,10,11,12,12,13,13,13,14,14,14,15,15,16,16,17,17,18,18,19,19,20,20,20,21,21,22,22,23,23,24,24,25,26,26,27,27,28,28,29,29,30,32];
const find=(t,n,id)=>t.steps.get(n).events.find(event=>event.ids.includes(id));
const placed=(t,n)=>t.steps.get(n).events.filter(e=>e.kind==='place').flatMap(e=>e.ids);
const norm=(a,b)=>Math.hypot(...a.slice(0,3).map((v,i)=>v-b[i]));
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);

test('exact 46 figure pages, kit and non-supplied items match the edition ledger',()=>{
  const t=compile({});
  assert.deepEqual(t.order,Array.from({length:47},(_,i)=>i));
  assert.deepEqual([...t.steps.values()].map(s=>s.page),byFigure);
  assert.deepEqual([...previewPages],[...Array.from({length:23},(_,i)=>i+8),32]);
  assert.deepEqual([manual.id,manual.footer,manual.date,manual.pages],['AA-1621040-20-100','AA-1621040-20','2024-04-04',32]);
  assert.match(pageLink(t.steps.get(46).page),/AA-1621040-20-100\.pdf#page=32$/);
  assert.match(pageLink(product.references[46][0][1]),/\.pdf#page=31$/);
  assert.deepEqual(product.references[46].map(([,p])=>p),[31,32]);
  const stock={};
  for(const {family} of product.parts.values()) stock[family]=(stock[family]??0)+1;
  assert.deepEqual(stock,{lowerL:1,lowerR:1,bottom:1,rail:1,divider:1,shelfL:1,shelfR:1,lowerBack:1,oven:1,cupboard:1,
    upperL:1,upperR:1,upperShelf:1,dividerL:1,dividerR:1,upperBack:1,cap:1,microwave:1,counter:1,sink:1,
    152849:1,150916:1,128814:25,128815:3,100224:10,100295:14,100226:6,109597:2,109041:1,101344:17,
    108768:3,118562:8,100823:5,148819:4,118678:5,118679:1,120104:3,107967:1,118650:6,100006:1,147536:4,wallFix:1});
  assert.equal(product.parts.size,142);
  assert.deepEqual([...product.parts.values()].filter(p=>product.families[p.family].role==='external').map(p=>p.id),['wallFix']);
  assert.equal(product.families[100006].role,'tool');
  const ids=t.order.slice(1).flatMap(n=>placed(t,n));
  assert.equal(ids.length,141);
  assert.equal(new Set(ids).size,141);
  assert.deepEqual([...product.parts.keys()].filter(id=>!ids.includes(id)),['100006-1']);
  assert.deepEqual(sample(t,46,1).installed,ids);
});

test('all boundaries agree across forward, reverse, and fresh compiles',()=>{
  const t=compile({}), fresh=compile({});
  const forward=t.order.map(n=>sample(t,n,1));
  for(const n of [...t.order].reverse()) {
    assert.deepEqual(sample(t,n,1),forward[n]);
    assert.deepEqual(sample(fresh,n,1),forward[n]);
    if(n>1) assert.deepEqual(sample(t,n,0).installed,forward[n-1].installed);
    if(n) assert.deepEqual(sample(t,n,0),sample(fresh,n,0));
  }
  assert.equal(product.unbox.warning.page,2);
  assert.equal(t.steps.get(36).warning.page,2);
  assert.equal(t.steps.get(32).warning.page,23);
  assert.deepEqual(placed(t,32),['152849-1','100823-3','100823-4','109597-1','109597-2']);
  assert.deepEqual(placed(t,33),['100295-11','100295-12','100295-13','100295-14']);
  assert.deepEqual(placed(t,34),['101344-15','101344-16','101344-17']);
  assert.deepEqual(placed(t,35),['100224-7','100224-8','100224-9','100224-10']);
  assert.deepEqual(placed(t,36),['100823-5','wallFix']);
  assert.deepEqual(placed(t,45),['sink']);
  assert.deepEqual(placed(t,46),['150916-1']);
  assert.equal(sample(t,45,1).poses['150916-1'],undefined);
  assert.deepEqual(sample(t,45,1).poses.sink,sample(t,46,1).poses.sink);
});

test('the upper door gains its pull after the p. 21 pivot movement, not during it',()=>{
  const t=compile({});
  const door=['microwave','108768-1','128814-11','118650-1','128814-12','128814-13'];
  assert.deepEqual(find(t,29,'microwave').ids,door);
  assert.deepEqual(find(t,33,'microwave').ids,[...door,'120104-1','100226-1','100226-2']);
});

test('p. 24 seats one complete upper module vertically over the same lower cabinet',()=>{
  const t=compile({}), ev=find(t,34,'counter');
  const p=sample(t,34,ev.t0+(ev.t1-ev.t0)*.9).poses, end=sample(t,34,1).poses;
  const start=sample(t,33,1).poses;
  assert.equal(ev.kind,'move');
  assert.deepEqual(ev.joint.axis,[0,-1,0]);
  for(const id of ['upperL','upperR','cap','microwave','128815-3','118679-1','118678-5','152849-1','109597-2','148819-4','107967-1','100295-14']) {
    assert.ok(ev.ids.includes(id),`${id} stays attached`);
    near(norm(start[id],start.counter),norm(end[id],end.counter));
    near(norm(p[id],p.counter),norm(end[id],end.counter));
    near(p[id][1]-end[id][1],p.counter[1]-end.counter[1]);
  }
  for(const id of ['lowerL','lowerR','divider','shelfL','shelfR']) assert.deepEqual(p[id],start[id]);
  assert.ok(p.counter[1]>end.counter[1]);
  near(p.counter[0],end.counter[0]); near(p.counter[2],end.counter[2]);
  for(const [i,z] of [-119,0,117].entries()) assert.deepEqual(end[`101344-${15+i}`].slice(0,3),[0,550,z]);
});

test('p. 16 slide moves the loaded hook rail toward the right socket',()=>{
  const t=compile({}), ev=find(t,18,'118679-1');
  assert.equal(ev.kind,'move');
  assert.deepEqual(ev.op.prerequisites,['upperR']);
  assert.deepEqual(ev.joint.axis,[1,0,0]);
  const a=sample(t,17,1).poses, b=sample(t,18,1).poses, dx=b['118679-1'][0]-a['118679-1'][0];
  assert.ok(dx>0);
  assert.deepEqual(ev.ids,['118679-1','118678-1','118678-2','118678-3','118678-4','118678-5']);
  for(const id of ev.ids) near(b[id][0]-a[id][0],dx);
});
