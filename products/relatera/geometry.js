import { BoxGeometry, CylinderGeometry, ExtrudeGeometry, Group, LatheGeometry, Mesh, MeshStandardMaterial,
  Path, Shape, Vector2 } from 'three';
import { layout as L } from './kit.js';

const {PI}=Math;
const rect=(w,h,r=0)=>{
  const s=new Shape(), x=w/2,y=h/2;
  s.moveTo(-x+r,-y); s.lineTo(x-r,-y); s.quadraticCurveTo(x,-y,x,-y+r);
  s.lineTo(x,y-r); s.quadraticCurveTo(x,y,x-r,y); s.lineTo(-x+r,y);
  s.quadraticCurveTo(-x,y,-x,y-r); s.lineTo(-x,-y+r); s.quadraticCurveTo(-x,-y,-x+r,-y);
  return s;
};
function polygon(points,ShapeType=Shape) {
  const shape=new ShapeType();
  points.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));
  shape.closePath();
  return shape;
}
function bore(x,y,r) {
  const p=new Path(); p.absarc(x,y,r,0,2*PI,true); return p;
}
const rectangleHole=(x,y,w,h)=>polygon([[x-w/2,y-h/2],[x+w/2,y-h/2],[x+w/2,y+h/2],[x-w/2,y+h/2]].reverse(),Path);
const circle=(r,n)=>Array.from({length:n},(_,i)=>[r*Math.cos(i*2*PI/n),r*Math.sin(i*2*PI/n)]);
const cross=[[-1,-3],[1,-3],[1,-1],[3,-1],[3,1],[1,1],[1,3],[-1,3],[-1,1],[-3,1],[-3,-1],[-1,-1]];
const drill=(s,holes)=>{ s.holes.push(...holes.map(([x,y,r])=>bore(x,y,r))); return s; };

export function createGeometry() {
  const material=(color,roughness,metalness=0)=>new MeshStandardMaterial({color,roughness,metalness});
  const white=material(0xf0f0e9,.49,.18), top=material(0xf3f1e9,.73), edging=material(0xe4e2d9,.64),
    steel=material(0x9ba3a5,.36,.65), alloy=material(0xc1c4c0,.32,.57), dark=material(0x343c3c,.74),
    plastic=material(0xe2e3dd,.56), pad=material(0xb3aaa0,.94);
  const geometries=new Set(), templates=new Map(), blocks=new Map();
  function mesh(g,geometry,m,x=0,y=0,z=0) {
    geometries.add(geometry);
    const n=new Mesh(geometry,m);
    n.position.set(x,y,z); n.castShadow=true; n.receiveShadow=true; g.add(n);
    return n;
  }
  function block(g,key,create,m,x,y,z) {
    if(!blocks.has(key)) blocks.set(key,create());
    return mesh(g,blocks.get(key),m,x,y,z);
  }
  const box=(g,w,h,d,x,y,z,m=white)=>block(g,`b/${w}/${h}/${d}`,()=>new BoxGeometry(w,h,d),m,x,y,z);
  const roll=(g,a,b,h,x,y,z,m=steel,n=20)=>block(g,`c/${a}/${b}/${h}/${n}`,()=>new CylinderGeometry(a,b,h,n),m,x,y,z);
  function axle(g,r,len,x,y,z,m=steel,n=20) {
    const node=roll(g,r,r,len,x,y,z,m,n); node.rotation.z=-PI/2; return node;
  }
  const extrusion=(shape,d)=>new ExtrudeGeometry(shape,{depth:d,bevelEnabled:false,curveSegments:12});
  function floor(g,s,x,y,z,d,holes=[],m=white) {
    const geo=extrusion(drill(s,holes.map(([u,v,r])=>[u,-v,r])),d);
    geo.rotateX(-PI/2); geo.translate(x,y,z);
    geo.userData.mouths=holes.flatMap(([u,v,r])=>[
      {point:[x+u,y,z+v],normal:[0,-1,0],radius:r}, {point:[x+u,y+d,z+v],normal:[0,1,0],radius:r}]);
    return mesh(g,geo,m);
  }
  function side(g,s,x,y,z,d,holes=[],m=white) {
    const geo=extrusion(drill(s,holes.map(([v,u,r])=>[-u,v,r])),d);
    geo.rotateY(PI/2); geo.translate(x,y,z);
    geo.userData.mouths=holes.flatMap(([v,u,r])=>[
      {point:[x,y+v,z+u],normal:[-1,0,0],radius:r}, {point:[x+d,y+v,z+u],normal:[1,0,0],radius:r}]);
    return mesh(g,geo,m);
  }
  function wall(g,s,x,y,z,d,holes=[],m=white) {
    const geo=extrusion(drill(s,holes),d); geo.translate(x,y,z); return mesh(g,geo,m);
  }
  function screw(g,{r=3,len=12,head=5,h=4,recess='hex',flange=head,tip=0}={}) {
    const pts=[[0,-len],[r*.76,-len],[r*.76,-len+tip]];
    const main=len-tip;
    for(let i=0;i<7;i++) pts.push([r*.82,-len+tip+main*(i/8)],[r,-len+tip+main*((i+.5)/8)]);
    pts.push([r*.83,-.3],[flange,0],[head,h*.55],[0,h*.55]);
    mesh(g,new LatheGeometry(pts.map(([x,y])=>new Vector2(x,y)),18),steel);
    const profile=polygon(circle(head,24));
    const opening=(recess==='cross'?cross:circle(3,6)).map(([x,y])=>[x*head*.16,y*head*.16]).reverse();
    profile.holes.push(polygon(opening,Path));
    mesh(g,extrusion(profile,h*.56).rotateX(-PI/2).translate(0,h*.44,0),alloy);
  }
  function rail(g,wide) {
    const x=wide?-L.railX:L.railX, w=630, halfZ=wide?37:30, bottom=wide?-21:-17;
    const ends=L.endX.map(v=>(wide?-v:v)-x);
    const holes=[...L.lapX.map(v=>[v-x,0,4]),...ends.map(v=>[v,0,4.6]),
      ...(wide?[-416,-310,-207,-103]:[148,241,345,426]).map(v=>[v-x,3,3.2])];
    for(const z of [-halfZ,halfZ-3]) wall(g,rect(w,2-bottom+17,4),0,bottom/2+9,z,3,
      holes.map(([u,v,r])=>[u,v-(bottom/2+9),r]));
    floor(g,rect(w,halfZ*2,4),0,bottom,0,3,[[(wide?-480:480)-x,0,5]]);
    if(!wide) return;
    for(const u of L.beamTopX) floor(g,rect(22,32,3),u-x,19,L.beamTopZ-L.legZ,3,[[0,0,4.2]]);
    for(const u of L.traySlots) {
      const px=L.trayX+u-x, py=L.trayY+22.5-L.railY;
      box(g,9,4,17,px,py,-44);
      box(g,9,13,3,px,py+5,-52);
      box(g,9,14,3,px,py+5,-36);
    }
  }
  function column(g,s) {
    floor(g,rect(40,50,6),0,42-L.legY,0,519,[],plastic);
    floor(g,rect(42,54,6),0,22-L.legY,0,20,L.footScrew.map(([x,z])=>[x,z,4.2]),alloy);
    const carriage=new Group(); carriage.name='upper carriage'; g.add(carriage);
    const sleeve=rect(51,65,7);
    sleeve.holes.push(rectangleHole(0,0,40.6,50.6));
    floor(carriage,sleeve,0,102-L.legY,0,484);
    const y=L.mountY-L.legY,z=L.mountZ-L.legZ;
    const matrix=[...L.crankHoles.map(([v,u])=>[v,u,3.12]),...L.hookHoles.flatMap(([v,u])=>[[v,u,3.1],[v,-u,3.1]]),
      ...L.shoulderZ.map(u=>[0,u,4.6]),[0,0,6.5]];
    for(const x of [-24,21]) side(carriage,rect(65,39,4),x,y,z,3,matrix,alloy);
    box(carriage,37,4,64,0,y+17,z);
    box(carriage,36,4,64,0,y-17,z);
    for(const u of [-32,32]) box(carriage,40,31,3,0,y,z+u);
    // The inboard tongue fits inside the nested channels and carries the same bolt stations.
    const tongue=-s*46, boltY=L.railY-L.legY;
    floor(carriage,rect(55,51,3),tongue,boltY-17,0,4,[[s*3,0,4.5]],alloy);
    for(const side of [-1,1]) wall(carriage,rect(54,32,3),tongue,boltY,side*25-1.5,3,
      L.endX.map(x=>[s*(x-L.legX)-tongue,0,4.4]),alloy);
  }
  function arm(g,s) {
    floor(g,rect(54,556,13),0,5,0,3,L.armZ.map(z=>[0,z,4.7]));
    const fin=polygon([[-270,4],[-216,-3],[-160,-32],[-103,-32],[78,-19],[78,0],[156,0],[156,-11],[264,1],[270,4]]);
    side(g,fin,s>0?16:-19,0,0,3);
    const holes=[...L.shoulderZ.map(z=>[0,z,4.65]),...L.crankHoles.map(([y,z])=>[y,z,3.1]),
      ...L.hookHoles.flatMap(([y,z])=>[[y,z,3.1],[y,-z,3.1]]),[0,0,6.8]];
    side(g,rect(70,40,5),s>0?24:-28,L.mountY-L.armY,L.mountZ,4,holes);
  }
  function shaft(g) {
    const main=new Group(); main.name='rotating shaft'; g.add(main);
    axle(main,7.6,640,0,0,0,alloy);
    for(const s of [-1,1]) {
      const rod=new Group(); rod.name=s<0?'shaft left':'shaft right'; main.add(rod);
      axle(rod,4.65,235,s*401,0,0,steel,6);
      axle(rod,5.1,13,s*503,0,0,alloy);
    }
    const collar=new Group(); collar.name='shaft collar'; main.add(collar);
    axle(collar,9.5,28,0,0,0,steel);
    box(collar,19,3,3,0,9,0,dark);
  }
  function crank(g) {
    side(g,rect(46,42,4),0,0,0,4,[...L.crankHoles.map(([y,z])=>[y,z,3.4]),[0,0,6.7]],alloy);
    const rotor=new Group(); rotor.name='crank rotor'; g.add(rotor);
    axle(rotor,5.5,43,-14,0,0,steel,6);
    axle(rotor,8.7,10,5,0,0,alloy);
    side(rotor,rect(16,76,7),7,-33,0,7,[],white);
    const grip=new Group(); grip.name='folding grip'; grip.position.set(14,-66,0); rotor.add(grip);
    axle(grip,6.3,42,21,0,0,plastic);
    axle(grip,3.3,0.8,42.1,0,0,alloy);
  }
  function hook(g) {
    const holes=[...L.shoulderZ.map(z=>[0,z,7.3]),...L.hookHoles.map(([y,z])=>[y,z,3.5])];
    side(g,rect(70,49,6),0,-2,0,3,holes.map(([y,z,r])=>[y+2,z,r]));
    const outline=new Shape();
    outline.moveTo(0,-24); outline.quadraticCurveTo(6,-38,20,-37); outline.quadraticCurveTo(32,-36,38,-24);
    outline.lineTo(36,-22); outline.quadraticCurveTo(27,-34,18,-34); outline.quadraticCurveTo(5,-34,3,-22); outline.closePath();
    wall(g,outline,0,0,-28,56);
  }
  function tray(g) {
    const z=47, height=33;
    const flange=polygon([[-129,-34],[129,-34],[129,12],[112,18],[89,22],[73,32],[18,34],[9,24],[-5,24],[-17,34],[-68,32],[-93,22],[-129,17]]);
    flange.holes.push(...L.traySlots.map(x=>rectangleHole(x,17,12,15)));
    wall(g,flange,0,0,z,2.6);
    floor(g,rect(258,98,6),0,-34,-1,2.6);
    wall(g,rect(258,height*.52,5),0,-25,-50,2.6);
  }
  function make(g,{id,shape}) {
    const sideSign=id.endsWith('L')?-1:1;
    switch(shape) {
      case 'railWide': case 'railNarrow': rail(g,shape==='railWide'); break;
      case 'column': column(g,sideSign); break;
      case 'arm': arm(g,sideSign); break;
      case 'base': floor(g,rect(64,581,30),0,-8,0,16,[...L.footScrew.map(([x,z])=>[x,L.legZ+z,4.8]),...L.glideZ.map(z=>[0,z,4.1])]); break;
      case 'shaft': shaft(g); break;
      case 'crank': crank(g); break;
      case 'hook': hook(g); break;
      case 'tray': tray(g); break;
      case 'top': {
        const caps=L.capsX.map(x=>[x,L.capsZ,7.35]);
        const bolts=[...[-L.legX,L.legX].flatMap(x=>L.armZ.map(z=>[x,z,4.1])),...L.beamTopX.map(x=>[x,L.beamTopZ,3.6])];
        floor(g,rect(L.topW,L.topD,23),0,-9.5,0,13,[...caps,...bolts],edging);
        floor(g,rect(L.topW,L.topD,23),0,3.5,0,6,caps,top);
        break;
      }
      case 'lapNut': floor(g,polygon(circle(6,6)),0,-2.9,0,4,[[0,0,2.65]],steel); floor(g,polygon(circle(6.7,24)),0,1.1,0,2,[[0,0,2.65]],alloy); break;
      case 'lapScrew': screw(g,{r:2.9,len:13,head:4.7,h:4}); break;
      case 'beamScrew': screw(g,{r:4.1,len:15,head:6.5,h:5,tip:5}); break;
      case 'shoulder': screw(g,{r:4.05,len:12,head:6.4,h:4.5}); break;
      case 'footScrew': screw(g,{r:3.9,len:34,head:5.8,h:5.4}); break;
      case 'crankScrew': screw(g,{r:2.7,len:9,head:4.45,h:1.5,flange:2.7,recess:'cross'}); break;
      case 'hookScrew': screw(g,{r:2.9,len:8,head:4.9,h:2.7,flange:4.05}); break;
      case 'topScrew': screw(g,{r:3.35,len:12.7,head:5.2,h:3.1,recess:'cross'}); break;
      case 'centerScrew': screw(g,{r:3.05,len:9,head:4.4,h:2.8,tip:1.8,recess:'cross'}); break;
      case 'glide': roll(g,16.5,17.5,6,0,3,0,dark,32); roll(g,3.7,3.7,15,0,-7.5,0,steel,12); break;
      case 'cap': roll(g,6.6,6.9,9,0,-4.5,0,plastic); roll(g,9.2,10.1,1.5,0,.75,0,white,32); break;
      case 'pad': wall(g,rect(12,10,1),0,0,-1,2,[],pad); break;
      case 'ballKey': case 'offsetKey': case 'smallKey': {
        const big=shape==='ballKey', offset=shape==='offsetKey', r=big?3.6:offset?4.2:2.35, length=big?128:59, width=big?30:offset?24:19;
        roll(g,r,r,length,0,0,0,steel,6); axle(g,r,width,width/2,length/2-r,0,steel,6);
        if(offset) axle(g,r,width,-width/2,-length/2+r,0,steel,6);
        if(big) roll(g,3,3.6,5,0,-length/2,0,steel,8);
        break;
      }
    }
  }
  const fraction=v=>Math.max(0,Math.min(1,(v-2)/4));
  function animate(node,shape) {
    if(shape==='column') {
      const carriage=node.getObjectByName('upper carriage');
      node.userData.setCaptive=v=>{ carriage.position.y=L.travel*fraction(v); };
      node.userData.adjustBounds=(b,v)=>{ b.max.y+=L.travel*fraction(v); };
    } else if(shape==='shaft') {
      const left=node.getObjectByName('shaft left'), right=node.getObjectByName('shaft right');
      const rotor=node.getObjectByName('rotating shaft'), collar=node.getObjectByName('shaft collar');
      node.userData.setCaptive=v=>{
        const extended=Math.min(1,v);
        left.position.x=41*(1-extended); right.position.x=-41*(1-extended);
        collar.position.x=-34+31*Math.max(0,Math.min(1,v-1));
        rotor.rotation.x=2*PI*fraction(v);
      };
    } else if(shape==='crank') {
      const rotor=node.getObjectByName('crank rotor'), grip=node.getObjectByName('folding grip');
      node.userData.setCaptive=v=>{
        rotor.position.x=12*Math.min(1,v);
        grip.rotation.z=(1-Math.max(0,Math.min(1,v-1)))*PI/2;
        // Captive values 2, 3, 4, 5, 6 are successive quarter-turn waypoints.
        rotor.rotation.x=2*PI*fraction(v)*(Math.abs(node.quaternion.y)>.5?-1:1);
      };
      node.userData.adjustBounds=(b,v)=>{
        b.max.x=v>1?74:28; b.min.x=-40;
        b.min.y=-77; b.max.y=v>2?77:23; b.min.z=v>2?-77:-24; b.max.z=v>2?77:24;
      };
    }
    node.userData.setCaptive?.(0);
  }
  return {
    instantiate(part) {
      const key=['arm','column'].includes(part.shape)?part.id:part.shape;
      if(!templates.has(key)) {
        const g=new Group(); make(g,part); templates.set(key,g);
      }
      const node=templates.get(key).clone(); animate(node,part.shape); return node;
    },
    dispose() {
      for(const geo of geometries) geo.dispose();
      for(const mat of [white,top,edging,steel,alloy,dark,plastic,pad]) mat.dispose();
      templates.clear(); blocks.clear(); geometries.clear();
    }
  };
}
