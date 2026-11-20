import assert from 'node:assert/strict';
import test from 'node:test';
import { sample } from '../../src/timeline.js';
import { manual, pageLink, previewPages } from './manual.js';
import { compile } from './model.js';
import product from './product.js';

const printedPages=[7,8,9,10,10,11,12,13,14,14,15,16,16,17,17,18,19,20,21,21,22,23,24,25,26,27,28,29,30,30,31,32,33,34,35,36];
const midpoint=e=>(e.t0+e.hold+e.t1)/2;
const distance=(p,q)=>Math.hypot(p[0]-q[0],p[1]-q[1],p[2]-q[2]);

test('the pinned Full/Double manual includes 36 numbered steps and the reconciled stock',()=>{
  const t=compile({});
  assert.equal(manual.id,'AA-2055625-9-100');
  assert.equal(manual.footer,'AA-2055625-9');
  assert.equal(manual.date,'2023-11-17');
  assert.equal(manual.pages,40);
  assert.equal(manual.sha256,'9f9cbbccc976cd1ea511f2cbf27e4d7b6c3da869d65e7943f33ed3a48a580c0e');
  assert.deepEqual(t.order,Array.from({length:37},(_,i)=>i));
  assert.deepEqual([...t.steps.values()].map(s=>s.page),printedPages);
  assert.deepEqual([...previewPages],[3,...Array.from({length:30},(_,i)=>i+7)]);
  assert.match(pageLink(t.steps.get(36).page),/malm-storage-bed-white__AA-2055625-9-100\.pdf#page=36$/);
  assert.deepEqual(product.references[25].map(([,p])=>p),[37,38]);
  assert.deepEqual(product.references[36].map(([,p])=>p),[34,37,38]);
  assert.equal(product.unbox.warning.page,2);
  for(const [step,page] of [[16,18],[24,25],[25,26],[26,27],[29,30],[31,31],[32,32],[33,33],[34,34],[36,36]]) {
    assert.equal(t.steps.get(step).warning.page,page);
  }
  const stock={};
  for(const {family} of product.parts.values()) stock[family]=(stock[family]??0)+1;
  assert.deepEqual(stock,{
    side:2,cap:2,endBoard:2,headboard:1,128895:4,outerRail:2,centerRail:2,endRail:2,brace:1,192367:2,slat:32,floor:3,
    123830:1,123829:1,124432:2,114334:4,123491:4,130618:8,101367:5,101359:16,115311:8,114670:4,122998:4,114254:4,
    100049:1,113453:1,123851:4,123852:2,123849:2,123850:4,109021:46,190018:4,124252:4,123848:2,
    124584:6,158998:12,105107:2,115461:4,110440:2,124573:1,157409:24,108490:1,100001:1,124249:4,124389:1,
    124390:1,124663:64,mattress:1
  });
  assert.equal(product.parts.size,310);
  assert.deepEqual([...product.parts.values()].filter(p=>product.families[p.family].role==='external').map(p=>p.id),['mattress']);
  const all=[...t.steps.values()].flatMap(s=>s.events);
  const placed=all.filter(e=>e.kind==='place').flatMap(e=>e.ids);
  assert.equal(placed.length,306);
  assert.equal(new Set(placed).size,306);
  assert.deepEqual([...product.parts.keys()].filter(id=>!placed.includes(id)),['100049-1','113453-1','108490-1','100001-1']);
  assert.ok(all.every(e=>e.kind!=='remove'));
  assert.deepEqual(sample(t,36,1).installed,placed);
});

test('the assembled and flipped carriage lands as one unit on two receivers at step 24',()=>{
  const t=compile({}), step=t.steps.get(24), before=sample(t,23,1).poses, after=sample(t,24,1).poses;
  const carry=step.events.find(e=>e.kind==='move'&&e.ids.includes('outerR'));
  assert.deepEqual(carry.op.prerequisites,['linkR','linkL']);
  for(const id of ['outerR','outerL','centerR','centerL','deckHead','deckFoot','brace','retainerHead','retainerFoot','158998-12','115461-4']) {
    assert.ok(carry.ids.includes(id));
    const inTransit=sample(t,24,midpoint(carry)).poses;
    assert.ok(inTransit[id][1]>after[id][1]+180);
    assert.ok(Math.abs(distance(inTransit[id],inTransit.outerR)-distance(after[id],after.outerR))<1e-6);
    assert.ok(Math.abs(distance(before[id],before.outerR)-distance(after[id],after.outerR))<1e-6);
  }
  assert.equal(after.outerR[0],after.linkR[0]);
  assert.equal(after.outerL[0],after.linkL[0]);
  const seatings=step.events.filter(e=>e.kind==='place');
  assert.deepEqual(seatings.map(e=>[...e.op.prerequisites,...e.ids]),[
    ['outerR','linkR','124584-1','124584-2','124584-3'],['outerL','linkL','124584-4','124584-5','124584-6']
  ]);
  assert.match(step.warning.text,/Two people/);
  assert.equal(step.warning.page,25);
});

test('upper-pinned struts and lower eye hardware stay captive through tightening, closing and the loaded lift',()=>{
  const t=compile({});
  const at=n=>sample(t,n,1);
  const left=t.steps.get(17).events.find(e=>e.ids.includes('linkL'));
  const right=t.steps.get(17).events.find(e=>e.ids.includes('linkR'));
  assert.deepEqual(left.ids,['linkL','124432-2']);
  assert.deepEqual(right.ids,['linkR','124432-1']);
  for(const id of ['124432-1','124432-2']) {
    assert.ok(at(17).installed.includes(id));
    assert.equal(at(25).captive[id],1);
    assert.equal(at(26).captive[id],2);
    assert.equal(at(29).captive[id],3);
  }
  assert.equal(t.steps.get(27).events[0].kind,'adjust');
  assert.deepEqual([...t.steps.get(27).events[0].ids].sort(),['123851-1','123851-2','123851-3','123851-4','123852-1','123852-2']);
  for(const id of ['123848-1','123848-2','123852-1','123852-2']) assert.deepEqual(at(34).poses[id],at(27).poses[id]);
  assert.ok(!at(32).installed.includes('mattress'));
  assert.deepEqual(t.steps.get(33).parts,[{family:'mattress',ids:['mattress'],added:1,reused:0}]);
  assert.match(t.steps.get(33).warning.text,/40 kg \(88 lb\)/);
  const [release,raise]=t.steps.get(34).events;
  assert.deepEqual(release.ids,['124390-1']);
  for(const id of ['outerR','slat-1','124663-1','mattress','retainerHead','retainerFoot']) assert.ok(raise.ids.includes(id));
  const closed=at(33).poses, mid=sample(t,34,midpoint(raise)).poses, open=at(34).poses;
  assert.ok(closed.mattress[1]<mid.mattress[1]&&mid.mattress[1]<open.mattress[1]);
  for(const id of ['deckFoot','slat-1','124663-64','retainerFoot']) {
    assert.ok(Math.abs(distance(closed[id],closed.mattress)-distance(mid[id],mid.mattress))<1e-6);
    assert.ok(Math.abs(distance(open[id],open.mattress)-distance(mid[id],mid.mattress))<1e-6);
  }
  assert.deepEqual(open.foot,closed.foot);
  assert.equal(t.steps.get(36).warning.page,36);
  assert.match(t.steps.get(36).warning.text,/Do not enter/);
  assert.deepEqual(t.steps.get(36).events.map(e=>e.ids.length),[9,9,9]);
  for(const id of ['floorHead','floorCenter','floorFoot']) assert.equal(at(36).poses[id][1],12);
});

test('replay, backward seeking, and fresh compile preserve snapshots and representative motion frames',()=>{
  const t=compile({}), fresh=compile({});
  const forward=t.order.map(n=>sample(t,n,1));
  for(const n of [...t.order].reverse()) {
    assert.deepEqual(sample(t,n,1),forward[n]);
    assert.deepEqual(sample(fresh,n,1),forward[n]);
    if(n>1) assert.deepEqual(t.steps.get(n).start,forward[n-1]);
  }
  for(const n of [17,22,24,26,29,32,34,36]) {
    for(const e of t.steps.get(n).events) {
      const p=midpoint(e);
      assert.deepEqual(sample(t,n,p),sample(fresh,n,p));
    }
  }
});
