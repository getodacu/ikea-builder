import assert from 'node:assert/strict';
import test from 'node:test';
import { sample } from '../../src/timeline.js';
import { pageLink, previewPages } from './manual.js';
import { compile } from './model.js';
import product from './product.js';

const start=[8,9,9,10,11,12,12,13,14,14];
const common=[23,23,24,24,25,25,26,26,27,27,28,29,29,30,30,31,31,32,32,33,34,35,35,36,36,37];
const shelfPages={right:[15,16,16,17,18,18],left:[19,20,20,21,22,22]};
const figure=(t,n)=>t.steps.get(n);
const placed=record=>record.events.filter(e=>e.kind==='place').flatMap(e=>e.ids);
const routes=['right','left'].flatMap(footShelfSide=>[true,false].map(skirting=>({footShelfSide,skirting})));
const stock={side:2,notchRail:1,plainRail:1,rearRail:1,hingedRail:1,lowRail:1,roof:1,smallAngle:5,largeAngle:2,
  meshUpper:1,meshLower:1,trough:1,hook:2,footShelf:1,desktop:1,shelfBoard:2,shelfEdge:2,shelfBracket:4,
  lowerFelt:2,hinge:2,door:2,pull:2,camCover:6,wallFixing:2,
  100214:2,101350:2,157421:6,101083:2,117784:8,100404:4,107622:22,10098369:10,100498:3,102533:3,
  130884:8,130886:8,195362:2,151059:2,10046004:4,10106860:35,101065:2,109535:8,190226:2,10002420:2,
  100092:1,141413:2,141414:2,133303:2,126916:2};

const bothAnchors=['126916-1','126916-2','wallFixing-1','wallFixing-2','133303-1','133303-2'];
const spacers=['141413-1','141413-2','141414-1','141414-2'];

test('the printed order, gate choices and preview targets are exact in all four combinations',()=>{
  assert.deepEqual(product.choices.map(c=>[c.step,c.key,c.initial,c.requireExplicit]),[[11,'footShelfSide','right',true],[42,'skirting',true,true]]);
  assert.deepEqual(compile().route,{footShelfSide:'right',skirting:true});
  assert.deepEqual(product.skippedLabels,{44:'With baseboard only',45:'With baseboard only'});
  assert.deepEqual([...previewPages],[6,...Array.from({length:33},(_,i)=>i+8)]);
  assert.equal(product.unbox.warning.page,2);
  assert.equal(product.unbox.page,6);
  for(const route of routes) {
    const {footShelfSide,skirting}=route, t=compile(route), last=skirting?45:43;
    assert.deepEqual(t.order,Array.from({length:last+1},(_,i)=>i));
    assert.deepEqual([...t.steps.values()].map(s=>s.page),[...start,...shelfPages[footShelfSide],...common,...(skirting?[39,40,40]:[38])]);
    assert.match(pageLink(figure(t,11).page),new RegExp(`AA-2488890-1-100\\.pdf#page=${footShelfSide==='right'?15:19}$`));
    assert.match(pageLink(figure(t,43).page),new RegExp(`#page=${skirting?39:38}$`));
    assert.match(pageLink(figure(t,last).page),new RegExp(`#page=${skirting?40:38}$`));
    assert.equal(figure(t,17).page,23);
    assert.equal(figure(t,42).page,37);
    assert.equal(figure(t,42).warning.page,2);
    assert.equal(figure(t,last).warning.page,2);
    assert.deepEqual(placed(figure(t,43)),skirting?spacers:bothAnchors);
    assert.deepEqual(placed(figure(t,last)),bothAnchors);
    if(skirting) {
      assert.deepEqual(placed(figure(t,44)),[]);
      assert.deepEqual(figure(t,44).events.map(e=>e.ids),[['141414-1','141414-2']]);
    } else assert.throws(()=>sample(t,44,1),RangeError);
    assert.deepEqual(sample(t,42,1),sample(compile({...route,skirting:!skirting}),42,1));
  }
});

test('every route balances supplied pieces, external positions, and uninstalled stock',()=>{
  const quantity={};
  for(const {family} of product.parts.values()) quantity[family]=(quantity[family]??0)+1;
  assert.deepEqual(quantity,stock);
  assert.equal([...product.parts.values()].filter(p=>product.families[p.family].role!=='external').length,188);
  assert.deepEqual([...product.parts.values()].filter(p=>product.families[p.family].role==='external').map(p=>p.id),['wallFixing-1','wallFixing-2']);
  for(const route of routes) {
    const t=compile(route), last=t.order.at(-1), end=sample(t,last,1);
    const newIds=[...t.steps.values()].flatMap(placed);
    assert.equal(new Set(newIds).size,newIds.length);
    assert.deepEqual(end.installed,newIds);
    assert.deepEqual([...t.steps.values()].flatMap(s=>s.events.filter(e=>e.kind==='remove')),[]);
    assert.deepEqual([...product.parts.keys()].filter(id=>!end.installed.includes(id)),[
      '100092-1',...(route.skirting?[]:spacers),
      ...(route.footShelfSide==='right'?['camCover-1','camCover-2','camCover-3']:[]),'camCover-4','camCover-5','camCover-6'
    ]);
    const cams=figure(t,13).events.find(e=>e.kind==='adjust');
    assert.deepEqual(cams.ids,['102533-1','102533-2','102533-3']);
    assert.deepEqual(figure(t,15).events[0].ids,['107622-9','107622-10']);
    assert.ok(placed(figure(t,9)).includes('107622-9'));
    assert.deepEqual(figure(t,42).events.find(e=>e.kind==='adjust').ids,['10046004-1','10046004-2','10046004-3','10046004-4']);
  }
});

test('changing shelf side uses opposite receivers and maintains a common mesh phase',()=>{
  const left=compile({footShelfSide:'left'}), right=compile({footShelfSide:'right'});
  assert.deepEqual(sample(left,10,1),sample(right,10,1));
  for(const [t,side,sign] of [[left,'sideL',-1],[right,'sideR',1]]) {
    assert.deepEqual(figure(t,11).events[0].op.prerequisites,[side]);
    assert.deepEqual(figure(t,11).events[0].ids,['100498-1','100498-2','100498-3']);
    const at14=sample(t,14,1).poses, at16=sample(t,16,1).poses, at18=sample(t,18,1).poses;
    assert.equal(Math.sign(at14.smallAngle5[0]),-sign);
    assert.ok(at16.footShelf.slice(0,3).every((v,i)=>Math.abs(v-[sign*283,105,0][i])<1e-8));
    assert.deepEqual(['100214-1','100214-2'].map(id=>at16[id][0]),[sign*204,sign*400]);
    assert.deepEqual(at18.meshUpper.slice(0,3),[0,1522,-336]);
    assert.deepEqual(at18.meshLower.slice(0,3),[0,1022,-336]);
    assert.equal(at18['10106860-1'][0],-sign*285);
    assert.equal(figure(t,18).end.captive.meshLower,sign*2);
  }
  assert.notDeepEqual(sample(left,17,1).poses.meshUpper.slice(3),sample(right,17,1).poses.meshUpper.slice(3));
});

test('all forward, back/seek and fresh-compile boundaries agree; mounted units stay rigid',()=>{
  const distance=(a,b)=>Math.hypot(...a.slice(0,3).map((x,i)=>x-b[i]));
  for(const route of routes) {
    const t=compile(route), fresh=compile(route);
    const boundaries=t.order.map(n=>sample(t,n,1));
    for(const n of [...t.order].reverse()) {
      assert.deepEqual(sample(t,n,1),boundaries[n]);
      assert.deepEqual(sample(fresh,n,1),boundaries[n]);
      if(n>1) assert.deepEqual(figure(t,n).start,boundaries[n-1]);
    }
    for(const [n,base,member] of [[14,'sideR','100498-1'],[22,'trough','190226-1'],[24,'desktop','101350-1'],[38,'doorL','pullL']]) {
      const event=figure(t,n).events.find(e=>e.kind==='move');
      const initial=distance(event.before.poses[base],event.before.poses[member]);
      for(const f of [.25,.55,.85]) {
        const frame=sample(t,n,event.t0+(event.t1-event.t0)*f);
        assert.ok(Math.abs(distance(frame.poses[base],frame.poses[member])-initial)<1e-7);
      }
    }
  }
});
