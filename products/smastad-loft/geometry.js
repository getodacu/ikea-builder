import { BoxGeometry, CylinderGeometry, ExtrudeGeometry, Group, Mesh, MeshStandardMaterial, Path, Shape } from 'three';
import { deck, endStuds, gripY, locator, rearStuds, rearStudX, rungY, shapes, spareBore } from './kit.js';

function rounded(path,w,h,r,cy=0) {
  const x=w/2, bottom=cy-h/2, top=cy+h/2;
  path.moveTo(-x+r,bottom); path.lineTo(x-r,bottom); path.quadraticCurveTo(x,bottom,x,bottom+r);
  path.lineTo(x,top-r); path.quadraticCurveTo(x,top,x-r,top);
  path.lineTo(-x+r,top); path.quadraticCurveTo(-x,top,-x,top-r);
  path.lineTo(-x,bottom+r); path.quadraticCurveTo(-x,bottom,-x+r,bottom); path.closePath();
  return path;
}
function hole(profile,x,y,r) {
  const p=new Path(); p.absarc(x,y,r,0,Math.PI*2,true); profile.holes.push(p);
}
function extrusion(profile,depth) {
  return new ExtrudeGeometry(profile,{depth,steps:1,bevelEnabled:false,curveSegments:10}).translate(0,0,-depth/2);
}
function rect(w,h,holes) {
  const s=rounded(new Shape(),w,h,0);
  for(const [x,y,r] of holes) hole(s,x,y,r);
  return s;
}
function horizontal(w,d,t,holes) {
  return extrusion(rect(w,d,holes.map(([x,z,r])=>[x,-z,r])),t).rotateX(-Math.PI/2);
}
function transverse(d,h,t,holes) {
  return extrusion(rect(d,h,holes.map(([z,y,r])=>[-z,y,r])),t).rotateY(Math.PI/2);
}

export function createGeometry() {
  const enamel=new MeshStandardMaterial({color:0xf2f0e9,roughness:.75});
  const edge=new MeshStandardMaterial({color:0xdad9d0,roughness:.83});
  const steel=new MeshStandardMaterial({color:0x9aa1a3,metalness:.7,roughness:.4});
  const nylon=new MeshStandardMaterial({color:0xdadcda,roughness:.71});
  const grip=new MeshStandardMaterial({color:0x555955,roughness:.87});
  const wood=new MeshStandardMaterial({color:0xc6a177,roughness:.85});
  const meshes=new Map(), templates=new Map();
  function mesh(g,key,make,m,x=0,y=0,z=0) {
    if(!meshes.has(key)) meshes.set(key,make());
    const n=new Mesh(meshes.get(key),m);
    n.position.set(x,y,z); n.castShadow=true; n.receiveShadow=true; g.add(n);
    return n;
  }
  const block=(g,w,h,d,x=0,y=0,z=0,m=enamel)=>mesh(g,`box/${w}/${h}/${d}`,()=>new BoxGeometry(w,h,d),m,x,y,z);
  const cylinder=(g,a,b,h,x=0,y=0,z=0,m=steel,sides=16)=>mesh(g,`cyl/${a}/${b}/${h}/${sides}`,
    ()=>new CylinderGeometry(a,b,h,sides),m,x,y,z);
  function ring(g,key,outer,inner,h,m,y=0,sides=24) {
    mesh(g,key,()=>{
      const profile=new Shape();
      for(let i=0;i<sides;i++) {
        const a=i*2*Math.PI/sides, x=Math.cos(a)*outer, z=Math.sin(a)*outer;
        if(i===0) profile.moveTo(x,z); else profile.lineTo(x,z);
      }
      profile.closePath(); hole(profile,0,0,inner);
      return extrusion(profile,h).rotateX(-Math.PI/2);
    },m,0,y);
  }
  function screw(g,id,w,h) {
    const r=w/2, head=Math.min(3.5,h*.2), shank=r*(id==='joinStud'?.51:.67);
    const pointed=id==='woodScrew'||id==='railScrew'||id==='crossBolt';
    cylinder(g,shank,pointed?shank*.29:shank,h-head,0,-head/2);
    cylinder(g,r,id==='railScrew'?r*.7:r,head,0,(h-head)/2);
    cylinder(g,r*.36,r*.36,.3,0,h/2+.1,0,grip,6);
    if(h>=20) for(let y=-h/2+4;y<h/2-head-4;y+=4) cylinder(g,shank*1.07,shank*1.28,1.2,0,y);
  }
  function stile(g,id,w,h,d) {
    mesh(g,id,()=>{
      const x=d/2, y=h/2;
      const s=new Shape();
      s.moveTo(-x,-y); s.lineTo(x,-y); s.lineTo(x,y); s.lineTo(-x+24,y);
      s.quadraticCurveTo(-x,y,-x,y-24); s.lineTo(-x,-y); s.closePath();
      s.holes.push(rounded(new Path(),24,151,12,gripY-912));
      rungY.forEach((r,i)=>{
        for(const z of i%2===0?[0]:[-19,19]) hole(s,-z,r-912,4.1);
      });
      if(id==='stileBored') for(const y of [1730,1774]) hole(s,25,y-912,4.8);
      return extrusion(s,w).rotateY(Math.PI/2);
    },enamel);
  }
  function build(g,id) {
    const [w,h,d]=shapes[id];
    if(id==='gableWide') {
      mesh(g,id,()=>transverse(d,h,w,[[-324,-482.5,28.8],[-324,317.5,28.8]]),enamel);
    } else if(id==='rearRail') {
      mesh(g,'rear-edge-pocket',()=>horizontal(w,d,8,rearStudX.map(x=>[x,0,5.5])),enamel,0,-h/2+4);
      mesh(g,'rear-web',()=>extrusion(rect(w,h-8,rearStudX.map(x=>[x,18-h/2,9])),d),enamel,0,4);
    } else if(id==='frontRail') {
      mesh(g,'front-edge-pocket',()=>horizontal(w,d,20,[[906,0,5]]),enamel,0,-h/2+10);
      block(g,w,h-20,d,0,10);
    } else if(id==='sideGuard') {
      mesh(g,'end-edge-pocket',()=>horizontal(w,d,8,[[0,-408,5.4],[0,457,5.4]]),enamel,0,-h/2+4);
      mesh(g,'end-web',()=>transverse(d,h-8,w,[[-408,18-h/2,12],[457,18-h/2,12]]),enamel,0,4);
    } else if(id==='frontGuard') {
      mesh(g,id,()=>extrusion(rect(w,h,[[686,110.5,12],[686,154.5,12]]),d),enamel);
    } else if(id==='brace') {
      mesh(g,id,()=>extrusion(rect(w,h,[[662,-37,9],[662,36,9]]),d),enamel);
    } else if(id==='angle') {
      mesh(g,'angle-flange',()=>extrusion(rect(w,h,[-869,-697,-465,-233,0,233,465,697,869].map(x=>[x,-1,4])),2),steel,0,0,-10);
      mesh(g,'angle-ledge',()=>horizontal(w,28,3,[-810,-540,-270,0,270,540,810].map(x=>[x,9,6])),steel,0,-9.5,2);
    } else if(id==='slat') {
      mesh(g,id,()=>horizontal(w,d,h,[[0,-487,6.4],[0,487,6.4]]),enamel);
    } else if(id.startsWith('stile')) {
      stile(g,id,w,h,d);
    } else if(id==='tread') {
      mesh(g,id,()=>extrusion(rounded(new Shape(),w,d,7),h).rotateX(-Math.PI/2),enamel);
      block(g,w-12,2,1,0,h/2-5,d/2-.4,edge);
    } else if(id==='strip') {
      mesh(g,id,()=>extrusion(rounded(new Shape(),w,d,23),h).rotateX(-Math.PI/2),grip);
    } else if(id.startsWith('grip')) {
      const trim=(outerW,outerH,innerW,innerH,depth)=>{
        const s=rounded(new Shape(),outerW,outerH,outerW/2);
        s.holes.push(rounded(new Path(),innerW,innerH,innerW/2));
        return extrusion(s,depth).rotateY(Math.PI/2);
      };
      mesh(g,`${id}/rim`,()=>trim(d,h,18,h-29,4),nylon,w/2-2);
      mesh(g,`${id}/insert`,()=>id==='gripDeep'?trim(22,146,18,139,w-4):trim(23.6,150,22.3,147,w-4),nylon,-2);
    } else if(id==='glide') {
      block(g,w,4,d,0,1,0,nylon);
      for(const z of [-10,10]) cylinder(g,3.1,2.8,5,0,-2.8,z,nylon);
    } else if(id==='camCap') {
      cylinder(g,w/2,w/2-1,h,0,0,0,enamel,32);
      cylinder(g,w/2-3,w/2-3,.7,0,h/2,0,nylon,32);
    } else if(id.toLowerCase().endsWith('cam')) {
      ring(g,id,w/2,w*.15,h,id==='largeCam'?nylon:steel);
      for(let a=0;a<4;a++) block(g,w*.29,.5,w*.05,0,h/2+.2,0,grip).rotation.y=a*Math.PI/4;
    } else if(['sleeve','carrier','nut'].includes(id)) {
      ring(g,id,w/2,w*.28,h,steel,0,id==='nut'?6:24);
      if(id==='sleeve') ring(g,'sleeve-flange',w*.58,w*.28,2,steel,h/2-1);
      if(id==='carrier') block(g,w*.46,.4,w*.09,0,h/2,0,grip);
    } else if(id==='dowel'||id==='longDowel') {
      cylinder(g,w*.46,w*.46,h,0,0,0,wood,12);
      for(let i=0;i<8;i++) {
        const a=i*Math.PI/4;
        cylinder(g,.38,.38,h-4,Math.cos(a)*w*.45,0,Math.sin(a)*w*.45,wood,5);
      }
    } else if(id==='spanner') {
      block(g,w-38,h,11,0,0,0,steel);
      const end=new Group(); end.position.x=-w/2+13; g.add(end);
      ring(end,'spanner-ring',12,7,h,steel);
      for(const z of [-9,9]) block(g,24,h,6,w/2-13,0,z,steel);
      block(g,7,h,21,w/2-25,0,0,steel);
    } else if(id.endsWith('Key')) {
      block(g,h,h,d-4,-w/2+h/2,0,0,steel);
      block(g,w,h,h,0,0,-d/2+h/2,steel);
      if(id==='offsetKey') block(g,w*.44,h,h,-w/2+w*.22,0,d/2-h/2,steel);
    } else if(h>w) {
      screw(g,id,w,h);
    } else {
      block(g,w,h,d);
    }
  }
  return {
    instantiate({shape}) {
      if(!templates.has(shape)) {
        const g=new Group(); build(g,shape); templates.set(shape,g);
      }
      return templates.get(shape).clone(true);
    },
    dispose() {
      for(const g of meshes.values()) g.dispose();
      for(const m of [enamel,edge,steel,nylon,grip,wood]) m.dispose();
    }
  };
}

export function createStorage(own,side) {
  const tower=new Group(); tower.name=side===1?'Right storage prerequisite':'Left storage prerequisite';
  const shell=own(new MeshStandardMaterial({color:0xe1e3df,roughness:.84}));
  const back=own(new MeshStandardMaterial({color:0xcdd1ce,roughness:.87}));
  const cx=707*side;
  function put(geom,x,y,z,material=shell) {
    const m=new Mesh(own(geom),material); m.position.set(x,y,z);
    m.castShadow=true; m.receiveShadow=true; tower.add(m); return m;
  }
  const box=(w,h,d,x,y,z,m)=>put(new BoxGeometry(w,h,d),x,y,z,m);
  const bores=[...endStuds(side),...rearStuds(side),locator(side),spareBore(side)].map(([x,,z],i)=>[x-cx,z+12,i<4?4.8:5]);
  put(horizontal(554,1072,26,bores),cx,deck-13,-12).name='Drilled storage top';
  box(554,22,1072,cx,16,-12);
  box(26,1369,1030,443*side,709,-12,back);
  for(const z of [-536,514]) box(554,1369,22,cx,709,z);
  box(536,1369,22,cx,709,167);
  for(const y of [329,644,959]) box(524,19,326,cx,y,341);
  box(524,22,680,cx,165,-185);
  const lower=box(18,1369,674,971*side,709,-185,back);
  lower.name='Closed wide bay face (lower drawing)';
  return {tower,lower};
}
