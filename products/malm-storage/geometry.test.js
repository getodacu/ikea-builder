import assert from 'node:assert/strict';
import test from 'node:test';
import { Raycaster, Vector3 } from 'three';
import { sample } from '../../src/timeline.js';
import { createGeometry } from './geometry.js';
import { parts } from './kit.js';
import { compile } from './model.js';

const v=(...p)=>new Vector3(...p);
const down=v(0,-1,0);
function mounted(factory,snapshot,id) {
  const node=factory.instantiate(parts.get(id));
  node.position.fromArray(snapshot.poses[id]);
  node.quaternion.fromArray(snapshot.poses[id],3);
  node.userData.setCaptive?.(snapshot.captive[id]??0);
  node.updateMatrixWorld(true);
  return node;
}
const strikeY=(node,x,y,z)=>new Raycaster(v(x,y,z),down).intersectObject(node)[0]?.point.y;
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-5,`${a} is not ${b}`);

test('p. 25 bolt axes run through both steel deck faces into keyed upper receiver bores',()=>{
  const f=createGeometry(), t=compile({}), snap=sample(t,24,1);
  try {
    for(const [side,rail,sign,first] of [['linkR','outerR',-1,1],['linkL','outerL',1,4]]) {
      const beam=mounted(f,snap,rail), receiver=mounted(f,snap,side);
      for(const [index,z] of [-800,-650,-460].entries()) {
        const x=650*sign, bolt=snap.poses[`124584-${first+index}`];
        assert.deepEqual(bolt.slice(0,3),[x,386,z]);
        assert.equal(strikeY(beam,x,401,z),undefined,'Aligned through bore must not hit the carriage tube');
        close(strikeY(beam,x+9,401,z),384);
        close(strikeY(receiver,x,370,z),344.5);
        close(strikeY(receiver,x+9,370,z),356);
      }
    }
  } finally { f.dispose(); }
});

test('p. 32 two-pin caps share one open row on the outer and adjacent center rails',()=>{
  const f=createGeometry(), t=compile({}), snap=sample(t,32,1);
  try {
    for(const [id,x,cap] of [['outerR',-650,1],['centerR',-12,2],['centerL',12,3],['outerL',650,4]]) {
      const rail=mounted(f,snap,id), pos=snap.poses[`124663-${cap}`];
      assert.deepEqual(pos.slice(0,3),[x,390,-850]);
      assert.ok(v(0,-1,0).applyQuaternion(mounted(f,snap,`124663-${cap}`).quaternion).distanceTo(down)<1e-6);
      for(const z of [-860,-840]) close(strikeY(rail,x,403,z),359);
      close(strikeY(rail,x,403,-850),384);
    }
  } finally { f.dispose(); }
});

test('pp. 19 and 37–38 place opposite-handed guard sets inside the respective bedside',()=>{
  const f=createGeometry(), t=compile({}), snap=sample(t,17,1);
  try {
    assert.equal(parts.get('linkL').family,'123830');
    assert.equal(parts.get('linkR').family,'123829');
    for(const [id,sign] of [['linkL',1],['linkR',-1]]) {
      const shell=mounted(f,snap,id);
      const blades=shell.children.filter(o=>o.type==='Group'&&o.children.length===1);
      assert.equal(blades.length,3);
      assert.deepEqual(blades.map(o=>o.position.x*sign),[14,17,20]);
      assert.equal(shell.position.x,sign*650);
      assert.ok(v(0,0,1).applyQuaternion(shell.quaternion).y>0,'Foot-facing carriage locator rises toward the foot');
    }
  } finally { f.dispose(); }
});
