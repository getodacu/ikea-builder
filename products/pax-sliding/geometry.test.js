import assert from 'node:assert/strict';
import test from 'node:test';
import { Box3, Raycaster, Scene, Vector3 } from 'three';
import product from './product.js';
import { compile } from './model.js';
import { createGeometry, createPresentation } from './scene.js';

const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-6,`expected ${a} to equal ${b}`);
function vector(actual,expected) { for(const [i,want] of expected.entries()) close(actual.getComponent(i),want); }
function node(geometry,id,frame) {
  const part=geometry.instantiate(product.parts.get(id));
  if(frame) {
    const p=frame.poses[id];
    part.position.fromArray(p); part.quaternion.fromArray(p,3);
    part.userData.setCaptive?.(frame.captive[id]??0);
  }
  part.updateMatrixWorld(true);
  return part;
}
const ray=(part,orig,dir,far=Infinity)=>new Raycaster(new Vector3(...orig),new Vector3(...dir),0,far).intersectObject(part,true);
const at=(part,name)=>part.getObjectByName(name).getWorldPosition(new Vector3());

test('p. 18 panel drops between two different-height hits at the actual bottom receiver',()=>{
  const geometry=createGeometry();
  try {
    const step=compile({}).steps.get(18);
    const foot=node(geometry,'inner-foot',step.end), panel=node(geometry,'inner-panel-1',step.end);
    // Lower panel edge sits between the two higher channel lips, not on either lip.
    const hits=[39,43,47].map(z=>ray(foot,[385,95,z],[0,-1,0])[0].point.y);
    [65,59,65].forEach((y,i)=>close(hits[i],y));
    const bounds=new Box3().setFromObject(panel);
    close(bounds.min.y,59);
    close(bounds.min.z,41.4);
    close(bounds.max.z,44.6);
    close(bounds.min.x-(-108),493-(bounds.max.x-385));
  } finally { geometry.dispose(); }
});

test('p. 13 and p. 23 brackets use pierced two-screw plates, with different lower reach',()=>{
  const geometry=createGeometry();
  try {
    const t=compile({}), inner=node(geometry,'shortCatch-2'), outer=node(geometry,'longCatch-2');
    for(const part of [inner,outer]) {
      for(const x of [-9,9]) for(const y of [0,4.6]) assert.equal(ray(part,[x,y,-18],[0,0,1],14).length,0);
      close(ray(part,[17,0,-18],[0,0,1],14)[0].point.z,-9);
    }
    vector(at(node(geometry,'shortCatch-2',t.steps.get(15).end),'catch tongue'),[958,45,27]);
    const step=t.steps.get(26);
    const justBeforeClick=step.events[1].before;
    const parked=at(node(geometry,'longCatch-2',justBeforeClick),'catch tongue');
    const engaged=at(node(geometry,'longCatch-2',step.end),'catch tongue');
    vector(parked,[958,29,22]);
    vector(engaged,[958,29,19]);
    const lower=node(geometry,'lower-track',step.end);
    vector(at(lower,'outer catch lane'),[0,29,19]);
    vector(at(lower,'inner catch lane'),[0,45,27]);
  } finally { geometry.dispose(); }
});

test('p. 14 and p. 24 short and long carriers run on distinct upper lips',()=>{
  const geometry=createGeometry();
  try {
    const t=compile({}), inner=t.steps.get(13).end, outer=t.steps.get(25).end;
    const i=at(node(geometry,'shortRoller-1',inner),'roller');
    const o=at(node(geometry,'longRoller-1',outer),'roller');
    vector(i,[-80,1988,27]);
    vector(o,[-145,2000,19]);
    const upper=node(geometry,'upper-track',outer);
    for(const [wheel,lane] of [[i,'inner running lip'],[o,'outer running lip']]) {
      const way=upper.getObjectByName(lane);
      const seat=ray(way,[wheel.x,wheel.y+18,wheel.z],[0,-1,0])[0].point;
      close(seat.y,wheel.y-8);
      close(seat.z,wheel.z);
    }
  } finally { geometry.dispose(); }
});

test('fixed bays are outside the kit and the external panel tray is Unbox only',()=>{
  const scene=new Scene(), assets=new Set();
  const presentation=createPresentation({scene,own:asset=>(assets.add(asset),asset)});
  try {
    const [bays,levels,tray]=scene.children;
    assert.deepEqual(presentation.zones.map(([label])=>label),['PAX frame and rail kit','Required, not supplied']);
    vector(presentation.bounds.getSize(new Vector3()),[2000,2010,580]);
    presentation.update(null,{number:0});
    assert.deepEqual([bays.visible,levels.visible,tray.visible],[false,false,true]);
    presentation.update(null,{number:1});
    assert.deepEqual([bays.visible,levels.visible,tray.visible],[true,true,false]);
    presentation.update(null,{number:37});
    assert.deepEqual([bays.visible,levels.visible,tray.visible],[true,false,false]);
    vector(bays.position,[0,0,0]);
  } finally { for(const asset of assets) asset.dispose(); }
});
