import assert from 'node:assert/strict';
import test from 'node:test';
import { sample } from '../../src/timeline.js';
import product from './product.js';
import { compile } from './model.js';
import { pageLink, previewPages } from './manual.js';

const printedPages=[5,7,8,8,9,9,10,10,11,12,13,13,14,15,15,16,17,18,19,20,20,21,22,23,24,25,26,27,27,28,29,30,30,31,32,33,34];
const allPanels=['inner-panel-1','inner-panel-2','inner-panel-3','inner-panel-4','outer-panel-1','outer-panel-2','outer-panel-3','outer-panel-4'];

test('printed steps, references, stock and separately supplied panels match the official figures',()=>{
  const t=compile({});
  assert.deepEqual(t.order,Array.from({length:38},(_,n)=>n));
  assert.deepEqual([...t.steps.values()].map(r=>r.page),printedPages);
  assert.deepEqual([...previewPages],[3,5,...Array.from({length:28},(_,i)=>7+i)]);
  assert.deepEqual(product.references[25].map(([,page])=>page),[35,36]);
  assert.deepEqual(product.references[37].map(([,page])=>page),[35,36]);
  assert.match(pageLink(t.steps.get(37).page),/AA-2213695-9-100\.pdf#page=34$/);
  assert.match(pageLink(product.references[37][1][1]),/AA-2213695-9-100\.pdf#page=36$/);
  assert.deepEqual(t.steps.get(1).events,[]);
  assert.equal(t.steps.get(1).warning.page,7);

  const counts={}, external=[];
  for(const p of product.parts.values()) {
    counts[p.family]=(counts[p.family]??0)+1;
    if(product.families[p.family].role==='external') external.push(p.id);
  }
  assert.deepEqual(counts,{upperTrack:1,lowerTrack:1,stile:4,head:2,foot:2,divider:6,key:1,railScrew:4,joinScrew:2,flangeScrew:16,
    pin:12,machineScrew:16,shortRoller:2,shortCatch:2,longRoller:2,longCatch:2,trim:2,edging:2,dustCover:1,brush:1,pad:8,panel:8});
  assert.deepEqual(external,allPanels);
  assert.equal(product.parts.size-external.length,89);
  const staged=sample(t,0,1).poses;
  assert.ok(Math.min(...external.map(id=>staged[id][0]-488))>570);
  assert.equal(new Set(external.map(id=>staged[id].join())).size,8);

  const events=[...t.steps.values()].flatMap(r=>r.events);
  const placed=events.filter(e=>e.kind==='place').flatMap(e=>e.ids);
  assert.equal(placed.length,96);
  assert.equal(new Set(placed).size,96);
  assert.deepEqual([...product.parts.keys()].filter(id=>!placed.includes(id)),['key-1']);
  assert.equal(events.some(e=>e.kind==='remove'),false);
  assert.deepEqual(sample(t,37,1).installed,placed);
});

test('both printed 24s stay in one record and replay/seek preserves every boundary',()=>{
  const t=compile({}), fresh=compile({});
  const forward=t.order.map(n=>sample(t,n,1));
  const step24=t.steps.get(24);
  assert.equal(step24.page,23);
  assert.deepEqual(step24.events.map(e=>[e.kind,e.ids]),[
    ['place',['longCatch-1']],['place',['machineScrew-13','machineScrew-14']],
    ['place',['longCatch-2']],['place',['machineScrew-15','machineScrew-16']],['adjust',['outer-head']]
  ]);
  assert.equal(step24.start.captive['outer-head'],undefined);
  assert.equal(step24.end.captive['outer-head'],1);
  for(const n of [...t.order].reverse()) {
    assert.deepEqual(sample(t,n,1),forward[n]);
    assert.deepEqual(sample(fresh,n,1),forward[n]);
    if(n>1) assert.deepEqual(t.steps.get(n).start,forward[n-1]);
    for(const e of t.steps.get(n)?.events??[]) {
      const progress=(e.t0+e.t1)/2;
      assert.deepEqual(sample(t,n,progress),sample(fresh,n,progress));
    }
  }
});

test('the empty outer frame engages to the right at 26 and loaded doors move with all their panels at 37',()=>{
  const t=compile({}), first=t.steps.get(18), connect=t.steps.get(26), finish=t.steps.get(37);
  assert.deepEqual(first.parts,[{family:'panel',ids:['inner-panel-1'],added:1,reused:0}]);
  assert.equal(product.families.panel.role,'external');
  assert.equal(first.start.installed.includes('inner-panel-1'),false);
  assert.equal(first.end.installed.includes('inner-panel-1'),true);
  assert.equal(connect.events[0].kind,'move');
  assert.ok(connect.events[0].ids.every(id=>!id.startsWith('inner')));
  assert.ok(connect.end.poses['outer-head'][0]>connect.start.poses['outer-head'][0]);
  assert.deepEqual(connect.events[1].ids,['longCatch-2']);
  assert.equal(connect.end.captive['longCatch-2'],1);
  assert.equal(connect.warning.page,25);
  for(const id of ['inner-foot','inner-head',...allPanels.slice(0,4)]) {
    assert.deepEqual(connect.start.poses[id],connect.end.poses[id]);
  }

  const slide=finish.events.find(e=>e.kind==='move'&&e.ids.includes('inner-panel-1'));
  const mid=sample(t,37,(slide.t0+slide.t1)/2);
  assert.ok(mid.poses['inner-foot'][0]<slide.before.poses['inner-foot'][0]);
  assert.ok(mid.poses['inner-foot'][0]>slide.after.poses['inner-foot'][0]);
  for(const id of allPanels.slice(0,4)) {
    const local=f=>f.poses[id].slice(0,3).map((v,i)=>v-f.poses['inner-foot'][i]);
    assert.deepEqual(local(slide.before),local(mid));
    assert.deepEqual(local(slide.before),local(slide.after));
    assert.equal(mid.installed.includes(id),true);
  }
  const outerSlides=finish.events.filter(e=>e.kind==='move'&&e.ids.includes('outer-head'));
  assert.equal(outerSlides.length,2);
  assert.ok(outerSlides.every(e=>['dust-cover',...allPanels.slice(4)].every(id=>e.ids.includes(id))));
  assert.deepEqual(finish.events.at(-1).ids,['brush']);
  assert.ok(finish.end.poses.brush[0]>finish.end.poses['outer-head'][0]);
});

test('p. 34 left-closing arrangement spans both bays without changing brush access',()=>{
  const t=compile({}), end=sample(t,37,1), original=structuredClone(end);
  const done=product.completeFrame(end), {poses}=done;
  assert.equal(poses['outer-head'][0],-493);
  assert.equal(poses['inner-head'][0],493);
  for(const id of allPanels) {
    const head=id.startsWith('inner')?'inner-head':'outer-head';
    assert.equal(poses[id][0],poses[head][0]);
    assert.deepEqual(poses[id].slice(1),original.poses[id].slice(1));
  }
  for(const id of ['brush','dust-cover']) {
    assert.equal(poses[id][0]-original.poses[id][0],-48);
    assert.deepEqual(poses[id].slice(1),original.poses[id].slice(1));
  }
  for(const id of ['upper-track','lower-track','side-trim-left','side-trim-right']) {
    assert.deepEqual(poses[id],original.poses[id]);
  }
  assert.deepEqual(done.installed,original.installed);
  assert.deepEqual(done.captive,original.captive);
  assert.equal(done.joint,null);
  assert.deepEqual(sample(t,37,1),original);
  assert.deepEqual(end,original);
  assert.deepEqual(['outer-head','inner-head','brush'].map(id=>original.poses[id][0]),[-445,-493,53]);
});
