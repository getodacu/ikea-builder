import assert from 'node:assert/strict';
import test from 'node:test';
import { Quaternion, Vector3 } from 'three';
import { sample } from '../../src/timeline.js';
import { manual, pageLink, previewPages } from './manual.js';
import { compile, compileUseDemo } from './model.js';
import product from './product.js';

const p=(frame,id)=>new Vector3().fromArray(frame.poses[id]);
const q=(frame,id)=>new Quaternion().fromArray(frame.poses[id],3);
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-6,`${a} ≠ ${b}`);
const addedByFigure=[12,6,39,8,6,4,2,18,6,0,6,18,30,12,24,0];

test('US source order and stock balance through every printed figure',()=>{
  const t=compile({});
  const printed=Array.from({length:17},(_,i)=>i);
  assert.deepEqual(t.order,printed);
  assert.deepEqual(product.steps.map(s=>s.number),printed.slice(1));
  assert.deepEqual([...t.steps.values()].map(s=>s.page),[4,5,5,6,7,8,8,9,9,9,10,10,11,11,11,12]);
  assert.deepEqual([...previewPages],[3,4,5,6,7,8,9,10,11,12]);
  assert.equal(manual.id,'AA-1931387-8-100');
  assert.match(pageLink(12),/AA-1931387-8-100\.pdf#page=12$/);
  assert.deepEqual(product.references[16],[['Raise a leaf, swing its gate and seat the locating pin',12]]);
  assert.equal(product.unbox.warning.page,2);
  assert.equal(t.steps.get(7).warning.page,2);
  assert.deepEqual(product.chapters.flatMap(([,start,end])=>printed.slice(start,end+1)),printed);

  const stock={};
  for(const {family} of product.parts.values()) stock[family]=(stock[family]??0)+1;
  assert.deepEqual(stock,{frame:2,crossblock:2,center:1,leaf:2,drawerL:6,drawerR:6,drawerBack:6,drawerBottom:6,drawerFront:6,
    105330:4,112996:24,110519:24,101352:8,121121:4,101345:12,100372:42,107271:4,156508:2,110689:24,10005601:4,120139:2,10083377:1,110018:1});
  assert.equal(product.families['112996'].number,'112996 / 118331');
  let count=0;
  for(const [i,added] of addedByFigure.entries()) {
    const record=t.steps.get(i+1), placed=record.events.filter(e=>e.kind==='place').flatMap(e=>e.ids);
    assert.equal(placed.length,added,`Printed figure ${i+1}`);
    assert.equal(new Set(placed).size,added);
    assert.equal(sample(t,i+1,1).installed.length,count+=added);
  }
  const end=sample(t,16,1);
  assert.equal(end.installed.length,191);
  assert.deepEqual([...product.parts.keys()].filter(id=>!end.poses[id]),['10083377-1','110018-1']);
  const tap=t.steps.get(10).events.flatMap(e=>e.ids);
  assert.deepEqual(tap,Array.from({length:12},(_,i)=>`110519-${i+1}`));
  assert.ok(t.steps.get(10).events.every(e=>e.kind==='adjust'));
  assert.equal(t.steps.get(15).events.filter(e=>e.kind==='adjust').flatMap(e=>e.ids).length,24);
});

test('out-of-order seek, replay, Back and recompile reproduce all boundaries and mids',()=>{
  const t=compile({}), fresh=compile({});
  const ends=t.order.map(n=>sample(t,n,1));
  for(const n of [...t.order].reverse()) {
    assert.deepEqual(sample(t,n,1),ends[n]);
    assert.deepEqual(sample(fresh,n,1),ends[n]);
    if(n>0) {
      if(n>1) {
        const start=sample(t,n,0), before=ends[n-1];
        assert.deepEqual(start.installed,before.installed);
        for(const id of before.installed) assert.deepEqual(start.poses[id],before.poses[id]);
      }
      for(const e of t.steps.get(n).events) {
        const at=(e.t0+e.t1)/2;
        assert.deepEqual(sample(t,n,at),sample(fresh,n,at));
      }
    }
  }
  const turn=t.steps.get(7).events.at(-1);
  assert.deepEqual(new Set(turn.ids),new Set(ends[7].installed));
  for(const id of ['107271-1','107271-2','107271-3','107271-4','156508-1','156508-2']) near(p(ends[7],id).y,4);
});

test('fig. 16 mounts six separate drawers on opposed straight insertion paths',()=>{
  const t=compile({}), record=t.steps.get(16), {end}=record;
  assert.equal(record.events.length,6);
  for(const [i,e] of record.events.entries()) {
    const id=`drawerFront-${i+1}`, sign=i<3?1:-1;
    const tier=i%3, y=202+tier*198;
    assert.equal(e.rigid.anchor,id);
    assert.equal(e.ids.length,19);
    assert.equal(new Set(e.ids).size,19);
    assert.ok(e.ids.includes(`drawerBottom-${i+1}`));
    assert.ok(e.ids.includes(`drawerBack-${i+1}`));
    const pass=e.rigid.frames.at(-2), seat=e.rigid.frames.at(-1);
    near(pass[0],0); near(seat[0],0); near(pass[1],y); near(seat[1],y);
    near(pass[2],sign*846); near(seat[2],sign*372);
    near(p(end,id).z,sign*372);
    near(new Vector3(0,0,1).applyQuaternion(q(end,id)).z,sign);
    for(const component of e.ids) assert.ok(end.poses[component]);
  }
});

test('p. 12 use remains outside the reader; independent gates do not change stock',()=>{
  const normal=compile({}), demo=product.useDemo.compile({}), complete=sample(normal,16,1), n=demo.order.at(-1);
  assert.equal(product.useDemo.label,'Open both gateleg leaves');
  assert.deepEqual(demo.order,[...normal.order,17]);
  assert.equal(product.useDemo.compile,compileUseDemo);
  assert.equal(demo.steps.get(n).duration,5450);
  assert.deepEqual(demo.steps.get(n).start,complete);
  assert.deepEqual(sample(demo,n,0).poses,complete.poses);
  assert.equal(normal.steps.has(n),false);
  const use=demo.steps.get(n), end=sample(demo,n,1);
  assert.equal(use.events.length,6);
  assert.ok(use.events.every(e=>e.kind==='move'&&e.rigid));
  assert.deepEqual(end.installed,complete.installed);
  assert.deepEqual(use.events.map(e=>e.rigid.anchor),['leaf-left','frame-left','leaf-left','leaf-right','frame-right','leaf-right']);
  const leftOpen=use.events[2].after;
  assert.deepEqual(leftOpen.poses['leaf-right'],complete.poses['leaf-right']);
  assert.deepEqual(leftOpen.poses['frame-right'],complete.poses['frame-right']);
  const changing=new Set(use.events.flatMap(e=>e.ids));
  for(const id of complete.installed) if(!changing.has(id)) assert.deepEqual(end.poses[id],complete.poses[id]);
  for(const [i,side] of ['left','right'].entries()) {
    const sign=i===0?-1:1, id=`leaf-${side}`;
    near(new Vector3(1,0,0).applyQuaternion(q(complete,id)).y,-Math.sin(89*Math.PI/180));
    near(new Vector3(1,0,0).applyQuaternion(q(end,id)).x,sign);
    near(p(end,`156508-${i+1}`).x,sign*626);
    near(p(end,`156508-${i+1}`).y,4);
  }
});
