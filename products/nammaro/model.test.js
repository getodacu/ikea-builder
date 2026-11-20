import assert from 'node:assert/strict';
import test from 'node:test';
import { Quaternion, Vector3 } from 'three';
import { sample } from '../../src/timeline.js';
import { pageLink, previewPages } from './manual.js';
import product from './product.js';

const printedPages=[4,5,6,6,7,8,9,10,11,11,12,13,14];
const additions=[
  {wheelLeg:2,footLeg:2,116562:4,114729:4}, {deck:1}, {wheelBrace:1}, {10089533:2},
  {wheel:2,10089529:2,117217:6,117215:2,112074:2}, {}, {106675:2,114577:2}, {},
  {footBrace:1,128832:2}, {}, {113153:2}, {113134:2}, {106675:2,114577:2}
];
const count=ids=>{
  const counts={};
  for(const id of ids) {
    const key=product.parts.get(id).family;
    counts[key]=(counts[key]??0)+1;
  }
  return counts;
};
const point=p=>new Vector3().fromArray(p);
const axis=p=>new Vector3(0,1,0).applyQuaternion(new Quaternion().fromArray(p,3));
const close=(a,b)=>assert.ok(a.distanceTo(b)<1e-6,`${a.toArray()} vs ${b.toArray()}`);
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-6,`${a} vs ${b}`);
const middle=e=>e.t0+e.hold+(e.t1-e.t0-e.hold)/2;

test('only the 13 printed figures are in assembly, with all p. 3 parts accounted for',()=>{
  const t=product.compile({}), printed=Array.from({length:13},(_,i)=>i+1);
  assert.deepEqual(t.order,[0,...printed]);
  assert.deepEqual(product.steps.map(r=>r.number),printed);
  assert.deepEqual([...t.steps.values()].map(r=>r.page),printedPages);
  assert.deepEqual([...previewPages],[3,4,5,6,7,8,9,10,11,12,13,14]);
  assert.match(pageLink(t.steps.get(13).page),/__AA-2307889-5-100\.pdf#page=14$/);
  assert.deepEqual(count(product.parts.keys()),{
    deck:1,wheelLeg:2,footLeg:2,wheelBrace:1,footBrace:1,wheel:2,
    10089529:2,113134:2,114729:4,128832:2,117215:2,112074:2,116562:4,10089533:2,113153:2,114577:4,117217:6,106675:4,
    128632:1,100001:1
  });
  const installed=[];
  for(const n of printed) {
    const record=t.steps.get(n), placed=record.events.filter(e=>e.kind==='place').flatMap(e=>e.ids);
    assert.deepEqual(count(placed),additions[n-1]);
    for(const e of record.events) assert.ok(e.op.prerequisites.every(id=>e.before.installed.includes(id)));
    installed.push(...placed);
    assert.deepEqual(sample(t,n,1).installed,installed);
  }
  assert.equal(installed.length,45);
  assert.equal(new Set(installed).size,45);
  assert.deepEqual([...product.parts.keys()].filter(id=>!installed.includes(id)).sort(),['100001-1','128632-1']);
  assert.equal(product.unbox.page,3);
  assert.equal(product.unbox.warning.page,2);
  assert.equal(t.steps.get(2).warning.page,5);
  assert.equal(t.steps.get(13).warning.page,15);
  assert.match(t.steps.get(13).warning.text,/two people.*fingers/i);
  assert.ok(product.references[13].some(([label,page])=>page===15&&/backrest/.test(label)));
});

test('same boundaries and fittings on replay, backward, and out-of-order seeking',()=>{
  const t=product.compile(), other=product.compile({});
  const forward=t.order.map(n=>sample(t,n,1));
  for(const n of [13,1,11,3,10,4,2,6,5,12,7,9,0,8]) {
    assert.deepEqual(sample(t,n,1),forward[n]);
    assert.deepEqual(sample(other,n,1),forward[n]);
    if(n>1) assert.strictEqual(t.steps.get(n).start,forward[n-1]);
    if(n) for(const event of t.steps.get(n).events) {
      const t0=middle(event), a=sample(t,n,t0);
      assert.deepEqual(sample(other,n,t0),a);
      assert.deepEqual(sample(t,n,t0),a);
    }
  }
});

test('figures 5–7 carry two independent wheel stacks and lock the rear leg studs in place',()=>{
  const t=product.compile(), wheelMoves=t.steps.get(6).events.filter(e=>e.kind==='move');
  assert.deepEqual(wheelMoves.map(e=>e.ids),[
    ['10089529-1','117217-1','117215-1','wheel-1','117217-2','112074-1','117217-3'],
    ['10089529-2','117217-4','117215-2','wheel-2','117217-5','112074-2','117217-6']
  ]);
  for(const [i,event] of wheelMoves.entries()) {
    const axle=event.ids[0], before=event.before.poses, after=event.after.poses;
    const mid=sample(t,6,middle(event)).poses, sign=i===0?1:-1;
    const travel=point(after[axle]).sub(point(before[axle]));
    close(travel,new Vector3(0,0,sign*145));
    for(const id of event.ids) {
      close(point(mid[id]).sub(point(mid[axle])),point(after[id]).sub(point(after[axle])));
      close(axis(after[id]),axis(before[id]));
      close(axis(mid[id]),new Vector3(0,0,-sign));
    }
  }
  for(const [n,legs] of [[7,[1,2]],[13,[3,4]]]) {
    const record=t.steps.get(n);
    assert.deepEqual(record.events.filter(e=>e.kind==='adjust').flatMap(e=>e.ids),legs.map(i=>`114577-${i}`));
    for(const i of legs) assert.deepEqual(record.start.poses[`114729-${i}`],record.end.poses[`114729-${i}`]);
    for(const i of [1,2]) assert.deepEqual(record.start.poses[`10089529-${i}`],record.end.poses[`10089529-${i}`]);
  }
});

test('Complete and the private use timeline turn the same stock and only adjust the captive backrest',()=>{
  const t=product.compile(), end=sample(t,13,1), done=product.completeFrame(end);
  const demo=product.useDemo.compile({});
  assert.equal(product.useDemo.label,'Raise the backrest');
  assert.deepEqual(demo.order,[...t.order,14,15]);
  assert.equal(demo.steps.get(15).duration,3350);
  assert.deepEqual(demo.steps.get(15).start,done);
  assert.deepEqual(sample(demo,15,0).poses,done.poses);
  assert.deepEqual(sample(demo,15,1).poses,done.poses);
  assert.deepEqual(sample(demo,15,1).captive,{deck:1});
  assert.deepEqual(sample(demo,15,1).installed,end.installed);
  assert.deepEqual(sample(t,13,1),end);
  close(axis(end.poses.deck),new Vector3(0,-1,0));
  close(axis(done.poses.deck),new Vector3(0,1,0));
  assert.deepEqual(done.installed,end.installed);
  const mid=sample(demo,14,middle(demo.steps.get(14).events[0]));
  assert.deepEqual(mid.installed,end.installed);
  for(const id of end.installed) {
    const distance=frame=>point(frame.poses.deck).distanceTo(point(frame.poses[id]));
    near(distance(end),distance(mid)); near(distance(end),distance(done));
  }
});
