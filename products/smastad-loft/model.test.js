import assert from 'node:assert/strict';
import test from 'node:test';
import { sample } from '../../src/timeline.js';
import { manual, pageLink, previewPages } from './manual.js';
import { compile } from './model.js';
import product from './product.js';

const printed={
  'right-upper':[7,8,8,9,10,10,11,11,12,13,14,15,15,16,17,18,18,21,22,23,24,24,25,25,26,26,27,28,28,29,29,30,30,31,31,32,32],
  'right-lower':[7,8,8,9,10,10,11,11,12,13,14,15,15,16,19,20,20,21,22,23,24,24,25,25,26,26,27,28,28,29,29,30,30,31,31,32,32],
  'left-upper':[33,34,34,35,36,36,37,37,38,39,40,41,41,42,43,44,44,47,48,49,50,50,51,51,52,52,53,54,54,55,55,56,56,57,57,58,58],
  'left-lower':[33,34,34,35,36,36,37,37,38,39,40,41,41,42,45,46,46,47,48,49,50,50,51,51,52,52,53,54,54,55,55,56,56,57,57,58,58]
};
const amounts=[4,5,2,0,2,4,2,16,6,6,6,4,1,4,4,1,2,0,2,12,2,1,2,2,4,2,25,16,8,2,3,2,4,2,2,4,5];
const unused=['113453-1','100049-1','100092-1','100002-1'];
const added=step=>step.events.filter(e=>e.kind==='place').flatMap(e=>e.ids);
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} should be near ${b}`);

test('the four choices play exactly one depiction of each printed step',()=>{
  assert.deepEqual(product.steps.map(r=>r.number),Array.from({length:37},(_,i)=>i+1));
  assert.equal(product.choices[0].step,1);
  assert.equal(product.choices[0].requireExplicit,true);
  assert.deepEqual(product.choices[0].options.map(([v])=>v),Object.keys(printed));
  assert.deepEqual(compile().route,{layout:'right-upper'});
  for(const [layout,expected] of Object.entries(printed)) {
    const t=compile({layout});
    assert.deepEqual(t.order,Array.from({length:38},(_,i)=>i));
    assert.deepEqual([...t.steps.values()].map(r=>r.page),expected);
    assert.equal(pageLink(t.steps.get(37).page),`${manual.url}#page=${expected[36]}`);
    assert.equal(t.steps.get(18).warning.page,expected[17]);
    assert.equal(t.steps.get(37).warning.page,59);
    assert.match(t.steps.get(37).warning.text,/marked fill line/);
  }
  for(const side of ['right','left']) {
    const a=compile({layout:`${side}-upper`}), b=compile({layout:`${side}-lower`});
    assert.match(a.steps.get(15).action,/open wide bay/);
    assert.match(b.steps.get(15).action,/closed wide bay/);
    assert.deepEqual(a.steps.get(18),b.steps.get(18));
  }
  assert.deepEqual([...previewPages],[3,...Array.from({length:52},(_,i)=>7+i)]);
  assert.deepEqual(product.references[0],product.references[1]);
  assert.equal(product.references[1][0][1],6);
  assert.equal(product.references[37][0][1],59);
  assert.deepEqual(product.manualLinks.filter(([,p])=>typeof p==='string'),[
    ['Desk assembly booklet','https://www.ikea.com/us/en/assembly_instructions/smastad-loft-bed-frame-desk-and-storage-white__AA-2200883-3-100.pdf'],
    ['Storage assembly booklet','https://www.ikea.com/us/en/assembly_instructions/smastad-loft-bed-frame-desk-and-storage-white__AA-2200885-4-100.pdf']
  ]);
});

test('all four routes use the reconciled stock once and preserve sought boundaries',()=>{
  const inventory={};
  for(const {family} of product.parts.values()) inventory[family]=(inventory[family]??0)+1;
  assert.deepEqual(inventory,{gableNarrow:1,gableWide:1,rearRail:1,frontRail:1,sideGuard:1,frontGuard:1,brace:1,
    stileBored:1,stilePlain:1,slat:7,tread:5,123491:2,100218:16,105105:3,105100:14,114613:8,192800:4,
    101358:19,100600:14,116894:18,114670:2,150626:2,113453:1,'100049':1,100092:1,100002:1,
    105237:8,128437:8,113434:4,101352:1,100710:8,106043:6,121108:5,139536:2,190729:2,190730:2});
  assert.equal(product.parts.size,173);
  assert.equal([...product.parts.values()].filter(p=>p.family==='100218'&&p.packet==='Packet 2').length,6);
  assert.ok(Object.values(product.families).every(f=>f.role==='kit'||f.role==='tool'));
  for(const layout of Object.keys(printed)) {
    const t=compile({layout}), fresh=compile({layout});
    const chunks=[...t.steps.values()].map(added);
    assert.deepEqual(chunks.map(ids=>ids.length),amounts);
    const ids=chunks.flat();
    assert.equal(ids.length,169);
    assert.equal(new Set(ids).size,169);
    assert.deepEqual([...product.parts.keys()].filter(id=>!ids.includes(id)),unused);
    assert.ok(unused.every(id=>product.families[product.parts.get(id).family].role==='tool'));
    assert.deepEqual(sample(t,37,1).installed,ids);
    assert.ok([...t.steps.values()].every(r=>r.events.every(e=>e.kind!=='remove')));
    const forward=t.order.map(n=>sample(t,n,1));
    for(const n of [...t.order].reverse()) {
      assert.deepEqual(sample(t,n,1),forward[n]);
      assert.deepEqual(sample(fresh,n,1),forward[n]);
      if(n>1) assert.equal(t.steps.get(n).start,forward[n-1]);
    }
  }
});

test('the same raised frame seats level on the handed fixed receiver group',()=>{
  for(const layout of Object.keys(printed)) {
    const t=compile({layout}), same=compile({layout}), s=layout.startsWith('right')?1:-1;
    const record=t.steps.get(18), e=record.events[0], before=sample(t,17,1), seated=sample(t,18,1);
    assert.equal(record.events.length,1);
    assert.equal(e.kind,'move');
    assert.equal(e.ids.length,62);
    assert.equal(e.rigid.anchor,'gableWide');
    assert.ok(['gableNarrow','rearRail','frontRail','101352-1','slat-1','slat-2','106043-4','139536-1','139536-2'].every(id=>e.ids.includes(id)));
    const now=e.t0+(e.t1-e.t0)*.88, replay=sample(t,18,now);
    assert.deepEqual(sample(same,18,now),replay);
    assert.deepEqual(replay.installed,seated.installed);
    for(const id of ['sideGuard','114613-1','114613-2','114613-3','114613-4','192800-1','192800-2']) {
      assert.ok(!e.ids.includes(id));
      assert.equal(before.poses[id],replay.poses[id]);
      assert.equal(before.poses[id],seated.poses[id]);
    }
    for(const id of ['rearRail','frontRail','101352-1','139536-2','slat-2']) {
      assert.ok(replay.poses[id][1]>seated.poses[id][1]);
      near(replay.poses[id][0],seated.poses[id][0]);
      near(replay.poses[id][2],seated.poses[id][2]);
      near(replay.poses[id][1]-replay.poses.gableWide[1],seated.poses[id][1]-seated.poses.gableWide[1]);
    }
    for(const [id,want] of [['101352-1',[s*906,1417,512]],['114613-3',[s*906,1429,-530]],['114613-4',[s*514,1429,-530]]]) {
      want.forEach((v,i)=>near(seated.poses[id][i],v));
    }
    const ladder=t.steps.get(34).events[0], finish=sample(t,37,1);
    assert.ok(['stilePlain','stileBored','114613-7','114613-8','190729-2','190730-2','tread-5'].every(id=>ladder.ids.includes(id)));
    near(finish.poses.stileBored[0],s*466);
    near(finish.poses.stilePlain[0],s*969);
    near(finish.poses['121108-5'][1],1370);
  }
});
