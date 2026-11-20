import { BoxGeometry, CylinderGeometry, ExtrudeGeometry, Group, Mesh, MeshStandardMaterial, Path, Shape } from 'three';
import { shapes } from './kit.js';

export function createGeometry() {
  const wood=new MeshStandardMaterial({color:0xf0efeb,roughness:0.8});
  const edge=new MeshStandardMaterial({color:0xdbd9d0,roughness:0.8});
  const metal=new MeshStandardMaterial({color:0x8d979d,roughness:0.42,metalness:0.62});
  const dark=new MeshStandardMaterial({color:0x41484a,roughness:0.58});
  const dowel=new MeshStandardMaterial({color:0xc3a17d,roughness:0.88});
  const cache=new Map(), templates=new Map();
  function mesh(g,key,make,material,x=0,y=0,z=0) {
    if(!cache.has(key)) cache.set(key,make());
    const m=new Mesh(cache.get(key),material);
    m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true; g.add(m);
    return m;
  }
  const box=(g,w,h,d,x=0,y=0,z=0,m=wood)=>mesh(g,`box/${w}/${h}/${d}`,()=>new BoxGeometry(w,h,d),m,x,y,z);
  const cylinder=(g,top,base,h,x=0,y=0,z=0,m=metal,sides=20)=>mesh(g,`cyl/${top}/${base}/${h}/${sides}`,
    ()=>new CylinderGeometry(top,base,h,sides),m,x,y,z);
  function profile(w,h,holes,clip=0) {
    const s=new Shape(), x=w/2, y=h/2;
    s.moveTo(-x+clip,-y); s.lineTo(x-clip,-y); s.lineTo(x,-y+clip); s.lineTo(x,y-clip);
    s.lineTo(x-clip,y); s.lineTo(-x+clip,y); s.lineTo(-x,y-clip); s.lineTo(-x,-y+clip); s.closePath();
    for(const [a,b,r] of holes) {
      const p=new Path(); p.absarc(a,b,r,0,2*Math.PI,true); s.holes.push(p);
    }
    return s;
  }
  function stockFace(g,id,w,d,y,depth,holes,m=wood,clip=0) {
    const node=mesh(g,`y/${id}`,()=>{
      const geo=new ExtrudeGeometry(profile(w,d,holes.map(([x,z,r])=>[x,-z,r]),clip),{depth,bevelEnabled:false,curveSegments:16});
      geo.rotateX(-Math.PI/2); geo.translate(0,y-depth,0);
      geo.userData.mouths=holes.map(([x,z,radius])=>({point:[x,y,z],normal:[0,1,0],radius}));
      return geo;
    },m);
    return node;
  }
  function frontFace(g,id,w,h,z,depth,holes,m) {
    mesh(g,`z/${id}`,()=>{
      const geo=new ExtrudeGeometry(profile(w,h,holes),{depth,bevelEnabled:false,curveSegments:16});
      geo.translate(0,0,z-depth);
      geo.userData.mouths=holes.map(([x,y,radius])=>({point:[x,y,z],normal:[0,0,1],radius}));
      return geo;
    },m);
  }
  const ring=(g,id,outer,inner,height,m=metal,sides=24)=>mesh(g,`ring/${id}`,()=>{
    const s=new Shape(), p=new Path();
    for(let i=0;i<sides;i++){
      const a=i*2*Math.PI/sides, x=outer*Math.cos(a), y=outer*Math.sin(a);
      if(i===0) s.moveTo(x,y); else s.lineTo(x,y);
    }
    s.closePath(); p.absarc(0,0,inner,0,2*Math.PI,true); s.holes.push(p);
    const geo=new ExtrudeGeometry(s,{depth:height,bevelEnabled:false,curveSegments:16});
    geo.rotateX(-Math.PI/2); geo.translate(0,-height/2,0); return geo;
  },m);
  function screw(g,w,h,shape) {
    const head=shape==='flushScrew'?3.5:2.5;
    cylinder(g,w*.27,w*.24,h-head,0,-head/2,0);
    cylinder(g,w/2,shape==='flushScrew'?w*.29:w*.44,head,0,(h-head)/2,0);
    box(g,w*.72,0.3,w*.13,0,h/2,0,dark);
    box(g,w*.13,0.3,w*.72,0,h/2,0,dark);
  }
  function make(g,{id,shape}) {
    const [w,h,d]=shapes[shape];
    switch(shape) {
      case 'top': case 'leaf': {
        const holes=shape==='top' ? [
          ...[-354,354].flatMap(z=>[-405,-135,135,405].map(x=>[x,z,3])),
          [-527,-15,2.6],[-527,15,2.6]
        ] : [[272,-335,2.7],[272,-315,2.7],[272,315,2.7],[272,335,2.7],[-272,-15,2.6],[-272,15,2.6]];
        box(g,w,h-9,d,0,-4.5,0,edge);
        stockFace(g,shape,w,d,11,9,holes);
        break;
      }
      case 'guide': {
        const sign=id==='guideRear'?1:-1;
        box(g,w,h,8,0,0,-8);
        box(g,w,7,17,0,23.5,2.5);
        box(g,w,5,17,0,-24.5,2.5);
        frontFace(g,id,w,31,12,7,[...[-405,-135,135,405].map(x=>[x,-9,7.7]),[526*sign,4,4.3]],edge);
        box(g,w,2,6,0,15,5,metal);
        break;
      }
      case 'slide':
        box(g,w,h,14,0,0,-5);
        box(g,w,3,20,0,-20.5,12,metal);
        for(const x of [-474,-413,-352]) box(g,26,5,1.4,x,10,21,dark);
        break;
      case 'leg':
        box(g,w,h-10,d,0,-5,0);
        stockFace(g,shape,w,d,361,10,[[0,0,4.7]]);
        box(g,1,72,d*.75,w/2,-311,0,edge);
        break;
      case 'locator':
        stockFace(g,shape,w,d,5,10,[[0,-10,3.8],[0,10,3.8]],dark,4);
        break;
      case 'keeper':
        stockFace(g,shape,w,d,-2,4,[[0,-15,2.8],[0,15,2.8]],dark,3);
        for(const z of [-15,15]) {
          const wing=ring(g,'keeper-wing',7.5,4.15,8,dark);
          wing.position.set(0,1,z);
          box(g,4,7,4,0,1,z-Math.sign(z)*6,dark);
        }
        break;
      case 'catch':
        box(g,w,3,d,0,-14,0,metal);
        box(g,5,28,22,3,0,0,metal);
        cylinder(g,9,9,5,1,1,0).rotation.z=Math.PI/2;
        box(g,23,4,9,-8,7,5,dark).rotation.z=-0.38;
        box(g,7,8,10,8,11,0,metal);
        break;
      case 'angle': {
        const makePlate=()=>new ExtrudeGeometry(profile(44,44,[[-12,-14,2.9],[-12,14,2.9],[10,-14,4.9],[10,14,4.9]],3),
          {depth:2,bevelEnabled:false,curveSegments:12});
        const plate=mesh(g,'corner-flange',makePlate,metal,0,0,24);
        plate.rotation.y=id.endsWith('-1')||id.endsWith('-4')?Math.PI:0;
        mesh(g,'corner-flange',makePlate,metal,24,0,0).rotation.y=Math.PI/2;
        box(g,32,3,3,6,0,24,metal);
        break;
      }
      case 'cam':
        cylinder(g,w/2,w/2,h,0,0,0,metal);
        box(g,10,0.4,1.2,0,h/2,0,dark);
        box(g,1.2,0.4,6,0,h/2,0,dark);
        break;
      case 'barrel': {
        cylinder(g,w/2,w/2,h,0,0,0);
        for(const y of [-10,10]) cylinder(g,2.7,2.7,1,w/2,y,0,dark).rotation.z=Math.PI/2;
        break;
      }
      case 'washer': ring(g,shape,w/2,4.2,h); break;
      case 'nut': ring(g,shape,w/2,3.8,h,metal,6); break;
      case 'glide':
        cylinder(g,4,4,8,0,-1.5,0,dark);
        cylinder(g,w/2,w/2,3,0,4,0,edge);
        break;
      case 'wrench':
        ring(g,shape,7.5,4.8,h,metal,12);
        cylinder(g,3,3,76).rotation.z=Math.PI/2;
        break;
      case 'dowel': case 'pin': case 'longRod': case 'shortRod':
        cylinder(g,w/2,w/2,h,0,0,0,shape==='dowel'?dowel:metal,shape==='dowel'?12:20);
        break;
      case 'longScrew': case 'camStud': case 'shortStud': case 'screw': case 'stop': case 'flushScrew': case 'catchScrew':
        screw(g,w,h,shape); break;
      default: box(g,w,h,d);
    }
  }
  return {
    instantiate(p) {
      const key=['guide','angle'].includes(p.shape)?p.id:p.shape;
      if(!templates.has(key)) {
        const g=new Group(); make(g,p); templates.set(key,g);
      }
      return templates.get(key).clone(true);
    },
    dispose() {
      for(const g of cache.values()) g.dispose();
      for(const m of [wood,edge,metal,dark,dowel]) m.dispose();
    }
  };
}
