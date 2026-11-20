import assert from 'node:assert/strict';
import test from 'node:test';
import { Box3, Quaternion, Raycaster, Vector3 } from 'three';
import { sample } from '../../src/timeline.js';
import { createGeometry } from './geometry.js';
import { parts } from './kit.js';
import { compile } from './model.js';

const ray=(obj,origin,dir,far)=>new Raycaster(new Vector3().fromArray(origin),new Vector3().fromArray(dir),0,far).intersectObject(obj)[0]?.distance;
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-4,`${a} ≠ ${b}`);
function mounted(g,id,state) {
  const node=g.instantiate(parts.get(id)), p=state.poses[id];
  node.position.fromArray(p); node.quaternion.fromArray(p,3); node.userData.setCaptive?.(state.captive[id]??0);
  node.updateMatrixWorld(true);
  return node;
}

test('pp. 7–16 keyed tongues and the variant-specific punching leave real through-paths',()=>{
  const g=createGeometry();
  try {
    const upright=sample(compile({}),17,1);
    const end=mounted(g,'endR',upright), rear=mounted(g,'railRear',upright);
    assert.equal(ray(end,[924,286,-188],[1,0,0],39),undefined);
    assert.ok(ray(end,[924,295,-188],[1,0,0],40)>0);
    assert.equal(ray(rear,[951,286,-168],[0,0,-1],41),undefined);
    assert.ok(ray(rear,[951,292,-168],[0,0,-1],41)>0);
    for(const [s,id] of [[-1,'railRear'],[1,'railFront']]) {
      const rail=mounted(g,id,upright);
      for(const x of [-487,0,487]) {
        assert.equal(ray(rail,[x,286,s*170],[0,0,s],30),undefined);
        assert.ok(ray(rail,[x+7,286,s*170],[0,0,s],30)>0);
      }
    }
    for(const [id,x] of [['front1',-487],['front2',0],['front3',487]]) {
      const post=mounted(g,id,upright), from=[x,219,225];
      if(x===0) assert.ok(ray(post,from,[0,0,-1],14)>0);
      else {
        assert.equal(ray(post,from,[0,0,-1],14),undefined);
        assert.ok(ray(post,[x+6,219,225],[0,0,-1],14)>0);
      }
    }
  } finally { g.dispose(); }
});

test('p. 25 legs and feet mate at ten positions on the nominal floor and the top matches the article envelope',()=>{
  const g=createGeometry();
  try {
    const t=compile({}), level=sample(t,24,1), top=mounted(g,'top',level);
    const bounds=new Box3().setFromObject(top,true), size=bounds.getSize(new Vector3());
    close(size.x,1981.2); close(size.z,450.85); close(bounds.max.y,540);
    const receivers=['endL','endL','endR','endR','rear1','rear2','rear3','front1','front2','front3'];
    for(const [i,id] of receivers.entries()) {
      const foot=mounted(g,`122158-${i+1}`,level), receiver=mounted(g,id,level);
      const {x,y,z}=foot.position;
      close(y,4);
      close(new Box3().setFromObject(foot,true).min.y,0);
      assert.equal(ray(receiver,[x,9,z],[0,1,0],20),undefined);
      assert.ok(ray(receiver,[x+5,9,z],[0,1,0],20)>0);
      assert.ok(ray(foot,[x+.6,34,z],[0,-1,0],18)>0);
    }
  } finally { g.dispose(); }
});

test('pp. 25–27 the through-drills and mesh are open and the four hinge hands and latch ends match',()=>{
  const g=createGeometry();
  try {
    const t=compile({}), hanging=sample(t,26,1), finished=sample(t,28,1);
    for(const [i,[pivot,side,post]] of [[-960,1,-975],[-472,1,-487],[472,-1,487],[960,-1,975]].entries()) {
      const door=mounted(g,`door-${i+1}`,hanging);
      close(door.position.x,pivot);
      for(const [j,y] of [207,405].entries()) {
        const hinge=mounted(g,`153334-${i*2+j+1}`,hanging), fixed=hinge.getObjectByName('Frame hinge leaf');
        close(hinge.position.y,y); close(hinge.position.x,pivot);
        for(const dy of [-12,12]) {
          assert.equal(ray(door,[pivot+side*19,y+dy,232],[0,0,-1],20),undefined);
          assert.ok(ray(door,[pivot+side*25,y+dy,232],[0,0,-1],20)>0);
          assert.equal(ray(fixed,[post,y+dy+4,227],[0,0,-1],18),undefined);
          assert.ok(ray(fixed,[post+5,y+dy+4,227],[0,0,-1],18)>0);
        }
      }
      const width=i===0||i===3?456:455, center=pivot+side*width/2;
      assert.equal(ray(door,[center,322,230],[0,0,-1],24),undefined);
      assert.ok(ray(door,[center,317,230],[0,0,-1],24)>0);
      const catchPose=finished.poses[`114755-${i+1}`];
      close(catchPose[0],pivot+side*(width-15)); close(catchPose[1],490);
      assert.equal(ray(door,[catchPose[0],490,210],[0,0,1],9),undefined);
      assert.ok(ray(door,[catchPose[0]+5,490,210],[0,0,1],9)>0);
    }
    for(const id of ['153334-7','153334-8']) {
      const fixed=s=>mounted(g,id,s).getObjectByName('Frame hinge leaf').getWorldQuaternion(new Quaternion());
      const open=sample(t,30,1);
      close(fixed(open).angleTo(fixed(finished)),0);
      const a=mounted(g,id,finished), b=mounted(g,id,open);
      assert.ok(a.quaternion.angleTo(b.quaternion)>1);
      close(a.position.distanceTo(b.position),0);
    }
  } finally { g.dispose(); }
});

test('p. 29 the two external positions match open rear bores on the squared frame',()=>{
  const g=createGeometry();
  try {
    const t=compile({}), anchored=sample(t,29,1);
    for(const [i,x] of [-487,487].entries()) {
      const post=mounted(g,i===0?'rear1':'rear3',anchored);
      const p=anchored.poses[`wall-${i+1}`];
      close(p[0],x); close(p[1],471); close(p[2],-221);
      assert.equal(ray(post,[x,471,-185],[0,0,-1],45),undefined);
      assert.ok(ray(post,[x,478,-185],[0,0,-1],45)>0);
    }
  } finally { g.dispose(); }
});

test('p. 30 the clip liner peels without adding a part or changing the two wall positions',()=>{
  const g=createGeometry();
  try {
    const t=compile({}), {start,events:[press],end}=t.steps.get(30);
    const during=mounted(g,'123742-1',sample(t,30,(press.t0+press.t1)/2));
    assert.ok(during.getObjectByName('Peel-off release liner').visible);
    const installed=mounted(g,'123742-1',end);
    assert.equal(installed.getObjectByName('Peel-off release liner').visible,false);
    assert.deepEqual(installed.position.toArray(),[975,395,-198]);
    for(const id of ['wall-1','wall-2']) assert.deepEqual(start.poses[id],end.poses[id]);
  } finally { g.dispose(); }
});
