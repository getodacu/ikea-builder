import assert from 'node:assert/strict';
import test from 'node:test';
import { sample } from '../../src/timeline.js';
import { manual, pageLink, previewPages } from './manual.js';
import product from './product.js';

const {compile,parts,families,useDemo,completeFrame}=product;
const figures=[4,4,5,6,6,7,8];
const counts=(ids)=>{
  const families={};
  for (const id of ids) {
    const key=parts.get(id).family;
    families[key]=(families[key]??0)+1;
  }
  return families;
};

test('the reader follows all seven printed figures and keeps the use inset separate',()=>{
  const t=compile({});
  assert.deepEqual(t.order,[0,1,2,3,4,5,6,7]);
  assert.deepEqual(product.steps.map(s=>s.number),[1,2,3,4,5,6,7]);
  assert.deepEqual([...t.steps.values()].map(s=>s.page),figures);
  assert.deepEqual([...previewPages],[3,4,5,6,7,8]);
  assert.equal(product.unbox.page,3);
  assert.equal(t.steps.get(6).warning.page,2);
  assert.equal(t.steps.get(7).warning.page,2);
  assert.deepEqual(product.references[7],[['Brake lever operation (unnumbered inset)',8]]);
  assert.equal(pageLink(8),`${manual.url}#page=8`);
});

test('the p. 3 stock and figs. 1–7 only add the pictured pieces, not the wrench or alternate numbers',()=>{
  const expected={lower:2,upper:2,hoop:2,'tray-1':1,'tray-2':1,'tray-3':1,clamp:6,
    124154:6,10119612:6,121194:8,130772:1,braked:2,plain:2};
  assert.deepEqual(counts(parts.keys()),expected);
  const t=compile({});
  const additions=[{lower:2,upper:2,121194:4},{hoop:2,121194:4},
    {'tray-1':1,clamp:2,124154:2,10119612:2},{'tray-2':1,clamp:2,124154:2,10119612:2},
    {'tray-3':1,clamp:2,124154:2,10119612:2},{braked:2},{plain:2}];
  for (const [i,newStock] of additions.entries()) {
    const step=t.steps.get(i+1);
    assert.deepEqual(counts(step.events.filter(e=>e.kind==='place').flatMap(e=>e.ids)),newStock);
    assert.equal(step.end.installed.length,[8,14,21,28,35,37,39][i]);
  }
  assert.deepEqual([...parts.keys()].filter(id=>!sample(t,7,1).installed.includes(id)),['wrench']);
  assert.equal(families[130772].role,'tool');
  assert.equal(families.braked.number,'10121215 / 10121236 / 10169640');
  assert.equal(families.plain.number,'10121224 / 10121235 / 10169527');
});

test('tip and joined end mounts carry hardware rigidly and repeat after seeks and back',()=>{
  const t=compile({}), rebuilt=compile({});
  for (const n of [6,3,2,7,4,1,5,0,7]) {
    for (const p of [1,0,.38,.61,1]) assert.deepEqual(sample(t,n,p),sample(rebuilt,n,p));
    if(n>1) {
      const start=sample(t,n,0), prior=sample(t,n-1,1);
      assert.deepEqual(start.installed,prior.installed);
      for (const id of start.installed) assert.deepEqual(start.poses[id],prior.poses[id]);
    }
  }
  const mount=t.steps.get(2).events.find(e=>e.kind==='move');
  assert.deepEqual(mount.ids,['lower-left','upper-left','121194-1','121194-2']);
  const distance=(a,b)=>Math.hypot(...a.slice(0,3).map((v,i)=>v-b[i]));
  const tip=t.steps.get(6).events[0];
  const end5=sample(t,5,1);
  assert.deepEqual(new Set(tip.ids),new Set(end5.installed));
  assert.equal(tip.rigid.anchor,'hoop-front');
  for (const p of [.19,.3,tip.t1]) {
    const pose=sample(t,6,p).poses;
    for (const id of tip.ids) assert.ok(Math.abs(distance(pose[id],pose['hoop-front'])-
      distance(end5.poses[id],end5.poses['hoop-front']))<1e-8);
  }
});

test('both brakes are at one short end and lock from the upright completed pose without moving stock',()=>{
  const t=compile({}), complete=completeFrame(sample(t,7,1));
  assert.equal(useDemo.label,'Lock the caster brakes');
  const demo=useDemo.compile({}), number=demo.order.at(-1), record=demo.steps.get(number);
  assert.deepEqual(demo.order,[0,1,2,3,4,5,6,7,8,9]);
  assert.equal(record.duration,1950);
  assert.equal(record.page,8);
  assert.deepEqual(record.start.poses,complete.poses);
  assert.deepEqual(record.start.installed,complete.installed);
  assert.deepEqual(record.start.captive,{});
  assert.deepEqual(sample(demo,8,0).installed,sample(t,7,1).installed);
  assert.deepEqual(new Set(demo.steps.get(8).events[0].ids),new Set(complete.installed));
  const brakes=['braked-swivel-1','braked-swivel-2'];
  const approx=(a,b)=>Math.abs(a-b)<1e-9;
  for (const [i,id] of [...brakes,'plain-swivel-1','plain-swivel-2'].entries()) {
    const p=complete.poses[id];
    assert.ok(approx(p[0],i<2?-204:204));
    assert.ok(approx(p[1],59));
    assert.ok(approx(p[2],i%2===0?-137:137));
    assert.ok(p.slice(3).every((value,j)=>approx(value,j===3?1:0)));
  }
  for (const p of [0,.37,.5,1]) {
    const frame=sample(demo,number,p);
    assert.deepEqual(frame.installed,complete.installed);
    assert.deepEqual(frame.poses,complete.poses);
    assert.deepEqual(Object.keys(frame.captive),brakes);
    assert.equal(frame.captive[brakes[0]],frame.captive[brakes[1]]);
    assert.ok(p===0?frame.captive[brakes[0]]===0:p===1?frame.captive[brakes[0]]===1:
      frame.captive[brakes[0]]>0 && frame.captive[brakes[0]]<1);
  }
  assert.deepEqual(sample(useDemo.compile({}),number,.5),sample(demo,number,.5));
});
