import assert from 'node:assert/strict';
import test from 'node:test';
import { Box3, Quaternion, Raycaster, Vector3 } from 'three';
import { sample } from '../../src/timeline.js';
import { createGeometry } from './geometry.js';
import { parts } from './kit.js';
import { compile } from './model.js';

const v=(x,y,z)=>new Vector3(x,y,z);
function mounted(geometry,id,pose) {
  const node=geometry.instantiate(parts.get(id));
  node.position.fromArray(pose);
  node.quaternion.fromArray(pose,3);
  node.updateMatrixWorld(true);
  return node;
}
const ray=(node,origin,direction,far)=>new Raycaster(origin,direction,0,far).intersectObject(node)[0]?.distance;

test('p. 8 notches and square end key meet an open frame receiver',()=>{
  const t=compile(), g=createGeometry();
  try {
    const {poses}=sample(t,1,1), side=mounted(g,'sideR',poses.sideR);
    // On the protection surface the desk receiver is 308 mm up in the scene and faces inward.
    assert.equal(ray(side,v(459,308,-1091),v(1,0,0),36),undefined);
    assert.ok(Math.abs(ray(side,v(459,308,-1080),v(1,0,0),36)-13)<1e-6);
    const rail=g.instantiate(parts.get('notchRail'));
    assert.equal(rail.children.filter(c=>c.name==='square rail tongue').length,2);
    rail.updateMatrixWorld(true);
    assert.equal(ray(rail,v(159,9,18),v(0,0,-1),10),undefined);
    assert.ok(Math.abs(ray(rail,v(130,9,18),v(0,0,-1),10)-6)<1e-6);
  } finally { g.dispose(); }
});

test('pp. 15 and 19 use real opposite lower receivers; pp. 18 and 22 fit the same shelf through the rail',()=>{
  const g=createGeometry();
  try {
    for(const [footShelfSide,side,s] of [['right','sideR',1],['left','sideL',-1]]) {
      const t=compile({footShelfSide});
      const {poses}=sample(t,16,1), frame=mounted(g,side,poses[side]), shelf=mounted(g,'footShelf',poses.footShelf);
      assert.equal(ray(frame,v(s*452,105,-214),v(s,0,0),50),undefined);
      assert.ok(Math.abs(ray(frame,v(s*452,105,-204),v(s,0,0),50)-20)<1e-6);
      const down=u=>ray(shelf,v(s*u,86,-214),v(0,1,0),25);
      assert.ok(Math.abs(down(443)-17)<1e-5);
      assert.ok(Math.abs(down(429)-10)<1e-5);
      const rail=mounted(g,'lowRail',poses.lowRail);
      for(const x of [204,400]) {
        assert.equal(ray(rail,v(s*x,105,-355),v(0,0,1),35),undefined);
        assert.ok(Math.abs(ray(rail,v(s*(x+8),105,-355),v(0,0,1),35)-7)<1e-6);
      }
    }
  } finally { g.dispose(); }
});

test('p. 40 captive knobs reach a different wall plane, and both wall routes preserve the rear anchor bores',()=>{
  const g=createGeometry();
  try {
    const t=compile(), before=sample(t,43,1), after=sample(t,44,1);
    for(const [s,i] of [[-1,1],[1,2]]) {
      const bracket=`141413-${i}`, knob=`141414-${i}`;
      assert.deepEqual(before.poses[bracket],after.poses[bracket]);
      assert.equal(after.poses[knob][2]-before.poses[knob][2],-12.5);
      const mesh=mounted(g,knob,after.poses[knob]);
      assert.ok(Math.abs(new Box3().setFromObject(mesh,true).min.z+384)<1e-6);
      const post=mounted(g,s===-1?'sideL':'sideR',after.poses[s===-1?'sideL':'sideR']);
      assert.equal(ray(post,v(s*484,1718,-384),v(0,0,1),68),undefined);
      assert.ok(Math.abs(ray(post,v(s*484,1727,-384),v(0,0,1),68)-36)<1e-6);
      for(const y of [1738,1762]) {
        assert.ok(Math.abs(ray(post,v(s*484,y,-384),v(0,0,1),68)-58)<1e-6);
        assert.ok(Math.abs(ray(post,v(s*484,y+6,-384),v(0,0,1),68)-36)<1e-6);
      }
    }
    const direct=sample(compile({skirting:false}),43,1).poses, spaced=sample(t,45,1).poses;
    for(const id of ['126916-1','126916-2']) {
      assert.deepEqual(direct[id],spaced[id]);
      assert.ok(v(0,1,0).applyQuaternion(new Quaternion().fromArray(spaced[id],3)).distanceTo(v(0,0,1))<1e-7);
    }
    assert.equal(direct['141414-1'],undefined);
  } finally { g.dispose(); }
});
