import assert from 'node:assert/strict';
import test from 'node:test';
import { Quaternion, Raycaster, Vector3 } from 'three';
import { sample } from '../../src/timeline.js';
import { createGeometry } from './geometry.js';
import { parts } from './kit.js';
import { compile } from './model.js';

const v=(x,y,z)=>new Vector3(x,y,z);
function mount(factory,id,snapshot) {
  const node=factory.instantiate(parts.get(id)), pose=snapshot.poses[id];
  node.position.fromArray(pose);
  node.quaternion.fromArray(pose,3);
  node.userData.setCaptive?.(snapshot.captive[id]??0);
  node.updateMatrixWorld(true);
  return node;
}
const hit=(node,p,d,far=40)=>new Raycaster(p,d,0,far).intersectObject(node,true)[0];
const project=(p,local)=>local.applyQuaternion(new Quaternion().fromArray(p,3)).add(new Vector3().fromArray(p));

test('p. 21–23 keyed rails admit a screw head only before the downward slide',()=>{
  const t=compile({}), factory=createGeometry();
  try {
    for(const [id,n,z] of [['frontRail',18,270],['rearRail',19,-270]]) {
      const rail=mount(factory,id,sample(t,n,1));
      const entry=t.steps.get(n).events[0];
      assert.equal(entry.paths[0][1][1]-entry.paths[0][2][1],16);
      assert.ok(entry.paths[0][1][0]>entry.paths[0][0][0]);
      for(const x of [-1,1]) for(const y of [168,272]) {
        const start=(height,offset)=>v(x*1022,height,z+offset), inward=v(-x,0,0);
        assert.equal(hit(rail,start(y-16,6),inward),undefined,'wide lower entry clears the head');
        assert.equal(hit(rail,start(y,0),inward),undefined,'narrow upper slot clears the shaft');
        assert.ok(hit(rail,start(y,7),inward),'narrow slot retains the head');
      }
    }
    const left=t.steps.get(20).events[1];
    assert.equal(left.kind,'move');
    assert.ok(left.paths[0][1][0]>left.paths[0][0][0]);
  } finally { factory.dispose(); }
});

test('p. 32 closes four sewn cuffs around each matching lower rail, rear before front',()=>{
  const t=compile({}), factory=createGeometry();
  try {
    const step=t.steps.get(30), liner=mount(factory,'liner',step.start);
    for(const [name,z,first,closed] of [['rear',-270,1,2],['front',270,2,3]]) {
      for(const [i,x] of [-780,-260,260,780].entries()) {
        const strap=liner.getObjectByName(`${name}-strap-${i+1}`);
        assert.ok(strap);
        liner.userData.setCaptive(first);
        assert.ok(Math.abs(strap.rotation.x)>1);
        liner.userData.setCaptive(closed);
        liner.updateMatrixWorld(true);
        assert.deepEqual(strap.getWorldPosition(v()).toArray(),[x,105,z]);
        assert.ok(Math.abs(strap.rotation.x)<1e-8);
        assert.equal(hit(strap,v(x+25,105,z),v(-1,0,0)),undefined,'strap opening clears the rail center');
        assert.ok(hit(strap,v(x+25,120,z),v(-1,0,0)),'the webbing goes over the rail');
      }
      const rail=mount(factory,`${name}Rail`,step.end);
      assert.ok(hit(rail,v(0,105,z+28),v(0,0,-1)),'the lower rail passes through the closed cuffs');
    }
  } finally { factory.dispose(); }
});

test('p. 28 spring mechanisms hand inward; p. 34 advances both locators at fixed mounts',()=>{
  const t=compile({}), factory=createGeometry();
  try {
    const fasteners=t.steps.get(26).events.filter(e=>e.kind==='place'&&e.ids.length===3);
    assert.deepEqual(fasteners.map(e=>e.op.axes[0]),[[-1,0,0],[1,0,0]]);
    for(const [id,x] of [['hingeL',-971],['hingeR',971]]) {
      const before=sample(t,31,1), after=sample(t,32,1), node=mount(factory,id,after);
      assert.deepEqual(after.poses[id],before.poses[id]);
      const locator=node.getObjectByName('seat-locator');
      assert.deepEqual(locator.getWorldPosition(v()).toArray(),[x,288,218]);
      node.userData.setCaptive(0); node.updateMatrixWorld(true);
      assert.ok(locator.getWorldPosition(v()).z<-90);
    }
  } finally { factory.dispose(); }
});

test('pp. 37–39 seat both downward forks and fold the cover around the fixed upper pins',()=>{
  const t=compile({}), factory=createGeometry();
  try {
    const seated=sample(t,36,1), fold=t.steps.get(37).events[0], mid=sample(t,37,(fold.t0+fold.t1)/2);
    const topHoles=t.steps.get(35).events.slice(1).map(e=>e.op.axes[0]);
    assert.deepEqual(topHoles,[[-1,0,0],[1,0,0]]);
    for(const [id,x] of [['guideL',-973],['guideR',973]]) {
      const guide=mount(factory,id,seated);
      assert.equal(hit(guide,v(x+34,345,-305),v(-1,0,0),70),undefined,'the fork accepts the lower receiver pin');
      assert.ok(hit(guide,v(x+34,345,-294),v(-1,0,0),70),'the fork retains its side');
      const rail=mount(factory,'rearRail',seated);
      assert.ok(hit(rail,v(x,345,-287),v(0,0,-1)),'rear rail supplies the locating pin');
      assert.deepEqual(mid.poses[id],seated.poses[id]);
      assert.ok(project(mid.poses.back,v(x,-163,-46)).distanceTo(v(x,422,-395))<1e-8);
      assert.ok(project(mid.poses.backCover,v(x,-163,-46)).distanceTo(v(x,422,-395))<1e-8);
    }
  } finally { factory.dispose(); }
});
