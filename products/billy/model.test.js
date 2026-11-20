import assert from 'node:assert/strict';
import test from 'node:test';
import { Quaternion, Vector3 } from 'three';
import { sample } from '../../src/timeline.js';
import product from './product.js';
import { manual, pageLink, previewPages } from './manual.js';

const { compile, families, parts }=product;
const track=compile({});
const pages=[7,8,8,9,10,11,11,12,13,14,15,16];
const order=[0,1,2,3,4,5,6,7,8,9,10,11,12];
const near=(actual,expected)=>assert.ok(actual.distanceTo(expected)<1e-6,`${actual.toArray()} != ${expected.toArray()}`);
const v=(x,y,z)=>new Vector3(x,y,z);
const pos=p=>new Vector3().fromArray(p);
const rot=p=>new Quaternion().fromArray(p,3);
const axis=(p,vec)=>vec.applyQuaternion(rot(p));
const end=n=>sample(track,n,1);

test('the BILLY US booklet governs every figure and chapter, including Complete safety',()=>{
  assert.deepEqual(track.order,order);
  assert.deepEqual(product.steps.map(s=>s.number),order.slice(1));
  assert.deepEqual([...track.steps.values()].map(s=>s.page),pages);
  assert.deepEqual([...previewPages],[7,8,9,10,11,12,13,14,15,16]);
  assert.equal(product.unbox.page,7);
  assert.deepEqual(product.chapters.flatMap(([,a,b])=>order.filter(n=>n>=a&&n<=b)),order);
  assert.equal(manual.id,'AA-2289108-3-100');
  assert.match(pageLink(16),/billy-bookcase-white__AA-2289108-3-100\.pdf#page=16$/);
  assert.equal(product.unbox.warning.page,2);
  for(const n of [10,11,12]) {
    assert.equal(track.steps.get(n).warning.page,2);
    assert.match(track.steps.get(n).warning.text,/both supplied wall brackets/);
  }
  assert.ok(product.references[12].some(([,page])=>page===14));
  assert.equal(product.choices,undefined);
  assert.equal(product.useDemo,undefined);
});

test('p. 7 packet and every number balance, including the two external positions',()=>{
  const adds=[
    {bottom:1,fixed:1,top:1,rail:1,101351:16}, {side:2,118331:12}, {},
    {119081:4}, {119081:2}, {}, {119081:6}, {back:1}, {151705:18,151706:18},
    {106989:2,100823:4,109041:2,wall:2}, {131372:16}, {shelf:4}
  ];
  const cumulative=[20,34,34,38,40,40,46,47,83,93,109,113];
  for(const [i,s] of [...track.steps.values()].entries()) {
    const placed=s.parts.filter(p=>p.added);
    assert.deepEqual(Object.fromEntries(placed.map(p=>[p.family,p.added])),adds[i]);
    assert.equal(s.end.installed.length,cumulative[i]);
    assert.ok(s.events.every(e=>e.kind!=='remove'));
  }
  const catalog=[...parts.values()];
  const supplied=catalog.filter(p=>families[p.family].role==='kit');
  assert.equal(supplied.length,111);
  assert.equal(supplied.filter(p=>families[p.family].number===null).length,11);
  assert.deepEqual(catalog.filter(p=>families[p.family].role==='external').map(p=>p.id),['wall-1','wall-2']);
  assert.deepEqual(new Set(end(12).installed),new Set(parts.keys()));
  assert.deepEqual(end(0).installed,[]);
  assert.equal(Object.keys(end(0).poses).length,113);
  assert.equal(Object.keys(end(7).captive).length,12);
  assert.ok(Object.values(end(7).captive).every(value=>value===1));
});

test('dowels, bolts and retainers travel rigidly with their already attached members',()=>{
  for(const n of [3,5,6,8,10]) {
    const s=track.steps.get(n);
    const moves=s.events.filter(e=>e.rigid);
    for(const e of moves) {
      const {anchor}=e.rigid, a=e.before.poses[anchor];
      const mid=sample(track,n,e.t0+(e.t1-e.t0)*.58), b=mid.poses[anchor];
      assert.deepEqual(mid.installed,e.before.installed);
      for(const id of e.ids) {
        const old=e.before.poses[id], current=mid.poses[id];
        near(pos(old).sub(pos(a)).applyQuaternion(rot(a).invert()),pos(current).sub(pos(b)).applyQuaternion(rot(b).invert()));
        const from=rot(a).invert().multiply(rot(old));
        const to=rot(b).invert().multiply(rot(current));
        assert.ok(1-Math.abs(from.dot(to))<1e-8,`relative rotation of ${id} at figure ${n}`);
      }
    }
  }
  assert.deepEqual(track.steps.get(6).events[0].ids,['sideR',...Array.from({length:6},(_,i)=>`118331-${i+7}`)]);
  assert.equal(track.steps.get(8).events[0].ids.length,46);
  assert.equal(track.steps.get(10).events[0].ids.length,83);
  const finished=end(12).poses;
  near(pos(finished.sideL),v(-391,1009.5,0));
  near(pos(finished.sideR),v(391,1009.5,0));
  near(axis(finished.sideL,v(0,1,0)),v(0,1,0));
  near(axis(finished.sideR,v(0,0,1)),v(0,0,1));
});

test('the same back opens, travels along the channels, and takes 18 pairs in three rows',()=>{
  const back=track.steps.get(8);
  assert.equal(end(7).poses.back,undefined);
  const opening=back.events.find(e=>e.captive);
  const during=sample(track,8,(opening.t0+opening.t1)/2);
  assert.ok(Math.abs(during.captive.back-.5)<1e-6);
  assert.deepEqual(during.active,['back']);
  const slide=back.events.at(-1);
  assert.deepEqual(slide.ids,['back']);
  assert.equal(slide.before.captive.back,1);
  assert.ok(slide.op.prerequisites.includes('sideL')&&slide.op.prerequisites.includes('sideR'));
  const delta=pos(slide.after.poses.back).sub(pos(slide.before.poses.back));
  assert.ok(delta.z>1900);
  near(delta.normalize(),v(0,0,1));
  assert.equal(end(8).installed.some(id=>/^15170[56]-/.test(id)),false);
  const rows=new Map();
  for(let i=1;i<=18;i++) {
    const sleeve=`151706-${i}`, pin=`151705-${i}`;
    const event=track.steps.get(9).events.find(e=>e.ids.includes(pin));
    assert.ok(event.before.installed.includes('back')&&event.op.prerequisites.includes(sleeve));
    near(pos(end(10).poses[sleeve]),pos(end(10).poses[pin]));
    near(axis(end(10).poses[sleeve],v(0,1,0)),v(0,0,-1));
    const at=pos(end(10).poses[sleeve]), y=Math.round(at.y);
    assert.ok(Math.abs(at.z+125.5)<1e-6);
    if(!rows.has(y)) rows.set(y,[]);
    rows.get(y).push(Math.round(at.x));
  }
  assert.deepEqual([...rows.keys()],[87,1001,2010]);
  for(const x of rows.values()) assert.deepEqual(x,[-320,-192,-64,64,192,320]);
});

test('two wall events precede all 16 upward pegs and exactly four shelf seats',()=>{
  const wall=track.steps.get(10);
  const anchors=wall.events.find(e=>e.ids.includes('wall-1'));
  assert.deepEqual(anchors.ids,['wall-1','wall-2']);
  assert.ok(['106989-1','106989-2','100823-1','100823-2'].every(id=>anchors.op.prerequisites.includes(id)));
  for(const [i,x] of [-238,238].entries()) {
    const n=i+1;
    near(pos(wall.end.poses[`106989-${n}`]),v(x,2019,-139.5));
    near(pos(wall.end.poses[`wall-${n}`]),v(x,2037,-135.35));
    near(pos(wall.end.poses[`109041-${n}`]),v(x,2022.6,-102.5));
  }
  const supports=track.steps.get(11), shelves=track.steps.get(12);
  assert.equal(end(10).installed.some(id=>/^131372-|^shelf-/.test(id)),false);
  assert.equal(end(11).installed.filter(id=>id.startsWith('131372-')).length,16);
  assert.equal(end(11).installed.some(id=>id.startsWith('shelf-')),false);
  for(const s of supports.events) assert.ok(['wall-1','wall-2'].every(id=>s.op.prerequisites.includes(id)));
  for(const [i,e] of shelves.events.entries()) {
    const y=[376,600,1400,1656][i];
    const {ids,paths}=e;
    assert.deepEqual(ids,[`shelf-${i+1}`]);
    const [start,raised,seat]=paths[0];
    near(pos(raised).sub(pos(start)),v(0,0,-300));
    near(pos(seat).sub(pos(raised)),v(0,-32,0));
    assert.ok(Math.abs(seat[1]-(y+13))<1e-6);
    for(const id of e.op.prerequisites) {
      const p=end(11).poses[id];
      near(axis(p,v(0,1,0)),v(0,1,0));
      assert.equal(p[1],y);
      assert.equal(Math.abs(p[0]),374);
    }
  }
});

test('replay, seeking out of order and recompilation preserve every pose and ID',()=>{
  const replay=compile({});
  for(const n of [12,8,9,1,10,7,0,6,11,5,3,4,2,12,11,12]) {
    for(const p of [1,.03,.9,.5,0,1]) assert.deepEqual(sample(track,n,p),sample(replay,n,p));
    if(n>1) assert.equal(track.steps.get(n).start,end(n-1));
  }
  assert.throws(()=>sample(track,13,0),RangeError);
});
