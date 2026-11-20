import assert from 'node:assert/strict';
import test from 'node:test';
import { Raycaster, Vector3 } from 'three';
import { sample } from '../../src/timeline.js';
import { createGeometry } from './geometry.js';
import { parts } from './kit.js';
import { compile } from './model.js';

const v=(x,y,z)=>new Vector3(x,y,z);
const near=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-6,`${actual} differs from ${expected}`);
function mount(factory,id,pose=[0,0,0,0,0,0,1]) {
  const node=factory.instantiate(parts.get(id));
  node.position.fromArray(pose);
  node.quaternion.fromArray(pose,3);
  node.updateMatrixWorld(true);
  return node;
}
function depth(node,mouth,axis) {
  const hit=new Raycaster(mouth.clone().addScaledVector(axis,-30),axis).intersectObject(node)[0];
  return hit ? hit.distance-30 : Infinity;
}

test('pp. 20–27: both extra front screws pass through actual open runner holes in each bay',()=>{
  const factory=createGeometry();
  try {
    const xs={left:[-895.2,-310.3],right:[310.3,895.2],center:[-289.7,289.7]};
    for(const [drawerBay,expected] of Object.entries(xs)) {
      const t=compile({drawerBay}), {poses}=sample(t,30,1);
      for(const [i,id] of ['runnerL','runnerR'].entries()) {
        const sign=i?-1:1, axis=v(-sign,0,0);
        const rail=mount(factory,id,poses[id]);
        const x=expected[i], fastener=poses[`148510-${i+1}`];
        near(fastener[0],x+sign*1.5);
        near(fastener[1],818);
        near(fastener[2],255);
        assert.equal(depth(rail,v(x+1.3*sign,818,255),axis),Infinity);
        near(depth(rail,v(x+1.3*sign,818,237),axis),0);
        assert.ok(depth(rail,v(x+1.3*sign,800,261),axis)<-7,'wheel projects inward at the front');
      }
    }
    const p29=sample(compile({drawerBay:'left'}),29,1).poses;
    const end=mount(factory,'endL',p29.endL);
    near(depth(end,v(-896.5,808,250),v(-1,0,0)),7); // The separate shallow board bore lies behind the rail bore.
    near(depth(end,v(-896.5,808,234),v(-1,0,0)),0);
  } finally { factory.dispose(); }
});

test('p. 40: drawer wheels face rear on the two outside faces, opposite the case wheels',()=>{
  const factory=createGeometry();
  try {
    for(const [i,id] of ['drawerRunnerL','drawerRunnerR'].entries()) {
      const outward=i?1:-1, rail=mount(factory,id);
      assert.ok(depth(rail,v(1.3*outward,-9,-256),v(-outward,0,0))<-7);
      near(depth(rail,v(1.3*outward,-9,256),v(-outward,0,0)),0);
    }
  } finally { factory.dispose(); }
});

test('pp. 34–35: the same short door has two blind cup recesses and follows the selected handed plates',()=>{
  const factory=createGeometry();
  try {
    const hinges={left:['117877-1','117877-2'],center:['117877-3','117877-4'],right:['117877-5','117877-6']};
    for(const [drawerBay,ids] of Object.entries(hinges)) {
      const t=compile({drawerBay}), bench=sample(t,40,1).poses, hanging=sample(t,41,1).poses;
      const door=mount(factory,'shortDoor',bench.shortDoor), mounted=mount(factory,'shortDoor',hanging.shortDoor);
      const into=v(0,0,1).applyQuaternion(door.quaternion);
      for(const [i,id] of ids.entries()) {
        const local=door.worldToLocal(v(...bench[id].slice(0,3)));
        near(local.x,276);
        near(Math.abs(local.y),265.5);
        near(local.z,-13);
        near(depth(door,door.localToWorld(v(276,local.y,-9)),into),14);
        near(depth(door,door.localToWorld(v(298,local.y,-9)),into),0);
        const world=mounted.localToWorld(local);
        near(world.distanceTo(v(...hanging[id].slice(0,3))),0);
        near(world.y,i?163:694);
        near(world.z,291);
        const hinge=mount(factory,id,hanging[id]);
        const tongue=hinge.getObjectByName('hinge tongue').getWorldPosition(v(0,0,0));
        const joint=t.steps.get(41).events.find(event=>event.kind==='move'&&event.ids.includes(id));
        const platePos=v(...hanging[joint.op.prerequisites[i]].slice(0,3));
        assert.ok(tongue.distanceTo(platePos)<4,'the open hinge tongue reaches its selected mounting plate');
      }
    }
  } finally { factory.dispose(); }
});

test('p. 32: the round entry and the retaining neck are different regions of the same cutout',()=>{
  const factory=createGeometry();
  try {
    const plate=mount(factory,'103693-1');
    assert.equal(depth(plate,v(5,12,-1.4),v(0,0,1)),Infinity);
    assert.equal(depth(plate,v(0,0,-1.4),v(0,0,1)),Infinity);
    near(depth(plate,v(5,0,-1.4),v(0,0,1)),0);
  } finally { factory.dispose(); }
});
