import assert from 'node:assert/strict';
import test from 'node:test';
import { sample } from '../../src/timeline.js';
import { manual, pageLink, previewPages } from './manual.js';
import { compile } from './model.js';
import product from './product.js';

const printed=[6,7,8,9,10,11,12,13,13,14,15,16,17,17,18,19,20,21,22,23,24,25,26,27,27,28,29,30,31,32,33,34,35,36,37,38,39,40,42,43];
const external=['seatCover','backCover','armCoverL','armCoverR','outerCoverL','outerCoverR','centerCover'];
const midpoint=({t0,t1})=>(t0+t1)/2;
const placementIds=(timeline,n)=>timeline.steps.get(n).events.filter(e=>e.kind==='place').flatMap(e=>e.ids);

test('one exact edition, 40 printed steps and no reference pages in playback',()=>{
  const t=compile({});
  assert.equal(manual.pages,44);
  assert.equal(manual.date,null);
  assert.equal(manual.footer,'AA-2191645-5');
  assert.deepEqual(t.order,Array.from({length:41},(_,i)=>i));
  assert.deepEqual([...t.steps.values()].map(s=>s.page),printed);
  assert.deepEqual([...previewPages],[3,...Array.from({length:35},(_,i)=>i+6),42,43]);
  assert.match(pageLink(43),/vretstorp-frame-for-sleeper-sofa__AA-2191645-5-100\.pdf#page=43$/);
  assert.deepEqual(product.references[39].map(([,page])=>page),[41]);
  assert.deepEqual(product.references[40].map(([,page])=>page),[41,44]);
  assert.ok(product.unbox.warning.text.includes('two people'));
  assert.equal(product.unbox.warning.page,2);
  assert.equal(t.steps.get(1).warning.page,2);
  for(const n of [5,10,23]) assert.equal(t.steps.get(n).warning.page,5);
  for(const n of [39,40]) {
    assert.ok(t.steps.get(n).warning.text.includes('72 hours'));
    assert.equal(t.steps.get(n).warning.page,41);
  }
  const before=sample(t,40,1);
  assert.match(pageLink(product.references[40][1][1]),/\.pdf#page=44$/);
  assert.deepEqual(sample(t,40,1),before);
});

test('the frame box balances separately from retail covers and all placements are unique',()=>{
  const t=compile({}), quantities={};
  for(const {family} of product.parts.values()) quantities[family]=(quantities[family]??0)+1;
  assert.deepEqual(quantities,{seat:1,back:1,arm:2,frontRail:1,rearRail:1,bar:1,liner:1,outer:2,center:1,riser:2,guide:2,hinge:2,
    10003880:1,141454:6,10004419:4,10050334:8,130550:2,152546:4,10050529:18,121365:4,152122:2,
    seatCover:1,backCover:1,armCover:2,outerCover:2,centerCover:1});
  assert.deepEqual([...product.parts.values()].filter(p=>product.families[p.family].role==='external').map(p=>p.id),external);
  assert.equal(product.parts.size-external.length,66);
  const placed=t.order.slice(1).flatMap(n=>placementIds(t,n));
  assert.equal(placed.length,70);
  assert.equal(new Set(placed).size,70);
  assert.deepEqual(sample(t,40,1).installed,placed);
  assert.deepEqual([...product.parts.keys()].filter(id=>!placed.includes(id)),['10003880-1','10050334-7','10050334-8']);
  for(const [n,count] of [[17,8],[21,4],[26,6]]) assert.equal(placementIds(t,n).filter(id=>id.startsWith('10050529-')).length,count);
  assert.deepEqual(placementIds(t,22),[]);
  assert.deepEqual(placementIds(t,27),['liner','10004419-1','10004419-2','10004419-3','10004419-4']);
  assert.deepEqual(placementIds(t,34),['152122-1','152122-2']);
  assert.deepEqual(placementIds(t,37),['152546-1','152546-2','152546-3','152546-4']);
  assert.deepEqual(placementIds(t,39),['outerL','outerCoverL','outerR','outerCoverR']);
  assert.deepEqual(placementIds(t,40),['center','centerCover']);
});

test('forward, back, seek and fresh compile reproduce boundaries and sampled beats',()=>{
  const timeline=compile({}), fresh=compile({});
  const forward=timeline.order.map(n=>sample(timeline,n,1));
  for(const n of [...timeline.order].reverse()) {
    assert.deepEqual(sample(timeline,n,1),forward[n]);
    assert.deepEqual(sample(fresh,n,1),forward[n]);
    if(n>1) assert.deepEqual(timeline.steps.get(n).start,forward[n-1]);
    if(n) for(const event of timeline.steps.get(n).events) assert.deepEqual(sample(fresh,n,midpoint(event)),sample(timeline,n,midpoint(event)));
  }
});

test('fastening both groups uses the same liner and no new stock',()=>{
  const t=compile({}), {events}=t.steps.get(30);
  assert.equal(t.steps.get(30).page,32);
  assert.deepEqual(events.map(e=>[e.kind,e.ids,e.joint.receivers,e.captive.to]),[
    ['adjust',['liner'],['rearRail'],2],['adjust',['liner'],['frontRail'],3]
  ]);
  for(const [i,e] of events.entries()) assert.ok(Math.abs(sample(t,30,midpoint(e)).captive.liner-(1.5+i))<1e-8);
  const start=sample(t,29,1), end=sample(t,30,1);
  assert.equal(start.captive.liner,1);
  assert.equal(end.captive.liner,3);
  assert.deepEqual(end.poses,start.poses);
  assert.deepEqual(end.installed,start.installed);
});

test('the covered seat and backrest stay rigid while the modules fold and return',()=>{
  const t=compile({});
  for(const [n,anchor,cover] of [[33,'seat','seatCover'],[36,'back','backCover'],[37,'back','backCover'],[38,'back','backCover'],[38,'seat','seatCover']]) {
    const moves=t.steps.get(n).events.filter(e=>e.kind==='move'&&e.ids[0]===anchor);
    assert.ok(moves.length);
    for(const e of moves) for(const frame of [e.before,sample(t,n,midpoint(e)),e.after]) {
      assert.ok(frame.poses[anchor].every((x,i)=>Math.abs(x-frame.poses[cover][i])<1e-7));
    }
  }
  const open=sample(t,37,1).poses, closed=sample(t,38,1).poses;
  assert.ok(open.back[2]>closed.back[2]);
  assert.ok(open.seat[2]-closed.seat[2]>400);
  assert.ok(Math.abs(open.back[3]-Math.SQRT1_2)<1e-8);
  assert.deepEqual(closed.back.slice(3),[0,0,0,1]);
  for(const id of ['guideL','guideR','152546-1','152546-2','152546-3','152546-4']) assert.deepEqual(closed[id],open[id]);
  const outer=sample(t,39,1), final=sample(t,40,1);
  for(const [id,cover] of [['armL','armCoverL'],['armR','armCoverR'],['outerL','outerCoverL'],['outerR','outerCoverR'],['center','centerCover']]) {
    assert.ok(final.poses[id].every((x,i)=>Math.abs(x-final.poses[cover][i])<1e-7));
  }
  assert.equal(outer.poses.center,undefined);
  assert.ok(final.poses.outerL[0]<final.poses.center[0]&&final.poses.center[0]<final.poses.outerR[0]);
  assert.deepEqual(final.poses.outerL,outer.poses.outerL);
  assert.deepEqual(final.poses.outerR,outer.poses.outerR);
});
