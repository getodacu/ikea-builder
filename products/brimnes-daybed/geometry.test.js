import assert from 'node:assert/strict';
import test from 'node:test';
import { Box3, Raycaster, Vector3 } from 'three';
import { sample } from '../../src/timeline.js';
import { createGeometry } from './geometry.js';
import { parts } from './kit.js';
import { compile } from './model.js';

const v=(x,y,z)=>new Vector3(x,y,z);
const X=v(1,0,0), Y=v(0,1,0), Z=v(0,0,1);
const opposite=axis=>axis.clone().negate();
const along=(p,axis,d)=>p.clone().addScaledVector(axis,d);
const bounds=node=>new Box3().setFromObject(node,true);
const cast=(node,from,dir,far=Infinity)=>new Raycaster(from,dir,0,far).intersectObject(node,true)[0];
// Mesh/contact tolerances in millimetres, not nominal joint dimensions.
const SURFACE=.15, CONTACT=.4;
const near=(a,b,tol=CONTACT,label='surfaces')=>assert.ok(Math.abs(a-b)<=tol,`${label}: ${a} vs ${b} (±${tol} mm)`);

function mounted(factory,snap,id) {
  const node=factory.instantiate(parts.get(id));
  node.position.fromArray(snap.poses[id]);
  node.quaternion.fromArray(snap.poses[id],3);
  node.userData.setCaptive?.(snap.captive[id]??0);
  node.updateMatrixWorld(true);
  return node;
}

function geometryTest(name,run) {
  test(name,()=>{
    const factory=createGeometry(), timeline=compile({});
    try {
      const read=(fig,p=1)=>{
        const snap=sample(timeline,fig,p);
        return id=>mounted(factory,snap,id);
      };
      const events=(fig,id,kind)=>timeline.steps.get(fig).events.filter(e=>e.kind===kind&&e.ids[0]===id);
      const during=(fig,e,u)=>read(fig,e.t0+e.hold+u*(e.t1-e.t0-e.hold));
      run({read,events,during,installed:fig=>sample(timeline,fig,1).installed});
    } finally {factory.dispose();}
  });
}

// Off-axis rays witness the material around each aperture, so a missing web
// cannot give the same result as a real hole. Depth is signed along insertion.
function witness(node,p,axis,offset=v()) {
  return cast(node,along(p.clone().add(offset),axis,-36),axis,72);
}
function depth(node,p,axis,offset,label) {
  const hit=witness(node,p,axis,offset);
  assert.ok(hit,`${label}: no surface on probe`);
  return hit.point.clone().sub(p).dot(axis);
}
function faces(node,p,axis,offset,label) {
  return [depth(node,p,axis,offset,label),-depth(node,p,opposite(axis),offset,label)];
}
function open(node,p,axis,label,r=1.6) {
  const tangent=Math.abs(axis.dot(Y))>.9?X:Y;
  for(const d of [-r,0,r]) {
    const offset=tangent.clone().multiplyScalar(d);
    assert.ok(!witness(node,p,axis,offset) && !witness(node,p,opposite(axis),offset),`${label}: obstructed axis`);
  }
}

geometryTest('figs. 8 and 10 seat long and short screws through real runner webs and bearer pilots',({read})=>{
  const rim=v(0,3.6,0);
  for(const [fig,rail,bearer,screwKey] of [[8,'CR-1','pull-bearer-center','102138'],[10,'CR-2','pull-bearer-right','100372']]) {
    const at=read(fig), track=at(rail), board=at(bearer);
    for(let i=1;i<=3;i++) {
      const screw=at(`${screwKey}-${i}`), p=screw.position, label=`fig. ${fig}, fixing ${i}`;
      const [webIn,webOut]=faces(track,p,X,rim,`${label} web`);
      assert.ok(webOut-webIn>1,`${label}: no web thickness`);
      open(track,p,X,`${label} track hole`);
      const face=depth(board,p,X,rim,`${label} bearer face`);
      const floor=depth(board,p,X,v(),`${label} pilot floor`);
      assert.ok(floor-face>4,`${label}: no recessed pilot`);
      if(fig===8) {
        const spacer=at(`110646-${i}`);
        const [a,b]=faces(spacer,p,X,rim,`${label} spacer shoulders`);
        open(spacer,p,X,`${label} spacer bore`);
        assert.ok(b-a>5,`${label}: no distinct spacer thickness`);
        near(a,webOut,CONTACT,`${label} rail to spacer`);
        near(b,face,CONTACT,`${label} spacer to bearer`);
      } else near(webOut,face,CONTACT,`${label} rail directly against bearer`);
      const screwBox=bounds(screw), tip=screwBox.max.x-p.x;
      const shoulder=-depth(screw,p,opposite(X),rim,`${label} screw-head shoulder`);
      assert.ok(screwBox.min.x-p.x<webIn && shoulder>=webIn-SURFACE && shoulder<webOut+SURFACE,
        `${label}: head does not bear in the track web`);
      assert.ok(tip>face+4 && tip<=floor+CONTACT,`${label}: tip misses or bottoms out in the pilot`);
    }
  }
});

geometryTest('figs. 32–33 separate upper clip pilots from opposite-entry lower sleeves on both ends',({read,events,during})=>{
  const at32=read(32), at33=read(33), rail=at32('112978-1'), rim=v(0,4.3,0);
  for(const [i,hand] of ['left','right'].entries()) {
    const out=v(i===0?-1:1,0,0), into=opposite(out), board=at32(`fixed-${hand}`);
    const clip=at32(`130485-${i+1}`), woodScrew=at32(`105307-${31+i}`);
    const sleeveId=`100602-${i+1}`, boltId=`105163-${i+1}`;
    const sleeve=at33(sleeveId), bolt=at33(boltId), high=woodScrew.position, low=bolt.position;
    assert.ok(high.y-low.y>15,`${hand}: lower bolt is not below the clip`);
    near(high.z,low.z,SURFACE,`${hand} tab alignment`);
    open(clip,high,out,`${hand} upper clip`);
    open(rail,high,out,`${hand} upper tab`);
    const [clipNear,clipFar]=faces(clip,high,out,rim,`${hand} clip shoulders`);
    const [tabNear,tabFar]=faces(rail,high,out,rim,`${hand} upper tab faces`);
    const upperFace=depth(board,high,out,rim,`${hand} upper panel face`);
    assert.ok(clipFar>clipNear+1 && tabFar>tabNear+1);
    near(clipFar,tabNear,CONTACT,`${hand} clip to upper tab`);
    near(tabFar,upperFace,CONTACT,`${hand} upper tab to panel`);
    assert.ok(depth(board,high,out,v(),`${hand} upper pilot`)-upperFace>3,`${hand}: upper pilot missing`);
    assert.ok(depth(board,high,into,v(),`${hand} exterior behind upper pilot`)<0,
      `${hand}: upper pilot must not open to the outside`);
    open(rail,low,out,`${hand} lower tab`);
    open(board,low,out,`${hand} lower panel through-bore`,4);
    assert.ok(depth(board,low,out,v(0,0,6),`${hand} lower aperture rim`)<0);

    const [insertSleeve]=events(33,sleeveId,'place'), [insertBolt]=events(33,boltId,'place');
    const startSleeve=during(33,insertSleeve,.2)(sleeveId).position;
    const startBolt=during(33,insertBolt,.2)(boltId).position;
    assert.ok(startSleeve.clone().sub(sleeve.position).dot(out)>15,`${hand}: sleeve did not enter from outside`);
    assert.ok(startBolt.clone().sub(low).dot(into)>15,`${hand}: screw did not enter from inside`);
    const mouth=depth(sleeve,low,out,v(0,0,3.6),`${hand} sleeve mouth`);
    const socket=depth(sleeve,low,out,v(),`${hand} sleeve socket`);
    const outside=-depth(sleeve,low,into,v(0,0,4.8),`${hand} exterior flange`);
    const outsidePanel=-depth(board,low,into,v(0,0,6),`${hand} exterior panel`);
    const tip=bounds(bolt)[i===0?'min':'max'].x*out.x-low.dot(out);
    near(outside,outsidePanel,CONTACT,`${hand} flange to outside face`);
    assert.ok(socket-mouth>6 && tip>mouth+4 && tip<socket+CONTACT,`${hand}: screw does not seat in the open sleeve`);
  }
});

geometryTest('figs. 34–35 keep both hooks handed, with outer fasteners and an unoccupied center aperture',({read})=>{
  const prep=read(34), final=read(39);
  const bent=final('112978-1');
  for(const [i,id] of ['fixed-slat-1','fixed-slat-13'].entries()) {
    const hookId=`123660-${i+1}`, slat=prep(id), hook=prep(hookId), into=v(i===0?1:-1,0,0);
    const p=hook.position;
    open(hook,p,into,`${id} open center hole`);
    const plainFace=depth(slat,p,into,v(),`${id} undrilled wood under center hole`);
    for(const j of [0,1]) {
      const screw=prep(`100372-${7+2*i+j}`), axis=screw.position;
      open(hook,axis,into,`${id} outer hole ${j+1}`);
      const rim=v(0,3.7,0);
      const [a,b]=faces(hook,axis,into,rim,`${id} plate around hole ${j+1}`);
      const wood=depth(slat,axis,into,rim,`${id} wood near hole ${j+1}`);
      near(b+axis.dot(into)-p.dot(into),plainFace,CONTACT,`${id} plate seats against slat`);
      near(b,wood,CONTACT,`${id} plate-to-wood shoulder`);
      assert.ok(b-a>1 && depth(slat,axis,into,v(),`${id} pilot ${j+1}`)-wood>5,`${id}: missing side pilot`);
    }
    const seated=final(hookId), plateBox=bounds(seated), woodBox=bounds(final(id));
    assert.ok(i===0?plateBox.max.x<=woodBox.min.x+CONTACT:plateBox.min.x>=woodBox.max.x-CONTACT,
      `${id}: hook faces into the moving deck`);
    assert.ok(plateBox.min.z>woodBox.getCenter(v()).z && plateBox.max.y>woodBox.max.y+1,
      `${id}: return is not at the front rail above the slat`);
    const catchPoint=v(plateBox.getCenter(v()).x,woodBox.max.y+1,bent.position.z);
    const gap=depth(seated,catchPoint,Z,v(),`${id} inside of hook return`) +
      depth(bent,catchPoint,opposite(Z),v(),`${id} face of rail at hook`);
    assert.ok(gap>SURFACE && gap<2,`${id}: hook return must clear the rail by a small gap`);
  }
});

geometryTest('figs. 44–45 admit each brace sideways under the same proud screw head',({read,events,during})=>{
  const started=read(44), hooked=read(45), into=opposite(Y), rim=v(3.5,0,0);
  for(let i=1;i<=2;i++) {
    const braceId=`118301-${i}`, screwId=`100359-${i}`;
    const screw=started(screwId), p=screw.position;
    const board=started(`drawer-${i}-front`), brace=hooked(braceId);
    const face=depth(board,p,into,rim,`drawer ${i} front face`);
    const shoulder=-depth(screw,p,Y,rim,`drawer ${i} underside of screw head`);
    const [exterior,interior]=faces(brace,p,into,rim,`drawer ${i} open tab prong`);
    assert.ok(exterior>shoulder+.25 && interior-exterior>1,`drawer ${i}: tab does not fit in the head gap`);
    near(interior,face,CONTACT,`drawer ${i} tab against front`);
    open(brace,p,into,`drawer ${i} opening across screw axis`);
    near(hooked(screwId).position.distanceTo(p),0,SURFACE,`drawer ${i} original screw stays put`);

    const [engage]=events(45,braceId,'place'), first=during(45,engage,.2)(braceId);
    const travel=brace.position.clone().sub(first.position);
    assert.ok(travel.length()>8 && Math.abs(travel.dot(into))<SURFACE,`drawer ${i}: not a sideways approach`);
    const entry=travel.normalize(), slot=along(p,into,(exterior+interior)/2);
    for(const dx of [-1.8,0,1.8]) {
      const shank=along(slot,X,dx);
      assert.ok(!cast(brace,along(shank,entry,10),opposite(entry),10),`drawer ${i}: closed edge blocks the shank`);
    }
    assert.ok(cast(brace,along(along(slot,X,3.5),entry,10),opposite(entry),10),`drawer ${i}: no fork beside the slot`);
  }
});

// Clip actual triangles to the frame's thickness, excluding the pitched part
// of the drawer that is still outside its opening.
function sectionBounds(nodes,key,lo,hi) {
  const box=new Box3(), points=[v(),v(),v()], edge=v();
  for(const node of nodes) node.traverse(mesh=>{
    if(!mesh.isMesh) return;
    const {attributes:{position},index}=mesh.geometry;
    for(let i=0;i<(index?.count??position.count);i+=3) {
      for(let j=0;j<3;j++) points[j].fromBufferAttribute(position,index?index.getX(i+j):i+j).applyMatrix4(mesh.matrixWorld);
      for(let j=0;j<3;j++) {
        const a=points[j], b=points[(j+1)%3];
        if(a[key]>=lo && a[key]<=hi) box.expandByPoint(a);
        for(const plane of [lo,hi]) if((a[key]<plane && plane<b[key]) || (b[key]<plane && plane<a[key]))
          box.expandByPoint(edge.lerpVectors(a,b,(plane-a[key])/(b[key]-a[key])));
      }
    }
  });
  return box;
}

geometryTest('fig. 39 lowers onto the pullout then slides with all 25 slats alternating without interference',({read,events,during})=>{
  const pull=Array.from({length:12},(_,i)=>`pull-slat-${i+1}`);
  const fixed=Array.from({length:13},(_,i)=>`fixed-slat-${i+1}`);
  const seat=events(39,'fixed-back','move').at(-1);
  const start=during(39,seat,0)('112978-1').position;
  const lowered=during(39,seat,.5)('112978-1').position;
  const compact=read(39), closed=compact('112978-1').position;
  assert.ok(start.y-lowered.y>100 && closed.z-lowered.z>500,'frame must lower first, then slide a substantial distance');
  near(start.z,lowered.z,SURFACE,'no longitudinal slip during lowering');
  near(lowered.y,closed.y,SURFACE,'no lift during sliding');

  const deck=[...fixed.map(id=>({base:'fixed',box:bounds(compact(id))})),
    ...pull.map(id=>({base:'pullout',box:bounds(compact(id))}))].sort((a,b)=>a.box.min.x-b.box.min.x);
  const x=slat=>slat.box.getCenter(v()).x;
  const pitch=(x(deck.at(-1))-x(deck[0]))/24;
  assert.ok(pitch>65 && pitch<85,'slats must span the bed at a consistent deck pitch');
  const span=base=>deck.filter(slat=>slat.base===base).map(({box})=>box.max.z-box.min.z);
  assert.ok(Math.min(...span('fixed'))-Math.max(...span('pullout'))>20,'short slats must go on the moving base');
  for(const [i,slat] of deck.entries()) {
    assert.equal(slat.base,i%2?'pullout':'fixed');
    near(x(slat),x(deck[0])+i*pitch,SURFACE,'slat station');
    near(slat.box.max.y,deck[0].box.max.y,SURFACE,'common deck plane');
    if(i) assert.ok(slat.box.min.x-deck[i-1].box.max.x>2,'adjacent slat edges do not clear');
  }

  for(let i=0;i<=16;i++) {
    const at=during(39,seat,i/16), rail=at('112978-1');
    const outer=fixed.map(id=>bounds(at(id)));
    for(const id of pull) {
      const slat=bounds(at(id));
      assert.ok(outer.every(other=>!other.intersectsBox(slat)),`slats intersect at frame nesting sample ${i}`);
      const band=sectionBounds([rail],'x',slat.min.x,slat.max.x);
      const lo=Math.max(band.min.z,slat.min.z), hi=Math.min(band.max.z,slat.max.z);
      assert.ok(hi-lo>3,`bent rail does not overhang pullout slat at sample ${i}`);
      assert.ok(band.min.y>=slat.max.y-SURFACE,`bent rail intrudes through the deck at sample ${i}`);
      const origin=v(slat.getCenter(v()).x,slat.min.y-60,(lo+hi)/2);
      const ledge=cast(rail,origin,Y,350);
      assert.ok(ledge,`missing rail underside above a short slat at sample ${i}`);
      if(i>=8) near(ledge.point.y,slat.max.y,SURFACE,`seated rail at nesting sample ${i}`);
    }
  }
});

function aperture(frame,x) {
  const box=bounds(frame), center=box.getCenter(v());
  center.x=x;
  const face=(axis,label)=>{
    const hit=cast(frame,center,axis);
    assert.ok(hit,`missing ${label} around drawer opening at x=${x}`);
    return hit.point;
  };
  const left=face(opposite(X),'left jamb').x, right=face(X,'right jamb').x;
  const bottom=face(opposite(Y),'sill').y, top=face(Y,'top rail').y;
  assert.ok(left<x && x<right && bottom<center.y && center.y<top);
  for(const wx of [.03,.25,.5,.75,.97]) for(const wy of [.03,.5,.97]) {
    const p=v(left+wx*(right-left),bottom+wy*(top-bottom),box.max.z+1);
    assert.ok(!cast(frame,p,opposite(Z),box.max.z-box.min.z+2),`front opening blocked at x=${p.x}, y=${p.y}`);
  }
  return {left,right,bottom,top,z0:box.min.z,z1:box.max.z};
}

function roller(node) {
  // The tread is broad and round in the plane of travel, narrow along its axle.
  let tread, diameter=0;
  node.traverse(mesh=>{
    if(!mesh.isMesh) return;
    const box=bounds(mesh), size=box.getSize(v());
    if(size.x<size.y/2 && Math.abs(size.y-size.z)<1 && size.y>diameter) {
      tread=box; diameter=size.y;
    }
  });
  assert.ok(diameter>12 && diameter<28,'runner has no rendered roller tread');
  return tread;
}

geometryTest('fig. 52 engages opposite runner hands and passes both complete drawers through real bays',({read,events,during})=>{
  const compact=read(52), frame=compact('pull-front');
  const bays=[1,2].map(i=>aperture(frame,bounds(compact(`drawer-${i}-front`)).getCenter(v()).x));
  assert.ok(bays[0].right+10<bays[1].left,'the two openings must have a divider');
  for(const [i,cabinetIds] of [['CL-2','CR-1'],['CL-1','CR-2']].entries()) {
    const id=`drawer-${i+1}-front`, bay=bays[i], drawerIds=[`DL-${i+1}`,`DR-${i+1}`];
    const cabinet=cabinetIds.map(compact), cabinetTreads=cabinet.map(roller);
    const [approach,engage,slide]=events(52,id,'move');
    const tilted=during(52,engage,0), level=during(52,slide,0);
    assert.ok(tilted(id).quaternion.x<-.02 && Math.abs(level(id).quaternion.x)<.001,`${id}: front must tip up, then level`);
    for(const [j,cabTread] of cabinetTreads.entries()) {
      const entry=roller(tilted(drawerIds[j])), seated=roller(level(drawerIds[j]));
      const cab=cabTread.getCenter(v());
      assert.ok(cab.z>bounds(cabinet[j]).getCenter(v()).z+150,`${id}: cabinet roller is not at the front`);
      assert.ok(seated.getCenter(v()).z<bounds(level(drawerIds[j])).getCenter(v()).z-150,`${id}: drawer roller is not at the back`);
      assert.ok(entry.min.z>cabTread.max.z && seated.max.z<cabTread.min.z,
        `${id}: drawer tread does not pass behind the cabinet roller while engaging`);
    }

    let crossings=0;
    for(const [stage,event] of [approach,engage,slide].entries()) for(let k=0;k<=12;k++) {
      const at=during(52,event,k/12), label=`${id}, travel stage ${stage+1}, sample ${k}`;
      const cut=sectionBounds(event.ids.map(at),'z',bay.z0,bay.z1);
      if(!cut.isEmpty()) {
        crossings++;
        assert.ok(cut.min.x>bay.left+SURFACE && cut.max.x<bay.right-SURFACE &&
          cut.min.y>bay.bottom+SURFACE && cut.max.y<bay.top-SURFACE,`${label}: drawer hits its opening`);
      }
      if(stage===0) continue;
      for(const [j,cabTread] of cabinetTreads.entries()) {
        const rail=at(drawerIds[j]), tread=roller(rail);
        assert.ok(j===0?tread.min.x>cabTread.max.x+SURFACE:tread.max.x<cabTread.min.x-SURFACE,
          `${label}: opposed rollers are not in separate passing lanes`);
        const p=tread.getCenter(v()), q=cabTread.getCenter(v());
        const shelf=cast(cabinet[j],p,opposite(Y),30), ledge=cast(rail,q,Y,30);
        if(stage===2) {
          assert.ok(shelf && ledge,`${label}: an opposed tread has no supporting shelf`);
          near(shelf.point.y,tread.min.y,CONTACT,`${label}: cabinet shelf under drawer roller`);
          near(ledge.point.y,cabTread.max.y,CONTACT,`${label}: drawer rail rides cabinet roller`);
        } else {
          assert.ok(!shelf || shelf.point.y<=tread.min.y+CONTACT,`${label}: cabinet shelf cuts into incoming tread`);
          assert.ok(!ledge || ledge.point.y>=cabTread.max.y-CONTACT,`${label}: angled drawer rail cuts into cabinet tread`);
        }
      }
    }
    assert.ok(crossings>=10,`${id}: motion never carries the box through the front frame`);
    near(bounds(compact(id)).max.z,bay.z1,SURFACE,`${id} closes flush`);
  }
});

geometryTest('the compact assembled mesh fits the published 76¾ × 41 × 22⅞ inch envelope',({read,installed})=>{
  const final=read(52), box=new Box3();
  for(const id of installed(52)) box.union(bounds(final(id)));
  const {x,y,z}=box.getSize(v());
  near(x,76.75*25.4,25,'compact length');
  near(z,41*25.4,25,'compact depth');
  near(y,22.875*25.4,25,'compact height');
});
