import assert from 'node:assert/strict';
import test from 'node:test';
import { Quaternion, Vector3 } from 'three';
import { sample } from '../../src/timeline.js';
import { families, parts } from './kit.js';
import { manual, pageLink, previewPages } from './manual.js';
import { compile } from './model.js';
import product from './product.js';

const expectedPages=[7,7,8,8,9,9,10,10,11,12,12,13,14,15,16,17,18,19,20,21,22,23,24,25,25,26,27,28,29,30];
const additions=[
  {end:1,railRear:1},{107616:1},{base:1},{107616:1},{railFront:1},{107616:1},{end:1},{107616:3},
  {brace:2,107616:4},{152526:4,152527:4},{122158:4},{postHinge:2,139212:4},{postFrontCenter:1,139212:2},
  {postRearWall:2,139212:4},{postRearCenter:1,139212:2},{122158:6},{shelf:1},{152497:10},{top:1,rim:1},{152497:10},{},
  {107616:7},{stop:3,107616:3},{},{door:4,153334:8,107616:16},{107616:16},{139578:4,114755:4},{},{wall:2},{123742:1}
];
const counts=ids=>{
  const result={};
  for(const id of ids) result[parts.get(id).family]=(result[parts.get(id).family]??0)+1;
  return result;
};
const stays=(p,q)=>assert.ok(p.every((a,i)=>Math.abs(a-q[i])<1e-7));

test('AA-2503161-1 figures, page pin and quantities match the printed case and door sequence',()=>{
  const t=compile({}), order=Array.from({length:31},(_,n)=>n);
  assert.equal(manual.id,'AA-2503161-1-100');
  assert.equal(manual.sha256,'a1a35b11570f06b080e3c5146f379d44087d7876cb98da008d364ebc4ab9ec13');
  assert.deepEqual(t.order,order);
  assert.deepEqual(product.steps.map(s=>s.number),order.slice(1));
  assert.deepEqual(product.chapters.flatMap(([,a,b])=>Array.from({length:b-a+1},(_,i)=>a+i)),order);
  assert.deepEqual([...t.steps.values()].map(s=>s.page),expectedPages);
  assert.deepEqual([...previewPages], [...new Set([6,...expectedPages])]);
  assert.match(pageLink(30),/__AA-2503161-1-100\.pdf#page=30$/);
  assert.equal(product.choices,undefined);
  assert.equal(product.useDemo,undefined);
  assert.equal(t.steps.get(7).warning.page,5);
  for(const n of [29,30]) assert.equal(t.steps.get(n).warning.page,2);
  const cumulative={};
  for(const n of t.order.slice(1)) {
    const {start,end,parts:sheet}=t.steps.get(n);
    const added=end.installed.filter(id=>!start.installed.includes(id));
    assert.deepEqual(counts(added),additions[n-1],`added at figure ${n}`);
    assert.deepEqual(Object.fromEntries(sheet.filter(row=>row.added).map(row=>[row.family,row.added])),additions[n-1]);
    for(const [k,count] of Object.entries(additions[n-1])) cumulative[k]=(cumulative[k]??0)+count;
    assert.deepEqual(counts(end.installed),cumulative,`remaining at figure ${n}`);
  }
  const supplied=[...parts.keys()].filter(id=>families[parts.get(id).family].role==='kit');
  const numbered=supplied.filter(id=>families[parts.get(id).family].number!==null);
  assert.deepEqual(counts(numbered),{122158:10,152497:20,107616:52,152527:4,152526:4,139212:12,123742:14,153334:8,139578:4,114755:4});
  assert.equal(supplied.length-numbered.length,23);
  const installed=sample(t,30,1).installed;
  assert.equal(installed.length,144);
  assert.deepEqual(supplied.filter(id=>!installed.includes(id)),Array.from({length:13},(_,i)=>`123742-${i+2}`));
});

test('whole-frame turns carry all attached fittings; every boundary and replay is seekable',()=>{
  const t=compile({}), rebuilt=compile({});
  for(const n of [30,7,25,29,14,17,1,11,26,20,28,...t.order.slice(1).reverse()]) {
    const step=t.steps.get(n);
    assert.strictEqual(sample(t,n,1),step.end);
    assert.strictEqual(step.start,n===1?t.steps.get(1).start:sample(t,n-1,1));
    for(const p of [0,.31,.65,1]) assert.deepEqual(sample(t,n,p),sample(rebuilt,n,p));
  }
  for(const n of [14,17]) {
    const {events:[turn],start}=t.steps.get(n);
    assert.deepEqual(turn.ids,start.installed);
    assert.ok(turn.rigid);
    const locals=(state,id)=>{
      const p=state.poses[turn.rigid.anchor], q=new Quaternion().fromArray(p,3).invert();
      return new Vector3().fromArray(state.poses[id]).sub(new Vector3().fromArray(p)).applyQuaternion(q).toArray();
    };
    const mid=sample(t,n,(turn.t0+turn.t1)/2);
    for(const id of turn.ids) stays(locals(mid,id),locals(start,id));
  }
  const level=t.steps.get(24);
  assert.deepEqual(level.parts.map(({family,added,reused})=>[family,added,reused]),[['122158',0,10]]);
  for(const id of level.parts[0].ids) {
    const before=level.start.poses[id], after=level.end.poses[id];
    assert.equal(after[1],4);
    assert.ok(Math.abs(before[1]-7)<1e-7);
    stays([after[0],after[2]],[before[0],before[2]]);
    assert.notDeepEqual(after.slice(3),before.slice(3));
  }
});

test('the same four hinged doors survive squaring; both wall positions precede the clip',()=>{
  const t=compile(), square=t.steps.get(28), anchor=t.steps.get(29), cable=t.steps.get(30);
  for(const f of ['door','153334']) {
    const ids=state=>state.installed.filter(id=>parts.get(id).family===f);
    assert.deepEqual(ids(square.end),ids(t.steps.get(26).end));
    assert.deepEqual(ids(cable.end),ids(square.end));
  }
  const [close,nudge,tighten]=square.events;
  assert.equal(close.rigid.anchor,'door-4');
  assert.ok(nudge.paths[0].length===3 && nudge.paths.some(([a,b])=>a[0]!==b[0]));
  assert.deepEqual(tighten.ids,['152527-1','152527-2','152527-3','152527-4','152526-1','152526-2','152526-3','152526-4']);
  for(const id of tighten.ids) assert.notDeepEqual(tighten.before.poses[id],tighten.after.poses[id]);
  assert.equal(square.end.poses['wall-1'],undefined);
  assert.deepEqual(anchor.events.at(-1).ids,['wall-1','wall-2']);
  assert.ok(anchor.events.at(-1).op.prerequisites.every(id=>square.end.installed.includes(id)));
  assert.deepEqual(cable.events[0].op.prerequisites.filter(id=>id.startsWith('wall-')),['wall-1','wall-2']);
  assert.deepEqual(cable.end.poses['door-4'],anchor.end.poses['door-4']);
  assert.notDeepEqual(cable.end.poses['door-4'].slice(3),square.end.poses['door-4'].slice(3));
});
