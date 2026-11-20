import assert from 'node:assert/strict';
import test from 'node:test';
import { Quaternion, Raycaster, Scene, Vector3 } from 'three';
import { sample } from '../../src/timeline.js';
import { parts } from './kit.js';
import { createGeometry, createPresentation } from './scene.js';
import { compile } from './model.js';

function put(node,pose) {
  node.position.fromArray(pose); node.quaternion.fromArray(pose,3); node.updateMatrixWorld(true);
  return node;
}
function hits(mesh,origin,axis,distance) {
  return new Raycaster(new Vector3(...origin),new Vector3(...axis),0,distance).intersectObject(mesh,true).length>0;
}

test('both official step 18 insets align the independent front locator and rear sockets',()=>{
  const geo=createGeometry();
  const assets=[];
  const scene=new Scene(), presentation=createPresentation({scene,own:asset=>{ assets.push(asset); return asset; }});
  try {
    for(const [layout,s,page] of [['right-upper',1,21],['right-lower',1,21],['left-upper',-1,47],['left-lower',-1,47]]) {
      const t=compile({layout}), frame=sample(t,18,1), record=t.steps.get(18);
      assert.equal(record.page,page);
      presentation.update(frame,{number:18,route:t.route});
      scene.updateMatrixWorld(true);
      const visible=scene.children.filter(o=>o.visible);
      assert.equal(visible.length,1);
      assert.equal(visible[0].name,`${s===1?'Right':'Left'} storage prerequisite`);
      assert.equal(visible[0].getObjectByName('Closed wide bay face (lower drawing)').visible,layout.endsWith('lower'));
      const roof=visible[0].getObjectByName('Drilled storage top');
      const rear=put(geo.instantiate(parts.get('rearRail')),frame.poses.rearRail);
      const front=put(geo.instantiate(parts.get('frontRail')),frame.poses.frontRail);
      for(const [id,x,z,rail] of [['101352-1',s*906,512,front],['114613-3',s*906,-530,rear],['114613-4',s*514,-530,rear]]) {
        const pin=frame.poses[id];
        assert.ok(Math.abs(pin[0]-x)<1e-7);
        assert.ok(Math.abs(pin[2]-z)<1e-7);
        assert.equal(hits(roof,[x,1450,z],[0,-1,0],44),false,`closed storage bore for ${id}`);
        assert.equal(hits(roof,[x-s*15,1450,z],[0,-1,0],44),true);
        assert.equal(hits(rail,[x,1418,z],[0,1,0],7),false,`closed rail receiver for ${id}`);
        assert.equal(hits(rail,[x-s*15,1418,z],[0,1,0],7),true);
      }
      assert.equal(hits(roof,[s*940,1450,512],[0,-1,0],44),false,'adjacent unoccupied bore in p. 21/47 inset');
    }
    presentation.update(null,{number:14,route:{layout:'right-upper'}});
    assert.ok(scene.children.every(o=>!o.visible));
  } finally {
    geo.dispose();
    for(const a of assets) a.dispose();
  }
});

test('ladder grip geometry stays open and the added stud bores distinguish the stiles',()=>{
  const geo=createGeometry();
  try {
    for(const [layout,s] of [['right-lower',1],['left-upper',-1]]) {
      const t=compile({layout}), stage=sample(t,34,1);
      for(const [id,x] of [['stileBored',s*466],['stilePlain',s*969]]) {
        const stile=put(geo.instantiate(parts.get(id)),stage.poses[id]);
        const origin=x-s*57, direction=[s,0,0];
        assert.equal(hits(stile,[origin,1640,549],direction,111),false,'through the oval hand grip');
        assert.equal(hits(stile,[origin,1640,576],direction,111),true,'beside the grip');
        assert.equal(hits(stile,[origin,1730,524],direction,111),id==='stilePlain','only the bored stile has the upper stud receiver');
        assert.equal(hits(stile,[origin,552,530],direction,111),false,'second tread has its first dowel receiver');
        assert.equal(hits(stile,[origin,552,568],direction,111),false,'second tread has its second dowel receiver');
        assert.equal(hits(stile,[origin,285,530],direction,111),true,'first tread does not have the offset receiver');
      }
      const axis=new Vector3(0,1,0).applyQuaternion(new Quaternion().fromArray(stage.poses['114613-7'],3));
      assert.ok(axis.distanceTo(new Vector3(-s,0,0))<1e-7,'pre-fitted stud sticks out toward the front guard');
      assert.equal(stage.captive['192800-3'],undefined);
      assert.equal(sample(t,35,1).captive['192800-3'],1);
    }
  } finally { geo.dispose(); }
});
