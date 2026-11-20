import test from 'node:test';
import assert from 'node:assert/strict';
import {Quaternion,Vector3} from 'three';
import {sample} from '../../src/timeline.js';
import {parts,families} from './kit.js';
import {compile} from './model.js';
import {pages,previewPages} from './manual.js';

const timeline=compile({}), range=n=>Array.from({length:n},(_,i)=>i);
const figure=n=>timeline.steps.get(n), family=id=>parts.get(id).family;
const placed=n=>figure(n).events.filter(e=>e.kind==='place').flatMap(e=>e.ids);
const tally=keys=>keys.reduce((m,k)=>(m[k]=(m[k]??0)+1,m),{});
const numbered=ids=>tally(ids.filter(id=>families[family(id)].number).map(family));

test('all 52 printed figures use their one-based pages, in order',()=>{
  const expected=[6,7,7,8,8,9,9,10,10,11,11,12,13,13,14,14,15,15,16,16,17,17,18,19,19,20,21,21,22,22,23,24,24,25,26,27,27,28,29,30,30,31,31,32,32,32,32,33,33,34,35,35];
  assert.deepEqual(timeline.order,range(53));
  assert.deepEqual(Object.values(pages),expected);
  assert.deepEqual([...timeline.steps.values()].map(s=>s.page),expected);
  assert.deepEqual([...previewPages],[3,...range(30).map(n=>n+6)]);
});

test('packet counts reconcile by supplied part number, not purchase sets',()=>{
  const packet=n=>tally([...parts.values()].filter(p=>p.packet===`Packet ${n}`).map(p=>p.family));
  assert.deepEqual(packet(1),{118331:14,109542:6,109567:12,102138:6,100372:6,101345:24,119030:14,111401:6,110646:6,110525:18,105307:22});
  assert.deepEqual(packet(2),{123660:2,105307:25,100049:1,108490:1,114671:4,100372:4,105163:2,101359:4,130787:4,114670:4,100602:2,110525:11,130485:2});
  assert.deepEqual(packet(3),{110519:8,118331:8,109567:4,101345:8,119030:8,100359:4,100365:12});
  assert.deepEqual(tally([...parts.values()].map(p=>p.packet)),{'Frame panels':10,'Bed slats':25,'Drawer panels':10,'Packet 1':134,'Packet 2':66,'Packet 3':52,'Loose fittings':16});
  assert.deepEqual(numbered([...parts.values()].filter(p=>p.packet==='Loose fittings').map(p=>p.id)),{112976:3,112978:1,118301:2,124328:2,CL:2,CR:2,DL:2,DR:2});
});

test('placements balance at each figure, with only the two keys remaining',()=>{
  const fromManual=[
    {panels:3,101345:12},{118331:7},{112976:1,105307:2},{105307:6},{},{119030:4},{119030:4},
    {panels:3,CR:1,110646:3,102138:3},{CL:1,110646:3,102138:3},{CR:1,100372:3},{CL:1,100372:3},
    {111401:6,109567:12},{101345:12},{},{119030:3},{panels:1,118331:7},{112976:1,105307:2},{105307:6},
    {},{},{119030:3},{109542:6},{slats:3,105307:6},{slats:9,110525:18},{},
    {panels:3,101359:4},{114671:4},{112976:1,105307:2},{105307:6},{114670:4},{},
    {112978:1,130485:2,105307:2},{105163:2,100602:2},{slats:2,123660:2,100372:4},{105307:4},
    {130787:4},{slats:11,110525:11},{105307:11},{},{panels:6,101345:8},{118331:8},{},{119030:8},
    {100359:2},{118301:2},{panels:2},{panels:2},{110519:8},{100359:2},{DL:2,DR:2,100365:12},{124328:2,109567:4},{}
  ];
  assert.equal(parts.size,313); assert.equal(sample(timeline,0,1).installed.length,0);
  fromManual.forEach((expected,i)=>{
    const keys=placed(i+1).map(id=>families[family(id)].number?family(id):parts.get(id).packet==='Bed slats'?'slats':'panels');
    assert.deepEqual(tally(keys),expected,`fig. ${i+1}`);
  });
  for(const [n,count] of [[25,159],[38,241],[39,241],[51,311],[52,311]]) assert.equal(figure(n).end.installed.length,count);
  const unused=[...parts.keys()].filter(id=>!figure(52).end.installed.includes(id));
  assert.deepEqual(unused.map(family).sort(),['100049','108490']);
  assert.ok(unused.every(id=>families[family(id)].role==='tool'));
});

test('handed tracks, keyed rails, and reused hardware follow the insets',()=>{
  const locked=figure(20).events.filter(e=>e.kind==='adjust').flatMap(e=>e.ids);
  assert.deepEqual(locked.sort(),placed(7).sort());
  assert.ok(locked.every(id=>figure(20).end.captive[id]===1));
  const passes=figure(31).events.filter(e=>e.kind==='adjust');
  for(const cam of placed(30)) {
    const turns=passes.filter(e=>e.ids.includes(cam));
    assert.equal(turns.length,2); assert.ok(turns[0].captive.to>0&&turns[0].captive.to<1);
    assert.equal(turns[1].captive.to,1);
  }
  assert.ok(figure(33).events.some(e=>e.op.prerequisites.includes('112978-1')));
  for(const screw of placed(44)) assert.ok(figure(45).events.some(e=>e.op.prerequisites.includes(screw)));
  const drawers=figure(52).events.filter(e=>e.rigid);
  const roots=new Set(drawers.map(e=>e.rigid.anchor)); assert.equal(roots.size,2);
  for(const root of roots) {
    const box=drawers.find(e=>e.rigid.anchor===root);
    assert.equal(box.ids.length,35); assert.ok(box.ids.includes(root));
    for(const k of ['DL','DR','118301','124328']) assert.ok(box.ids.some(id=>family(id)===k),k);
  }
});

function relative(a,b) {
  const q=new Quaternion().fromArray(a,3).invert();
  const pos=new Vector3().fromArray(b).sub(new Vector3().fromArray(a)).applyQuaternion(q);
  return [pos,q.multiply(new Quaternion().fromArray(b,3))];
}
test('turns, joining and drawer insertion carry mounted hardware rigidly between endpoints',()=>{
  for(const n of [12,19,24,31,35,39,52]) {
    const moves=figure(n).events.filter(e=>e.rigid); assert.ok(moves.length,`fig. ${n}`);
    for(const e of moves) for(const state of [e.before,sample(timeline,n,(e.t0+e.t1)/2),e.after]) {
      const a=e.rigid.anchor;
      for(const id of e.ids) {
        const [x,q]=relative(e.before.poses[a],e.before.poses[id]),[y,r]=relative(state.poses[a],state.poses[id]);
        assert.ok(x.distanceTo(y)<1e-5&&1-Math.abs(q.dot(r))<1e-7,`fig. ${n}: ${id}`);
      }
    }
  }
});
test('out-of-order seeks, Back and replay agree with a fresh compile',()=>{
  const fresh=compile({});
  for(const n of [52,31,20,38,39,50,51,52,1,25,24,25]) for(const u of [1,.43,0,1])
    assert.deepEqual(sample(timeline,n,u),sample(fresh,n,u));
});
