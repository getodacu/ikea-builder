import { BoxGeometry, CylinderGeometry, ExtrudeGeometry, Group, Mesh, MeshStandardMaterial, Path, Shape, TorusGeometry } from 'three';
import { shapes, stopOffset, tipAngle } from './kit.js';

const {PI}=Math;
const rect=(w,h)=>[[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]];
function trace(path,points) {
  path.moveTo(...points[0]);
  for(let i=1;i<points.length;i++) path.lineTo(...points[i]);
  path.closePath();
  return path;
}
function profile(outline,holes=[]) {
  const s=trace(new Shape(),outline);
  for(const hole of holes) {
    const p=new Path();
    if(Array.isArray(hole[0])) trace(p,hole);
    else p.absarc(...hole,0,2*PI,true);
    s.holes.push(p);
  }
  return s;
}
const vents=(columns,rows,xSpacing,ySpacing,r)=>Array.from({length:rows},(_,j)=>Array.from({length:columns},(_,i)=>
  [(i-(columns-1)/2)*xSpacing,(j-(rows-1)/2)*ySpacing,r])).flat();

export function createGeometry() {
  const wood=new MeshStandardMaterial({color:0xf3f0e8,roughness:.76});
  const edge=new MeshStandardMaterial({color:0xe0dbcf,roughness:.8});
  const metal=new MeshStandardMaterial({color:0x79878a,roughness:.44,metalness:.7});
  const plastic=new MeshStandardMaterial({color:0x64685e,roughness:.72});
  const dark=new MeshStandardMaterial({color:0x2d3735,roughness:.75});
  const oak=new MeshStandardMaterial({color:0xc6a072,roughness:.9});
  const marker=new MeshStandardMaterial({color:0x477b83,roughness:.8});
  const cache=new Map(), templates=new Map();
  function mesh(g,key,make,material,x=0,y=0,z=0) {
    if(!cache.has(key)) cache.set(key,make());
    const m=new Mesh(cache.get(key),material);
    m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true; g.add(m);
    return m;
  }
  const box=(g,w,h,d,x=0,y=0,z=0,m=wood)=>mesh(g,`box/${w}/${h}/${d}`,()=>new BoxGeometry(w,h,d),m,x,y,z);
  const cyl=(g,a,b,h,x=0,y=0,z=0,m=metal,sides=18)=>mesh(g,`cyl/${a}/${b}/${h}/${sides}`,
    ()=>new CylinderGeometry(a,b,h,sides),m,x,y,z);
  function extruded(g,key,s,depth,material,x=0,y=0,z=0) {
    return mesh(g,key,()=>new ExtrudeGeometry(s,{depth,bevelEnabled:false,curveSegments:8}).translate(0,0,-depth/2),material,x,y,z);
  }
  function cheek(g,sign) {
    const z0=-113, y0=191;
    const uv=([z,y])=>[z0-z,y-y0];
    const outline=[[12,-20],[12,406],[-24,405],[-66,380],[-117,342],[-166,293],[-207,237],[-238,162],[-239,92],[-224,-20]].map(uv);
    const [,dy,dz]=stopOffset, radius=Math.hypot(dy,dz), start=Math.atan2(-dz,dy)-.035, sweep=tipAngle+.073;
    const arc=(r,i)=>{const a=start+i*sweep/20;return uv([-r*Math.sin(a),r*Math.cos(a)]);};
    const slot=[...Array.from({length:21},(_,i)=>arc(radius+7,i)),...Array.from({length:21},(_,i)=>arc(radius-7,20-i))];
    extruded(g,'curved slotted cheek',profile(outline,[slot]),7,plastic).rotation.y=PI/2;
    // p. 18's pin is part of the cheek; the p. 21 rotation axis runs through both pins.
    cyl(g,5.2,5.2,16,sign*9,-y0,-z0,dark).rotation.z=PI/2;
    cyl(g,7.4,7.4,3,sign*15.5,-y0,-z0,plastic).rotation.z=PI/2;
    for(const y of [45,135,224]) for(const z of [-124,-104]) box(g,8,28,5,-sign*5,y-y0,z-z0,dark);
    for(const y of [42,148,229]) box(g,7,13,10,-sign*5,y-y0,-195-z0,plastic);
    box(g,14,12,20,0,383-y0,6-z0,plastic);
  }
  function liner(g) {
    const sockets=[-255,0,255].map(x=>rect(12,9).map(([u,v])=>[x+u,v-3]));
    const base=extruded(g,'liner base sockets',profile(rect(760,220),sockets),6,plastic,0,-143,0);
    base.rotation.x=PI/2;
    const back=extruded(g,'perforated liner back',profile(rect(754,297),vents(8,3,85,77,18)),7,plastic,0,0,-61);
    back.rotation.x=.316;
    for(const x of [-300,-100,100,300]) box(g,22,8,27,x,-137,111,plastic);
    box(g,760,13,14,0,-139,-109,dark);
  }
  function runner(g,id) {
    const sign=id.endsWith('L')?-1:1, cab=id.startsWith('case');
    const edgeX=sign*(cab?6:-6), wheelX=sign*(cab?-5:5), z=cab?105:-104;
    box(g,2.7,19,cab?245:240,edgeX,0,0,metal);
    box(g,15,2.7,cab?245:240,0,cab?-6:6,0,metal);
    box(g,10,2.4,223,wheelX,cab?7:-7,cab?-9:8,metal);
    cyl(g,10,10,5.5,wheelX,0,z,edge).rotation.z=PI/2;
    cyl(g,4.5,4.5,7,wheelX,0,z,metal).rotation.z=PI/2;
  }
  function head(g,r,lower,y,key) {
    cyl(g,r,lower,3.2,0,y,0);
    const straight=key==='nail';
    if(straight) return;
    box(g,r*1.13,.55,1.05,0,y+1.65,0,dark);
    if(key!=='topScrew'&&key!=='sideScrew') box(g,1.05,.55,r*1.13,0,y+1.65,0,dark);
  }
  function screw(g,shape,d) {
    const r=shape==='topScrew'?6.4:4.5;
    const stem=shape==='topScrew'?3.3:shape==='knobScrew'?2:2.6;
    const exposed=shape==='stud'?20:1.6;
    const length=d-3.5;
    cyl(g,stem,shape==='nail'?stem:stem*.82,length,0,exposed-1.5-length/2,0);
    if(shape==='stud') cyl(g,3.8,3.6,15,0,8.5,0,dark);
    head(g,r,shape==='mountScrew'?r*.64:r*.9,exposed,shape);
  }
  function make(g,{id,shape}) {
    const [w,h,d]=shapes[shape];
    switch(shape) {
      case 'frontStile':
        box(g,w,h,d); box(g,w-4,h-7,1,0,0,d/2,edge); break;
      case 'side': case 'trim': case 'rearStile': case 'frontCross': case 'top':
        box(g,w,h,d); break;
      case 'rearCross': {
        const holes=[[-374,20,6.8],[374,20,6.8]];
        if(id==='wallBrace') holes.push([-270,0,5.2],[270,0,5.2]);
        extruded(g,id,profile(rect(w,h),holes),d,wood); break;
      }
      case 'liner': liner(g); break;
      case 'cheek': cheek(g,id.endsWith('L')?-1:1); break;
      case 'partition':
        extruded(g,'divider vents',profile([[-380,-151],[380,-151],[380,125],[367,151],[-367,151],[-380,125]],
          vents(8,3,85,72,16)),7,plastic);
        for(const y of [-144,-49,25,99,146]) box(g,760,7,12,0,y,-3,dark);
        for(const x of [-255,0,255]) box(g,9,13,6,x,-154,0,plastic);
        break;
      case 'binFront':
        extruded(g,'bin front knob receivers',profile(rect(w,h),[[-206,151,2.8],[206,151,2.8]]),d,wood);
        break;
      case 'drawerFront':
        extruded(g,'drawer front knob receivers',profile(rect(w,h),[[-206,4,2.8],[206,4,2.8]]),d-4,wood,0,0,2);
        extruded(g,'drawer front groove lip',profile(rect(w,80.5),[[-206,-9.25,2.8],[206,-9.25,2.8]]),4,wood,0,13.25,-7.5);
        box(g,w,20.5,4,0,-43.25,-7.5);
        break;
      case 'drawerSide': {
        const sign=id.endsWith('L')?-1:1;
        box(g,w,73.5,d,0,5.25,0); box(g,w,5,d,0,-39.5,0);
        box(g,w-4,5.5,d,sign*2,-34.25,0,edge); break;
      }
      case 'drawerBase': box(g,w,h,d,0,0,0,edge); break;
      case 'drawerRear':
        box(g,w,h,10,0,0,-2); box(g,w,71.5,4,0,3.75,5); box(g,w,1.5,4,0,-38.75,5); break;
      case 'runner': runner(g,id); break;
      case 'pivot': {
        const outline=[[-25,-9],[-21,-12],[21,-12],[25,-9],[25,8],[22,12],[6.6,12],[6.6,0],[4.7,-4.7],
          [0,-6.7],[-4.7,-4.7],[-6.6,0],[-6.6,12],[-22,12],[-25,8]];
        extruded(g,'open pivot receiver and screw holes',profile(outline,[[-17,0,3.4],[17,0,3.4]]),12,plastic).rotation.x=PI/2;
        break;
      }
      case 'stop': {
        const wing=[[-7,-7],[7,-7],[7,13],[4,20],[-4,20],[-7,13]];
        extruded(g,'stop plate mounting hole',profile(wing,[[0,12,3.5]]),4,plastic,0,-2,0).rotation.x=PI/2;
        cyl(g,5,5,20,0,8,0,plastic);
        cyl(g,5.7,5.7,3,0,17.5,0,dark);
        cyl(g,4.8,4.8,9,0,-7.5,0,dark);
        break;
      }
      case 'largeCam': case 'smallCam':
        cyl(g,w/2,w/2,h,0,-h/2,0); head(g,w/2-.3,w/2-.3,-1.4,shape); break;
      case 'dowel':
        cyl(g,4,4,h,0,0,0,oak);
        for(let i=0;i<6;i++) {
          const a=i*PI/3;
          const rib=box(g,.65,h-4,.68,3.9*Math.cos(a),0,3.9*Math.sin(a),edge); rib.rotation.y=-a;
        }
        break;
      case 'glide':
        cyl(g,11,10,5,0,1,0,plastic); cyl(g,3.4,3.1,14,0,-7,0,dark); break;
      case 'knob':
        cyl(g,5.8,6.7,12,0,6,0,metal); cyl(g,13.2,9,5.5,0,14,0,dark);
        cyl(g,8.6,13.2,2.6,0,18,0,plastic); break;
      case 'smallKey': case 'largeKey':
        box(g,h,h,d-5,-w/2+h/2,0,0,metal);
        box(g,w,h,h,0,0,-d/2+h/2,metal); break;
      case 'wallSymbol': {
        const ring=mesh(g,'generic wall attachment point',()=>new TorusGeometry(6,1.55,10,32),marker,0,1,0);
        ring.rotation.x=PI/2;
        cyl(g,1.65,1.65,24,0,-11.5,0,marker);
        break;
      }
      default: screw(g,shape,h);
    }
  }
  return {
    instantiate(p) {
      const key=['runner','cheek','drawerSide','rearCross'].includes(p.shape)?p.id:p.shape;
      if(!templates.has(key)) {
        const g=new Group(); make(g,p); templates.set(key,g);
      }
      return templates.get(key).clone(true);
    },
    dispose() {
      for(const g of cache.values()) g.dispose();
      for(const m of [wood,edge,metal,plastic,dark,oak,marker]) m.dispose();
    }
  };
}
