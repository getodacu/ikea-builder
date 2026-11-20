import assert from 'node:assert/strict';
import test from 'node:test';
import { sample } from '../../src/timeline.js';
import product from './product.js';
import { compile } from './model.js';
import { pageLink, previewPages } from './manual.js';

const commonStart=[6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,14,14,14,15,15,16,16,17,17,18,18,19,19];
const routing={left:[20,21,21,22],right:[23,24,24,25],center:[26,27,27,28]};
const commonEnd=[29,30,31,32,32,33,33,34,35,36,36,36,37,37,38,38,39,39,40,40,41];
const layouts=Object.keys(routing);
const wallIds=['wall-1','wall-2','wall-3','wall-4'];
const delta=(p,q)=>Math.hypot(...p.slice(0,3).map((v,i)=>v-q[i]));
const additions=record=>record.events.filter(e=>e.kind==='place').flatMap(e=>e.ids);
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} differs from ${b}`);

const counted={ends:2,base:1,uprights:4,crosspieces:2,topRails:2,plinth:1,back:1,counter:1,shelves:3,
  tallDoors:2,shortDoor:1,drawerFront:1,drawerSides:2,drawerBack:1,drawerBottom:1,
  100214:12,109029:10,148510:2,105344:3,100344:21,100365:12,118331:6,103430:4,119030:2,101350:28,
  101345:2,110519:2,101449:5,103095:5,100001:1,101532:12,107091:4,115753:4,103693:4,103717:1,
  101221:23,117877:6,118692:6,118301:1,139505:4,wall:4};

test('each front-view choice has exactly 53 printed steps and its own source pages',()=>{
  const [choice]=product.choices;
  assert.equal(choice.step,29);
  assert.equal(choice.key,'drawerBay');
  assert.equal(choice.initial,'left');
  assert.equal(choice.requireExplicit,true);
  assert.deepEqual(choice.options.map(([key])=>key),layouts);
  assert.deepEqual(compile().route,{drawerBay:'left'});
  assert.deepEqual([...previewPages],[4,...Array.from({length:36},(_,i)=>i+6)]);
  for(const drawerBay of layouts) {
    const t=compile({drawerBay});
    assert.deepEqual(t.order,Array.from({length:54},(_,i)=>i));
    assert.deepEqual([...t.steps.values()].map(record=>record.page),[...commonStart,...routing[drawerBay],...commonEnd]);
    assert.match(pageLink(t.steps.get(29).page),new RegExp(`__AA-1969722-7-2\\.pdf#page=${routing[drawerBay][0]}$`));
    assert.match(pageLink(t.steps.get(53).page),/#page=41$/);
    assert.equal(t.steps.get(33).page,29);
    assert.ok(t.steps.get(33).action.includes('5 mm')&&t.steps.get(33).action.includes('10 mm'));
  }
  assert.equal(product.unbox.warning.page,2);
  assert.deepEqual(product.references[53],[['Adjust the doors',42]]);
});

test('each layout consumes the same reconciled parts, four required wall screws and no duplicate drawer',()=>{
  const inventory={};
  for(const {family} of product.parts.values()) inventory[family]=(inventory[family]??0)+1;
  assert.deepEqual(inventory,counted);
  assert.equal(product.families.wall.role,'external');
  assert.equal(product.families['100001'].role,'tool');
  assert.equal([...product.parts.values()].filter(p=>product.families[p.family].role!=='external').length,205);
  for(const drawerBay of layouts) {
    const t=compile({drawerBay});
    const placed=[...t.steps.values()].flatMap(additions);
    assert.equal(placed.length,206);
    assert.equal(new Set(placed).size,206);
    assert.deepEqual([...product.parts.keys()].filter(id=>!placed.includes(id)),['100001-1','107091-3','107091-4']);
    assert.deepEqual(placed.filter(id=>id.startsWith('wall-')),wallIds);
    assert.deepEqual(sample(t,53,1).installed,placed);
    assert.deepEqual(additions(t.steps.get(9)).filter(id=>id.startsWith('101350-')),
      ['101350-9','101350-10','101350-11','101350-12','101350-13','101350-14','101350-15','101350-16']);
    assert.deepEqual(additions(t.steps.get(52)),[]);
    assert.deepEqual(additions(t.steps.get(53)),['107091-1','107091-2']);
  }
});

test('the three layouts diverge at the receiver faces and share the same worktop and final number',()=>{
  const expected={
    left:{faces:[['endL'],['uprightLF','crossL','uprightLB']],x:[-895.2,-310.3],plateXs:[893.5,-893.5,-288],shortX:-890,drawerX:-602},
    right:{faces:[['uprightRF','crossR','uprightRB'],['endR']],x:[310.3,895.2],plateXs:[893.5,288,-893.5],shortX:890,drawerX:602},
    center:{faces:[['uprightLF','crossL','uprightLB'],['uprightRF','crossR','uprightRB']],x:[-289.7,289.7],plateXs:[893.5,288,-893.5],shortX:288,drawerX:0}
  };
  const baseline=compile({drawerBay:'left'});
  for(const drawerBay of layouts) {
    const t=compile({drawerBay});
    const {faces,x,plateXs,shortX,drawerX}=expected[drawerBay];
    assert.deepEqual(t.steps.get(28).end,baseline.steps.get(28).end);
    const mounting=t.steps.get(29).events.filter(event=>event.ids[0].startsWith('runner'));
    assert.equal(mounting.length,2);
    assert.deepEqual(mounting.map(event=>event.op.prerequisites),faces);
    for(const [i,id] of ['runnerL','runnerR'].entries()) near(t.steps.get(29).end.poses[id][0],x[i]);
    const plateEvents=[31,32].flatMap(n=>t.steps.get(n).events.filter(e=>e.kind==='place'));
    assert.deepEqual(plateEvents.map(event=>event.paths[0].at(-1)[0]),plateXs.flatMap(x=>[x,x]));
    assert.equal(plateEvents.filter(event=>event.paths[0].at(-1)[1]===694).length,1);
    assert.deepEqual(t.steps.get(33).end.poses.counter,baseline.steps.get(33).end.poses.counter);
    assert.equal(t.steps.get(40).end.poses.shortDoor[0],drawerX);
    near(t.steps.get(41).end.poses.shortDoor[0],shortX);
    near(t.steps.get(53).end.poses.drawerFront[0],drawerX);
    const event=t.steps.get(52).events[0];
    assert.equal(event.kind,'move');
    assert.deepEqual(event.op.prerequisites,['runnerL','runnerR']);
    assert.equal(event.rigid.anchor,'drawerFront');
    const mid=sample(t,52,(event.t0+event.t1)/2).poses;
    for(const id of ['drawerL','drawerR','drawerBottom','drawerBack','drawerRunnerL','drawerRunnerR','118301-1','100365-12']) {
      assert.ok(event.ids.includes(id));
      near(delta(mid[id],mid.drawerFront),delta(event.after.poses[id],event.after.poses.drawerFront));
      assert.deepEqual(t.steps.get(53).end.poses[id],event.after.poses[id]);
    }
  }
});

test('five feet and the four fixed anchors retain stable IDs through seek/back and fresh builds',()=>{
  for(const drawerBay of layouts) {
    const t=compile({drawerBay}), fresh=compile({drawerBay});
    const forward=t.order.map(n=>sample(t,n,1));
    for(const n of [...t.order].reverse()) {
      assert.deepEqual(sample(t,n,1),forward[n]);
      assert.deepEqual(sample(fresh,n,1),forward[n]);
      if(n>1) assert.deepEqual(t.steps.get(n).start,forward[n-1]);
    }
    assert.deepEqual(t.steps.get(34).events[0].ids,['103095-1','103095-2','103095-3','103095-4','103095-5']);
    assert.deepEqual(additions(t.steps.get(36)),wallIds);
    assert.deepEqual(additions(t.steps.get(37)),['103693-1','103693-2','103693-3','103693-4']);
    for(const n of [35,36,37,38]) assert.equal(t.steps.get(n).warning.page,2);
    const cabinetMove=t.steps.get(37).events[0];
    assert.ok(cabinetMove.rigid);
    for(const id of wallIds) {
      assert.ok(!cabinetMove.ids.includes(id));
      assert.deepEqual(cabinetMove.before.poses[id],cabinetMove.after.poses[id]);
    }
    assert.deepEqual(t.steps.get(38).events[0].ids,wallIds);
    for(const [i,id] of wallIds.entries()) {
      assert.equal(forward[38].captive[id],1);
      for(const j of [0,1]) near(forward[38].poses[id][j],forward[37].poses[`103693-${i+1}`][j]);
    }
  }
});
