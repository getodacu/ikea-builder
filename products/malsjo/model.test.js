import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Quaternion, Vector3 } from 'three';
import { families, parts, shapes, steps } from './kit.js';
import { pageLink } from './manual.js';
import { compile, routeSteps } from './model.js';
import { sample } from '../../src/timeline.js';

const pages = [11,12,12,13,13,14,14,15,16,16,17,17,18,18,19,20,21,21,22,22,23,23,24,25,26,26,27,28,28,29,30,31,32,33,33,34,34,35,35,36,37,37,38,38,39,40,41,42,43,43,43,44,44,44,44,45,45,46,46,47,47,48,48,49,49,49,49,50,50,51,51,52,52];
const additions = [24,2,2,2,4,4,0,4,0,11,6,6,10,0,4,3,2,1,2,6,4,2,4,1,7,6,6,24,2,2,2,0,4,3,3,3,3,16,2,4,12,12,12,4,2,0,0,6,5,0,4,3,0,1,1,6,6,2,6,4,5,6,5,0,4,1,1,4,6,2,4,2,0];
const keys = ['118331:26 123026:4 113434:10 118137:16 101350:22 100214:4 109562:2 100362:44 102553:10 130616:12 130617:12 100001:1 107971:6',
  '120639:4 109560:9 100365:4 100404:6 139343:10 145571:10 123805:1 133304:2 126916:2 146190:2 141413:2 141414:2 144641:4',
  '131361:8 109504:4 101345:10 110519:10 141144:4 122353:4 150980:2 144290:2 144291:2 144637:4 144638:4 128258:2 151128:2 151127:2 147901:1'];
const stock = [...parts.values()];
const of = (list, family) => list.filter(id => parts.get(id).family === family);
const added = (before, after) => after.filter(id => !before.includes(id));
const end = (route, n) => sample(route, n, 1);
const defaultRoute = {skirting:true,doorStop:'right'};

test('all 73 numbered figures and all physical source quantities are present', () => {
  assert.deepEqual(steps.map(s => s.page), pages);
  assert.deepEqual(steps.map(s => s.number), pages.map((_, i) => i+1));
  assert.match(pageLink(26), /AA-1848992-8-2\.pdf#page=26$/);
  for (const [key, count] of keys.join(' ').split(' ').map(v => v.split(':'))) {
    assert.equal(stock.filter(p => p.family === key).length, Number(count), key);
  }
  assert.equal(stock.filter(p => families[p.family].number === null).length, 31);
  for (const [packet, n] of [['Packet 1',137],['Packet 2',66],['Packet 3',66],['Loose fittings',19]]) {
    assert.equal(stock.filter(p => p.packet === packet).length, n);
  }
  assert.equal(parts.size, 319);
});

test('each route reconciles canonically at every boundary, regardless of seeks', () => {
  for (const skirting of [true,false]) for (const doorStop of ['right','left']) {
    const route = {skirting,doorStop}, timeline = compile(route);
    const order = routeSteps(route);
    assert.deepEqual(order, [0,...pages.map((_,i)=>i+1).filter(n => skirting || ![31,32].includes(n))]);
    const snapshots = order.map(n => end(timeline,n));
    assert.equal(Object.keys(snapshots[0].poses).length,319);
    assert.deepEqual(snapshots[0].installed,[]);
    for (let i=1; i<order.length; i++) {
      const n = order[i], boundary = snapshots[i];
      assert.equal(added(snapshots[i-1].installed,boundary.installed).length,additions[n-1],`step ${n}`);
      assert.equal(new Set(boundary.installed).size,boundary.installed.length);
      assert.deepEqual(Object.keys(boundary.poses),boundary.installed);
      assert.equal(boundary.joint,null);
      assert.ok(Object.isFrozen(boundary.poses) && Object.isFrozen(boundary.installed));
      sample(timeline,n,0.62);
    }
    for (let i=order.length-1; i>=0; i--) {
      assert.deepEqual(sample(timeline,order[i],1.5),snapshots[i]);
      assert.deepEqual(end(compile(route),order[i]),snapshots[i]);
    }
    const excluded = stock.filter(p => families[p.family].role !== 'kit' || (!skirting && p.family === '141414'));
    assert.deepEqual(new Set(added(stock.map(p=>p.id),snapshots.at(-1).installed)),new Set());
    assert.deepEqual(new Set(added(snapshots.at(-1).installed,stock.map(p=>p.id))),new Set(excluded.map(p=>p.id)));
    assert.equal(snapshots.at(-1).installed.length,skirting ? 317 : 315);
    assert.throws(() => sample(timeline,74,1),RangeError);
    if (!skirting) assert.throws(() => sample(timeline,31,1),RangeError);
  }
});

test('mounted parts retain event order, exclude receiving and carried parts, and deduplicate fittings', () => {
  const timeline = compile(defaultRoute);
  for (const [n,expected] of [
    [5,['113434-3','113434-4','113434-5','113434-6']],
    [8,['113434-7','113434-8','113434-9','113434-10']],
    [14,['sideL','sideR']],
    [18,[]],
    [22,['base','100214-3','100214-4']],
    [24,['back']],
    [26,['101350-17','101350-18','101350-19','101350-20','101350-21','101350-22','top']],
  ]) {
    const {mountedIds} = timeline.steps.get(n);
    assert.deepEqual(mountedIds,expected,`step ${n}`);
    assert.ok(Object.isFrozen(mountedIds),`step ${n}`);
  }
});

test('staged parts do not install until their beat seats; six top dowels mate three stations', () => {
  const timeline = compile(defaultRoute), before = end(timeline,25), after = end(timeline,26);
  const staged = sample(timeline,26,0);
  assert.deepEqual(staged.installed,before.installed);
  assert.equal(staged.active.length,6);
  const dowels = added(before.installed,after.installed);
  assert.equal(of(dowels,'101350').length,6);
  for (const x of [-690,0,690]) {
    const points = dowels.map(id => after.poses[id]).filter(p=>p[0]===x);
    assert.deepEqual(points.map(p=>p[2]).sort((a,b)=>a-b),[-169,154]);
    assert.ok(points.every(p=>p[1]===887));
  }
  assert.ok(staged.joint.axis[1] < -0.99);
  assert.ok(staged.active.every(id=>staged.poses[id][1]>after.poses[id][1]));
  assert.ok(before.installed.includes('top'));
  assert.notDeepEqual(before.poses.top,after.poses.top);
});

test('bolt and screw replays hold the fasteners clear before insertion', () => {
  const timeline = compile(defaultRoute);
  for(const number of [2,10]) {
    const step = timeline.steps.get(number), event = step.events.at(-1);
    const [id] = event.ids;
    const preview = sample(timeline,number,event.t0+0.4/ (step.duration/1000));
    const inserting = sample(timeline,number,event.t0+0.9/ (step.duration/1000));
    assert.deepEqual(preview.poses[id],event.paths[0][0]);
    assert.notDeepEqual(inserting.poses[id],preview.poses[id]);
    assert.ok(!preview.installed.includes(id));
    assert.ok(end(timeline,number).installed.includes(id));
  }
});

test('feet and both cross rails seat on their actual joint lines', () => {
  const timeline = compile(defaultRoute);
  const rotation = p => new Quaternion().fromArray(p,3);
  const footState = end(timeline,11);
  const feet = of(footState.installed,'107971');
  assert.deepEqual(feet.map(id=>footState.poses[id].slice(0,3)),
    [[-688,97.5,1016],[-688,97.5,1304],[0,97.5,944],[0,97.5,1376],[688,97.5,1016],[688,97.5,1304]]);
  for (const id of feet) {
    const p = footState.poses[id], q = rotation(p);
    const rail = p[0] ? (p[0]<0 ? 'pl' : 'pr') : (p[2]<1160 ? 'pf' : 'pb');
    const wood = footState.poses[rail], [w,h,d] = shapes[parts.get(rail).shape];
    for (const x of [-8.16,8.16]) {
      const pegTip = new Vector3(x,-4.5,0).applyQuaternion(q).add(new Vector3(...p));
      const local = pegTip.sub(new Vector3(...wood)).applyQuaternion(rotation(wood).invert());
      assert.ok(Math.abs(local.x)<w/2-3.5 && Math.abs(local.z)<d/2-3.5 && Math.abs(local.y)<h/2, id);
    }
  }

  const {events} = timeline.steps.get(14);
  for (const event of events.slice(2,4)) {
    const pose = sample(timeline,14,(event.t0+event.t1)/2).poses;
    for (const id of event.ids.slice(1)) {
      const x = pose[id][0], tip = shapes.dowel[1]/2;
      assert.ok(x-tip>pose.sideL[0]+13 && x+tip<pose.sideR[0]-13);
    }
  }
  const seated = end(timeline,15).poses, cams = of(added(end(timeline,14).installed,end(timeline,15).installed),'118137');
  const rails = ['upperBack','upperFront'];
  for (const [i,event] of events.slice(-2).entries()) {
    const mid = sample(timeline,14,(event.t0+event.t1)/2).poses;
    for (const [j,id] of event.ids.slice(1).entries()) {
      const bolt = seated[id], cam = seated[cams[i*2+j]], rail = seated[rails[j]];
      assert.ok(Math.abs(mid[id][0])>Math.abs(bolt[0])+10);
      assert.ok(Math.hypot(mid[id][1]-bolt[1],mid[id][2]-bolt[2])<.01);
      assert.ok(Math.hypot(bolt[1]-cam[1],bolt[2]-cam[2])<=8);
      assert.ok(Math.abs(bolt[0]-cam[0])<=shapes.bolt[1]/2+2);
      const local = new Vector3(...bolt).sub(new Vector3(...rail)).applyQuaternion(rotation(rail).invert());
      assert.ok(Math.abs(local.z)<shapes[parts.get(rails[j]).shape][2]/2 && Math.abs(local.y)<shapes.rail[1]/2);
    }
  }
});

test('joint close-ups frame the receiving faces and move the contact highlight', () => {
  const timeline = compile(defaultRoute);
  const events = n => timeline.steps.get(n).events;
  const nearPoint = (actual, expected) => {
    assert.ok(Math.hypot(...actual.map((v,i) => v-expected[i])) < .01, `${actual} should be near ${expected}`);
  };
  for (const [i, y] of [[2,71],[3,437]]) {
    const { joint, t0, t1 } = events(14)[i];
    const contact = [-677,y,-199];
    nearPoint(joint.target,contact);
    assert.ok(joint.span <= 250 && joint.direction[0] > .75);
    nearPoint(sample(timeline,14,t0+.6*(t1-t0)).joint.target,contact);
  }
  const [dowel, top] = events(26).map(e => e.joint);
  nearPoint(dowel.target,[-690,884,-169]);
  nearPoint(top.target,[0,892,154]);
  assert.ok(dowel.direction[1] > .65 && top.direction[1] < 0);

  const [handle, screw] = events(44).slice(2,4).map(e => e.joint);
  assert.deepEqual(handle.target.slice(0,2),screw.target.slice(0,2));
  assert.ok(handle.direction[2] > .8 && screw.direction[2] < -.8);
  assert.ok(handle.span <= 160 && screw.span <= 160);

  for (const [n, center] of [[46,-335],[47,335]]) {
    const [left, right] = events(n).slice(-2).map(e => e.joint);
    assert.ok(left.direction[2] < 0 && right.direction[2] < 0);
    assert.deepEqual([left.target[0],right.target[0]],[center-306,center+306]);
  }
});

test('both wall routes face the cabinet out before attaching both washers and covers', () => {
  const direction = (p,x,y,z) => new Vector3(x,y,z).applyQuaternion(new Quaternion().fromArray(p,3));
  const near = (p, xyz) => assert.ok(new Vector3(...p).distanceTo(new Vector3(...xyz))<.01,`${p.slice(0,3)} vs ${xyz}`);
  for (const skirting of [true,false]) {
    const timeline = compile({...defaultRoute,skirting});
    const brackets = ['141413-1','141413-2'], spacers = ['141414-1','141414-2'];
    const mount = timeline.steps.get(30).events;
    const attach = timeline.steps.get(33);
    const turn = timeline.steps.get(skirting ? 32 : 33).events[0];
    assert.equal(mount.length,2);
    assert.equal(turn.rigid.anchor,'sideL');
    assert.deepEqual(turn.before.installed,turn.after.installed);
    const turned = turn.after.poses;
    const adjusted = skirting ? end(timeline,32).poses : turned;
    for (const [i,id] of brackets.entries()) {
      const sign = i ? 1 : -1, x = sign*663, p = turned[id];
      assert.deepEqual(mount[i].ids,[id]);
      assert.equal(mount[i].joint.axis[0],-sign,'rear-view bracket seats toward its stile');
      near(p,[x,674,-227]);
      assert.ok(direction(p,1,0,0).x*sign>.99,'both flanges face outward');
      const washer = attach.end.poses[`126916-${i+1}`];
      near(washer,[x,674,-204]);
      assert.ok(direction(washer,0,1,0).z>.99);
      if (skirting) {
        const spacer = spacers[i];
        near(turned[spacer],[x,674,-237]);
        near(adjusted[spacer],[x,674,-252]);
        const adjust = timeline.steps.get(32).events[1];
        const mid = sample(timeline,32,(adjust.t0+adjust.t1)/2).poses[spacer];
        assert.ok(Math.abs(mid[0]-x)<.01 && Math.abs(mid[1]-674)<.01 && mid[2]<-237 && mid[2]>-252);
        assert.ok(direction(mid,0,1,0).dot(direction(p,0,1,0))>.99);
      } else {
        assert.equal(attach.end.poses[spacers[i]],undefined);
      }
    }
    const washerBeat = attach.events[skirting ? 0 : 1], coverBeat = attach.events.at(-1);
    assert.deepEqual(added(washerBeat.before.installed,washerBeat.after.installed),['126916-1','126916-2']);
    assert.deepEqual(added(coverBeat.before.installed,coverBeat.after.installed),['133304-1','133304-2']);
    assert.deepEqual(timeline.order.slice(timeline.order.indexOf(30),timeline.order.indexOf(33)+1),skirting ? [30,31,32,33] : [30,33]);
  }
});

test('selecting the other door stop does not duplicate it', () => {
  const right = compile(defaultRoute), left = compile({...defaultRoute,doorStop:'left'});
  for (const n of [45,46,47,73]) {
    const a = end(right,n), b = end(left,n);
    assert.deepEqual(new Set(a.installed),new Set(b.installed));
    const [stop] = of(a.installed,'123805');
    assert.notDeepEqual(a.poses[stop],b.poses[stop]);
  }
});

test('both drawer backs pivot from the near end and count as added only once seated', () => {
  const timeline = compile(defaultRoute);
  for (const [n,id,x,fasteners] of [[55,'dRBack',560,6],[67,'dLBack',-560,4]]) {
    const [event] = timeline.steps.get(n).events;
    const at = u => sample(timeline,n,event.t0+u*(event.t1-event.t0));
    const ends = snapshot => {
      const p = snapshot.poses[id], q = new Quaternion().fromArray(p,3);
      return [1,-1].map(s=>new Vector3(s*shapes.drawerBack[0]/2,0,0).applyQuaternion(q).add(new Vector3(...p)));
    };
    const [near,far] = ends(at(0));
    const swing = ends(at(.5)), level = ends(at(.75)), seating = ends(at(.875));
    assert.ok(near.x<far.x && far.y-near.y>100);
    assert.ok(near.distanceTo(swing[0])<.01 && near.distanceTo(level[0])<.01);
    assert.ok(swing[1].y<far.y && swing[1].y>swing[0].y);
    assert.ok(Math.abs(level[0].y-level[1].y)<.01 && Math.abs(level[0].y-398)<.01);
    assert.ok(seating.every((p,i)=>Math.abs(p.y-level[i].y+3)<.01));
    const seated = at(1);
    assert.ok(!at(.999).installed.includes(id));
    assert.deepEqual(added(at(0).installed,seated.installed),[id]);
    const p = seated.poses[id];
    assert.deepEqual(p.slice(0,3),[x,392,957]);
    assert.ok(new Vector3(0,0,1).applyQuaternion(new Quaternion().fromArray(p,3)).y<-.999);
    assert.equal(of(added(seated.installed,end(timeline,n+1).installed),'110519').length,fasteners);
  }
});

test('prepared doors seat on different tracks and engage the same captive locks; both existing drawers close', () => {
  const timeline = compile(defaultRoute);
  const prep = end(timeline,45), rear = end(timeline,46), front = end(timeline,47);
  assert.deepEqual(rear.installed,prep.installed);
  assert.deepEqual(front.installed,prep.installed);
  assert.ok(Math.abs(rear.poses.doorL[2]-167)<1e-6);
  assert.ok(Math.abs(front.poses.doorR[2]-209)<1e-6);
  assert.deepEqual(front.poses.doorL,rear.poses.doorL);
  const locks = of(front.installed,'144638');
  assert.equal(locks.filter(id=>rear.captive[id]===1).length,2);
  assert.equal(locks.filter(id=>front.captive[id]===1).length,4);
  const before = end(timeline,72), after = end(timeline,73);
  assert.deepEqual(after.installed,before.installed);
  for (const door of ['dL','dR']) {
    assert.ok(before.poses[`${door}Front`][2]>after.poses[`${door}Front`][2]);
    assert.ok(Math.abs(after.poses[`${door}Front`][2]-213)<1e-6);
    assert.ok(Math.abs(after.poses[`${door}Front`][1]-776)<1e-6);
  }
});

test('the plinth clears the sideways case before seating as a rigid module', () => {
  const timeline=compile(defaultRoute), transfer=timeline.steps.get(22).events[0];
  const separation=({poses})=>Math.hypot(...poses.base.slice(0,3).map((v,i)=>v-poses.pf[i]));
  const clearance=separation(end(timeline,21));
  let crossing=0;
  for(let i=0;i<100;i++) {
    const motion=sample(timeline,22,transfer.t0+(transfer.t1-transfer.t0)*i/100);
    const [,y,z]=motion.poses.base;
    assert.ok(Math.abs(separation(motion)-clearance)<1e-8);
    if(z>-380&&z<450) { assert.ok(y>720,'plinth crosses above the case'); crossing++; }
  }
  assert.ok(crossing>0);
  assert.ok(end(timeline,22).poses.base[2]<-400);
});
