import assert from 'node:assert/strict';
import test from 'node:test';
import { Box3, Quaternion, Raycaster, Vector3 } from 'three';
import { sample } from '../../src/timeline.js';
import { createGeometry } from './geometry.js';
import { parts } from './kit.js';
import { compile } from './model.js';

function mount(factory,id,p) {
  const node=factory.instantiate(parts.get(id));
  node.position.fromArray(p);
  node.quaternion.fromArray(p,3);
  node.updateMatrixWorld(true);
  return node;
}
function cut(node,p,axis) {
  return new Raycaster(new Vector3(...p),new Vector3(...axis)).intersectObject(node)[0]?.distance??Infinity;
}
const up=[0,1,0], down=[0,-1,0], near=(n,expected)=>assert.ok(Math.abs(n-expected)<1e-6,`${n} != ${expected}`);
function axis(p) { return new Vector3(0,-1,0).applyQuaternion(new Quaternion().fromArray(p,3)); }
function equalAxis(p,direction) { near(axis(p).distanceTo(new Vector3(...direction)),0); }

function geometry(name,verify) {
  test(name,()=>{
    const factory=createGeometry();
    try { verify(factory,compile({})); } finally { factory.dispose(); }
  });
}

geometry('pp. 23–24: vertical hutch screws and dowels use separate holes from horizontal base screws',(f,t)=>{
  const now=sample(t,35,1).poses, counter=mount(f,'counter',now.counter);
  for(const [i,[x,z]] of [[-331,-159],[-331,-67],[331,-159],[331,-67]].entries()) {
    const screw=now[`100295-${11+i}`];
    near(screw[0],x); near(screw[1],550); near(screw[2],z);
    equalAxis(screw,up);
    assert.equal(cut(counter,[x,545,z],up),Infinity);
    near(cut(counter,[x+10,545,z],up),5);
  }
  const divider=mount(f,'divider',now.divider);
  for(const z of [-119,0,117]) {
    near(cut(counter,[0,545,z],up),17);
    near(cut(counter,[9,545,z],up),5);
    near(cut(divider,[0,555,z],down),17);
    near(cut(divider,[6,555,z],down),5);
  }
  for(const [i,[s,z]] of [[-1,-169],[-1,169],[1,-169],[1,169]].entries()) {
    const screw=now[`100224-${7+i}`], outward=[-s,0,0];
    near(screw[0],s*353); near(screw[1],534); near(screw[2],z);
    equalAxis(screw,outward);
    const connectorId=`148819-${i+1}`;
    const connector=mount(f,connectorId,now[connectorId]);
    assert.equal(cut(connector,[s*360,534,z],outward),Infinity);
    near(cut(connector,[s*360,540,z],outward),9);
  }
});

geometry('the rod socket and vertical door pivot receivers are separate and handed',(f,t)=>{
  const end=sample(t,46,1).poses;
  const wing=mount(f,'upperR',end.upperR), cap=mount(f,'cap',end.cap), rail=mount(f,'rail',end.rail);
  assert.equal(cut(wing,[345,891,-53],[-1,0,0]),Infinity);
  near(cut(wing,[345,905,-53],[-1,0,0]),6);
  near(cut(cap,[-150,1068,-40],up),14);
  near(cut(cap,[-140,1068,-40],up),3);
  for(const s of [-1,1]) {
    const x=s*312;
    assert.equal(cut(rail,[x,498,158],up),Infinity);
    near(cut(rail,[x-10*s,498,158],up),6);
  }
  const right=sample(t,41,1).poses, left=sample(t,43,1).poses;
  near(right['118650-4'][0],312); near(left['118650-3'][0],-312);
  near(right['118650-6'][0],312); near(left['118650-5'][0],-312);
  assert.ok(right.cupboard[4]>0&&left.oven[4]<0,'The doors swing toward opposite sides about the two vertical axes');
  assert.deepEqual(left.cupboard,right.cupboard);
});

geometry('pp. 30 and 32: the right opening takes an open bowl and the left opening takes one housed cooktop',(f,t)=>{
  const end=sample(t,46,1).poses;
  const counter=mount(f,'counter',end.counter), sink=mount(f,'sink',end.sink), stove=mount(f,'150916-1',end['150916-1']);
  assert.deepEqual(end.sink.slice(0,3),[171,568,27]);
  assert.deepEqual(end['150916-1'].slice(0,3),[-170,568,22]);
  assert.equal(cut(counter,[171,610,27],down),Infinity);
  assert.equal(cut(counter,[-170,610,22],down),Infinity);
  near(cut(counter,[0,610,27],down),42);
  assert.ok(cut(sink,[171,610,27],down)>95,'Center ray enters the cavity before hitting the bowl floor');
  near(cut(sink,[295,610,27],down),38);
  near(cut(stove,[-170,610,22],down),37);
  assert.equal(cut(stove,[171,610,27],down),Infinity);
  const [e]=t.steps.get(46).events;
  const tilted=sample(t,46,e.t0+(e.t1-e.t0)*.62).poses['150916-1'];
  assert.ok(tilted[3]<-.08&&tilted[1]>568,'The initial edge is angled before the housing snaps down');
});

geometry('every staged stock shape has finite, nonempty bounds',(f,t)=>{
  const seen=new Set();
  for(const [id,{shape}] of parts) {
    if(seen.has(shape)) continue;
    seen.add(shape);
    const bounds=new Box3().setFromObject(mount(f,id,t.unbox.poses[id]));
    assert.ok(!bounds.isEmpty()&&[...bounds.min.toArray(),...bounds.max.toArray()].every(Number.isFinite),shape);
  }
});
