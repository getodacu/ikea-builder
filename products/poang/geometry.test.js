import assert from 'node:assert/strict';
import test from 'node:test';
import { Box3, Raycaster, Vector3 } from 'three';
import { sample } from '../../src/timeline.js';
import { createGeometry } from './geometry.js';
import { compile } from './model.js';
import product from './product.js';

function put(kit,id,pose) {
  const node=kit.instantiate(product.parts.get(id));
  node.position.fromArray(pose);
  node.quaternion.fromArray(pose,3);
  node.updateMatrixWorld(true);
  return node;
}
const V=(...v)=>new Vector3(...v);
const cast=(node,from,axis)=>new Raycaster(from,V(...axis)).intersectObject(node)[0]?.distance;
const axisX=s=>[s,0,0];

test('the bowed slats seat in both keyed stiles with the cushion strip second from the top',t=>{
  const kit=createGeometry(), complete=product.completeFrame(sample(compile({}),11,1));
  t.after(()=>kit.dispose());
  const model=id=>put(kit,id,complete.poses[id]);
  const slat3=complete.poses.slat3;
  assert.equal(product.parts.get('slat3').family,'markedSlat');
  assert.ok(complete.poses.slat2[1]<slat3[1] && slat3[1]<complete.poses.slat4[1]);
  for(const [side,offset] of [['R',1],['L',5]]) {
    const stile=model(`stile${side}`);
    for(let n=1;n<=4;n++) {
      const screw=model(`119046-${offset+n-1}`), tab=model(`slat${n}`);
      const axis=V(0,-1,0).applyQuaternion(screw.quaternion);
      const entry=screw.position.clone().addScaledVector(axis,-5);
      assert.ok(axis.z<-.75,'slat screws approach from the front face');
      assert.ok(cast(stile,entry,axis.toArray())>15,'the screw reaches the back of the keyed pocket');
      assert.ok(cast(stile,entry.clone().add(V(5,0,0)),axis.toArray())<6,'there is wood beside the socket');
      assert.equal(cast(tab,entry,axis.toArray()),undefined,'the screw clears the aligned slat-end hole');
    }
  }
});

test('fig. 6 admits both leading tabs through real side openings, then accepts the screws from above',t=>{
  const kit=createGeometry(), route=compile({});
  t.after(()=>kit.dispose());
  const end=sample(route,6,1), seat=put(kit,'seat',end.poses.seat);
  for(const [id,y,z] of [['rearTie',34,-91],['frontTie',63,381]]) {
    const install=route.steps.get(6).events.find(e=>e.ids[0]===id);
    assert.equal(install.before.installed.length+(id==='rearTie'?2:1),end.installed.length);
    assert.ok(install.op.axes[0][0]>.999);
    const throughSlot=cast(seat,V(273,y,z),[1,0,0]);
    assert.ok(throughSlot>18 && throughSlot<20,`${id} has a blind right mortise at least as deep as the tab`);
    assert.ok(cast(seat,V(273,y+7,z+7),[1,0,0])<2,'the mortise has a solid crown');
    assert.ok(cast(seat,V(273,y,z+11),[1,0,0])<2,'the mortise has solid ends');
    assert.ok(cast(seat,V(-289,y-14,z),[0,1,0])>17,'the opposite tab can rise into its lower opening');
    for(const f of [0,.18,.33,.5,.75,.96]) {
      const progress=install.t0+install.hold+f*(install.t1-install.t0-install.hold);
      const pose=sample(route,6,progress).poses[id], node=put(kit,id,pose);
      for(const yy of [-2.8,2.8]) for(const zz of [-7.8,7.8]) {
        const tip=node.localToWorld(V(290.8,yy,zz));
        const free=cast(seat,tip,[1,0,0]);
        assert.ok(free>1.2,`${id} leading tab corner clears the host throughout entry`);
      }
    }
    const rail=put(kit,id,end.poses[id]);
    for(const x of [-284,284]) {
      assert.equal(cast(rail,V(x,y+16,z),[0,-1,0]),undefined,'the vertical screw axis clears the tab mesh');
      assert.ok(cast(rail,V(x,y+16,z+6),[0,-1,0])<16,'the tab has material around its screw hole');
    }
  }
  assert.equal(end.installed.filter(id=>id.startsWith('120925-')).length,2,'the tab screws wait for fig. 7');
  assert.equal(sample(route,7,1).installed.filter(id=>id.startsWith('120925-')).length,6);
});

test('both handed arm joints pass the short screw to the stile and both long screws to barrel nuts',t=>{
  const kit=createGeometry(), route=compile({});
  t.after(()=>kit.dispose());
  const completed=product.completeFrame(sample(route,11,1));
  const model=id=>put(kit,id,completed.poses[id]);
  const point=id=>V(...completed.poses[id].slice(0,3));
  for(const [s,side,n] of [[-1,'L',1],[1,'R',2]]) {
    const short=`146654-${n}`, arm=model(`arm${side}`), stile=model(`stile${side}`);
    const pairs=[[short,562,-205,`102319-${n}`],
      [`122606-${2*n-1}`,243,391,`100514-${2*n-1}`],[`122606-${2*n}`,16,-262,`100514-${2*n}`]];
    for(const [bolt,y,z,receiver] of pairs) {
      const screw=model(bolt), inward=V(0,-1,0).applyQuaternion(screw.quaternion), origin=point(bolt);
      assert.ok(inward.distanceTo(V(-s,0,0))<1e-6);
      assert.ok(Math.abs(origin.y-y)<1e-6 && Math.abs(origin.z-z)<1e-6 && Math.sign(origin.x)===s);
      const center=point(receiver), delta=center.clone().sub(origin);
      assert.ok(delta.dot(inward)>0 && delta.cross(inward).length()<1e-6);
      const start=origin.clone().addScaledVector(inward,-8);
      assert.equal(cast(arm,start,axisX(-s)),undefined,'the headed fastener clears the laminated arm bore');
      assert.ok(cast(arm,start.clone().add(V(0,7,0)),axisX(-s))<10,'nearby arm material is solid');
      if(bolt===short) {
        assert.equal(cast(stile,start,axisX(-s)),undefined,'the shorter fastener passes through the back stile receiver');
        assert.equal(cast(model(receiver),start,axisX(-s)),undefined,'the black spacer is a ring, not a plug');
        assert.ok(new Box3().setFromObject(screw).getSize(V()).x<68);
      } else {
        const brace=model(y===16?'lowBrace':'frontBrace');
        assert.ok(cast(brace,start,axisX(-s))>82,'the long screw clears the brace end and reaches its barrel pocket');
        assert.equal(cast(model(receiver),start,axisX(-s)),undefined,'the aligned barrel cross-bore clears the screw centerline');
        assert.ok(cast(model(receiver),start.clone().add(V(0,5.5,0)),axisX(-s))>65);
        assert.ok(new Box3().setFromObject(screw).getSize(V()).x>84);
      }
    }
  }
  const bounds=new Box3();
  for(const id of completed.installed) bounds.expandByObject(model(id),true);
  const {x,y,z}=bounds.getSize(V());
  assert.ok(x>=677 && x<687 && y>=937 && y<944 && z>=814 && z<824,
    `the completed frame uses the published chair envelope (measured ${x} × ${y} × ${z} mm)`);
  assert.ok(Math.abs(bounds.min.y)<1.2,'the protective contacts are at ground level');
});
