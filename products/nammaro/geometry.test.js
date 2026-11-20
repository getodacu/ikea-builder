import assert from 'node:assert/strict';
import test from 'node:test';
import { Box3, Raycaster, Vector3 } from 'three';
import { sample } from '../../src/timeline.js';
import { createGeometry } from './geometry.js';
import product from './product.js';

const v=(x=0,y=0,z=0)=>new Vector3(x,y,z);
const ray=(node,from,dir,far)=>new Raycaster(from,dir,0,far).intersectObject(node,true)[0]?.distance;
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-4,`${a} vs ${b}`);
function mounted(g,id,frame) {
  const node=g.instantiate(product.parts.get(id)), p=frame.poses[id];
  node.position.fromArray(p); node.quaternion.fromArray(p,3);
  node.userData.setCaptive?.(frame.captive[id]??0);
  node.updateMatrixWorld(true);
  return node;
}

test('pp. 5–8: the two separate axle lines pass the handed rear leg openings and enter blind brace seats',()=>{
  const g=createGeometry(), t=product.compile(), finish=product.completeFrame(sample(t,13,1));
  try {
    const brace=mounted(g,'wheelBrace',finish);
    for(const [s,i,side] of [[1,1,'Near'],[-1,2,'Far']]) {
      const bore=v(-921,44,344*s), direction=v(0,0,-s), leg=mounted(g,`wheelLeg${side}`,finish);
      assert.equal(ray(leg,bore,direction,100),undefined);
      near(ray(leg,bore.clone().add(v(13)),direction,70),42);
      const bar=mounted(g,`10089529-${i}`,finish), barrel=mounted(g,`10089533-${i}`,finish);
      const axle=bar.localToWorld(v(0,1)).sub(bar.position).normalize();
      near(axle.z,s); near(bar.position.y,44); near(bar.position.x,-921);
      near(barrel.position.z,239*s); near(barrel.position.y,44);
      assert.equal(ray(barrel,bore,direction,120),undefined);
      const opening=v(-921,44,273*s);
      assert.equal(ray(brace,opening,direction,45),undefined);
      near(ray(brace,opening,direction,75),50.5);
      const wheel=mounted(g,`wheel-${i}`,finish), bounds=new Box3().setFromObject(wheel,true);
      assert.equal(ray(wheel,bore,direction,49),undefined);
      near(bounds.min.y,0);
      near(s>0?bounds.max.z:bounds.min.z,335*s);
    }
  } finally { g.dispose(); }
});

test('pp. 10–13: padded legs accept dowels only from the inboard face, and the bolts meet the smaller barrels',()=>{
  const g=createGeometry(), t=product.compile(), pose=product.completeFrame(sample(t,13,1));
  try {
    for(const [s,i,side] of [[1,1,'Near'],[-1,2,'Far']]) {
      const leg=mounted(g,`footLeg${side}`,pose), bolt=mounted(g,`113134-${i}`,pose), dowel=mounted(g,`128832-${i}`,pose);
      const barrel=mounted(g,`113153-${i}`,pose);
      near(new Box3().setFromObject(leg,true).min.y,0);
      const outward=v(0,0,s), inward=v(0,0,-s);
      assert.equal(ray(leg,v(943,53,s*250),outward,19),undefined);
      near(ray(leg,v(952,53,s*250),outward,24),8);
      near(ray(leg,v(943,53,s*344),inward,53),42);
      assert.equal(ray(leg,v(943,35,s*344),inward,100),undefined);
      assert.equal(ray(barrel,v(943,35,s*252),inward,25),undefined);
      near(bolt.position.y,35); near(bolt.position.z,266*s);
      near(dowel.position.y,53); near(dowel.position.z,258*s);
      near(barrel.position.y,35); near(barrel.position.z,239*s);
    }
  } finally { g.dispose(); }
});

test('p. 15: captive backrest keeps both pivots connected and seats the spanning bar in both open detents',()=>{
  const g=createGeometry(), t=product.useDemo.compile(), record=t.steps.get(15);
  try {
    const park=mounted(g,'deck',sample(t,15,0)), open=mounted(g,'deck',sample(t,15,1));
    const hinge='Backrest hinge', pivot='Support pivot pin', bar='Support seating bar';
    const locate=(deck,name)=>deck.getObjectByName(name).getWorldPosition(v());
    const remain=locate(park,hinge), rest=locate(park,bar), caught=locate(open,bar);
    near(rest.y,270); near(caught.y,250);
    assert.ok(locate(open,pivot).y>550);
    const mids=record.events.flatMap(event=>Array.from({length:8},(_,i)=>event.t0+(event.t1-event.t0)*i/8));
    for(const p of [...mids,1]) {
      const frame=mounted(g,'deck',sample(t,15,p)), pivotPoint=locate(frame,pivot), crossbar=locate(frame,bar);
      near(locate(frame,hinge).distanceTo(remain),0);
      near(pivotPoint.distanceTo(crossbar),350);
      for(const mount of frame.getObjectsByProperty('name','Support pivot mount')) {
        const center=mount.getWorldPosition(v());
        near(pivotPoint.distanceTo(v(center.x,center.y,0)),4);
        near(Math.abs(center.z),248);
      }
      if(p>=record.events[1].t0 && p<record.events[2].t0) assert.ok(crossbar.y-6>254);
      if(p>=record.events[2].t0) near(crossbar.x,caught.x);
    }
    for(const catchPlate of open.getObjectsByProperty('name','Backrest detent plate')) {
      const center=catchPlate.getWorldPosition(v());
      near(center.x,caught.x);
      near(ray(catchPlate,v(caught.x,260,center.z),v(0,-1),25),16);
      near(ray(catchPlate,v(caught.x+10,260,center.z),v(0,-1),25),6);
    }
    const bottom=new Box3().setFromObject(open.getObjectByName(bar),true).min.y;
    assert.ok(Math.abs(bottom-(caught.y-6))<.06);
    near(locate(park,bar).distanceTo(rest),0);
  } finally { g.dispose(); }
});
