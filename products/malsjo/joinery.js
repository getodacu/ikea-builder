import { BufferGeometry, Float32BufferAttribute, Quaternion, ShapeUtils, Vector2, Vector3 } from 'three';
import { families, parts, shapes, steps, stepsForRoute } from './kit.js';

const round = {
  bolt:0.46, elbow:0.31, cam:0.53, crossCam:0.53, dowel:0.56, skinnyDowel:0.58,
  hexScrew:0.32, screw:0.32, shortScrew:0.32, longScrew:0.32, flatScrew:0.32, machineScrew:0.32,
  nail:0.22, pin:0.32, backSocket:0.53, cap:0.53
};
const pockets = new Set(['damper','roller','lock','pull']);
const connectors = new Set(['bolt','elbow','dowel','skinnyDowel']);
const timber = new Set([...parts.values()].filter(p=>!families[p.family].number).map(p=>p.id));
const mounts = new Set(['angle','damper','drawerCatchL','drawerCatchR','lock','roller','runnerL','runnerR','strike']);

export function receivingBores() {
  const bores = new Map();
  const inverse=new Quaternion(), fittingRotation=new Quaternion(), center=new Vector3(), inward=new Vector3(), basis=new Vector3();
  function mark(id, receiver, fitting, axis, shape, peg=0) {
    if(!timber.has(id) && !mounts.has(parts.get(id).shape)) return;
    const [w,h,d]=shapes[shape], rect=pockets.has(shape);
    inverse.fromArray(receiver,3).invert();
    inward.fromArray(axis).applyQuaternion(inverse);
    const direction=inward.toArray(), n=direction.findIndex(value=>Math.abs(value)>0.999);
    if(n<0) return;
    fittingRotation.fromArray(fitting,3);
    center.set(peg*w*0.24,peg?-h/4:0,0).applyQuaternion(fittingRotation);
    center.x+=fitting[0]-receiver[0]; center.y+=fitting[1]-receiver[1]; center.z+=fitting[2]-receiver[2];
    const point=center.applyQuaternion(inverse).toArray();
    const sign=Math.sign(direction[n]);
    let reach=peg?9:Math.max(9,h/2+5);
    let rx=peg?3.8:w*round[shape], ry=rx;
    if(rect) {
      reach=3;
      fittingRotation.premultiply(inverse);
      rx=ry=0;
      for(const [component,extent] of [w,h,d].entries()) {
        basis.set(0,0,0).setComponent(component,extent*0.47).applyQuaternion(fittingRotation);
        reach+=Math.abs(basis.getComponent(n));
        rx+=Math.abs(basis.getComponent((n+1)%3)); ry+=Math.abs(basis.getComponent((n+2)%3));
      }
    }
    const size=shapes[parts.get(id).shape];
    if(point.some((value,i)=>Math.abs(value)>size[i]/2+(i===n?reach:1))) return;
    let list=bores.get(id);
    if(!list) { list=[]; bores.set(id,list); }
    if(!list.some(b=>b.n===n && b.sign===sign && b.rx===rx && b.ry===ry && b.point.every((v,i)=>Math.abs(v-point[i])<0.01))) {
      list.push({n,sign,point,rx,ry,reach,rect});
    }
  }
  for(const route of [steps,stepsForRoute({skirting:true,doorStop:'left'})]) {
    const poses=new Map(), anchored=new Map();
    for(const {operations} of route) for(const op of operations) {
      const ends=op.poses.map(path=>path.at(-1));
      for(const [i,id] of op.ids.entries()) {
        const shape=parts.get(id).shape, end=ends[i], axis=op.axes[i];
        if(op.kind==='place' && (round[shape] || pockets.has(shape) || shape==='foot' || shape==='trayFoot')) {
          for(const receiver of op.prerequisites) {
            if(shape==='foot' || shape==='trayFoot') {
              for(const peg of [-1,1]) mark(receiver,poses.get(receiver),end,axis,shape,peg);
            } else mark(receiver,poses.get(receiver),end,axis,shape);
          }
          if(connectors.has(shape)) {
            inverse.fromArray(end,3).invert();
            anchored.set(id,{axis:new Vector3().fromArray(axis).applyQuaternion(inverse),receivers:op.prerequisites});
          }
        }
        if(!op.prerequisites.length || (op.kind!=='move' && op.kind!=='place')) continue;
        // A projecting connector needs a bore in the other piece as well as its original seat.
        const joint=anchored.get(id);
        if(op.kind==='move' && joint) {
          const axis=inward.copy(joint.axis).applyQuaternion(fittingRotation.fromArray(end,3)).negate().toArray();
          for(const receiver of op.prerequisites) if(timber.has(receiver)) mark(receiver,poses.get(receiver),end,axis,shape);
        }
        if(timber.has(id)) for(const [pin,joint] of anchored) {
          if(op.ids.includes(pin) || (!op.prerequisites.includes(pin) && !joint.receivers.some(r=>op.prerequisites.includes(r)))) continue;
          const fitting=poses.get(pin);
          const axis=inward.copy(joint.axis).applyQuaternion(fittingRotation.fromArray(fitting,3)).negate().toArray();
          mark(id,end,fitting,axis,parts.get(pin).shape);
        }
      }
      op.ids.forEach((id,i)=>{ if(op.kind==='remove') poses.delete(id); else poses.set(id,ends[i]); });
    }
  }
  return bores;
}

export function boreBox(mesh, bores) {
  if(mesh.geometry?.type!=='BoxGeometry' || mesh.material.transparent || mesh.rotation.x || mesh.rotation.y || mesh.rotation.z) return;
  const {width,height,depth}=mesh.geometry.parameters;
  const half=[width/2,height/2,depth/2], at=mesh.position.toArray();
  const faces=Array.from({length:6},()=>[]), cavities=[], mouths=[];
  const face=(n,sign)=>faces[n*2+Number(sign>0)];
  // shortcut: contours stay within each box face for triangulation; use solid subtraction for edge-spanning or intersecting bores.
  const overlaps=(holes,x,y,rx,ry,rect)=>holes.some(h=>{
    const dx=Math.abs(x-h.x)/(rx+h.rx), dy=Math.abs(y-h.y)/(ry+h.ry);
    return rect||h.rect ? dx<1 && dy<1 : dx*dx+dy*dy<1;
  });
  for(const {n,sign,point,rx,ry,reach,rect} of bores) {
    const u=(n+1)%3, v=(n+2)%3, side=-sign;
    const x=point[u]-at[u], y=point[v]-at[v], mouth=side*half[n];
    const inset=sign*(point[n]-at[n]-mouth);
    if(Math.abs(inset)>=reach-0.2) continue;
    const a=Math.min(rx,half[u]-Math.abs(x)-0.1), b=Math.min(ry,half[v]-Math.abs(y)-0.1);
    if(a<rx*0.5 || b<ry*0.5) continue;
    const entry=face(n,side), exit=face(n,-side), bite=Math.min(reach+inset,half[n]*2);
    const through=bite>=half[n]*2-0.2;
    if(overlaps(entry,x,y,a,b,rect) || (through && overlaps(exit,x,y,a,b,rect))) continue;
    const loop=rect ? [new Vector2(x-a,y-b),new Vector2(x+a,y-b),new Vector2(x+a,y+b),new Vector2(x-a,y+b)]
      : Array.from({length:16},(_,i)=>{const t=i*Math.PI/8; return new Vector2(x+a*Math.cos(t),y+b*Math.sin(t));});
    const hole={x,y,rx:a,ry:b,rect,loop};
    entry.push(hole);
    if(through) exit.push(hole);
    cavities.push({n,side,loop,bottom:through?-mouth:mouth+sign*bite,through});
    const opening=at.slice(), normal=[0,0,0];
    opening[n]+=mouth; opening[u]+=x; opening[v]+=y; normal[n]=side;
    mouths.push({point:opening,normal,radius:Math.max(a,b)});
  }
  if(!cavities.length) return;

  const vertices=[], indices=[];
  function vertex(n,height,{x,y}) {
    const i=vertices.length/3;
    vertices.length+=3;
    vertices[i*3+n]=height; vertices[i*3+(n+1)%3]=x; vertices[i*3+(n+2)%3]=y;
    return i;
  }
  function triangle(a,b,c,side) { if(side>0) indices.push(a,b,c); else indices.push(a,c,b); }
  for(let n=0;n<3;n++) for(const side of [-1,1]) {
    const w=half[(n+1)%3], h=half[(n+2)%3];
    const rim=[new Vector2(-w,-h),new Vector2(w,-h),new Vector2(w,h),new Vector2(-w,h)];
    const holes=face(n,side).map(h=>h.loop);
    const offset=vertices.length/3;
    for(const p of rim) vertex(n,side*half[n],p);
    for(const loop of holes) for(const p of loop) vertex(n,side*half[n],p);
    for(const [a,b,c] of ShapeUtils.triangulateShape(rim,holes)) triangle(offset+a,offset+b,offset+c,side);
  }
  const exterior=indices.length;
  for(const {n,side,loop,bottom,through} of cavities) {
    const mouth=side*half[n];
    for(const [i,p] of loop.entries()) {
      const q=loop[(i+1)%loop.length];
      const a=vertex(n,mouth,p), b=vertex(n,mouth,q), c=vertex(n,bottom,q), d=vertex(n,bottom,p);
      triangle(a,b,c,side); triangle(a,c,d,side);
    }
    if(!through) {
      const start=vertices.length/3;
      for(const p of loop) vertex(n,bottom,p);
      for(let i=1;i<loop.length-1;i++) triangle(start,start+i,start+i+1,side);
    }
  }
  const geometry=new BufferGeometry();
  geometry.setAttribute('position',new Float32BufferAttribute(vertices,3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.addGroup(0,exterior,0);
  geometry.addGroup(exterior,indices.length-exterior,1);
  geometry.userData.mouths=mouths;
  return geometry;
}
