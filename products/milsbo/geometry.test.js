import assert from 'node:assert/strict';
import test from 'node:test';
import { Box3, Raycaster, Vector3 } from 'three';
import { sample } from '../../src/timeline.js';
import { createGeometry } from './geometry.js';
import { parts } from './kit.js';
import { compile } from './model.js';

const v=(...a)=>new Vector3(...a), down=v(0,-1,0);
const unitPose=[0,0,0,0,0,0,1];
function mount(factory,id,pose=unitPose) {
  const node=factory.instantiate(parts.get(id));
  node.position.fromArray(pose); node.quaternion.fromArray(pose,3); node.updateMatrixWorld(true);
  return node;
}
const cast=(node,from,axis,depth)=>new Raycaster(from,axis,0,depth).intersectObject(node);
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-6,`${a} does not align with ${b}`);

// The p. 12 shoulder/key inset is independent of the p. 13 insertion arrow.
test('the rear mullion enters a keyed opening, not a flat floor',()=>{
  const t=compile({}), factory=createGeometry();
  try {
    const floor=mount(factory,'floor');
    assert.equal(cast(floor,v(0,20,-194),down,26).length,0);
    assert.equal(cast(floor,v(12,20,-194),down,26).length,0,'lateral key wing is open');
    assert.ok(cast(floor,v(12,20,-198),down,26).length,'adjacent shoulder is intact');
    assert.ok(cast(floor,v(18,20,-194),down,26).length,'adjacent deck is intact');
    const {poses}=sample(t,9,1);
    const target=v(...t.steps.get(9).events[0].joint.target);
    assert.ok(target.distanceTo(v(0,192,194))<1e-7,'rear centre is still facing the assembly side');
    const mullion=mount(factory,'mullion',poses.mullion);
    near(new Box3().setFromObject(mullion).min.y,185.5);
  } finally { factory.dispose(); }
});

test('side panes go in top-first on opposite sides and sit behind the actual roof stops',()=>{
  const t=compile({}), factory=createGeometry();
  try {
    const {poses}=sample(t,20,1), roof=mount(factory,'roof',poses.roof);
    for(const [step,id,s] of [[15,'sideR',1],[17,'sideL',-1]]) {
      const {paths}=t.steps.get(step).events[0];
      const staged=mount(factory,id,paths[0][1]);
      const head=staged.localToWorld(v(0,768,0));
      near(head.x,s*347); near(head.y,1733);
      assert.ok(s*staged.localToWorld(v(0,-768,0)).x<300,'the bottom swings outward only after the top enters');
      const seated=new Box3().setFromObject(mount(factory,id,poses[id]));
      near(seated.min.y,192); near(seated.max.y,1728);
      assert.ok(cast(roof,v(s*342,1728,112),v(-s,0,0),8).length,'roof has a retainer on the inside of the glass');
    }
  } finally { factory.dispose(); }
});

test('the handed doors meet their pegs and pins, and both pulls enter their own stiles',()=>{
  const t=compile({}), factory=createGeometry();
  try {
    const {poses}=sample(t,26,1), roof=mount(factory,'roof',poses.roof);
    for(const [hand,s,n] of [['L',-1,1],['R',1,2]]) {
      const id=`door${hand}`, door=mount(factory,id,poses[id]);
      const pull=door.worldToLocal(v(...poses[`10002580-${n}`].slice(0,3)));
      near(pull.x,-s*332); near(pull.y,801.84); near(pull.z,15);
      for(const y of [779.84,823.84]) {
        const stile=mount(factory,id);
        assert.equal(cast(stile,v(-s*332,y,-16),v(0,0,1),32).length,0,'pull stud has an open bore');
        assert.ok(cast(stile,v(-s*337,y,-16),v(0,0,1),32).length,'solid metal beside the bore');
      }
      near(poses[`151059-${n}`][0],s*347); near(poses[`151059-${n}`][2],203);
      near(poses[`195362-${n}`][0],s*347); near(poses[`195362-${n}`][2],203);
      assert.equal(cast(roof,v(s*347,1745,203),down,6).length,0,'upper pin has clearance in the roof tab');
      assert.ok(cast(roof,v(s*347+8,1745,203),down,6).length,'tab metal surrounds the opening');
    }
    const left=mount(factory,'doorL'), right=mount(factory,'doorR');
    assert.ok(cast(left,v(332,745.84,-16),v(0,0,1),34).length);
    assert.equal(cast(right,v(-332,745.84,-16),v(0,0,1),34).length,0,'keyhole is only on the right meeting stile');
  } finally { factory.dispose(); }
});

test('three transparent shelves lower onto the twelve corner rests at their own heights',()=>{
  const t=compile({}), factory=createGeometry();
  try {
    const {poses}=sample(t,30,1);
    const ids=[[1,[5,1,7,3],552],[2,[9,10,11,12],936],[3,[6,2,8,4],1320]];
    for(const [n,rests,y] of ids) {
      const id=`shelf-${n}`, shelf=mount(factory,id,poses[id]);
      const bounds=new Box3().setFromObject(shelf);
      near(bounds.min.y,y); near(bounds.max.y,y+6);
      const event=t.steps.get(30).events[n-1], path=event.paths[0];
      assert.ok(path[0][2]>400&&path[0][3]!==0,'shelf enters at an angle through the front');
      near(path.at(-2)[2],0); near(path.at(-2)[3],0);
      assert.ok(path.at(-2)[1]>bounds.max.y);
      shelf.traverse(node=>{if(node.isMesh) assert.ok(node.material.transparent&&node.material.opacity<1);});
      for(const [i,rest] of rests.entries()) {
        const support=mount(factory,`10003241-${rest}`,poses[`10003241-${rest}`]);
        const s=i%2===0?-1:1, d=i<2?1:-1;
        const p=v(s*326,y+20,d*178);
        const shelfHits=cast(shelf,p,down,30), supportHits=cast(support,p,down,30);
        assert.ok(shelfHits.length&&supportHits.length);
        near(shelfHits[0].point.y,y+6); near(supportHits[0].point.y,y);
      }
    }
  } finally { factory.dispose(); }
});
