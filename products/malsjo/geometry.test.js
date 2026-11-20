import assert from 'node:assert/strict';
import test from 'node:test';
import { Raycaster, Vector3 } from 'three';
import { createGeometry } from './geometry.js';
import { parts, shapes } from './kit.js';

test('joining parts have recessed and through openings in the rendered mesh', t=>{
  const kit=createGeometry();
  t.after(()=>kit.dispose());
  const cast=(part,from,axis)=>{
    const mesh=kit.instantiate(part);
    mesh.updateMatrixWorld(true);
    return new Raycaster(new Vector3(...from),new Vector3(...axis)).intersectObject(mesh)[0]?.distance;
  };
  const top=parts.get('top');
  for(const x of [-690,0,690]) for(const z of [-169,154]) {
    assert.ok(cast(top,[x,-30,z],[0,1,0])>cast(top,[x+12,-30,z],[0,1,0])+11,`top dowel at ${x}, ${z}`);
    assert.equal(cast(top,[x,30,z],[0,-1,0]),13,'the show face is not drilled through');
  }
  for(const id of ['sideL','sideR']) {
    const side=parts.get(id);
    assert.ok(cast(side,[0,425,-169],[0,-1,0])>cast(side,[0,425,-159],[0,-1,0])+8,`${id} receives the dowel at the other end`);
  }
  const side=parts.get('sideL');
  assert.equal(cast(side,[30,190,-186],[-1,0,0]),undefined,'the cross-rail dowel bore clears both layers of the stepped stile');
  assert.ok(Number.isFinite(cast(side,[30,178,-186],[-1,0,0])),'solid wood borders the dowel bore');
  for(const [id,z] of [['upperBack',7],['upperFront',29]]) {
    const rail=parts.get(id);
    assert.ok(cast(rail,[-700,0,z],[1,0,0])>cast(rail,[-700,12,z],[1,0,0])+10,`${id} receives its side bolt`);
  }
  for(const id of ['pf','pb','pl','pr']) {
    const rail=parts.get(id);
    const centers=rail.shape==='plinthSide'
      ? [-144,144].flatMap(z=>[z-8.16,z+8.16].map(peg=>[0,peg]))
      : [[-8.16,0],[8.16,0]];
    for(const [x,z] of centers) assert.ok(cast(rail,[x,-30,z],[0,1,0])>cast(rail,[x,-30,z+6],[0,1,0])+4,`${id} receives the foot peg at ${x}, ${z}`);
  }
  const drawer=parts.get('dRFront');
  assert.ok(cast(drawer,[-312.5,11,-30],[0,0,1])>cast(drawer,[-312.5,20,-30],[0,0,1])+5,'drawer front receives its side dowel');
  for(const id of ['dividerLow','dividerTop','shelfL','dRDivider','dRBack','dLBack']) {
    const part=parts.get(id), [w,h,d]=shapes[part.shape];
    for(const sign of [-1,1]) assert.ok(Math.abs(cast(part,[sign*w*.4,h*.33,d/2+10],[0,0,-1])-10)<.01,`${id} has a wooden face near both ends`);
  }
  const sleeve=[...parts.values()].find(p=>p.shape==='sleeve');
  assert.equal(cast(sleeve,[0,10,0],[0,-1,0]),undefined,'the support pin can pass through its sleeve');
  assert.ok(Number.isFinite(cast(sleeve,[4,10,0],[0,-1,0])),'the sleeve still has a rim');
  const anchor=parts.get('141413-1'), washer=parts.get('126916-1');
  assert.equal(cast(anchor,[0,30,0],[0,-1,0]),undefined,'wall bracket has a centered passage');
  assert.equal(cast(washer,[0,10,0],[0,-1,0]),undefined,'wall screw passes through the washer');
  assert.ok(cast(washer,[13,10,0],[0,-1,0])<cast(washer,[5,10,0],[0,-1,0]),'the rim is solid and the head-facing center is recessed');
});

test('screws can enter both faces of the plinth bracket and pass through the door stop', t=>{
  const kit=createGeometry();
  t.after(()=>kit.dispose());
  const bracket=kit.instantiate(parts.get('102553-1'));
  const stop=kit.instantiate(parts.get('123805-1'));
  for(const mesh of [bracket,stop]) mesh.updateMatrixWorld(true);
  for(const [mesh,start,axis] of [
    [bracket,[0,10,0],[0,-1,0]],
    [bracket,[0,0,-12],[0,0,1]],
    [stop,[0,12,0],[0,-1,0]]
  ]) {
    const ray=new Raycaster(new Vector3(...start),new Vector3(...axis));
    assert.deepEqual(ray.intersectObject(mesh),[],'the screw centerline clears the receiving part');
    ray.ray.origin.x+=5;
    assert.ok(ray.intersectObject(mesh).length>0,'solid material borders the hole');
  }
});
