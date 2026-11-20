import assert from 'node:assert/strict';
import test from 'node:test';
import { sample } from '../../src/timeline.js';
import { families, parts } from './kit.js';
import { manual, pageLink, previewPages, unboxPage } from './manual.js';
import { compile, compileDemo } from './model.js';
import product from './product.js';

const printed=[5,5,7,7,8,8,9,9,10,11,12,13,13,14,15,15,16];
const order=[0,...printed.map((_,i)=>i+1)];
const added=[2,8,2,10,0,6,10,4,1,0,5,3,5,2,3,0,4];
const quantities={railWide:1,railNarrow:1,column:2,arm:2,base:2,shaft:1,crank:1,hook:1,tray:1,top:1,
  '10118114':4,'10118113':4,'10036539':10,'10106891':4,'148236':8,'112762':4,'101076':4,'143670':2,
  '107624':4,'109067':2,'119500':2,'10096992':4};
const count=ids=>Object.fromEntries(Object.entries(Object.groupBy(ids,id=>parts.get(id).family)).map(([key,list])=>[key,list.length]));
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-6,`${a} ≠ ${b}`);

for(const crankSide of ['left','right']) {
  test(`${crankSide} crank: wide sequence and reconciled physical stock`,()=>{
    const route={crankSide}, t=compile(route);
    assert.deepEqual(t.order,order);
    assert.deepEqual([...t.steps.values()].map(step=>step.page),printed);
    assert.deepEqual(product.steps.map(s=>s.number),order.slice(1));
    assert.deepEqual(product.chapters.flatMap(([,lo,hi])=>Array.from({length:hi-lo+1},(_,i)=>lo+i)),order);
    assert.equal(unboxPage,3);
    assert.deepEqual(previewPages,new Set([3,...printed]));
    assert.equal(pageLink(16),`${manual.url}#page=16`);
    let installed=0;
    for(const [i,n] of order.slice(1).entries()) {
      const step=t.steps.get(n);
      assert.equal(step.start.installed.length,installed);
      assert.equal(step.parts.reduce((sum,row)=>sum+row.added,0),added[i]);
      installed+=added[i];
      assert.equal(sample(t,n,1).installed.length,installed);
    }
    assert.equal(parts.size,68);
    assert.deepEqual(count(sample(t,17,1).installed),quantities);
    assert.deepEqual([...parts.values()].filter(p=>families[p.family].role==='tool').map(p=>p.family),['124325','10067513','100006']);
    assert.deepEqual(t.steps.get(5).parts.find(p=>p.family==='10036539'),{
      family:'10036539',ids:Array.from({length:10},(_,i)=>`10036539-${i+1}`),added:0,reused:10});
    assert.equal(t.steps.get(10).end.captive.shaft,2);
    assert.equal(t.steps.get(17).warning.page,16);
    assert.match(t.steps.get(17).warning.text,/every tabletop accessory hole/);
    for(const number of [3,9,13,14,16]) assert.ok(t.steps.get(number).events.some(event=>event.rigid),`rigid motion in ${number}`);
    const recompile=compile(route);
    for(const number of [17,6,13,2,16,10,12,4,9,17]) {
      for(const progress of [1,0,.54,1]) assert.deepEqual(sample(t,number,progress),sample(recompile,number,progress));
    }
    for(const previous of [4,8,12,13,16]) assert.deepEqual(t.steps.get(previous+1).start,sample(t,previous,1));
  });

  test(`${crankSide} crank: opt-in use keeps the assembly boundary and all IDs`,()=>{
    const t=compile({crankSide}), demo=compileDemo({crankSide});
    const end=sample(t,17,1), start=sample(demo,18,0), up=sample(demo,18,1);
    assert.equal(product.useDemo.label,'Raise the desk with the crank');
    assert.equal(product.useDemo.compile,compileDemo);
    assert.deepEqual(demo.order,[...order,18]);
    assert.equal(demo.steps.get(18).page,19);
    assert.equal(demo.steps.get(18).duration,2650);
    assert.deepEqual(start.poses,end.poses);
    assert.deepEqual(start.captive,end.captive);
    assert.deepEqual(start.installed,up.installed);
    assert.ok(demo.steps.get(18).parts.every(p=>p.added===0));
    assert.deepEqual(['baseL','baseR','columnL','columnR',...Array.from({length:4},(_,i)=>`112762-${i+1}`)].map(id=>up.poses[id]),
      ['baseL','baseR','columnL','columnR',...Array.from({length:4},(_,i)=>`112762-${i+1}`)].map(id=>end.poses[id]));
    for(const id of ['top','railWide','railNarrow','shaft','armL','armR','crank','hook','tray','119500-1','10096992-4']) {
      close(up.poses[id][1]-end.poses[id][1],180);
      assert.deepEqual(up.poses[id].filter((_,i)=>i!==1),end.poses[id].filter((_,i)=>i!==1));
    }
    assert.equal(up.captive.columnL,6);
    assert.equal(up.captive.columnR,6);
    const [unlock,raise]=demo.steps.get(18).events;
    assert.equal(sample(demo,18,unlock.t1).captive.crank,2);
    assert.ok(sample(demo,18,(raise.t0+raise.t1)/2).captive.crank>2);
  });
}

test('only the documented side mount is changed on the right route',()=>{
  const left=compile({crankSide:'left'}), right=compile({crankSide:'right'});
  assert.deepEqual(sample(compile({}),17,1),sample(left,17,1));
  assert.throws(()=>compile({crankSide:'rear'}),RangeError);
  assert.throws(()=>compileDemo({crankSide:null}),RangeError);
  for(let n=1;n<=10;n++) assert.deepEqual(left.steps.get(n).end,right.steps.get(n).end);
  const a=sample(left,17,1),b=sample(right,17,1);
  assert.deepEqual(a.installed,b.installed);
  for(const id of a.installed) {
    if(!/^(crank$|hook$|101076-|143670-)/.test(id)) assert.deepEqual(a.poses[id],b.poses[id],id);
  }
  for(const id of ['crank','hook']) {
    close(a.poses[id][0],-b.poses[id][0]);
    close(a.poses[id][2],b.poses[id][2]);
  }
  assert.ok(a.poses.crank[0]<0 && b.poses.crank[0]>0);
  assert.ok(a.poses.hook[0]>0 && b.poses.hook[0]<0);
});
