import assert from 'node:assert/strict';
import test from 'node:test';
import { Box3, Raycaster, Vector3 } from 'three';
import { sample } from '../../src/timeline.js';
import { createGeometry } from './geometry.js';
import { compile } from './model.js';
import { parts } from './kit.js';

const timeline=compile({}), installed=sample(timeline,12,1);
const vec=p=>new Vector3(...p);
const cast=(mesh,from,direction)=>new Raycaster(vec(from),vec(direction)).intersectObject(mesh)[0]?.distance;
function fixture(t) {
  const geometry=createGeometry();
  t.after(()=>geometry.dispose());
  return (id,frame=installed)=>{
    const node=geometry.instantiate(parts.get(id));
    if(frame) {
      const pose=frame.poses[id];
      node.position.fromArray(pose);
      node.quaternion.fromArray(pose,3);
      node.userData.setCaptive?.(frame.captive[id]??0);
    }
    node.updateMatrixWorld(true);
    return node;
  };
}

test('both rear channels have a continuous passage and actual surrounding wood',t=>{
  const mesh=fixture(t), back=mesh('back'), backBox=new Box3().setFromObject(back);
  assert.ok(backBox.min.x < -382 && backBox.max.x > 382,'back edges extend inside both channels');
  assert.ok(backBox.min.x > -388 && backBox.max.x < 388,'back edges do not penetrate the outside webs');
  assert.ok(Math.abs(backBox.max.z+122)<1e-6,'back front plane meets the fixed panel rear edges');
  for(const [sign,id] of [[-1,'sideL'],[1,'sideR']]) {
    const side=mesh(id), up=[0,1,0];
    for(const z of [backBox.min.z+.3,-123.75,backBox.max.z-.3]) {
      assert.equal(cast(side,[sign*386,-12,z],up),undefined,'full length of sliding strip clears the channel');
    }
    assert.ok(Number.isFinite(cast(side,[sign*386,-12,-118],up)),'inside front lip remains');
    assert.ok(Number.isFinite(cast(side,[sign*386,-12,-132],up)),'inside rear lip remains');
    assert.ok(Number.isFinite(cast(side,[sign*390,-12,-123.75],up)),'outside web remains');
    const opening=cast(side,[sign*370,900,-123.75],[sign,0,0]);
    const solid=cast(side,[sign*370,900,-115],[sign,0,0]);
    assert.ok(Math.abs(opening-solid-6)<1e-5,'mirrored channel opens toward the case and is not a through-hole in the broad face');
  }
});

test('the one back really folds and opens, with all 18 holes lined up to solid-edge pilot rows',t=>{
  const mesh=fixture(t), back=mesh('back');
  const secondBack=mesh('back',null), folded=new Box3().setFromObject(secondBack);
  assert.ok(folded.max.x-folded.min.x<310,'the two wing panels actually fold around the central stock');
  const open=new Box3().setFromObject(back);
  assert.ok(open.max.x-open.min.x>770,'the unfolded back spans both grooves');
  assert.ok(new Box3().setFromObject(secondBack).equals(folded),'opening one instance must not change another clone');
  for(const [board,y] of [['bottom',87],['fixed',1001],['top',2010]]) {
    const edge=mesh(board);
    for(const x of [-320,-192,-64,64,192,320]) {
      const ray=[0,0,1], distance=cast(edge,[x,y,-136],ray);
      assert.equal(cast(back,[x,y,-136],ray),undefined,'the sleeve passes through the full thickness of the back');
      assert.ok(Number.isFinite(cast(back,[x+6,y,-136],ray)),'surrounding fiberboard remains');
      assert.ok(distance > 24 && distance < 29,`blind rear-edge pilot at ${x}, ${y}`);
      assert.ok(Math.abs(cast(edge,[x+6,y,-136],ray)-14)<1e-5,'wood surrounds each edge pilot');
    }
  }
  const sleeve=mesh('151706-1',null), pin=mesh('151705-1',null);
  assert.equal(cast(sleeve,[0,10,0],[0,-1,0]),undefined,'locking pin fits through the sleeve center');
  assert.ok(Number.isFinite(cast(sleeve,[2.5,10,0],[0,-1,0])),'sleeve wall surrounds the opening');
  assert.ok(Number.isFinite(cast(pin,[0,10,0],[0,-1,0])),'matching pin has a head over the sleeve');
});

test('carcass cam mouths open on the indicated faces and meet the side-stud passages',t=>{
  const mesh=fixture(t);
  for(const [id,y,face] of [['bottom',87,-1],['fixed',1001,-1],['top',2010,1]]) {
    const board=mesh(id);
    for(const s of [-1,1]) for(const z of [-62,70]) {
      const faceIn=[0,-face,0];
      assert.ok(cast(board,[s*354,y+28*face,z],faceIn)>cast(board,[s*342,y+28*face,z],faceIn)+11,`${id} cam opening`);
      assert.ok(Math.abs(cast(board,[s*354,y-28*face,z],[0,face,0])-19)<1e-5,'the opposite face stays closed');
      assert.ok(cast(board,[s*412,y,z],[-s,0,0])>cast(board,[s*412,y,z+10],[-s,0,0])+20,'the bolt can enter through the end into the cam pocket');
    }
  }
});

test('bracket slots, washer holes and top pilots align at both external targets',t=>{
  const mesh=fixture(t), top=mesh('top');
  for(const [i,x] of [-238,238].entries()) {
    const n=i+1, angle=mesh(`106989-${n}`), washer=mesh(`100823-${n}`), bookWasher=mesh(`100823-${n+2}`);
    const back=[0,0,-1], down=[0,-1,0];
    for(const [part,point,axis] of [[angle,[x,2037,-122],back],[angle,[x,2034,-102.5],down],
      [washer,[x,2037,-122],back],[bookWasher,[x,2034,-102.5],down]]) {
      assert.equal(cast(part,point,axis),undefined,'clear path through slot or washer center');
      assert.ok(Number.isFinite(cast(part,[x+5,point[1],point[2]],axis)),'solid metal around path');
    }
    assert.ok(cast(top,[x,2030,-102.5],down)>cast(top,[x+7,2030,-102.5],down)+10,'bookcase screw has a blind top pilot');
  }
});

test('all sixteen shelf-shank bores and the four matching shelf undersides are present',t=>{
  const mesh=fixture(t), sides=[mesh('sideL'),mesh('sideR')];
  for(const [i,y] of [376,600,1400,1656].entries()) {
    const shelf=mesh(`shelf-${i+1}`);
    for(const [j,s] of [-1,1].entries()) for(const z of [-88,102]) {
      const side=sides[j], enter=[s,0,0], up=[0,1,0];
      const bore=cast(side,[s*360,y,z],enter), face=cast(side,[s*360,y+8,z],enter);
      assert.ok(Math.abs(bore-face-6)<1e-5,'side shank rests in a blind pilot');
      const seat=cast(shelf,[s*374,y-8,z],up), solid=cast(shelf,[s*364,y-8,z],up);
      assert.ok(Math.abs(seat-solid-7)<1e-5,'upward support peg registers into the right shelf underside');
    }
  }
});
