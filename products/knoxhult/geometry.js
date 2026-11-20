import { BoxGeometry, CylinderGeometry, ExtrudeGeometry, Group, Mesh, MeshStandardMaterial, Path, Shape } from 'three';
import { shapes } from './kit.js';

const half=Math.PI/2;
export function createGeometry() {
  const white=new MeshStandardMaterial({color:0xf5f3ed,roughness:.79});
  const fiber=new MeshStandardMaterial({color:0xd1cabe,roughness:.92});
  const oak=new MeshStandardMaterial({color:0xb28e5d,roughness:.75});
  const oakEdge=new MeshStandardMaterial({color:0x9a794e,roughness:.81});
  const metal=new MeshStandardMaterial({color:0xa1adb2,roughness:.43,metalness:.68});
  const dark=new MeshStandardMaterial({color:0x4b5459,roughness:.67});
  const plastic=new MeshStandardMaterial({color:0xc9c7be,roughness:.74});
  const dowel=new MeshStandardMaterial({color:0xc7a17b,roughness:.82});
  const wall=new MeshStandardMaterial({color:0x777a81,roughness:.65});
  const cache=new Map(), templates=new Map();
  function mesh(g,key,geometry,material,x=0,y=0,z=0) {
    if(!cache.has(key)) cache.set(key,geometry());
    const m=new Mesh(cache.get(key),material);
    m.position.set(x,y,z); m.castShadow=m.receiveShadow=true; g.add(m);
    return m;
  }
  const box=(g,w,h,d,x=0,y=0,z=0,m=white)=>mesh(g,`box/${w}/${h}/${d}`,()=>new BoxGeometry(w,h,d),m,x,y,z);
  const cyl=(g,rt,rb,h,x=0,y=0,z=0,m=metal,sides=20)=>mesh(g,`cyl/${rt}/${rb}/${h}/${sides}`,
    ()=>new CylinderGeometry(rt,rb,h,sides),m,x,y,z);
  function profile(w,h,holes=[],clip=0) {
    const s=new Shape(), x=w/2, y=h/2;
    s.moveTo(-x+clip,-y); s.lineTo(x-clip,-y); s.lineTo(x,-y+clip); s.lineTo(x,y-clip);
    s.lineTo(x-clip,y); s.lineTo(-x+clip,y); s.lineTo(-x,y-clip); s.lineTo(-x,-y+clip); s.closePath();
    for(const [a,b,r] of holes) {
      const p=new Path(); p.absarc(a,b,r,0,2*Math.PI,true); s.holes.push(p);
    }
    return s;
  }
  const xy=(g,id,s,depth,z,m)=>mesh(g,`xy/${id}`,()=>new ExtrudeGeometry(s,{depth,bevelEnabled:false,curveSegments:16}),m,0,0,z);
  const zy=(g,id,s,depth,x,m)=>mesh(g,`zy/${id}`,()=>{
    const geo=new ExtrudeGeometry(s,{depth,bevelEnabled:false,curveSegments:16});
    geo.rotateY(-half);
    return geo;
  },m,x);
  function end(g,id) {
    const s=id==='endL'?1:-1;
    const holes=[245,1,-244].map(z=>[z+5,808-445,2.8]);
    for(const z of [-246,246]) for(const y of [355,415,477,499,569,629]) holes.push([z,y-445,2.3]);
    for(const y of [163,694,825]) for(const dy of [-16,16]) holes.push([257,y+dy-445,2.6]);
    const bored=profile(590,876,holes);
    const panel=zy(g,id,bored,7,s===1?9:-2,white);
    panel.geometry.userData.mouths=holes.map(([z,y,radius])=>({point:[9*s,y,z],normal:[s,0,0],radius}));
    box(g,11,876,590,s===1?-3.5:3.5);
    box(g,17,874,4,0,0,-293,fiber);
  }
  function door(g,shape,w,h) {
    const bores=[];
    for(const y of [h/2-55,-h/2+55]) bores.push([276,y,17.5],[276,y+22,2.4],[276,y-22,2.4]);
    const skin=xy(g,shape,profile(w,h,bores),14,-9,white);
    skin.geometry.userData.mouths=bores.map(([x,y,radius])=>({point:[x,y,-9],normal:[0,0,-1],radius}));
    box(g,w,h,4,0,0,7);
  }
  function runner(g,shape) {
    const cabinet=shape.startsWith('case');
    const inner=(shape.endsWith('L')?1:-1)*(cabinet?1:-1);
    const wheel=cabinet?256:-256;
    const holes=[[245,-1,4.1],[1,-1,3.5],[-244,-1,4.1]];
    if(cabinet) holes.push([250,9,3.4]);
    const web=zy(g,shape,profile(531,28,holes,4),2.6,1.3,metal);
    web.geometry.userData.mouths=holes.map(([z,y,radius])=>({point:[1.3*inner,y,z],normal:[inner,0,0],radius}));
    box(g,9,2.4,500,inner*4.4,-12.5,-3,metal);
    box(g,2.2,6,500,inner*8,-9,-3,metal);
    cyl(g,10,10,7,inner*5,-9,wheel,plastic).rotation.z=half;
    cyl(g,3.6,3.6,1.4,inner*9,-9,wheel,metal).rotation.z=half;
  }
  function anchor(g) {
    xy(g,'anchor',profile(44,57,[[0,0,11]],3),2.6,-1.3,metal);
    const wing=zy(g,'anchor-wing',profile(24,57,[[0,-15,3.2],[0,15,3.2]],2),2.6,-18,metal);
    wing.position.z=12;
    for(const y of [-22,-19,19,22]) box(g,36,1,1.3,0,y,1.5,metal);
  }
  function keyhole(g) {
    const p=new Path();
    p.moveTo(-3.4,-5); p.lineTo(3.4,-5); p.lineTo(3.4,6.2); p.absarc(0,12,6.7,-1.04,4.18);
    p.lineTo(-3.4,-5); p.closePath();
    const s=profile(36,41,[],2.6); s.holes.push(p);
    xy(g,'keyhole',s,2.8,-1.4,metal);
    for(const x of [-13,13]) box(g,2.8,32,1.6,x,0,2,metal);
  }
  function drive(g,x,y,z) {
    const head=new Group();
    head.name='captive drive'; head.position.set(x,y,z); g.add(head);
    cyl(head,4.7,4.7,2,0,0,0,metal).rotation.z=half;
    box(head,.4,5,1.2,1.1,0,0,dark); box(head,.4,1.2,5,1.1,0,0,dark);
  }
  function hinge(g) {
    cyl(g,16.4,16.4,12,0,0,7,metal).rotation.x=half;
    const bores=[[-22,3.2],[22,3.2]];
    const flange=xy(g,'cup flange',profile(40,58,bores.map(([y,r])=>[0,y,r]),4),2.4,0,metal);
    flange.geometry.userData.mouths=bores.map(([y,radius])=>({point:[0,y,0],normal:[0,0,-1],radius}));
    box(g,37,21,10,15,0,-5,metal);
    box(g,11,19,21,34,0,6,metal);
    box(g,12,15,11,34,0,16,metal).name='hinge tongue';
    drive(g,34,0,16);
  }
  function mountingPlate(g) {
    zy(g,'hinge plate',profile(32,51,[],4),2.8,1.4,metal);
    box(g,9.5,15,41,4.5,0,-1,metal);
    for(const y of [-16,16]) drive(g,2,y,0);
  }
  function screw(g,w,h,kind) {
    const fastener=kind==='drivePin'||kind==='nail';
    const k=kind==='wallScrew'?wall:metal, wide=w/2, core=w*(fastener ? .20 : .28);
    cyl(g,core,core,h-5,0,-1,0,k,12);
    cyl(g,core,.25,3,0,-h/2+1.5,0,k,12);
    cyl(g,wide,wide*(fastener ? .65 : .80),2.5,0,h/2-1.25,0,k);
    if(fastener) return;
    const n=Math.min(7,Math.floor(h/4));
    for(let i=0;i<n;i++) cyl(g,core*1.38,core,.9,0,-h/2+4+i*(h-9)/n,0,k,12);
    box(g,w*.59,.3,w*.10,0,h/2,0,dark);
    if(kind!=='wallScrew') box(g,w*.10,.3,w*.59,0,h/2,0,dark);
  }
  function make(g,{id,shape}) {
    const [w,h,d]=shapes[shape];
    switch(shape) {
      case 'end': end(g,id); break;
      case 'counter':
        box(g,w,h-4,d,0,0,0,oakEdge); box(g,w,3,d,0,h/2-1.5,0,oak); box(g,w,2,d,0,-h/2+1,0,fiber); break;
      case 'back': box(g,w,h,d,0,0,0,fiber); break;
      case 'topRail': box(g,w,h,d); box(g,w,1,d-2,0,-h/2,0,fiber); break;
      case 'tallDoor': case 'shortDoor': door(g,shape,w,h); break;
      case 'drawerSide': {
        const s=id==='drawerL'?1:-1;
        box(g,w-5,h,d,-s*2.5);
        box(g,5,55,d,s*5,10.5);
        box(g,5,16,d,s*5,-30);
        break;
      }
      case 'drawerBottom': box(g,w,h,d,0,0,0,fiber); break;
      case 'caseRunnerL': case 'caseRunnerR': case 'drawerRunnerL': case 'drawerRunnerR': runner(g,shape); break;
      case 'anchor': anchor(g); break;
      case 'keyhole': keyhole(g); break;
      case 'angle':
        xy(g,'angle face',profile(w,h,[[0,0,3.3]],2),2.3,-1,metal);
        box(g,w,2.3,d,0,-h/2,8,metal); break;
      case 'hinge': hinge(g); break;
      case 'plate': mountingPlate(g); break;
      case 'brace':
        box(g,14,3,d-20,0,0,-2,metal); box(g,3,11,d-16,-6,5,-2,metal); box(g,3,11,d-16,6,5,-2,metal);
        for(const x of [-5,5]) box(g,4,2,13,x,0,d/2-6,metal);
        box(g,16,2,15,0,7,-d/2+7,metal); break;
      case 'socket': {
        const r=w/2;
        const ring=xy(g,'foot socket ring',profile(w,w,[[0,0,4.8]],4),3,0,dark);
        ring.rotation.x=-half;
        cyl(g,r-2,r-3,h-3,0,-5,0,plastic); break;
      }
      case 'foot': cyl(g,4,4,h-6,0,-3,0,metal); cyl(g,w/2,w/2,8,0,h/2-4,0,dark,24); break;
      case 'hexKey':
        box(g,5,84,5,0,0,0,metal); box(g,45,5,5,20,41,0,metal); box(g,20,5,5,-8,-41,0,metal); break;
      case 'cam': case 'drawerCam':
        cyl(g,w/2,w/2,h,0,0,0,metal); box(g,w*.66,.5,1.2,0,h/2,0,dark); break;
      case 'dowel': case 'fineDowel':
        cyl(g,w/2,w/2,h,0,0,0,dowel,12); break;
      case 'shelfPin':
        cyl(g,2.2,2.2,h,0,0,0,metal); cyl(g,3.5,3.5,4,0,1,0,metal); break;
      case 'bumper': cyl(g,w*.46,w/2,h,0,0,0,plastic); break;
      case 'frameScrew': case 'topScrew': case 'pilotScrew': case 'panScrew': case 'euroScrew': case 'railScrew':
      case 'camStud': case 'drivePin': case 'nail': case 'wallScrew': screw(g,w,h,shape); break;
      default: box(g,w,h,d);
    }
  }
  return {
    instantiate(p) {
      const key=['end','drawerSide'].includes(p.shape)?p.id:p.shape;
      if(!templates.has(key)) {
        const g=new Group(); make(g,p); templates.set(key,g);
      }
      const node=templates.get(key).clone(true);
      if(p.shape==='plate'||p.shape==='hinge') {
        const drives=node.getObjectsByProperty('name','captive drive');
        node.userData.setCaptive=t=>{ for(const head of drives) head.rotation.x=t*Math.PI*1.2; };
      }
      return node;
    },
    dispose() {
      for(const g of cache.values()) g.dispose();
      for(const m of [white,fiber,oak,oakEdge,metal,dark,plastic,dowel,wall]) m.dispose();
    }
  };
}
