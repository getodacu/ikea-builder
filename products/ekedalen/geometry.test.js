import assert from 'node:assert/strict';
import test from 'node:test';
import { Quaternion, Raycaster, Vector3 } from 'three';
import { sample } from '../../src/timeline.js';
import { createGeometry } from './geometry.js';
import { parts } from './kit.js';
import { compile } from './model.js';

const v=(...a)=>new Vector3(...a);
function mount(factory,id,pose) {
  const node=factory.instantiate(parts.get(id));
  node.position.fromArray(pose);
  node.quaternion.fromArray(pose,3);
  node.updateMatrixWorld(true);
  return node;
}
function cutDepth(node,p,axis) {
  return new Raycaster(p.clone().addScaledVector(axis,-20),axis).intersectObject(node)[0]?.distance-20;
}

test('p. 22 fittings reach separate drilled faces of the one leaf',()=>{
  const factory=createGeometry();
  try {
    const t=compile({}), end=sample(t,30,1).poses;
    const leaf=mount(factory,'leaf',end.leaf), down=v(0,-1,0);
    const committed=[['109021-17',272,515],['109021-18',272,535],['109021-19',272,1165],['109021-20',272,1185],
      ['10082399-3',-272,835],['10082399-4',-272,865]];
    for(const [id,x,z] of committed) {
      assert.deepEqual([end[id][0],end[id][2]],[x,z]);
      assert.ok(cutDepth(leaf,v(x,24,z),down)>8,'Screw reaches an open leaf pilot hole');
      assert.ok(Math.abs(cutDepth(leaf,v(x+7,24,z),down))<1e-5,'Adjacent material is intact');
    }
    assert.ok(end.locatorRear[0]>0&&end.locatorFront[0]>0&&end['10082205-2'][0]<0);
  } finally { factory.dispose(); }
});

test('p. 6 guides have opposed faces and the p. 5 end dowels enter their keyed bores',()=>{
  const t=compile({}), {poses}=sample(t,3,1), factory=createGeometry();
  try {
    for(const [id,dowel,sign] of [['guideRear','101350-1',-1],['guideFront','101350-2',1]]) {
      const rail=mount(factory,id,poses[id]);
      const q=new Quaternion().fromArray(poses[id],3);
      assert.ok(v(0,0,1).applyQuaternion(q).distanceTo(v(0,0,-sign))<1e-8);
      const [x,y]=poses[dowel];
      assert.ok(Math.abs(x-526)<1e-8);
      const mouth=v(x,y,342*sign), into=v(0,0,sign);
      assert.ok(cutDepth(rail,mouth,into)>6);
      assert.ok(Math.abs(cutDepth(rail,mouth.clone().add(v(-10,0,0)),into))<1e-5);
    }
  } finally { factory.dispose(); }
});

test('p. 11 carrier tongues enter both opposed guide channels',()=>{
  const frame=sample(compile({}),13,1), factory=createGeometry();
  try {
    for(const [guide,slide,sign] of [['guideRear','slideRear',-1],['guideFront','slideFront',1]]) {
      const rail=mount(factory,guide,frame.poses[guide]), tongue=mount(factory,slide,frame.poses[slide]);
      const outward=v(0,0,sign);
      assert.ok(Math.abs(cutDepth(rail,v(0,69.5,342*sign),outward)-16)<1e-5);
      assert.ok(Math.abs(cutDepth(tongue,v(0,69.5,351*sign),outward.negate()))<1e-5);
    }
  } finally { factory.dispose(); }
});
