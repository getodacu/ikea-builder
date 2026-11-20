import assert from 'node:assert/strict';
import test from 'node:test';
import { Quaternion, Vector3 } from 'three';
import { sample } from '../../src/timeline.js';
import product from './product.js';
import { compile } from './model.js';
import { pageLink, previewPages } from './manual.js';

const printedPages=[5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,13,13,14,14,15,15,16,17,18,19,19,20,21,22,22];

test('printed order, exact source targets, and all supplied stock match the manual',()=>{
  const t=compile({});
  assert.deepEqual(t.order,Array.from({length:31},(_,i)=>i));
  assert.deepEqual([...t.steps.values()].map(s=>s.page),printedPages);
  assert.deepEqual([...previewPages],[3,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22]);
  assert.match(pageLink(t.steps.get(30).page),/70340807_70340807_1\.pdf#page=22$/);
  assert.deepEqual(product.references[30].map(([,p])=>p),[23,24]);
  assert.match(pageLink(product.references[30][0][1]),/70340807_70340807_1\.pdf#page=23$/);
  const inventory=Object.create(null);
  for(const {family} of product.parts.values()) inventory[family]=(inventory[family]??0)+1;
  assert.deepEqual({...inventory},{top:1,leaf:1,guide:2,batten:2,slat:2,slide:2,apron:2,fixedLeg:2,movingLeg:2,locator:2,
    154409:13,114613:4,101350:14,154954:8,109021:20,113434:12,156685:4,100041:4,100038:4,110912:4,100843:8,
    100712:8,107271:4,120202:1,10062668:1,10082399:4,109067:2,10064763:2,10082205:2,122483:4});
  const placed=[...t.steps.values()].flatMap(s=>s.events.filter(e=>e.kind==='place').flatMap(e=>e.ids));
  assert.equal(placed.length,140);
  assert.equal(new Set(placed).size,140);
  assert.deepEqual([...product.parts.keys()].filter(id=>!placed.includes(id)),['120202-1']);
  assert.deepEqual(sample(t,30,1).installed,placed);
  assert.ok(Object.values(product.families).every(f=>f.role==='kit'||f.role==='tool'));
});

test('late leaf operations retain one board, and back/seek does not change boundaries',()=>{
  const t=compile({}), fresh=compile({});
  const forward=t.order.map(n=>sample(t,n,1));
  for(const n of [...t.order].reverse()) {
    assert.deepEqual(sample(t,n,1),forward[n]);
    assert.deepEqual(sample(fresh,n,1),forward[n]);
    if(n) assert.deepEqual(t.steps.get(n).start, n===1?{poses:{},installed:[],active:[],joint:null,captive:{}}:forward[n-1]);
  }
  const a=t.steps.get(29), b=t.steps.get(30);
  assert.deepEqual(a.events.flatMap(e=>e.ids),['leaf','locatorRear','109021-17','109021-18','locatorFront','109021-19','109021-20']);
  assert.deepEqual(b.events.flatMap(e=>e.ids),['10082205-2','10064763-2','10082399-3','10082399-4']);
  for(const [n,record] of [[29,a],[30,b]]) {
    for(const event of record.events) {
      const progress=(event.t0+event.t1)/2;
      const frame=sample(t,n,progress);
      assert.deepEqual(sample(fresh,n,progress),frame);
      if(event.ids[0]==='leaf') assert.ok(frame.poses.leaf[1]>forward[29].poses.leaf[1]);
      else assert.deepEqual(frame.poses.leaf,forward[29].poses.leaf);
    }
  }
});

test('the carrier turns over, then both sides travel together to the closed catch',()=>{
  const t=compile({});
  const loaded=sample(t,13,1).poses, closed=sample(t,21,1).poses;
  assert.deepEqual(loaded.apronSlide.slice(0,3),[-836,49,0]);
  const {t0,t1}=t.steps.get(21).events[0];
  const open=sample(t,20,1).poses, mid=sample(t,21,(t0+t1)/2).poses;
  for(const id of ['slideRear','slideFront','battenL','10062668-1','122483-1','156685-4']) {
    assert.ok(Math.abs(closed[id][0]-open[id][0]-270)<1e-8);
    assert.ok(Math.abs((mid[id][0]-mid.apronSlide[0])-(closed[id][0]-closed.apronSlide[0]))<1e-8);
  }
  assert.deepEqual(closed.guideRear,loaded.guideRear);
  assert.deepEqual(closed.guideFront,loaded.guideFront);
});

test('p. 24 shows the upright extension without changing the numbered bench pose',()=>{
  const t=compile({}), end=sample(t,30,1), original=structuredClone(end);
  const done=product.completeFrame(end), {poses}=done, {shapes}=product;
  const {top,leaf}=poses;
  assert.equal(top[0],300);
  assert.equal(leaf[0],-600);
  assert.equal(top[0]-shapes.top[0]/2,-300);
  assert.equal(leaf[0]+shapes.leaf[0]/2,-300);
  assert.equal(top[1]+shapes.top[1]/2,leaf[1]+shapes.leaf[1]/2);
  assert.equal(top[2],leaf[2]);
  for(const panel of [top,leaf]) {
    const underside=new Vector3(0,1,0).applyQuaternion(new Quaternion().fromArray(panel,3));
    assert.ok(underside.distanceTo(new Vector3(0,-1,0))<1e-8);
  }
  for(const i of [1,2,3,4]) assert.equal(poses[`107271-${i}`][1]-shapes.glide[1]/2,0);
  const alongTop=(frame,id)=>frame.poses[id][0]-frame.poses.top[0];
  for(const id of ['legLF','100843-7','100843-8','100712-7','100712-8','107271-4','slideRear']) {
    assert.ok(Math.abs(alongTop(done,id)-alongTop(end,id)+600)<1e-8,id);
  }
  for(const id of ['legRF','guideRear','apronFixed']) assert.equal(alongTop(done,id),alongTop(end,id));
  assert.deepEqual(['10082205-2','locatorRear'].map(id=>poses[id].slice(0,3).map((v,i)=>v-leaf[i])),
    [[-272,-17,0],[272,-16,325]]);
  assert.deepEqual(done.installed,original.installed);
  assert.deepEqual(done.captive,original.captive);
  assert.equal(done.joint,null);
  assert.deepEqual(sample(t,30,1),original);
  assert.deepEqual(end,original);
  assert.deepEqual(original.poses.top,[0,13,0,0,0,0,1]);
  assert.deepEqual(original.poses.leaf,[0,13,850,0,0,0,1]);
});
