import {
  BoxGeometry, BufferGeometry, CylinderGeometry, ExtrudeGeometry, Float32BufferAttribute, Group, LatheGeometry,
  LineBasicMaterial, LineSegments, Mesh, MeshStandardMaterial, Path, Shape, Vector2
} from 'three';
import { frame, shapes } from './kit.js';

const {PI}=Math, half=PI/2;
const {z,top,desk,bottom,camZ,shelfY,anchorY,spacerY}=frame;
function outline(path,points) {
  points.forEach(([x,y],i)=>i?path.lineTo(x,y):path.moveTo(x,y));
  path.closePath();
  return path;
}
const rect=(w,h,x=0,y=0)=>[[x-w/2,y-h/2],[x+w/2,y-h/2],[x+w/2,y+h/2],[x-w/2,y+h/2]];
const clipped=(w,d,c)=>[[-w/2+c,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2+c,d/2],[-w/2,d/2-c],[-w/2,-d/2+c]];

export function createGeometry() {
  const geos=new Map(), templates=new Map(), materials=[];
  const material=(color,roughness,metalness=0)=>{
    const mat=new MeshStandardMaterial({color,roughness,metalness}); materials.push(mat); return mat;
  };
  const steel=material(0xe0e1df,.53,.27), sheet=material(0xf0f1ed,.67,.18), felt=material(0x969c9b,.98);
  const melamine=material(0xf0f0eb,.75), edging=material(0xd3d6d1,.71), wireEdge=material(0xaeb6b4,.5,.33);
  const zinc=material(0x727e81,.37,.64), black=material(0x363c41,.84), yellow=material(0xe6b514,.77);
  const plastic=material(0x9ba3a1,.72), wood=material(0xba9a71,.87);
  const wire=new LineBasicMaterial({color:0x7e8a88}); materials.push(wire);
  function geometry(key,make) {
    if(!geos.has(key)) geos.set(key,make());
    return geos.get(key);
  }
  function mesh(g,key,make,mat,x=0,y=0,z=0) {
    const m=new Mesh(geometry(key,make),mat);
    m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true; g.add(m); return m;
  }
  const box=(g,w,h,d,x=0,y=0,z=0,m=steel)=>mesh(g,`b:${w}/${h}/${d}`,()=>new BoxGeometry(w,h,d),m,x,y,z);
  const cyl=(g,r,h,x=0,y=0,z=0,m=zinc,ends=20,r2=r)=>mesh(g,`c:${r}/${r2}/${h}/${ends}`,
    ()=>new CylinderGeometry(r,r2,h,ends),m,x,y,z);
  function plate(g,key,w,h,depth,holes,at,m=steel,turnX=0,turnY=0,boundary=rect(w,h)) {
    const node=mesh(g,`p:${key}`,()=>{
      const shape=outline(new Shape(),boundary);
      for(const [x,y,r,slot] of holes) {
        const path=new Path();
        if(slot) outline(path,rect(r,slot,x,y).reverse());
        else path.absarc(x,y,r,0,2*PI,true);
        shape.holes.push(path);
      }
      const geo=new ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:16});
      geo.translate(0,0,-depth/2); return geo;
    },m,...at);
    node.rotation.set(turnX,turnY,0);
    return node;
  }
  function ring(g,key,profile,m=zinc,x=0,y=0,z=0) {
    return mesh(g,`r:${key}`,()=>new LatheGeometry(profile.map(([a,b])=>new Vector2(a,b)),30),m,x,y,z);
  }
  const tube=(g,key,ro,ri,h,m=zinc,x=0,y=0,z=0)=>ring(g,key,
    [[ri,-h/2],[ro,-h/2],[ro,h/2],[ri,h/2],[ri,-h/2]],m,x,y,z);
  function crossHead(g,r,y,m=black) {
    box(g,r*1.25,.4,.8,0,y,0,m); box(g,.8,.4,r*1.25,0,y,0,m);
  }
  function screw(g,w,h,shape) {
    const flat=['longBolt','flatBolt','shortFlat','hexBolt','trayBolt','woodScrew','edgeScrew'].includes(shape);
    const hex=['hexBolt','longBolt'].includes(shape), headH=flat?2.6:3.7, headR=w/2;
    const tip=['woodScrew','edgeScrew','wallFixing'].includes(shape)?3:0;
    cyl(g,headR,headH,0,(h-headH)/2,0,zinc,20,flat?headR*.54:headR*.86);
    cyl(g,w*.23,h-headH-tip,0,-(headH-tip)/2,0,zinc,16);
    if(tip) cyl(g,w*.22,tip,0,(-h+tip)/2,0,zinc,12,.25);
    for(let yy=-h/2+tip+1;yy<h/2-headH-1;yy+=h>36?4.5:3) cyl(g,w*.29,1.05,0,yy,0,zinc,16,w*.24);
    if(hex) cyl(g,w*.17,.4,0,h/2+.1,0,black,6);
    else crossHead(g,headR,h/2+.1);
  }
  function tab(g,name,x,y,z,vertical=false) {
    const t=new Group(); t.name=name; t.position.set(x,y,z); g.add(t);
    if(vertical) box(t,13,27,2.4,-Math.sign(x)*6,0,0,wireEdge);
    else box(t,25,12,2.4,0,6,0,wireEdge);
  }
  function sideFrame(g) {
    const center=906, h=1764;
    const shelfSlots=shelfY.flatMap(y=>[2,-34].map(d=>[0,y+d-center,7,13]));
    for(const sign of [-1,1]) {
      const rear=sign===-1, zz=sign*z;
      for(const face of [-1,1]) {
        const zHoles=rear?[
          [0,anchorY-center,5.3],...shelfSlots,
          ...(face===-1?[-12,12].map(y=>[0,spacerY+y-center,3.9]):[])
        ]:face===1?[[0,102-center,13,6],[0,115-center,3.7]]:[];
        plate(g,`post/z/${sign}/${face}`,24,h,2,zHoles,[0,0,zz+face*11]);
        plate(g,`post/x/${sign}`,20,h,2,[[0,top-center,5.1]],[face*11,0,zz],steel,0,half);
      }
    }
    for(const [yy,holes] of [
      [bottom,camZ.map(zz=>[-zz,0,4.6])],
      [desk,[[302,0,14,14],[40,0,14,14]]],
      [top,[]],
      [990,[]]
    ]) {
      for(const face of [-1,1]) {
        plate(g,`side-channel/${yy}`,648,24,2,holes,[face*11,yy-center,0],steel,0,half);
        box(g,20,2,648,0,yy-center+face*11,0);
      }
    }
    box(g,4,763,624,0,1384-center,0,felt);
    for(const zz of [-309,309]) box(g,5,757,9,0,1384-center,zz,wireEdge);
  }
  function crossrail(g,k) {
    const body=944, halfBody=body/2;
    const mark=k==='notchRail', drill=k==='rearRail', low=k==='lowRail';
    const pilot=low?[-400,-204,204,400].map(x=>[x,0,4.8]):mark?[[-437,0,3.8],[437,0,3.8]]:[];
    const upper=drill?[-441,-285,0,285,441].map(x=>[x,-3,4.3]):mark?[[-437,1,3.5],[437,1,3.5]]:k==='plainRail'?
      [-367,367].map(x=>[x,0,4.5]):[];
    for(const sign of [-1,1]) {
      const cut=mark&&sign===1?[
        [-halfBody,-12],[halfBody,-12],[halfBody,12],[174,12],[174,8],[144,8],[144,12],
        [-144,12],[-144,8],[-174,8],[-174,12],[-halfBody,12]
      ]:undefined;
      plate(g,`${k}/z/${sign}`,body,24,2,pilot,[0,0,sign*11],steel,0,0,cut);
      plate(g,`${k}/y`,body,20,2,upper,[0,sign*11,0],steel,-half);
      const tongue=plate(g,'squareKey',13.6,13.6,13,[[0,0,4.4]],[sign*477,0,0],zinc,0,half);
      tongue.name='square rail tongue';
    }
    if(k==='hingedRail') for(const sign of [-1,1]) {
      plate(g,'upper-door-tab',29,33,3,[[0,0,4.7]],[sign*484,3,14],steel,-half,0,clipped(29,33,4));
      box(g,16,7,11,sign*473,-2,8);
    }
  }
  function backMesh(g,k,w,h) {
    const hw=w/2-16, hh=h/2-13;
    const geo=geometry(`lattice:${k}`,()=>{
      const vertices=[], span=hh*1.54;
      for(const sign of [-1,1]) for(let a=-hw-span+8;a<hw+span;a+=22) {
        const lo=Math.max(-hw,a-span), hi=Math.min(hw,a+span);
        if(lo>=hi) continue;
        vertices.push(lo,sign*(lo-a)/1.54,0,hi,sign*(hi-a)/1.54,0);
      }
      return new BufferGeometry().setAttribute('position',new Float32BufferAttribute(vertices,3));
    });
    g.add(new LineSegments(geo,wire));
    const upper=k==='meshUpper';
    for(const sign of [-1,1]) {
      const holds=upper?[-233,247].map(p=>[0,p,3.8]):[-232,227].map(p=>[0,p,3.8]);
      plate(g,`${k}/side`,19,h,3,holds,[sign*(w/2-10),0,0],wireEdge);
      box(g,w-38,10,8,0,sign*(h/2-5),0,wireEdge);
      for(const yy of [-154,142]) tab(g,'mesh-side',sign*(w/2-11),yy,1.5,true);
    }
    if(!upper) for(const xx of [-302,-12,273]) tab(g,'mesh-seam',xx,h/2-7,1.5);
  }
  function lowerFelt(g,hand) {
    const b=[[-325,-450],[325,-450],[325,450],[-325,450],[-325,222],[-301,222],[-301,174],[-325,174]];
    plate(g,'felt-notch',650,900,4,[],[0,0,0],felt,0,-half,b);
    for(const zz of [-311,311]) box(g,4,884,7,0,0,zz,wireEdge);
    for(const yy of [-447,447]) box(g,4,7,624,0,yy,0,wireEdge);
    for(const zz of [-207,8,209]) for(const yy of [-443,443]) {
      const t=new Group(); t.name=hand<0?'felt-left':'felt-right'; t.position.set(0,yy,zz); g.add(t);
      box(t,2,13,59,0,Math.sign(yy)*6,0,felt);
    }
  }
  function door(g,hand) {
    const end=-hand*472, mid=end/2;
    for(const yy of [-790,0,858]) box(g,446,19,20,mid-hand*13,yy,0);
    box(g,20,1631,22,0,32.5,0);
    box(g,21,1770,22,end,-20,0);
    box(g,451,780,4,mid,-396,1,felt); box(g,451,836,4,mid,430,1,felt);
    tube(g,'door-lower-mouth',8,5.1,13,steel,0,-797,0);
    tube(g,'door-upper-mouth',8,4.4,13,steel,0,857,0);
    cyl(g,11,10,end,-892,0,black,24).rotation.z=half;
    cyl(g,5,12,end,-892,0,zinc).rotation.z=half;
  }
  function make(g,{id,shape:k}) {
    const [w,h,d]=shapes[k], hand=id.endsWith('L')?-1:1;
    switch(k) {
      case 'side': sideFrame(g); break;
      case 'notchRail': case 'plainRail': case 'rearRail': case 'hingedRail': case 'lowRail': crossrail(g,k); break;
      case 'roof': {
        const bolts=[-1,1].flatMap(s=>[-1,1].flatMap(t=>[s*455,s*477].map(x=>[x,-t*321,3.5])));
        plate(g,k,w,d,3,bolts,[0,4,0],sheet,-half);
        for(const sign of [-1,1]) {
          box(g,3,10,d,sign*(w/2-1.5),-1,0);
          box(g,w-6,10,3,0,-1,sign*(d/2-1.5));
        }
        break;
      }
      case 'footShelf': {
        const b=clipped(w,d,30);
        plate(g,'foot/shell',w,d,11,[],[0,3.5,0],melamine,-half,0,b);
        plate(g,'foot/sockets',w,d,7,camZ.map(zz=>[160,-zz,9]),[0,-5.5,0],edging,-half,0,b);
        break;
      }
      case 'smallAngle': case 'largeAngle': {
        const large=k==='largeAngle', s=large?3:2.4;
        const holes=large?[[-18,0,4.4],[0,0,4.4],[18,0,4.4]]:[[0,0,4.4]];
        plate(g,`${k}/foot`,w,d,s,holes,[0,-h/2,4],steel,-half);
        plate(g,`${k}/web`,w,h,s,[[3,-4,large?5:3.4]],[0,0,-d/2],sheet,0,0,
          [[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[w/2-7,h/2]]);
        plate(g,`${k}/leg`,d,h,s,holes,[w/2,0,0],steel,0,half);
        break;
      }
      case 'meshUpper': case 'meshLower': backMesh(g,k,w,h); break;
      case 'trough':
        plate(g,'trough/floor',w,d,2.6,[[-150,23,3.5],[150,23,3.5]],[0,-h/2,0],sheet,-half);
        for(const sign of [-1,1]) box(g,w,23,2.6,0,0,sign*(d/2-1.4),steel);
        break;
      case 'hook':
        box(g,19,h,3.2,0,0,-16);
        box(g,19,3,31,0,h/2,0);
        box(g,19,11,3.2,0,h/2-5,15);
        box(g,19,3,36,0,-h/2+13,0);
        break;
      case 'desktop': {
        const fixed=403, leaf=d-fixed;
        plate(g,'desktop-drilled',w,fixed,7,[-367,367].map(x=>[x,176,4.1]),[0,-7,-126],edging,-half);
        box(g,w,h-7,fixed,0,3.5,-126,melamine);
        box(g,w,h,leaf-2,0,0,fixed/2-126+leaf/2,melamine);
        for(const x of [-285,285]) {
          box(g,45,2,64,x,-h/2-1,75,zinc);
          cyl(g,3.5,44,x,-h/2-2,75,zinc).rotation.z=half;
        }
        break;
      }
      case 'lowerFelt': lowerFelt(g,hand); break;
      case 'shelfBracket': {
        plate(g,'shelf-bracket/web',d,h,2.7,[[-77,-9,3.5]],[hand*5,-14,0],sheet,0,half,
          [[-d/2,h/2],[-d/2,-h/2],[-d/2+15,-h/2],[d/2,-3],[d/2,h/2]]);
        plate(g,'shelf-bracket/seat',w,d,2.8,[[0,75,5.4],[0,-5,3.5],[0,-86,5.4]],[-hand*15,8,0],steel,-half);
        cyl(g,2.4,5,-hand*15,11,5,zinc);
        for(const yy of [2,-34]) {
          box(g,5,9,17,hand*18,yy,-109,steel);
          box(g,5,9,5,hand*18,yy-5,-116,steel);
        }
        break;
      }
      case 'shelfBoard': {
        const openings=[-451,451].flatMap(x=>[-81,0,80].map(z=>[x,-z,z?5.4:3.5]));
        const b=[[-w/2,-d/2+13],[-w/2+13,-d/2],[w/2-13,-d/2],[w/2,-d/2+13],[w/2,d/2],[-w/2,d/2]];
        plate(g,'shelf/pan',w,d,7,openings,[0,-5,0],edging,-half,0,b);
        plate(g,'shelf/surface',w,d,10,[],[0,3.5,0],melamine,-half,0,b);
        break;
      }
      case 'shelfEdge':
        plate(g,'shelfEdge/seat',w,d,2.8,[-373,-121,121,373].map(x=>[x,0,3.5]),[0,0,0],steel,-half);
        box(g,w,h,2.5,0,-h/2,-d/2); break;
      case 'hinge':
        plate(g,'lowerHinge/wing',w,d,3,[[0,0,5.4]],[0,0,0],steel,-half,0,clipped(w,d,7));
        plate(g,'lowerHinge/return',w-6,h,3,[[0,8,4.1]],[0,h/2-2,-14],steel);
        break;
      case 'door': door(g,hand); break;
      case 'pull': {
        const arc=Array.from({length:15},(_,i)=>{
          const a=PI/2-i*PI/14; return [hand*37*Math.cos(a),h/2*Math.sin(a)];
        });
        if(hand===1) arc.reverse();
        plate(g,`pull/${hand}`,w,h,9,[],[0,0,8],yellow,0,0,arc);
        box(g,13,h,d,0,0,-1,yellow);
        plate(g,'pullFlange',18,h,3,[[0,-29,4],[0,29,4]],[0,0,-13],yellow);
        break;
      }
      case 'dowel': cyl(g,w/2,h,0,0,0,wood,12); break;
      case 'camStud':
        cyl(g,3,h,0,0,0,zinc,16);
        cyl(g,4.3,18,0,-4,0,plastic,16);
        cyl(g,4,2.6,0,15.7,0,zinc); crossHead(g,4,17); break;
      case 'cam':
        cyl(g,w/2-1,h,0,0,0,zinc);
        cyl(g,w/2,2,0,4.7,0,zinc); crossHead(g,w/2,6); break;
      case 'leveler':
        cyl(g,5,20,0,-6,0,zinc);
        for(let y=-12;y<1;y+=2.3) cyl(g,5.8,.8,0,y,0,zinc);
        cyl(g,w/2,8,0,8,0,black,30);
        for(let i=0;i<24;i++) {
          const a=i*PI/12;
          box(g,.9,7,1,14.1*Math.cos(a),8,14.1*Math.sin(a),plastic).rotation.y=-a;
        }
        break;
      case 'pushClip':
        cyl(g,3.55,h-2,0,-1,0,plastic);
        cyl(g,w/2,2,0,h/2-1,0,plastic);
        for(const y of [-4,-1,2]) cyl(g,4.4,1.15,0,y,0,plastic,14,3.5);
        break;
      case 'sleeve': tube(g,k,w/2,3.1,h,plastic); break;
      case 'smallPin': case 'upperPin': case 'lowerPin':
        cyl(g,w*.29,h-2.4,0,-1,0,zinc);
        cyl(g,w/2,2.4,0,h/2-1.2,0,plastic);
        if(k==='lowerPin') cyl(g,w/2,2.4,0,0,0,zinc);
        break;
      case 'bushing': tube(g,k,w/2,4.8,h,plastic); break;
      case 'sticker': cyl(g,w/2,1,0,0,0,melamine); break;
      case 'hexKey':
        cyl(g,3,76,0,-2,0,zinc,6);
        cyl(g,3,22,10,34,0,zinc,6).rotation.z=half;
        break;
      case 'spacer':
        plate(g,'spacerPlate',w,42,3.3,[],[0,0,0],steel,-half,0,clipped(w,42,5));
        for(const zz of [-12,12]) {
          cyl(g,3.6,13,0,-7,zz,zinc,16);
          for(const y of [-4,-7,-10]) cyl(g,4.1,1,0,y,zz,zinc,16);
        }
        tube(g,'spacerShaft',8,3.8,20,zinc,0,10,0);
        break;
      case 'knob':
        tube(g,'spacingKnob',w/2,4.6,h,plastic);
        for(let i=0;i<16;i++) {
          const a=i*PI/8;
          box(g,1.2,h-2,1.2,(w/2)*Math.cos(a),0,(w/2)*Math.sin(a),black).rotation.y=-a;
        }
        break;
      case 'wallWasher': ring(g,k,[[4.4,-1.8],[7,-1.7],[12,.3],[12.5,1.8],[11,2],[6,-.4],[4.4,-.4],[4.4,-1.8]]); break;
      case 'wallCap':
        box(g,w-2,2.5,d-2,0,3.75,0,steel);
        for(const s of [-1,1]) box(g,2.6,7,d-2,s*(w/2-2),-1,0,plastic);
        break;
      default: screw(g,w,h,k);
    }
  }
  return {
    instantiate(p) {
      const handed=['door','pull','lowerFelt','shelfBracket'].includes(p.shape), key=handed?`${p.shape}/${p.id.at(-1)}`:p.shape;
      if(!templates.has(key)) {
        const g=new Group(); make(g,p); templates.set(key,g);
      }
      const node=templates.get(key).clone(true);
      if(p.shape.startsWith('mesh')||p.shape==='lowerFelt') {
        const tabs=node.children.filter(child=>child.name);
        node.userData.setCaptive=value=>{
          for(const tab of tabs) {
            if(tab.name==='mesh-side') tab.rotation.y=Math.sign(value)*Math.min(1,Math.abs(value))*half*Math.sign(tab.position.x);
            else if(tab.name==='mesh-seam') tab.rotation.x=Math.sign(value)*Math.max(0,Math.abs(value)-1)*half;
            else tab.rotation.z=Math.min(1,value)*half*Math.sign(tab.position.y)*(tab.name==='felt-left'?-1:1);
          }
        };
      }
      return node;
    },
    dispose() {
      for(const geo of geos.values()) geo.dispose();
      for(const mat of materials) mat.dispose();
    }
  };
}
