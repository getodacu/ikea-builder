import assert from 'node:assert/strict';
import test from 'node:test';
import { sample } from '../../src/timeline.js';
import { manual, pageLink, previewPages } from './manual.js';
import { compile } from './model.js';
import product from './product.js';

const order=[0,...Array.from({length:21},(_,i)=>i+1),23];
const pages=[5,5,6,6,7,8,9,10,13,14,14,15,15,16,17,17,18,18,19,19,20,22];
const added=[
  {caseSide:2,118331:6},{caseBack:1,101345:12},{},{119251:6},{caseBase:1,caseTop:1,118331:12},{},{119251:12},{10061614:4},
  {frontDeep:3,118331:12},{sideDeep:6},{103114:12},{bottomDeep:3},{backDeep:3},{110519:12},
  {sideShallow:4,101345:4},{frontShallow:2,118331:4},{},{103114:4},{bottomShallow:2},{backShallow:2},{110519:8},{105021:10}
];
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-6,`${a} != ${b}`);
const familiesOf=ids => {
  const counts={};
  for(const id of ids) {
    const {family}=product.parts.get(id);
    counts[family]=(counts[family]??0)+1;
  }
  return counts;
};

test('the standalone route uses the pinned edition and a genuine printed gap before fig. 23',()=>{
  assert.equal(manual.id,'AA-2242840-5-100');
  assert.equal(manual.footer,'AA-2242840-5');
  assert.equal(manual.date,'2022-10-27');
  assert.equal(manual.pages,24);
  assert.equal(manual.sha256,'75385bf91c4dfe00b8a1f230aa030b037bdc55a846325f1c26e5f54299bb578d');
  assert.ok(Object.isFrozen(manual));
  const t=compile({});
  assert.deepEqual(t.order,order);
  assert.deepEqual([...t.steps.values()].map(s=>s.page),pages);
  assert.deepEqual(product.steps.map(s=>s.number),order.slice(1));
  assert.deepEqual([...previewPages],[3,5,6,7,8,9,10,13,14,15,16,17,18,19,20,22]);
  assert.match(pageLink(t.steps.get(23).page),/alex-drawer-unit-white__AA-2242840-5-100\.pdf#page=22$/);
  assert.throws(()=>sample(t,22,1),RangeError);
  assert.deepEqual(product.chapters.flatMap(([,a,b])=>order.filter(n=>n>=a&&n<=b)),order);
  assert.equal(product.unbox.warning.page,4);
  assert.equal(t.steps.get(23).warning.page,4);
  assert.match(t.steps.get(23).warning.text,/Do not stack/);
  assert.ok(product.references[8].some(([,p])=>p===23));
  assert.ok(product.references[21].some(([,p])=>p===21));
  assert.equal(product.choices,undefined);
  assert.equal(product.useDemo,undefined);
});

test('numbered stock and all structural pieces are accounted for at every boundary',()=>{
  const t=compile({});
  const unbox=sample(t,0,1);
  const stock=familiesOf(Object.keys(unbox.poses));
  assert.deepEqual(stock,{
    caseSide:2,caseBack:1,caseTop:1,caseBase:1,
    frontDeep:3,sideDeep:6,bottomDeep:3,backDeep:3,frontShallow:2,sideShallow:4,bottomShallow:2,backShallow:2,
    118331:34,119251:18,101345:16,10061614:4,103114:16,110519:20,105021:10,110907:4,100001:1
  });
  assert.equal(product.parts.size,153);
  assert.equal(product.families['100001'].role,'tool');
  let before=[];
  t.order.slice(1).forEach((n,i)=>{
    const s=t.steps.get(n), end=sample(t,n,1);
    assert.deepEqual(s.start.installed,before);
    assert.ok(s.events.every(e=>e.kind!=='remove'));
    assert.deepEqual(end.installed.slice(0,before.length),before);
    assert.deepEqual(familiesOf(end.installed.slice(before.length)),added[i],`stock at fig. ${n}`);
    assert.equal(Object.keys(end.poses).length,end.installed.length);
    before=end.installed;
  });
  assert.equal(before.length,148);
  assert.equal(new Set(before).size,before.length);
  assert.deepEqual([...product.parts.keys()].filter(id=>!before.includes(id)),['110907-1','110907-2','110907-3','110907-4','100001-1']);
});

test('fig. 8 turns the bolted cabinet and exactly four pads together',()=>{
  const t=compile({}), {events,end}=t.steps.get(8), [applyPads,turn]=events;
  assert.equal(applyPads.kind,'place');
  assert.equal(turn.kind,'move');
  assert.deepEqual(turn.ids.slice().sort(),end.installed.slice().sort());
  assert.equal(turn.rigid.anchor,'cabinet-left');
  const midway=sample(t,8,(turn.t0+turn.t1)/2);
  for(const [i,x,z] of [[1,-151,-265],[2,-151,265],[3,151,-265],[4,151,265]]) {
    const id=`10061614-${i}`, pad=end.poses[id];
    [x,4,z].forEach((v,j)=>close(v,pad[j]));
    const base=end.poses['cabinet-bottom'], movedBase=midway.poses['cabinet-bottom'], movedPad=midway.poses[id];
    close(Math.hypot(...pad.slice(0,3).map((v,j)=>v-base[j])),Math.hypot(...movedPad.slice(0,3).map((v,j)=>v-movedBase[j])));
  }
});

test('all five drawers push in, pull back for two screws, and close with those same screws',()=>{
  const t=compile({}), s=t.steps.get(23);
  const bayY=[579,478,327,176,25];
  assert.equal(s.events.length,20);
  for(const [i,y] of bayY.entries()) {
    const prefix=`drawer-${i+1}`, front=`${prefix}-front`, frontH=i<2?98:148;
    const [align,engage,secure,closeDrawer]=s.events.slice(i*4,i*4+4);
    assert.deepEqual([align.kind,engage.kind,secure.kind,closeDrawer.kind],['move','move','place','move']);
    const ys=y+frontH/2;
    assert.equal(product.parts.get(front).family,i<2?'frontShallow':'frontDeep');
    for(const e of [align,engage,closeDrawer]) assert.equal(e.rigid.anchor,front);
    assert.deepEqual(engage.rigid.frames.map(p=>p.slice(0,3)),[[0,ys,871.5],[0,ys,501.5],[0,ys,281.5],[0,ys,441.5]]);
    assert.deepEqual(engage.after.installed,engage.before.installed);
    assert.deepEqual(secure.op.prerequisites,[`${prefix}-left`,`${prefix}-right`]);
    assert.deepEqual(secure.ids,[`105021-${i*2+1}`,`105021-${i*2+2}`]);
    close(closeDrawer.after.poses[front][2],281.5);
    for(const id of secure.ids) {
      close(secure.after.poses[id][1],y+46);
      close(secure.after.poses[id][2],388);
      close(closeDrawer.after.poses[id][2],228);
      assert.ok(closeDrawer.ids.includes(id));
    }
  }
});

test('replay, out-of-order seeks, Back and recompile preserve transforms and physical IDs',()=>{
  const t=compile({}), again=compile({});
  for(const n of [...order].reverse()) {
    const first=sample(t,n,.57);
    sample(t,23,1); sample(t,order[Math.max(0,order.indexOf(n)-1)],1); sample(t,n,.09);
    assert.deepEqual(sample(t,n,.57),first);
    assert.deepEqual(sample(again,n,.57),first);
    assert.deepEqual(sample(again,n,1),sample(t,n,1));
  }
});
