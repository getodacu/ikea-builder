import assert from 'node:assert/strict';
import test from 'node:test';
import { Box3, Raycaster, Vector3 } from 'three';
import { sample } from '../../src/timeline.js';
import { createGeometry } from './geometry.js';
import { parts } from './kit.js';
import { compile, compileUseDemo } from './model.js';

const v=(...p)=>new Vector3(...p), down=v(0,-1,0);
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-5,`${a} ≠ ${b}`);
const samePoint=(a,b)=>near(a.distanceTo(b),0);
function put(node,frame,id) {
  node.position.fromArray(frame.poses[id]);
  node.quaternion.fromArray(frame.poses[id],3);
  node.userData.setCaptive?.(frame.captive[id]??0);
  node.updateMatrixWorld(true);
  return node;
}
function mount(factory,frame,id) {return put(factory.instantiate(parts.get(id)),frame,id);}
function cut(node,mouth,axis) {
  return (new Raycaster(mouth.clone().addScaledVector(axis,-10),axis).intersectObject(node)[0]?.distance??Infinity)-10;
}

test('figs. 2–5 use distinct holes, both hinge seams and matching tabletop pilots',()=>{
  const t=compile({}), factory=createGeometry();
  try {
    const p2=sample(t,2,1), plate=mount(factory,p2,'120139-1');
    const z=-1361;
    for(const x of [-84,-48,0,48,84]) assert.equal(cut(plate,v(x,720,z),down),Infinity);
    near(cut(plate,v(-48,720,z+4),down),0);
    assert.equal(cut(plate,v(-43,720,z),down),Infinity,'slot extends along its plate');
    assert.equal(p2.poses['100372-5'],undefined);
    const p3=sample(t,3,1);
    for(const [i,hinge] of ['10005601-1','10005601-2','10005601-3','10005601-4'].entries()) {
      const side=i<2?-1:1, leafId=i<2?'leaf-left':'leaf-right';
      const h=mount(factory,p3,hinge), top=mount(factory,p3,'center'), leaf=mount(factory,p3,leafId);
      near(Math.abs(h.position.z),281);
      near(h.position.x,side*130);
      near(h.position.y,24);
      for(let j=0;j<8;j++) {
        const p=v().fromArray(p3.poses[`100372-${5+8*i+j}`]);
        assert.equal(cut(h,p,down),Infinity,'real opening in the hinge plate');
        const board=j<4?top:leaf;
        const mouth=p.clone(); mouth.y=20;
        near(cut(board,mouth,down),11);
        near(cut(board,mouth.clone().add(v(0,0,4)),down),0);
      }
    }
    const p4=sample(t,4,1), barrel=mount(factory,p4,'121121-1');
    const port=v().fromArray(p4.poses['121121-1']).add(v(-4.7,-21,0));
    assert.equal(cut(barrel,port,v(1,0,0)),Infinity);
    near(cut(barrel,port.clone().add(v(0,4,0)),v(1,0,0)),0);
    const p5=sample(t,5,1), top=mount(factory,p5,'center');
    for(const n of [37,38,39,40,41,42]) {
      const hole=v().fromArray(p5.poses[`100372-${n}`]); hole.y=20;
      near(cut(top,hole,down),11);
    }
  } finally {factory.dispose();}
});

test('p. 12 holds independent hinge axes and clears the receiver before seating each locating pin',()=>{
  const demo=compileUseDemo({}), use=demo.steps.get(17), factory=createGeometry();
  try {
    for(const [i,side] of ['left','right'].entries()) {
      const s=i===0?-1:1, leafId=`leaf-${side}`, frameId=`frame-${side}`, hingeIDs=[`10005601-${1+2*i}`,`10005601-${2+2*i}`];
      const hinges=hingeIDs.map(id=>mount(factory,use.start,id));
      const pins=hinges.map(h=>h.position.clone());
      const fixedFlanges=hinges.map(h=>h.getObjectByName('fixed flange'));
      const fixedPoints=fixedFlanges.map(h=>h.localToWorld(v(-18,3,5)));
      const leaf=mount(factory,use.start,leafId), base=mount(factory,use.start,frameId);
      const gate=base.getObjectByName('gate'), ladder=base.getObjectByName('fixed ladder');
      const fixedLadderPoint=ladder.localToWorld(v(335,85,-33));
      const e0=use.events[i*3], e1=use.events[i*3+1], e2=use.events[i*3+2];
      for(const e of [e0,e1,e2]) for(const fraction of [0,.12,.36,.64,.88,1]) {
        const frame=sample(demo,17,e.t0+(e.t1-e.t0)*fraction);
        put(leaf,frame,leafId); put(base,frame,frameId);
        for(const [j,id] of hingeIDs.entries()) {
          put(hinges[j],frame,id);
          samePoint(hinges[j].position,pins[j]);
          samePoint(fixedFlanges[j].localToWorld(v(-18,3,5)),fixedPoints[j]);
        }
        samePoint(ladder.localToWorld(v(335,85,-33)),fixedLadderPoint);
        const root=leaf.localToWorld(v(496,4,335)), tip=leaf.localToWorld(v(496,-8,335));
        const direction=tip.clone().sub(root).normalize();
        for(const [dx,dz] of [[0,0],[-4.1,0],[4.1,0],[0,-4.1],[0,4.1]]) {
          const point=leaf.localToWorld(v(496+dx,4,335+dz));
          const hits=new Raycaster(point,direction,0,12-1e-5).intersectObject(gate);
          assert.equal(hits.length,0,'the illustrated locating pin clears the gate until it seats');
        }
        if(e===e1) assert.ok(tip.y>731,'the tip stays above the free post while the gate swings');
      }
      const end=use.end; put(leaf,end,leafId); put(base,end,frameId);
      const mouth=leaf.localToWorld(v(496,4,335));
      samePoint(mouth,v(s*626,720,s*335));
      samePoint(gate.localToWorld(v(510,720,0)),mouth);
      samePoint(leaf.localToWorld(v(496,-8,335)),v(s*626,708,s*335));
      near(cut(gate,mouth,down),14);
      near(cut(gate,mouth.clone().add(v(0,0,8)),down),0);
      const peg=mount(factory,end,`156508-${i+1}`);
      near(new Box3().setFromObject(peg).min.y,0);
    }
  } finally {factory.dispose();}
});

test('actual drawer grooves are open and all six bodies clear their own rails',()=>{
  const t=compile({}), factory=createGeometry();
  try {
    for(const id of ['drawerL-1','drawerR-1']) {
      const panel=factory.instantiate(parts.get(id));
      panel.updateMatrixWorld(true);
      assert.equal(cut(panel,v(0,-78,-179),v(0,0,1)),Infinity);
      near(cut(panel,v(0,-69,-179),v(0,0,1)),0);
    }
    const step=t.steps.get(16), end=step.end;
    for(const [i,e] of step.events.entries()) {
      const z=i<3?285:-285, tier=i%3;
      const d=sample(t,16,e.t0+(e.t1-e.t0)*.85);
      const box=new Box3().setFromObject(mount(factory,d,`drawerFront-${i+1}`));
      near(box.min.x,-63); near(box.max.x,63);
      near(box.min.y,108+tier*198); near(box.max.y,296+tier*198);
      for(const [s,id] of [[-1,'frame-left'],[1,'frame-right']]) {
        const ladder=mount(factory,end,id).getObjectByName('fixed ladder');
        near(cut(ladder,v(s*61,box.min.y,z),down),0);
        const sideRay=new Raycaster(v(s*62,box.min.y+8,i<3?435:-435),v(0,0,i<3?-1:1),0,430);
        assert.equal(sideRay.intersectObject(ladder).length,0,'drawer wall clears the rail and stile');
      }
    }
  } finally {factory.dispose();}
});
