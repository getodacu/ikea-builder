import {
  BoxGeometry, CatmullRomCurve3, CylinderGeometry, ExtrudeGeometry, Group, Mesh, MeshStandardMaterial,
  Path, Shape, TorusGeometry, TubeGeometry, Vector3
} from 'three';
import { join, shapes } from './kit.js';

const {PI}=Math;
const white=0xf6f2e9, birch=0xd9ae78, silver=0xb4bcc0, charcoal=0x303237;
function outline(target,points) {
  target.moveTo(...points[0]);
  for(const p of points.slice(1)) target.lineTo(...p);
  target.closePath();
  return target;
}
function rectangle(target,w,h,x=0,y=0,c=0) {
  const a=x-w/2,b=x+w/2,l=y-h/2,t=y+h/2;
  return outline(target,c?[[a+c,l],[b-c,l],[b,l+c],[b,t-c],[b-c,t],[a+c,t],[a,t-c],[a,l+c]]:[[a,l],[b,l],[b,t],[a,t]]);
}
function circle(x,y,r) {
  const path=new Path();
  path.absarc(x,y,r,0,2*PI,true);
  return path;
}

export function createGeometry() {
  const color=(c,roughness=.62,metalness=0,more={})=>new MeshStandardMaterial({color:c,roughness,metalness,...more});
  const cream=color(white), wood=color(birch), grey=color(silver,.37,.44), dark=color(charcoal),
    zinc=color(0x899597,.43,.62), back=color(0xf0e7d8), plastic=color(0xdfe1db), burner=color(0x686d71),
    glass=color(0xbecdd4,.22,0,{transparent:true,opacity:.4,depthWrite:false}), strap=color(0x9b9a92);
  const materials=[cream,wood,grey,dark,zinc,back,plastic,burner,glass,strap];
  const geometries=new Map(), templates=new Map();
  function node(g,key,make,m,x=0,y=0,z=0) {
    if(!geometries.has(key)) geometries.set(key,make());
    const n=new Mesh(geometries.get(key),m);
    n.position.set(x,y,z); n.castShadow=m!==glass; n.receiveShadow=true; g.add(n);
    return n;
  }
  const box=(g,w,h,d,x=0,y=0,z=0,m=cream)=>node(g,`box/${w}/${h}/${d}`,()=>new BoxGeometry(w,h,d),m,x,y,z);
  const cyl=(g,r1,r2,h,x=0,y=0,z=0,m=grey,sides=24)=>node(g,`cyl/${r1}/${r2}/${h}/${sides}`,
    ()=>new CylinderGeometry(r1,r2,h,sides),m,x,y,z);
  function tube(g,key,points,r,m) {
    return node(g,key,()=>new TubeGeometry(new CatmullRomCurve3(points.map(p=>new Vector3(...p))),24,r,8),m);
  }
  function prism(g,key,shape,thickness,m,axis='z',x=0,y=0,z=0) {
    return node(g,key,()=>{
      const geo=new ExtrudeGeometry(shape,{depth:thickness,bevelEnabled:false,curveSegments:16});
      if(axis==='x') geo.rotateY(PI/2);
      if(axis==='y') geo.rotateX(-PI/2);
      return geo;
    },m,x,y,z);
  }
  function horizontal(g,key,w,d,y,t,bores=[],holes=[],m=cream,clip=0) {
    const s=rectangle(new Shape(),w,d,0,0,clip);
    s.holes=[...bores.map(([x,z,r])=>circle(x,-z,r)),...holes.map(([x,z,a,b,c])=>rectangle(new Path(),a,b,x,-z,c))];
    return prism(g,key,s,t,m,'y',0,y);
  }
  function side(g,key,h,d,x,t,bores=[],m=cream,y=0,z=0,clip=0) {
    const s=rectangle(new Shape(),d,h,0,0,clip);
    s.holes=bores.map(([a,b,r])=>circle(-b,a,r));
    return prism(g,key,s,t,m,'x',x,y,z);
  }
  function joinScrew(g,id,h,w) {
    const length=h-2, radius=w*.28, hex=id==='longScrew'||id==='shortScrew';
    const s=new Shape();
    s.absarc(0,0,w/2,0,2*PI,false);
    if(hex) s.holes.push(outline(new Path(),Array.from({length:6},(_,i)=>[1.8*Math.cos(i*PI/3),1.8*Math.sin(i*PI/3)]).reverse()));
    else s.holes.push(outline(new Path(),[[-.5,-2],[-.5,-.5],[-2,-.5],[-2,.5],[-.5,.5],[-.5,2],[.5,2],[.5,.5],[2,.5],[2,-.5],[.5,-.5],[.5,-2]]));
    prism(g,`head/${id}`,s,1.7,zinc,'y',0,-1.2);
    cyl(g,radius,radius,length-3,0,(-length+3)/2,0,zinc,12);
    cyl(g,radius,.4,3,0,-length+1.5,0,zinc,12);
    for(let y=-length+4;y<-(hex?length*.38:3);y+=3.1) cyl(g,radius,radius+1,1.3,0,y,0,zinc,12);
  }
  function door(g,key,w,h,d) {
    const micro=key==='microwaveDoor', hole=micro ? [w-51,h-45] : [w-105,h-107];
    const cy=micro?0:-26;
    const s=rectangle(new Shape(),w,h,0,0,2);
    s.holes.push(rectangle(new Path(),...hole,0,cy,3));
    prism(g,`frame/${key}`,s,d,cream,'z',0,0,-d/2);
    box(g,hole[0]+3,hole[1]+3,3,0,cy,0,glass);
    const liner=rectangle(new Shape(),hole[0]+13,hole[1]+13,0,cy,2);
    liner.holes.push(rectangle(new Path(),...hole,0,cy,3));
    prism(g,`liner/${key}`,liner,2.5,wood,'z',0,0,-d/2-1);
  }
  function sink(g,w,d) {
    const H=62, wh=226, dh=188, wb=194, db=157;
    horizontal(g,'sinkLip',w,d,0,4,[],[[0,0,wh,dh,13]],grey,13);
    const base=rectangle(new Shape(),wb+5,db+5,0,0,6);
    prism(g,'sinkBowlFloor',base,4,grey,'y',0,-H-4);
    const ring=(a,b,c,y)=>[[-a/2+c,y,-b/2],[a/2-c,y,-b/2],[a/2,y,-b/2+c],[a/2,y,b/2-c],
      [a/2-c,y,b/2],[-a/2+c,y,b/2],[-a/2,y,b/2-c],[-a/2,y,-b/2+c]];
    const upper=ring(wh,dh,13,0), lower=ring(wb,db,7,-H);
    for(let i=0;i<8;i++) {
      const j=(i+1)%8, a=new Vector3(...upper[i]), b=new Vector3(...upper[j]), c=new Vector3(...lower[j]), e=new Vector3(...lower[i]);
      const plane=a.clone().sub(b).normalize(), normal=new Vector3().crossVectors(b.clone().sub(a),c.clone().sub(a)).normalize();
      const vertical=new Vector3().crossVectors(normal,plane);
      const offset=v=>v.clone().sub(a);
      const face=outline(new Shape(),[a,b,c,e].map(v=>[offset(v).dot(plane),offset(v).dot(vertical)]));
      const mesh=prism(g,`bowlWall${i}`,face,3,grey,'z',...a.toArray());
      mesh.matrix.makeBasis(plane,vertical,normal).setPosition(a);
      mesh.matrixAutoUpdate=false;
    }
    cyl(g,12,10,1,0,-H+.6,0,zinc);
    for(const x of [-4,0,4]) cyl(g,1.2,1.2,.5,x,-H+1.3,0,dark,10);
  }
  function make(g,{shape}) {
    const [w,h,d]=shapes[shape];
    switch(shape) {
    case 'lowerEnd': {
      side(g,'lowerWing',429,306,-8,16,join.shelfPinZ.map(z=>[-6,z,3.2]),cream,34);
      for(const z of join.sideZ) side(g,`leg/${z}`,500,34,-17,34,[[-202,0,4.4],[234,0,4.4],...(z>0?[[219,0,4.4]]:[])],wood,0,z,1);
      return;
    }
    case 'bottom':
      horizontal(g,'lowerFloor',w,d,-h/2,h,[[-312,161,4.7],[312,161,4.7],[0,-137,4.4],[0,127,4.4]]);
      box(g,w,2,3,0,-h/2+2,d/2-2,wood);
      return;
    case 'rail':
      horizontal(g,'frontRail',w,d,-h/2,h,[[-312,-11,4.7],[312,-11,4.7]],[],wood,1);
      return;
    case 'lowerDivider':
      side(g,'lowerCenter',h-12,d,-w/2,w,join.shelfPinZ.map(z=>[-34-6,z+4,3.2]),cream,-6);
      horizontal(g,'lowerCenterLip',w,d,h/2-12,12,join.dividers.map(z=>[0,z+4,4.4]));
      box(g,w,2,2,0,-h/2+2,d/2+1,wood);
      return;
    case 'shelf':
      box(g,w,h,d-3,0,0,-1.5);
      box(g,w,h,3,0,0,d/2-1.5,wood);
      return;
    case 'lowerBack': {
      const a=w/2,b=h/2;
      const s=outline(new Shape(),[[-a,-b],[a,-b],[a,b],[16,b],[12,b-10],[-12,b-10],[-16,b],[-a,b]]);
      prism(g,'notchedBack',s,d,back,'z',0,0,-d/2);
      return;
    }
    case 'upperBack': {
      const a=w/2,b=h/2;
      const s=outline(new Shape(),[[-a,-b],[a,-b],[a,b-8],[a-11,b],[-a+11,b],[-a,b-8]]);
      prism(g,'clippedBack',s,d,back,'z',0,0,-d/2);
      return;
    }
    case 'counter': {
      const holes=[[...join.stove,2],[...join.sink,10]];
      const common=[...join.hutchX.flatMap(x=>join.hutchZ.map(z=>[x,z,4.35])),...join.tap.map(x=>[x,join.tapZ,3.6])];
      const underside=[...join.dividers.map(z=>[0,z,4.45]),[0,-183,3],
        ...[-1,1].flatMap(s=>join.sideZ.flatMap(z=>[[s*336,z,6],[s*318,z,3]]))];
      horizontal(g,'counterUnderside',w,d,-9,12,[...common,...underside],holes,wood,5);
      horizontal(g,'counterFace',w,d,3,6,common,holes,cream,5);
      return;
    }
    case 'upperEnd': {
      const holes=[[join.rodY-819.5,join.rodZ+114,5.45],...[...join.upperPinZ,-143,-82].map(z=>[94.5,z+114,4.35]),
        ...join.hutchZ.map(z=>[-250,z+114,4.35])];
      side(g,'hutchWing',h,d,w/-2,w,holes,cream,0,0,2);
      box(g,w,h-8,2,0,0,d/2+1,wood);
      return;
    }
    case 'upperShelf':
      horizontal(g,'hutchShelf',w,d,-h/2,h,[[join.microwaveX,join.microwaveZ+114,4.5],
        ...[-165,165].flatMap(x=>join.upperPinZ.map(z=>[x,z+114,4.4]))]);
      return;
    case 'upperDivider':
      side(g,'hutchDivider',h,d,-w/2,w,[],cream,0,0,2);
      box(g,w,h-4,3,0,0,d/2-1.5,wood);
      return;
    case 'cap': {
      const pivot=[join.microwaveX,join.microwaveZ+114,4.5];
      const screws=join.hutchX.flatMap(x=>[-143,-83].map(z=>[x,z+114,4.4]));
      horizontal(g,'hutchCapBores',w,d,-9,11,[pivot,...screws,...[-165,165].flatMap(x=>join.upperPinZ.map(z=>[x,z+114,4.4]))],[],cream,3);
      horizontal(g,'hutchCapFace',w,d,2,7,screws,[],cream,3);
      return;
    }
    case 'ovenDoor': case 'microwaveDoor':
      door(g,shape,w,h,d); return;
    case 'longScrew': case 'shortScrew': case 'strapScrew': case 'tapScrew': case 'fixingScrew': case 'handleScrew':
      joinScrew(g,shape,h,w); return;
    case 'catch':
      box(g,w,h,6,0,0,-2,zinc);
      box(g,w-7,6,d,0,8,3,dark);
      box(g,w-7,6,d,0,-8,3,dark);
      return;
    case 'dowel':
      cyl(g,w/2,w/2,h-4,0,0,0,wood,12);
      cyl(g,w/2,w*.39,2,0,-h/2+1,0,wood,12);
      cyl(g,w*.39,w/2,2,0,h/2-1,0,wood,12);
      return;
    case 'strike': {
      const s=rectangle(new Shape(),w,h,0,0,4);
      s.holes.push(circle(0,0,3.2));
      prism(g,'strikePlate',s,d,zinc,'z',0,0,-d/2); return;
    }
    case 'support':
      cyl(g,3.2,3.2,9,0,0,-4,zinc).rotation.x=PI/2;
      box(g,10,9,5,0,0,3,plastic);
      box(g,12,3,10,0,5,6,plastic);
      return;
    case 'washer': {
      const s=new Shape();
      s.absarc(0,0,7.5,0,2*PI,false);
      s.holes.push(circle(0,0,3.4));
      prism(g,'washer',s,2,zinc,'y',0,-1);
      return;
    }
    case 'connector':
      side(g,'crossBoreConnector',23,31,-15,30,[[-4.5,0,4.4]],plastic,-11.5,0,4);
      cyl(g,5.75,5.75,8,0,3,0,plastic);
      horizontal(g,'connectorScrewTab',15,15,-6,6,[[-3,0,3.3]],[],plastic,1).position.x=-15;
      return;
    case 'hook':
      tube(g,'hookProfile',[[0,7,3],[0,1,8],[0,-5,4],[0,-5,-3],[0,0,-7],[0,8,-1]],2.1,grey);
      tube(g,'hookTail',[[0,-5,-3],[0,-11,-4],[0,-19,-6],[0,-31,-4],[0,-39,2],[0,-32,9]],2.15,grey);
      return;
    case 'rod':
      cyl(g,5,5,w,0,0,0,grey).rotation.z=PI/2; return;
    case 'pull':
      for(const y of [-44,44]) cyl(g,12,12,4,0,y,2,grey).rotation.x=PI/2;
      tube(g,'pullBridge',[[0,-44,4],[0,-44,17],[0,-34,24],[0,34,24],[0,44,17],[0,44,4]],5,grey);
      return;
    case 'strap': {
      const s=rectangle(new Shape(),16,57,0,20,4);
      s.holes.push(circle(0,0,3.8),circle(0,43,4));
      prism(g,'endEyeStrap',s,2,strap,'y',0,-1); return;
    }
    case 'pivot':
      side(g,'pivotSide',40,14,-7,2.5,[[-12,0,2.7],[9,0,2.7]],zinc,26,0,4);
      box(g,13,2.5,14,-1,5,0,zinc);
      cyl(g,3.7,3.7,12,0,-2,0,zinc); return;
    case 'key':
      tube(g,'hexKey',[[22,0,0],[2,0,0],[0,0,2],[0,0,71]],2,zinc); return;
    case 'sleeve':
      horizontal(g,'footSleeveRim',w,d,-h/2+3,h-3,[],[[0,0,34.5,34.5,1]],plastic,2);
      box(g,w,3,d,0,-h/2+1.5,0,plastic); return;
    case 'faucet':
      cyl(g,22,25,5,0,2.5,0,dark);
      cyl(g,14,19,56,0,29,0,dark);
      tube(g,'gooseneck',[[0,53,0],[0,85,0],[0,126,3],[0,140,20],[0,137,52],[0,120,63],[0,104,64]],10,dark);
      cyl(g,12,12,13,0,102,64,dark);
      cyl(g,14,14,15,18,30,0,dark).rotation.z=PI/2;
      for(let i=0;i<4;i++) {
        const a=i*PI/2;
        const n=cyl(g,3.4,3.4,22,25,30+12*Math.cos(a),12*Math.sin(a),dark);
        n.rotation.x=a;
      }
      return;
    case 'sink':
      sink(g,w,d); return;
    case 'cooktop': {
      horizontal(g,'stoveFlange',w,d,0,5,[],[],dark,9);
      horizontal(g,'stoveHousing',225,223,-34,34,[],[],dark,8);
      for(const z of [-50,47]) {
        cyl(g,42,42,1,-22,5.5,z,burner);
        cyl(g,30,30,1,-22,6.3,z,dark);
        const ring=node(g,'burnerRing',()=>new TorusGeometry(22,1.6,8,32),grey,-22,7,z);
        ring.rotation.x=-PI/2;
      }
      for(const z of [-31,20]) cyl(g,9,10,6,72,8,z,dark);
      for(const x of [-64,64]) for(const z of [-115,115]) box(g,13,10,12,x,-26,z,plastic);
      return;
    }
    case 'wallFix':
      cyl(g,4.5,4.5,3,0,0,0,zinc);
      cyl(g,2.8,2.8,24,0,-12,0,zinc); return;
    default:
      box(g,w,h,d);
    }
  }
  return {
    instantiate(part) {
      const {shape}=part;
      if(!templates.has(shape)) {
        const group=new Group(); make(group,part); templates.set(shape,group);
      }
      return templates.get(shape).clone(true);
    },
    dispose() {
      for(const g of geometries.values()) g.dispose();
      for(const m of materials) m.dispose();
    }
  };
}
