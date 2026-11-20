import assert from 'node:assert/strict';
import test from 'node:test';
import { Quaternion, Vector3 } from 'three';
import { sample } from '../../src/timeline.js';
import { manual, pageLink, previewPages } from './manual.js';
import { compile } from './model.js';
import product from './product.js';

const numbers=[1,2,3,4,5,6,7,8,9,10,11];
const sourcePages=[5,5,6,6,7,8,9,10,11,12,13];
const cumulative=[5,6,10,14,17,19,23,27,33,37,41];
const added=[{stile:1,slat:3,markedSlat:1},{stile:1},{119046:4},{119046:4},{seat:1,120925:2},
  {seatTie:2},{120925:4},{armL:1,123786:1,102319:1,146654:1},{frontBrace:1,lowBrace:1,100514:2,122606:2},
  {armR:1,123786:1,102319:1,146654:1},{100514:2,122606:2}];

function relative(poses,id,root) {
  const [x,y,z,a,b,c,d]=poses[root];
  const q=new Quaternion(a,b,c,d).invert();
  const point=new Vector3(...poses[id].slice(0,3)).sub(new Vector3(x,y,z)).applyQuaternion(q);
  return [point,q.multiply(new Quaternion(...poses[id].slice(3)))];
}

function sameMounts(a,b,ids) {
  for(const id of ids) {
    const [pa,qa]=relative(a.poses,id,ids[0]), [pb,qb]=relative(b.poses,id,ids[0]);
    assert.ok(pa.distanceTo(pb)<1e-6 && 1-Math.abs(qa.dot(qb))<1e-6,`${id} stays mounted through a turn`);
  }
}

test('eleven printed figures place all and only the frame stock',()=>{
  const t=compile({});
  assert.deepEqual(t.order,[0,...numbers]);
  assert.deepEqual(product.steps.map(s=>s.number),numbers);
  assert.deepEqual([...t.steps.values()].map(s=>s.page),sourcePages);
  assert.deepEqual([...t.steps.values()].map(s=>s.end.installed.length),cumulative);
  assert.deepEqual([...t.steps.values()].map(s=>Object.fromEntries(s.parts.filter(r=>r.added).map(r=>[r.family,r.added]))),added);
  assert.equal(product.unbox.page,3);
  assert.deepEqual([...previewPages],[3,5,6,7,8,9,10,11,12,13]);
  assert.equal(manual.id,'AA-2615392-2-100');
  assert.equal(product.parts.size,42);
  const installed=sample(t,11,1).installed;
  assert.deepEqual([...product.parts.keys()].filter(id=>!installed.includes(id)),['100001-1']);
  assert.equal(product.families['100001'].role,'tool');
  assert.deepEqual(['119046','120925','146654','122606'].map(id=>product.families[id].number),
    ['119046 / 123257','120925 / 150450','146654 / 146655','122606 / 122604']);
});

test('the four work turns rigidly carry the installed structure, and replay and Back are deterministic',()=>{
  const t=compile({});
  const again=compile({});
  for(const n of [11,4,10,2,6,8,1,7,5,3,9,0]) {
    for(const progress of [1,.52,0,.89,1]) assert.deepEqual(sample(t,n,progress),sample(again,n,progress));
    if(n>1) assert.deepEqual(t.steps.get(n).start,sample(t,n-1,1));
    if(![4,6,7,10].includes(n)) continue;
    const event=t.steps.get(n).events.find(e=>e.kind==='move');
    assert.deepEqual(event.ids,event.before.installed);
    assert.deepEqual(event.after.installed,event.before.installed);
    sameMounts(event.before,sample(t,n,(event.t0+event.t1)/2),event.ids);
    sameMounts(event.before,event.after,event.ids);
  }
  const afterSecondArm=sample(t,10,1);
  assert.ok(afterSecondArm.poses.armR[1]>afterSecondArm.poses.armL[1]);
  assert.ok(sample(t,9,1).poses.armL[1]>sample(t,9,1).poses.stileR[1]);
});

test('the final six-screw check and separately sold cushion are references, not operations',()=>{
  const t=compile({}), end=sample(t,11,1), upright=product.completeFrame(end);
  assert.equal(t.order.at(-1),11);
  assert.equal(t.steps.get(11).page,13);
  const [tightening,cushion]=product.references[11];
  assert.match(tightening[0],/Final tightening.*six side screws/);
  assert.match(cushion[0],/Separate cushion.*not included/);
  assert.equal(pageLink(tightening[1]),`${manual.url}#page=14`);
  assert.equal(pageLink(cushion[1]),`${manual.url}#page=15`);
  assert.ok(product.manualLinks.includes(tightening) && product.manualLinks.includes(cushion));
  assert.equal(end.installed.filter(id=>/^(122606|146654)-/.test(id)).length,6);
  assert.deepEqual(upright.installed,end.installed);
  sameMounts(end,upright,end.installed);
  assert.ok(Math.abs(upright.poses.armL[1]-upright.poses.armR[1])<1e-6);
  assert.ok(upright.poses.stileL[1]>upright.poses.armL[1]);
  assert.equal(product.useDemo,undefined);
});
