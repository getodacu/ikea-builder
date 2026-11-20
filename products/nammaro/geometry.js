import {
  BoxGeometry, CylinderGeometry, DoubleSide, ExtrudeGeometry, Group, LatheGeometry, Mesh, MeshStandardMaterial,
  Path, Shape, ShapeGeometry, Vector2
} from 'three';
import { fit, legStations } from './kit.js';

const { PI,cos,sin,sqrt,asin,acos }=Math, half=PI/2;
const { head,foot,deckY,halfWood,rearX,frontX,legY,legZ,legW,legTop,studY,
  wheelY,wheelR,footDowelY,footBoltY,braceEnd,braceBarrel }=fit;
const pivotX=-190, pivotY=282, supportX=-530, supportY=-12, supportZ=248, reach=350;
const lift=-.70, raised=-.60, notchY=250, rodRadius=6;
const supportPivot=(angle)=>[pivotX+cos(angle)*supportX-sin(angle)*supportY,
  pivotY+sin(angle)*supportX+cos(angle)*supportY];
const [raisedX,raisedY]=supportPivot(raised);
const notchX=raisedX-sqrt(reach**2-(raisedY-notchY)**2);
const supportAngle=angle=>-acos((notchX-supportPivot(angle)[0])/reach);
const round=(r,n)=>Array.from({length:n},(_,i)=>[r*cos(i*2*PI/n),r*sin(i*2*PI/n)]);
function outline(path,points) {
  points.forEach(([x,y],i)=>i?path.lineTo(x,y):path.moveTo(x,y));
  path.closePath(); return path;
}
const rect=(w,h)=>[[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]];
function cut(shape,x,y,r) {
  const hole=new Path(); hole.absarc(x,y,r,0,2*PI,true); shape.holes.push(hole);
}

export function createGeometry() {
  const geometries=new Map(), templates=new Map(), materials=[];
  const material=(color,roughness,metalness=0)=>{
    const m=new MeshStandardMaterial({color,roughness,metalness,side:DoubleSide}); materials.push(m); return m;
  };
  const frameWood=material(0xa56b3b,.77), endWood=material(0xb77b49,.79), cleanWood=material(0xc28a59,.8);
  const boards=[0xb57a4c,0xba8150,0xb98152,0xc18b5d,0xae7549].map(c=>material(c,.81));
  const steel=material(0x777b78,.39,.69), darkSteel=material(0x4b4d48,.54,.54), rubber=material(0x38322e,.91);
  function mesh(group,key,make,mat,x,y,z,name='') {
    if(!geometries.has(key)) geometries.set(key,make());
    const m=new Mesh(geometries.get(key),mat); m.position.set(x,y,z); m.name=name;
    m.castShadow=m.receiveShadow=true; group.add(m); return m;
  }
  const box=(g,w,h,d,x,y,z,m=frameWood)=>mesh(g,`box:${w}/${h}/${d}`,()=>new BoxGeometry(w,h,d),m,x,y,z);
  const cyl=(g,r,h,x,y,z,m=steel,n=24)=>mesh(g,`cyl:${r}/${h}/${n}`,()=>new CylinderGeometry(r,r,h,n),m,x,y,z);
  const lathe=(g,key,profile,x,y,z,m=steel,sweep=2*PI)=>mesh(g,`lathe:${key}`,
    ()=>new LatheGeometry(profile.map(([r,h])=>new Vector2(r,h)),28,0,sweep),m,x,y,z);
  const ring=(g,key,ro,ri,len,x=0,y=0,z=0,m=steel,sweep)=>lathe(g,key,
    [[ri,-len/2],[ro,-len/2],[ro,len/2],[ri,len/2],[ri,-len/2]],x,y,z,m,sweep);
  function plate(g,key,border,depth,holes,x,y,z,m=frameWood) {
    return mesh(g,`plate:${key}`,()=>{
      const shape=outline(new Shape(),border);
      for(const [u,v,r] of holes) cut(shape,u,v,r);
      return new ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:16}).translate(0,0,-depth/2);
    },m,x,y,z);
  }
  function drilled(g,key,[w,h,d],[x,y,z],cuts,m=frameWood) {
    // Hole coordinates are on the indicated face; only the visible bore throats are tubed where orthogonal drillings meet.
    for(const axis of ['x','y','z']) for(const side of [-1,1]) {
      const [u,v,at,normal,point,turn]=axis==='x'?[d,h,w,[side,0,0],(u,v,a)=>[a,v,-u],['y',half]]:
        axis==='y'?[w,d,h,[0,side,0],(u,v,a)=>[u,a,-v],['x',-half]]:
          [w,h,d,[0,0,side],(u,v,a)=>[u,v,a],['z',0]];
      const face=at*side/2, start=point(0,0,face);
      const holes=cuts.filter(c=>c[0]===axis&&c[1]===side);
      const faceMesh=mesh(g,`face:${key}/${axis}/${side}`,()=>{
        const shape=outline(new Shape(),rect(u,v));
        for(const [,,a,b,r] of holes) cut(shape,a,b,r);
        const geom=new ShapeGeometry(shape,20);
        if(holes.length) geom.userData.mouths=holes.map(([,,a,b,radius])=>({
          point:point(a,b,face).map((q,i)=>q+[x,y,z][i]),normal,radius}));
        return geom;
      },m,x+start[0],y+start[1],z+start[2]);
      faceMesh.rotation[turn[0]]=turn[1];
      for(const [,,a,b,r,depth] of holes) {
        const p=point(a,b,face-side*depth/2);
        const wall=mesh(g,`throat:${r}/${depth}`,()=>new CylinderGeometry(r,r,depth,24,1,true),m,x+p[0],y+p[1],z+p[2]);
        if(axis==='x') wall.rotation.z=half;
        if(axis==='z') wall.rotation.x=half;
      }
    }
  }
  function leg(g,{id,wheel,side,into}) {
    const low=wheel?7:2, shoulder=wheel?79:83, height=shoulder-low, centre=(low+shoulder)/2;
    const boltY=(wheel?wheelY:footBoltY)-centre;
    const slices=wheel?[[-22,-11,9.4],[-11,14,5.6],[14,22,9.85]]:
      [[-22,-6,5.25],[-6,17,5.25],[17,22,8.7]];
    for(const [a,b,r] of slices) {
      const holes=[[0,boltY,r]];
      if(!wheel&&a===-22) holes.push([0,footDowelY-centre,4.45]);
      const face=plate(g,`${id}/${a}`,rect(legW,height),b-a,holes,0,centre-legY,side*(a+b)/2,endWood);
      if(b===22) face.geometry.userData.mouths=[{point:[0,(wheel?wheelY:footBoltY)-legY,side*22],normal:[0,0,side],radius:r}];
    }
    if(!wheel) box(g,40,2,40,0,1-legY,0,rubber);
    const crown=215;
    box(g,legW,crown-shoulder,legW,0,(crown+shoulder)/2-legY,0,endWood);
    const middle=(legTop+crown)/2;
    drilled(g,`${id}/crown`,[legW,legTop-crown,legW],[0,middle-legY,0],[
      ['y',1,0,0,7.2,13],['x',into,0,studY-middle,4.7,12],
      ['z',-side,into*9,236-middle,4.4,8],['z',-side,into*9,257-middle,4.4,8]
    ],endWood);
  }
  function brace(g,wheel) {
    const name=wheel?'wheel':'foot', width=wheel?36:34, bottom=wheel?-21:-15, top=wheel?21:29, y=(top+bottom)/2;
    const cuts=[];
    for(const s of [-1,1]) {
      cuts.push(['y',-1,0,-s*braceBarrel,wheel?8.3:5.8,13],['z',s,0,-y,wheel?5.6:4.9,13]);
      if(!wheel) cuts.push(['z',s,0,footDowelY-footBoltY-y,4.3,13]);
      if(wheel) ring(g,'wood brace tongue',8.8,5.6,9,0,0,s*(braceEnd+4.5),endWood).rotation.x=half;
      cyl(g,wheel?5.6:4.9,1,0,0,s*222,endWood).rotation.x=half;
    }
    drilled(g,`${name} brace`,[width,top-bottom,2*braceEnd],[0,y,0],cuts,endWood);
  }
  function deck(g) {
    const put=(w,h,d,x,y,z,m)=>box(g,w,h,d,x,y-deckY,z,m);
    const cap=18, width=2*halfWood;
    for(const s of [-1,1]) {
      put(foot-head,cap,18,(foot+head)/2,289,s*293);
      put(frontX-rearX-legW,42,18,(frontX+rearX)/2,259,s*293);
    }
    for(const [end,s] of [[head,1],[foot,-1]]) {
      put(24,cap,width-36,end+s*12,289,0);
      put(24,38,516,end+s*12,261,0);
    }
    const seatStart=pivotX+8, seatLength=foot-24-seatStart, pitch=seatLength/17;
    for(let i=0;i<17;i++) put(pitch-7,18,570,seatStart+pitch*(i+.5),289,0,boards[i%boards.length]);
    for(const x of [pivotX+85,foot-99]) put(44,19,568,x,270,0);
    for(const {x,z,into,side} of legStations) {
      const at=x+25*into;
      const plateMesh=plate(g,'leg mounting plate',rect(34,36),4,[[0,0,4.8]],at,studY-deckY,z,steel);
      plateMesh.rotation.y=half;
      put(39,4,33,x+into*29,266,z,steel);
      put(12,31,4,x+into*23,249,z-side*19,steel);
      for(const dy of [-11,11]) cyl(g,3.9,2,at+3*into,studY+dy-deckY,z-side*10,darkSteel,12).rotation.z=half;
    }
    for(const s of [-1,1]) {
      const border=[[-57,-12],[57,-12],[57,4]];
      for(let i=2;i>=-2;i--) {
        const x=i*22;
        border.push([x+7,4],[x+7,-3],[x+4,-6],[x-4,-6],[x-7,-3],[x-7,4]);
      }
      border.push([-57,4]);
      plate(g,'comb detents',border,6,[],notchX,notchY-deckY,s*supportZ,darkSteel).name='Backrest detent plate';
      put(114,6,36,notchX,notchY-15,s*(supportZ+14),frameWood);
      put(18,8,37,pivotX,pivotY-5,s*266,steel);
      const pin=cyl(g,5,41,pivotX,pivotY-deckY,s*268,steel); pin.rotation.x=half;
    }
    const back=new Group(); back.name='Backrest hinge'; back.position.set(pivotX,pivotY-deckY,0); g.add(back);
    const span=pivotX-head-24;
    for(const s of [-1,1]) box(back,span,18,21,-span/2,7,s*274,endWood);
    box(back,24,18,527,-span+12,7,0,cleanWood);
    const gap=7, spacing=(span-29)/10;
    for(let i=0;i<10;i++) box(back,spacing-gap,18,527,-(i+.5)*spacing,7,0,boards[(i+2)%boards.length]);
    const support=new Group(); support.name='Backrest support pivot'; support.position.set(supportX,supportY,0); back.add(support);
    const cross=(x,r,name)=>{
      const bar=cyl(support,r,2*(supportZ+5),x,0,0,darkSteel); bar.rotation.x=half; bar.name=name;
    };
    cross(0,5,'Support pivot pin'); cross(reach,rodRadius,'Support seating bar');
    for(const side of [-1,1]) {
      const z=side*supportZ;
      cyl(support,4.5,reach,reach/2,0,z,darkSteel).rotation.z=half;
      box(back,18,14,12,supportX,supportY+4,z,darkSteel).name='Support pivot mount';
    }
  }
  function barrel(g,key,r,h,bore) {
    for(const s of [-1,1]) mesh(g,`barrel:${key}/${s}`,()=>{
      const bottom=[], top=[];
      for(let i=0;i<=18;i++) {
        const x=-half+PI*i/18;
        bottom.push([x,-h/2]); top.push([x,h/2]);
      }
      const body=outline(new Shape(),[...bottom,...top.reverse()]);
      body.holes.push(outline(new Path(),round(bore,32).reverse().map(([x,y])=>[asin(x/r),y])));
      const geo=new ShapeGeometry(body,16), pos=geo.attributes.position, normals=geo.attributes.normal;
      for(let i=0;i<pos.count;i++) {
        const a=pos.getX(i), nx=sin(a), nz=s*cos(a);
        pos.setXYZ(i,r*nx,pos.getY(i),r*nz);
        normals.setXYZ(i,s*nx,0,s*nz);
      }
      return geo;
    },steel,0,0,0);
    cyl(g,r,1,0,-h/2+.5,0,steel);
    cyl(g,r,1,0,h/2-.5,0,steel);
    box(g,r*1.6,.35,1.35,0,h/2,0,darkSteel);
  }
  function threaded(g,key,r,a,b) {
    const profile=[[0,a],[r-.4,a]];
    for(let y=a+1;y<b-1;y+=2.2) profile.push([r-.55,y],[r,y+.6],[r-.45,y+1.25]);
    profile.push([r-.4,b],[0,b]);
    lathe(g,key,profile,0,0,0);
  }
  function make(g,key) {
    if(key==='deck') { deck(g); return; }
    const station=legStations.find(s=>s.id===key);
    if(station) { leg(g,station); return; }
    switch(key) {
      case 'wheelBrace': case 'footBrace': brace(g,key==='wheelBrace'); break;
      case 'wheel':
        lathe(g,'wood wheel hub',[[7.15,-4],[35,-4],[37,-11],[39,-10],[39,11],[35,10],[35,9],[7.15,9],[7.15,-4]],0,0,0,cleanWood);
        lathe(g,'wheel tread',[[37,-16],[42,-16],[wheelR,-13],[wheelR,11],[42,15],[37,15],[39,10],[39,-10],[37,-16]],0,0,0,rubber);
        break;
      case '116562': barrel(g,key,7,25,4.2); break;
      case '10089533': barrel(g,key,8,23,4.2); break;
      case '113153': barrel(g,key,5.5,20,4.0); break;
      case '10089529':
        threaded(g,'axle thread',4.3,-51.5,-20);
        cyl(g,4.6,29,0,-5.5,0); cyl(g,5.1,42.5,0,30.25,0);
        cyl(g,8.5,4,0,53.5,0,steel,6); break;
      case '113134': {
        threaded(g,'foot bolt thread',4.15,-36,-8);
        cyl(g,4,44,0,14,0);
        cyl(g,8.3,1.6,0,36.8,0);
        const cap=outline(new Shape(),round(8.1,32)); cap.holes.push(outline(new Path(),round(3.25,6).reverse()));
        mesh(g,'hex socket head',()=>new ExtrudeGeometry(cap,{depth:2.4,bevelEnabled:false}),steel,0,37.6,0).rotation.x=-half;
        break;
      }
      case '114729':
        threaded(g,'full leg stud thread',4.1,-30.5,30.5);
        cyl(g,3.5,1.1,0,30,0); box(g,6.5,.34,1.2,0,30.55,0,darkSteel); break;
      case '128832': cyl(g,3.75,25,0,0,0,cleanWood,12); break;
      case '117215': ring(g,key,7,5.25,13); break;
      case '112074': ring(g,key,7,5.25,8); break;
      case '114577':
        plate(g,'hex nut',round(8,6),7,[[0,0,4.15]],0,0,0,steel).rotation.x=-half; break;
      case '117217': ring(g,key,9.5,5.2,2); break;
      case '106675': ring(g,key,7.5,4.1,2.5,0,0,0,steel,2*PI-.36); break;
      case '128632': {
        const jaw=[[-82,-8],[-72,-12],[-61,-12],[-54,-5],[-46,-4],[62,-4],[73,-13],[84,-11],[89,-7],[89,7],[84,11],[73,13],[62,4],[-46,4],[-54,5],[-61,12],[-72,12],[-82,8],[-67,5],[-67,-5]];
        plate(g,'wrench outline',jaw,4,[[76,0,7.1]],0,0,0,steel).rotation.x=-half;
        break;
      }
      case '100001':
        box(g,43,4.8,4.8,0,0,0,steel);
        box(g,5,4.8,20,-21,0,-8,steel);
        box(g,5,4.8,17,21,0,6.5,steel); break;
    }
  }
  return {
    instantiate({shape}) {
      if(!templates.has(shape)) { const g=new Group(); make(g,shape); templates.set(shape,g); }
      const node=templates.get(shape).clone(true);
      if(shape==='deck') {
        const back=node.getObjectByName('Backrest hinge'), support=node.getObjectByName('Backrest support pivot');
        const backAngle=t=>t<=.42?lift*t/.42:t<=.8?lift:lift+(raised-lift)*(t-.8)/.2;
        node.userData.setCaptive=t=>{
          const angle=backAngle(t);
          back.rotation.z=angle;
          support.rotation.z=t<=.42?0:t<=.8?(supportAngle(lift)-lift)*(t-.42)/.38:supportAngle(angle)-angle;
        };
        node.userData.adjustBounds=(bounds,t)=>{
          bounds.min.y=Math.min(bounds.min.y,studY-deckY-18);
          const angle=backAngle(t);
          bounds.max.y=Math.max(bounds.max.y,pivotY-deckY+(pivotX-head)*-sin(angle)+16*cos(angle));
        };
      }
      return node;
    },
    dispose() {
      for(const g of geometries.values()) g.dispose();
      for(const m of materials) m.dispose();
      geometries.clear(); templates.clear();
    }
  };
}
