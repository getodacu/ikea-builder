import assert from 'node:assert/strict';
import test from 'node:test';
import { Box3, Raycaster, Vector3 } from 'three';
import { sample } from '../../src/timeline.js';
import { createGeometry } from './geometry.js';
import { parts } from './kit.js';
import { compile, compileDemo } from './model.js';

const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-5,`${a} ≠ ${b}`);
const hit=(node,origin,axis)=>new Raycaster(new Vector3(...origin),new Vector3(...axis)).intersectObject(node,true)[0]?.distance;
function inspect(t) {
  const geometry=createGeometry();
  t.after(()=>geometry.dispose());
  return (id,frame)=>{
    const node=geometry.instantiate(parts.get(id));
    assert.ok(node.children.length,id);
    if(frame) {
      const p=frame.poses[id];
      node.position.fromArray(p); node.quaternion.fromArray(p,3);
      node.userData.setCaptive?.(frame.captive[id]??0);
    }
    node.updateMatrixWorld(true);
    return node;
  };
}

test('the wide top has four real cap holes and six blind mounting bores on the correct face', t=>{
  const node=inspect(t), compiled=compile({}), late=sample(compiled,17,1);
  const top=node('top',late);
  const dimensions=new Box3().setFromObject(top).getSize(new Vector3());
  near(dimensions.x,1172); near(dimensions.z,600); near(dimensions.y,19);
  for(const [i,x] of [-490,-163,163,490].entries()) {
    const origin=[x,670,-251], down=[0,-1,0];
    assert.equal(hit(top,origin,down),undefined,'clear through hole for an accessory or its cap');
    near(hit(top,[x+10,670,-251],down),19);
    const cap=node(`10096992-${i+1}`,late);
    assert.ok(hit(cap,origin,down)<19);
    near(cap.position.z,-251);
  }
  const origins=[[-523,-265],[-523,257],[523,-265],[523,257],[-26,-88],[70,-88]];
  for(const [i,[x,z]] of origins.entries()) {
    near(hit(top,[x,607,z],[0,1,0]),38,'the screw bore is blind and opens on the underside');
    near(hit(top,[x+9,607,z],[0,1,0]),25);
    near(hit(top,[x,670,z],[0,-1,0]),19);
    const screw=node(i<4?`107624-${i+1}`:`109067-${i-3}`,late);
    near(screw.position.x,x); near(screw.position.z,z);
    const direction=new Vector3(0,-1,0).applyQuaternion(screw.quaternion);
    near(direction.y,1);
    if(i<4) {
      const arm=node(i<2?'armL':'armR',late);
      assert.equal(hit(arm,[x,605,z],[0,1,0]),undefined,'clear through support plate');
      assert.ok(Number.isFinite(hit(arm,[x+10,605,z],[0,1,0])));
    }
  }
});

test('both crank routes use the same-offset input bore, and the opposite hook clears the existing screw heads', t=>{
  const node=inspect(t);
  for(const [crankSide,s] of [['left',-1],['right',1]]) {
    const end=sample(compile({crankSide}),17,1), side=s<0?'L':'R';
    const crank=node('crank',end), shaft=node('shaft',end);
    near(crank.position.y,609); near(crank.position.z,-119);
    near(shaft.position.y,crank.position.y); near(shaft.position.z,crank.position.z);
    const pin=new Vector3(-1,0,0).applyQuaternion(crank.quaternion);
    near(pin.x,-s); near(pin.y,0); near(pin.z,0);
    for(const id of [`arm${side}`,`column${side}`]) {
      const receiving=node(id,end);
      assert.equal(hit(receiving,[s*610,609,-119],[-s,0,0]),undefined,id);
      assert.ok(Number.isFinite(hit(receiving,[s*610,609,-129],[-s,0,0])),`${id} has metal bordering the input bore`);
    }
    const plate=crank.children[0];
    for(let i=1;i<=4;i++) {
      const screw=node(`101076-${i}`,end);
      assert.equal(hit(plate,[s*610,screw.position.y,screw.position.z],[-s,0,0]),undefined);
    }
    const hook=node('hook',end);
    const opposite=-s;
    for(const z of [-146,-92]) {
      assert.equal(hit(hook,[opposite*610,609,z],[s,0,0]),undefined,'hook clears shoulder screw at the previously installed position');
    }
  }
});

test('the drive extends into both receivers and the single cable holder seats over both lugs', t=>{
  const node=inspect(t), t0=compile({});
  const s9=t0.steps.get(9), lowered=sample(t0,9,s9.events.at(-1).t0), extended=sample(t0,9,1), seated=sample(t0,10,1);
  for(const [part,sign] of [['shaft left',-1],['shaft right',1]]) {
    const from=node('shaft',lowered).getObjectByName(part);
    const to=node('shaft',extended).getObjectByName(part);
    near(to.position.x-from.position.x,sign*41);
    const bounds=new Box3().setFromObject(to);
    near(sign<0?bounds.min.x:bounds.max.x,sign*518.5);
  }
  const c1=node('shaft',extended).getObjectByName('shaft collar');
  const c2=node('shaft',seated).getObjectByName('shaft collar');
  near(c2.position.x-c1.position.x,31);
  const stage=sample(t0,16,1), tray=node('tray',stage), beam=node('railWide',stage);
  const event=t0.steps.get(16).events[0];
  const sliding=node('tray',sample(t0,16,event.t0+(event.t1-event.t0)*.69));
  for(const x of [-119,29]) {
    assert.equal(hit(tray,[x,576.5,-110],[0,0,-1]),undefined,'the rear face has a real locating slot');
    assert.ok(Number.isFinite(hit(tray,[x+9,576.5,-110],[0,0,-1])),'there is sheet metal next to the slot');
    assert.ok(Number.isFinite(hit(tray,[x,585,-110],[0,0,-1])),'the slot top seats on the lug shoulder');
    for(const dx of [-4,4]) for(const y of [580,593]) {
      assert.equal(hit(sliding,[x+dx,y,-110],[0,0,-1]),undefined,'the raised slot clears the lug during engagement');
    }
    assert.ok(Number.isFinite(hit(beam,[x,582,-193],[0,0,1])),'the beam has a lug on this slot axis');
  }
  for(const i of [1,2]) {
    const id=`119500-${i}`, start=t0.steps.get(16).start;
    for(let axis=0;axis<3;axis++) near(stage.poses[id][axis]-stage.poses.tray[axis],start.poses[id][axis]-start.poses.tray[axis]);
  }
});

for(const crankSide of ['left','right']) test(`${crankSide} use: both jackets follow the table while the feet and lower profiles stay put`, t=>{
  const node=inspect(t), demo=compileDemo({crankSide}), [unlock,raise]=demo.steps.get(18).events;
  const start=sample(demo,18,0), open=sample(demo,18,unlock.t1), end=sample(demo,18,1);
  const parked=node('crank',start), unfolded=node('crank',open);
  near(parked.getObjectByName('folding grip').rotation.z,Math.PI/2);
  near(unfolded.getObjectByName('folding grip').rotation.z,0);
  near(unfolded.getObjectByName('crank rotor').position.x-parked.getObjectByName('crank rotor').position.x,12);
  for(const u of [0.2,0.5,0.8,1]) {
    const state=sample(demo,18,raise.t0+(raise.t1-raise.t0)*u);
    const h=state.poses.top[1]-start.poses.top[1];
    for(const side of ['L','R']) {
      const column=node(`column${side}`,state), rest=node(`column${side}`,start);
      near(column.position.y,rest.position.y);
      near(column.getObjectByName('upper carriage').getWorldPosition(new Vector3()).y-rest.position.y,h);
      near(node(`base${side}`,state).position.y,node(`base${side}`,start).position.y);
      near(new Box3().setFromObject(column.children[0]).min.y,new Box3().setFromObject(rest.children[0]).min.y);
    }
    const crank=node('crank',state), rotor=crank.getObjectByName('crank rotor'), drive=node('shaft',state).getObjectByName('rotating shaft');
    const localSign=crankSide==='left'?-1:1;
    near(rotor.rotation.x,localSign*2*Math.PI*h/180);
    near(localSign*rotor.rotation.x,drive.rotation.x);
  }
  near(end.poses.top[1]-start.poses.top[1],180);
  near(parked.getObjectByName('folding grip').rotation.z,Math.PI/2);
});
