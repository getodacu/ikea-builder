import assert from 'node:assert/strict';
import test from 'node:test';
import { Box3, Raycaster, Vector3 } from 'three';
import { sample } from '../../src/timeline.js';
import { parts } from './kit.js';
import { compile } from './model.js';
import { createGeometry } from './geometry.js';

const v=(...p)=>new Vector3(...p);
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-4,`${a} != ${b}`);
function mounted(factory,snap,id) {
  const node=factory.instantiate(parts.get(id));
  node.position.fromArray(snap.poses[id]);
  node.quaternion.fromArray(snap.poses[id],3);
  node.userData.setCaptive?.(snap.captive[id]??0);
  node.updateMatrixWorld(true);
  return node;
}
const hit=(node,origin,axis,far=1200)=>new Raycaster(v(...origin),v(...axis),0,far).intersectObject(node)[0];

test('fig. 6 puts the drilled board beneath the cabinet with its plate holes on the exterior face',()=>{
  const f=createGeometry(), t=compile({}), final=sample(t,8,1);
  try {
    const base=mounted(f,final,'cabinet-bottom'), top=mounted(f,final,'cabinet-top');
    for(const x of [-152,152]) for(const z of [-265,265]) {
      close(hit(base,[x,-10,z],[0,1,0]).point.y,10);
      close(hit(base,[x,-10,z+4],[0,1,0]).point.y,4);
      close(hit(base,[x,29,z],[0,-1,0]).point.y,22);
      close(hit(top,[x,670,z],[0,1,0]).point.y,680.5);
    }
    for(let i=1;i<=4;i++) close(new Box3().setFromObject(mounted(f,final,`10061614-${i}`)).min.y,0);
  } finally {f.dispose();}
});

test('both drawer runners clear both cabinet channels on a straight path to each of five bays',()=>{
  const f=createGeometry(), t=compile({}), cabin=sample(t,8,1), {events}=t.steps.get(23);
  try {
    for(const [i,baseY] of [579,478,327,176,25].entries()) {
      const engage=events[i*4+1];
      const midway=sample(t,23,engage.t0+.59*(engage.t1-engage.t0));
      for(const [hand,s] of [['left',-1],['right',1]]) {
        const rail=mounted(f,cabin,`cabinet-${hand}`);
        const side=mounted(f,midway,`drawer-${i+1}-${hand}`);
        const y=baseY+46, x=s*154.9;
        assert.equal(hit(rail,[x,y,275],[0,0,-1]),undefined);
        close(hit(rail,[x,y+4.3,275],[0,0,-1]).point.z,260);
        close(hit(rail,[x,y-4.3,275],[0,0,-1]).point.z,260);
        const shapeHit=hit(side,[x,y,side.position.z+280],[0,0,-1]);
        assert.ok(shapeHit,'The drawer has a real runner tongue in this channel');
        close(shapeHit.point.y,y);
        const box=new Box3().setFromObject(side);
        close(s<0?box.min.x:box.max.x,s*155.4);
        assert.ok(box.max.z>260&&box.min.z<-100,'The runner is partly engaged as it translates');
      }
    }
  } finally {f.dispose();}
});

test('fig. 23 retaining axes pass through the movable runner tongues, not the fixed rail or the neighboring solid',()=>{
  const f=createGeometry(), t=compile({}), final=t.steps.get(23);
  try {
    for(let i=0;i<5;i++) {
      const {after:open,ids}=final.events[i*4+2];
      for(const [j,hand] of ['left','right'].entries()) {
        const s=j*2-1, part=`drawer-${i+1}-${hand}`;
        for(const snap of [open,final.end]) {
          const side=mounted(f,snap,part), screw=mounted(f,snap,ids[j]);
          const {x,y,z}=screw.position, axis=v(0,-1,0).applyQuaternion(screw.quaternion);
          close(axis.x,s); close(axis.y,0); close(axis.z,0);
          close(x,s*138);
          close(z,snap===open?388:228);
          assert.equal(hit(side,[x-s,y,z],[s,0,0],21),undefined,'Bore must clear both the wood and the keyed tongue');
          close(hit(side,[x-s,y+4,z],[s,0,0],21).point.x,x);
          const shaft=new Box3().setFromObject(screw);
          assert.ok(s<0?shaft.min.x < -155.4:shaft.max.x > 155.4,'The screw reaches the matching tongue');
        }
      }
    }
  } finally {f.dispose();}
});

test('the face-down bottom slides through two open grooves and the finger recess is cut through the front',()=>{
  const f=createGeometry(), t=compile({});
  try {
    for(const [n,i,height] of [[10,3,148],[17,1,98]]) {
      const snap=sample(t,n,1);
      for(const [hand,s] of [['left',-1],['right',1]]) {
        const side=mounted(f,snap,`drawer-${i}-${hand}`);
        const sideH=i===3?130:80, y=16-(5+sideH/2), axis=v(0,0,1).applyQuaternion(side.quaternion).toArray();
        const probe=offset=>side.localToWorld(v(-s*5.25,y+offset,-279)).toArray();
        assert.equal(hit(side,probe(0),axis,550),undefined);
        assert.ok(hit(side,probe(7),axis,550));
      }
      const front=mounted(f,snap,`drawer-${i}-front`), axis=v(0,0,-1).applyQuaternion(front.quaternion).toArray();
      assert.equal(hit(front,front.localToWorld(v(0,height/2-7,18)).toArray(),axis,38),undefined);
      assert.ok(hit(front,front.localToWorld(v(110,height/2-7,18)).toArray(),axis,38));
    }
    for(const part of parts.values()) assert.ok(f.instantiate(part).children.length,part.id);
  } finally {f.dispose();}
});
