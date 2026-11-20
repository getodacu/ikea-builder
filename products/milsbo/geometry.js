import { Box3, BoxGeometry, CylinderGeometry, ExtrudeGeometry, Group, Mesh, MeshStandardMaterial, Path, Shape } from 'three';
import { dimensions, shapes } from './kit.js';

export function createGeometry() {
  const metal=new MeshStandardMaterial({color:0x30343a,roughness:.68,metalness:.28});
  const edge=new MeshStandardMaterial({color:0x505861,roughness:.56,metalness:.36});
  const dark=new MeshStandardMaterial({color:0x1c2125,roughness:.78});
  const steel=new MeshStandardMaterial({color:0xa8b1b7,roughness:.36,metalness:.7});
  const glass=new MeshStandardMaterial({color:0xb6e0e1,roughness:.18,transparent:true,opacity:.23,depthWrite:false});
  const shelfGlass=new MeshStandardMaterial({color:0x9fcacc,roughness:.2,transparent:true,opacity:.37,depthWrite:false});
  const glassEdge=new MeshStandardMaterial({color:0x5e9297,roughness:.32,transparent:true,opacity:.54,depthWrite:false});
  const marker=new MeshStandardMaterial({color:0xcd9b48,roughness:.55});
  const cache=new Map(), templates=new Map();
  const {width,depth,postX,postZ,pivotZ,doorH,doorW,restY}=dimensions;
  const {PI}=Math;
  function mesh(g,key,make,m,x=0,y=0,z=0) {
    if(!cache.has(key)) cache.set(key,make());
    const node=new Mesh(cache.get(key),m);
    node.position.set(x,y,z); node.castShadow=!m.transparent; node.receiveShadow=!m.transparent;
    g.add(node);
    return node;
  }
  const box=(g,w,h,d,x=0,y=0,z=0,m=metal)=>mesh(g,`box/${w}/${h}/${d}`,()=>new BoxGeometry(w,h,d),m,x,y,z);
  const cylinder=(g,top,base,h,x=0,y=0,z=0,m=steel,n=20)=>mesh(g,`cyl/${top}/${base}/${h}/${n}`,()=>new CylinderGeometry(top,base,h,n),m,x,y,z);
  function contour(a,points) {
    a.moveTo(...points[0]);
    for(let i=1;i<points.length;i++) a.lineTo(...points[i]);
    a.closePath();
    return a;
  }
  function cut(a,holes) {
    for(const hole of holes) {
      const p=new Path();
      if(hole.length===3) p.absarc(...hole,0,2*PI,true);
      else contour(p,hole);
      a.holes.push(p);
    }
    return a;
  }
  const rectangle=(w,h)=>[[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]];
  const extrude=(s,d)=>new ExtrudeGeometry(s,{depth:d,bevelEnabled:false,curveSegments:12});
  function panel(g,key,w,h,t,holes,m=metal,x=0,y=0,z=0) {
    return mesh(g,`panel/${key}`,()=>extrude(cut(contour(new Shape(),rectangle(w,h)),holes),t),m,x,y,z);
  }
  function horizontal(g,key,w,d,t,y,holes,x=0,z=0,m=metal) {
    return mesh(g,`horizontal/${key}`,()=>{
      const profile=holes.map(h=>h.length===3?[h[0],-h[1],h[2]]:h.map(([a,b])=>[a,-b]));
      const geo=extrude(cut(contour(new Shape(),rectangle(w,d)),profile),t);
      geo.rotateX(-PI/2); geo.translate(x,y,z);
      geo.userData.mouths=holes.map(h=>h.length===3
        ?{point:[x+h[0],y+t,z+h[1]],normal:[0,1,0],radius:h[2]}
        :{point:[0,y+t,-postZ],normal:[0,1,0],radius:7});
      return geo;
    },m);
  }
  function ring(g,key,r,bore,t,x,y,z,m=steel) {
    return mesh(g,`ring/${key}`,()=>{
      const a=cut(new Shape(),[[0,0,bore]]); a.absarc(0,0,r,0,2*PI,false);
      const geo=extrude(a,t);
      geo.rotateX(-PI/2); geo.translate(x,y,z);
      geo.userData.mouths=[{point:[x,y+t,z],normal:[0,1,0],radius:bore}];
      return geo;
    },m);
  }
  function pane(g,w,h,d) {
    box(g,w,h,d,0,0,0,glass);
    for(const s of [-1,1]) {
      if(w<d) {
        box(g,w,h,1.5,0,0,s*(d-1.5)/2,glassEdge);
        box(g,w,1.5,d,0,s*(h-1.5)/2,0,glassEdge);
      } else {
        box(g,1.5,h,d,s*(w-1.5)/2,0,0,glassEdge);
        box(g,w,1.5,d,0,s*(h-1.5)/2,0,glassEdge);
      }
    }
  }
  function stops(g,y,m) {
    for(const s of [-1,1]) {
      for(const x of [82,255]) box(g,19,4,5,s*x,y,-184,m);
      for(const z of [-112,112]) box(g,5,4,19,s*336,y,z,m);
    }
  }
  function leg(g,id) {
    const s=id[3]==='L'?-1:1, d=id[4]==='F'?1:-1;
    const stem=cylinder(g,16,10,161,2*s,-4,2*d,metal,4); stem.rotation.y=PI/4; stem.rotation.z=-s*.045;
    box(g,32,15,33,0,80,0);
    box(g,36,13,13,-s*20,69,0,edge);
    box(g,13,13,36,0,69,-d*20,edge);
    cylinder(g,7,7,5,0,-86,0,dark);
  }
  function post(g,id) {
    const s=id[4]==='L'?-1:1, d=id[5]==='F'?1:-1;
    // Pierced inside flange, offset from the exterior return of the folded section.
    box(g,7,1528,26,s*9,0,0);
    box(g,22,1528,5,0,0,d*10,edge);
    const holes=restY.map(y=>[-s*d*6,y-9-953,3.5]);
    for(const y of [360,744,1128,1512]) holes.push([-s*d*6,y-9-953,2.4]);
    const flange=panel(g,id,23,1516,3,holes,metal,-s*10,0,-d*10);
    flange.rotation.y=-s*PI/2;
    ring(g,`${id}/base`,9,4.6,4,0,-775,0,metal);
    box(g,9,20,9,0,780,0,edge);
  }
  function door(g,s) {
    const free=-s, meet=doorW-28, far=doorW-15;
    const keyY=doorH*.52-56;
    const holes=[];
    for(const dy of [-22,22]) holes.push([0,doorH*.02+dy,3]);
    if(s===1) holes.push([0,keyY-doorH/2,4]);
    if(s===-1) for(const y of [35,doorH-35]) for(const dy of [-16,16]) holes.push([0,y+dy-doorH/2,2.8]);
    panel(g,`meeting/${s}`,25,doorH,16,holes,metal,free*meet,doorH/2,-8);
    box(g,18,doorH-24,16,0,doorH/2,0);
    for(const y of [5,doorH-3]) ring(g,`door/${y}`,10,4.8,5,0,y-3,0,edge);
    for(const y of [9,doorH-9]) box(g,far-15,18,16,free*(far+15)/2,y,0);
    const infill=new Group(); infill.position.set(free*164,doorH/2,0); g.add(infill);
    pane(infill,310,doorH-32,5);
    box(g,22,4,11,free*(meet-6),doorH-4,-9,edge);
    if(s===1) {
      const lock=ring(g,'lock',10,4,5,0,0,0,steel);
      lock.rotation.x=PI/2; lock.position.set(free*meet,keyY,13);
      box(g,8,17,6,free*(meet+7),keyY,-9,dark);
    } else box(g,6,18,7,free*(meet+11),keyY,-9,edge);
  }
  function make(g,{id,shape}) {
    const [w,h,d]=shapes[shape];
    switch(shape) {
      case 'leg': leg(g,id); return;
      case 'longRail': {
        box(g,w,h,11,0,0,2);
        panel(g,shape,w,h,3,[[-323,0,3.5],[323,0,3.5]],edge,0,0,-8); return;
      }
      case 'endRail': {
        box(g,11,h,d,2);
        const face=panel(g,shape,d,h,3,[[-170,0,3.5],[170,0,3.5]],edge,-8,0,0);
        face.rotation.y=PI/2; return;
      }
      case 'tray': {
        const holes=[];
        for(const s of [-1,1]) for(const d of [-1,1]) holes.push([s*postX,d*postZ,4.7]);
        for(const s of [-1,1]) holes.push([s*(postX-19),-postZ+12,4],[s*postX,-postZ+12,4],[s*(postX-12),postZ-15,4]);
        horizontal(g,shape,width,depth,4,1,holes);
        for(const s of [-1,1]) box(g,5,22,410,s*362,9,0);
        box(g,728,22,5,0,9,207);
        panel(g,'tray-rear',728,22,4,[[0,0,3.6]],metal,0,9,-210);
        return;
      }
      case 'floor': {
        const slot=[[-16,-197],[-9,-197],[-9,-200],[9,-200],[9,-197],[16,-197],[16,-191],[9,-191],[9,-189],[-9,-189],[-9,-191],[-16,-191]];
        horizontal(g,shape,708,406,4,-4,[slot]);
        stops(g,2,edge);
        for(const s of [-1,1]) ring(g,`lower/${s}`,10,4.7,3,s*postX,0,pivotZ,edge);
        return;
      }
      case 'post': post(g,id); return;
      case 'mullion':
        box(g,30,h-12,8,0,0,-7);
        for(const y of restY) {
          const boss=panel(g,'clip-boss',7,10,6,[[0,0,2.5]],edge,0,y-9-960,-5);
          boss.castShadow=false;
        }
        box(g,28,9,5,0,-770,0,edge);
        box(g,15,10,10,0,771,0,edge);
        return;
      case 'roof': {
        const holes=[];
        for(const s of [-1,1]) for(const d of [-1,1]) holes.push([s*postX,d*postZ,4.7]);
        for(const s of [-1,1]) holes.push([s*314,-176,3.7]);
        horizontal(g,shape,width,depth,4,6,holes);
        box(g,728,20,5,0,-4,207);
        panel(g,'roof-rear',728,20,5,[[[-3,-5],[3,-5],[3,6],[-3,6]]],metal,0,-4,-210);
        for(const s of [-1,1]) {
          box(g,5,20,408,s*362,-4,0);
          ring(g,`upper/${s}`,9,4.8,4,s*postX,0,pivotZ,edge);
        }
        stops(g,-12,edge);
        return;
      }
      case 'rearPane': case 'sidePane': pane(g,w,h,d); return;
      case 'door': door(g,id.endsWith('L')?-1:1); return;
      case 'shelf': {
        const x=w/2,z=d/2;
        const a=contour(new Shape(),[[-x+9,-z],[x-9,-z],[x,-z+9],[x,z-9],[x-9,z],[-x+9,z],[-x,z-9],[-x,-z+9]]);
        mesh(g,shape,()=>{
          const geo=extrude(a,h); geo.rotateX(-PI/2); geo.translate(0,-h/2,0); return geo;
        },shelfGlass);
        for(const s of [-1,1]) {
          box(g,w-18,h,2,0,0,s*(z-1),glassEdge);
          box(g,2,h,d-18,s*(x-1),0,0,glassEdge);
        }
        return;
      }
      case 'glide':
        cylinder(g,10,10,5,0,1,0,dark,24); cylinder(g,4,4,14,0,-7,0,steel); return;
      case 'shortHex': case 'longHex': case 'shortCross': case 'longCross': {
        const hex=shape.endsWith('Hex');
        cylinder(g,w*.48,w*.5,3,0,1,0,steel); cylinder(g,w*.23,w*.20,h-3,0,-(h-3)/2,0,steel);
        if(hex) cylinder(g,w*.20,w*.20,.2,0,2.6,0,dark,6);
        else { box(g,w*.65,.25,1.1,0,2.55,0,dark); box(g,1.1,.25,w*.65,0,2.55,0,dark); }
        return;
      }
      case 'clip': case 'rest': {
        box(g,w,3,d,0,7.5,shape==='rest'?d/2-2:6,dark);
        panel(g,`${shape}/face`,w-3,16,3,[[0,0,3.6]],edge,0,0,0);
        for(const s of [-1,1]) {
          const gusset=contour(new Shape(),[[0,-7],[0,7],[d-3,7]]);
          const joint=mesh(g,`${shape}/gusset`,()=>extrude(gusset,3),metal,s*(w/2-4),0,0);
          joint.rotation.y=-PI/2;
        }
        return;
      }
      case 'slideBolt':
        panel(g,'slide',14,52,7,[[0,-16,2.9],[0,16,2.9]],edge,0,0,-4);
        box(g,5,22,2,0,21,0,steel); box(g,5,15,2,0,-2,-4,dark);
        cylinder(g,4,4,7,0,-2,-6,steel).rotation.x=PI/2; return;
      case 'pivotStud':
        cylinder(g,4.4,4.4,h,0,-1,0); cylinder(g,7.5,7.5,2,0,1,0); return;
      case 'pivotPin':
        cylinder(g,4.25,4.25,h-3,0,-h/2,0); cylinder(g,5.3,5.3,2.5,0,1,0); return;
      case 'pull':
        box(g,w,h,3,0,0,5,edge);
        for(const s of [-1,1]) box(g,3,h,15,s*(w-3)/2,0,11,steel);
        for(const y of [-22,22]) cylinder(g,3.4,3.4,14,0,y,-6).rotation.x=PI/2;
        return;
      case 'key': {
        const a=cut(contour(new Shape(),[[-12,16],[0,24],[12,16],[9,3],[0,-2],[-9,3]]),[[[-4,7],[4,7],[6,13],[0,17],[-6,13]]]);
        mesh(g,shape,()=>{ const geo=extrude(a,2.5); geo.rotateX(PI/2); return geo; },steel);
        box(g,5,2.5,20,0,-1.25,-10,steel);
        box(g,2.7,2.5,4,3,-1.25,-17,steel); return;
      }
      case 'angle': {
        const slot=[[-4,18],[4,18],[4,42],[2,45],[-2,45],[-4,42]];
        horizontal(g,shape,26,80,3,0,[[[-4,-18],[-4,18],[4,18],[4,-18]]],0,0,steel);
        panel(g,'angle-upright',26,48,3,[slot.map(([x,y])=>[x,y-24])],steel,0,24,-40);
        return;
      }
      case 'wallPoint':
        cylinder(g,6.4,6.4,2,0,1,0,marker); cylinder(g,2.75,2.75,25,0,-12,0,marker); return;
      case 'hexKey':
        cylinder(g,2.5,2.5,100,-2,-8,0,steel,6).rotation.z=PI/2;
        cylinder(g,2.5,2.5,20,48,1,0,steel,6); return;
      default: throw new Error(`Unknown MILSBO shape ${shape}`);
    }
  }
  return {
    instantiate(p) {
      const key=['leg','post','door'].includes(p.shape)?p.id:p.shape;
      if(!templates.has(key)) {
        const g=new Group(); make(g,p); templates.set(key,{g,bounds:new Box3().setFromObject(g)});
      }
      const {g,bounds}=templates.get(key), node=g.clone(true);
      node.userData.adjustBounds=box=>box.copy(bounds);
      return node;
    },
    dispose() {
      for(const geometry of cache.values()) geometry.dispose();
      for(const material of [metal,edge,dark,steel,glass,shelfGlass,glassEdge,marker]) material.dispose();
    }
  };
}
