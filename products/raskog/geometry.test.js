import assert from 'node:assert/strict';
import test from 'node:test';
import { Box3, Raycaster, Vector3 } from 'three';
import { sample } from '../../src/timeline.js';
import { createGeometry } from './geometry.js';
import product from './product.js';

const v=(...xyz)=>new Vector3(...xyz);
const {parts,compile,completeFrame,useDemo}=product;
function mounted(g,id,state) {
  const node=g.instantiate(parts.get(id)), p=state.poses[id];
  node.position.fromArray(p); node.quaternion.fromArray(p,3);
  node.userData.setCaptive?.(state.captive[id]??0);
  node.updateMatrixWorld(true);
  return node;
}
const ray=(mesh,origin,direction,far)=>new Raycaster(origin,direction,0,far).intersectObject(mesh,true)[0]?.distance;

test('figs. 1–2 spigots fit their end sleeves and their holes admit the short cross-head screws',()=>{
  const g=createGeometry(), t=compile({}), state=sample(t,1,1), based=sample(t,2,1);
  try {
    for (const [i,side] of ['left','right'].entries()) {
      const s=i===0?-1:1, lower=mounted(g,`lower-${side}`,state), upper=mounted(g,`upper-${side}`,state);
      for (const z of [-324,-294]) {
        assert.equal(ray(lower,v(s*204,345,z),v(0,-1,0),20),undefined);
        assert.ok(ray(lower,v(s*211.7,345,z),v(0,-1,0),12)>7.9);
        for (const mesh of [lower,upper]) {
          assert.equal(ray(mesh,v(s*225,327.5,z),v(-s,0,0),25),undefined);
          assert.ok(ray(mesh,v(s*225,330.7,z),v(-s,0,0),25)<17);
        }
      }
    }
    for (const [id,z] of [['hoop-front',15],['hoop-back',-15]]) {
      const hoop=mounted(g,id,based);
      for (const s of [-1,1]) {
        assert.equal(ray(hoop,v(s*225,70.5,z),v(-s,0,0),25),undefined);
        assert.ok(ray(hoop,v(s*225,73.7,z),v(-s,0,0),25)<17);
      }
    }
  } finally { g.dispose(); }
});

test('figs. 3–5 capture two outside clamp wings and a real bolt passage at each tier',()=>{
  const g=createGeometry(), t=compile({});
  try {
    for (const [i,y] of [97,384,671].entries()) {
      const state=sample(t,i+3,1), id=`tray-${i+1}`, tray=mounted(g,id,state), zone=i===2?'upper':'lower';
      assert.ok(Math.abs(state.poses[id][1]-(y-4))<1e-9);
      assert.equal(ray(tray,v(0,y-20,5),v(0,-1,0),45),undefined);
      assert.ok(ray(tray,v(0,y-20,0),v(0,-1,0),45)>25);
      for (const [j,side] of ['left','right'].entries()) {
        const n=2*i+j+1, s=j===0?-1:1, direction=v(-s,0,0);
        const clamp=mounted(g,`clamp-${n}`,state), post=mounted(g,`${zone}-${side}`,state);
        const bolt=mounted(g,`124154-${n}`,state), nut=mounted(g,`10119612-${n}`,state);
        for (const receiver of [clamp,post,tray]) {
          assert.equal(ray(receiver,v(s*224,y,0),direction,36),undefined);
          assert.ok(ray(receiver,v(s*224,y+5,0),direction,36)<35);
        }
        assert.ok(Math.abs(ray(clamp,v(s*224,y,15),direction,18)-10.3)<.2);
        assert.ok(v(0,-1,0).applyQuaternion(bolt.quaternion).distanceTo(direction)<1e-8);
        assert.ok(v(0,1,0).applyQuaternion(nut.quaternion).distanceTo(direction)<1e-8);
        assert.ok(Math.abs(bolt.position.x-s*214.5)<1e-8);
        assert.ok(Math.abs(nut.position.x-s*190.2)<1e-8);
      }
    }
  } finally { g.dispose(); }
});

test('figs. 6–7 thread four co-axial stems into the two tipped base hoops, then stand on the wheels',()=>{
  const g=createGeometry(), t=compile({});
  try {
    for (const [n,key,x] of [[6,'braked-swivel',-204],[7,'plain-swivel',204]]) {
      const state=sample(t,n,1);
      for (const [i,id,z] of [[1,'hoop-back',-137],[2,'hoop-front',137]]) {
        const wheel=mounted(g,`${key}-${i}`,state), hoop=mounted(g,id,state);
        const axis=v(0,1,0).applyQuaternion(wheel.quaternion);
        assert.ok(axis.distanceTo(v(0,0,-1))<1e-8);
        assert.ok(wheel.position.distanceTo(v(x,174.5+z,-59))<1e-8);
        const entry=wheel.position.clone().addScaledVector(axis,-4);
        assert.equal(ray(hoop,entry,axis,11),undefined);
        assert.ok(Math.abs(ray(hoop,entry.clone().add(v(6,0,0)),axis,11)-4)<1e-8);
      }
    }
    const finished=completeFrame(sample(t,7,1)), bounds=new Box3();
    for (const id of finished.installed) bounds.expandByObject(mounted(g,id,finished),true);
    assert.ok(Math.abs(bounds.min.y)<.001);
    const envelope=bounds.getSize(v(0,0,0));
    assert.ok(envelope.distanceTo(v(451,772,349))<3);
  } finally { g.dispose(); }
});

test('the p. 8 inset rotates the two cloned integral pedals, with fixed pivots, hubs and swivel bodies',()=>{
  const g=createGeometry(), t=useDemo.compile({}), n=t.order.at(-1);
  try {
    const start=sample(t,n,0), end=sample(t,n,1);
    for(const id of ['braked-swivel-1','braked-swivel-2']) {
      const unlocked=mounted(g,id,start), locked=mounted(g,id,end);
      const raised=unlocked.getObjectByName('brake lever'), lowered=locked.getObjectByName('brake lever');
      assert.notEqual(raised,lowered);
      assert.ok(raised.getWorldPosition(v(0,0,0)).distanceTo(lowered.getWorldPosition(v(0,0,0)))<1e-8);
      const pedalTip=node=>node.localToWorld(v(0,0,24));
      assert.ok(pedalTip(raised).y>pedalTip(lowered).y+19);
      assert.ok(Math.abs(pedalTip(lowered).y-lowered.getWorldPosition(v(0,0,0)).y)<1e-8);
      for (const [i,child] of unlocked.children.entries()) if(child!==raised) {
        assert.deepEqual(child.matrixWorld.elements,locked.children[i].matrixWorld.elements);
      }
    }
    for(const id of ['plain-swivel-1','plain-swivel-2']) {
      assert.equal(mounted(g,id,end).getObjectByName('brake lever'),undefined);
    }
  } finally { g.dispose(); }
});
