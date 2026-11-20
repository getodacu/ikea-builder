import { BoxGeometry, CylinderGeometry, ExtrudeGeometry, Group, Mesh, MeshStandardMaterial, Path, Shape } from 'three';
import { shapes, H, T, front, wallZ, inside, boardZ, panelRear, grooveZ, grooveHalf, grooveDepth,
  boardY, railY, railZ, railPins, camX, camZ, dowelZ, retainerX, backY, backW, backH, backT,
  wallX, bracketScrewZ, supportX, supportZ, sidePinY, shelfZ } from './kit.js';

const rect=(x0,x1,y0,y1)=>[[x0,y0],[x1,y0],[x1,y1],[x0,y1]];
const circle=(r,n=24)=>Array.from({length:n},(_,i)=>[r*Math.cos(2*Math.PI*i/n),r*Math.sin(2*Math.PI*i/n)]);
function slot(x,y,r,run,alongY=false) {
  return [1,-1].flatMap(sign=>Array.from({length:9},(_,i)=>{
    const a=Math.PI*(i/8-.5), u=sign*(run+r*Math.cos(a)), v=sign*r*Math.sin(a);
    return alongY?[x+v,y+u]:[x+u,y+v];
  }));
}
function trace(path,points) {
  path.moveTo(...points[0]);
  points.slice(1).forEach(p=>path.lineTo(...p));
  path.closePath();
  return path;
}
const mouth=(point,normal,radius)=>({point,normal,radius});

export function createGeometry() {
  const wood=new MeshStandardMaterial({color:0xf2f1ec,roughness:.78});
  const fiber=new MeshStandardMaterial({color:0xe4e1d8,roughness:.92});
  const steel=new MeshStandardMaterial({color:0x9da5a5,metalness:.68,roughness:.36});
  const nylon=new MeshStandardMaterial({color:0xbcbaa9,roughness:.68});
  const timber=new MeshStandardMaterial({color:0xb39570,roughness:.86});
  const target=new MeshStandardMaterial({color:0x9aa638,roughness:.67});
  const templates=new Map(), assets=new Set();
  const add=(g,geo,m,x=0,y=0,z=0)=>{
    assets.add(geo);
    const mesh=new Mesh(geo,m);
    mesh.castShadow=true; mesh.receiveShadow=true; mesh.position.set(x,y,z); g.add(mesh);
    return mesh;
  };
  const box=(g,w,h,d,x=0,y=0,z=0,m=wood)=>add(g,new BoxGeometry(w,h,d),m,x,y,z);
  const cyl=(g,outer,inner,y0,y1,m=steel,n=20)=>add(g,new CylinderGeometry(outer,inner,y1-y0,n),m,0,(y1+y0)/2,0);
  function cut(g,outline,holes,depth,axis,offset,m=wood,mouths=[]) {
    const s=trace(new Shape(),outline);
    for(const hole of holes) {
      const p=new Path();
      if(hole.length===3 && typeof hole[0]==='number') {
        p.absarc(hole[0],hole[1],hole[2],0,Math.PI*2,true); p.closePath();
      } else trace(p,hole);
      s.holes.push(p);
    }
    const geo=new ExtrudeGeometry(s,{depth,curveSegments:6,bevelEnabled:false});
    if(axis==='x') { geo.rotateY(Math.PI/2); geo.translate(offset,0,0); }
    else if(axis==='y') { geo.rotateX(-Math.PI/2); geo.translate(0,offset,0); }
    else geo.translate(0,0,offset);
    geo.userData.mouths=mouths;
    return add(g,geo,m);
  }
  function side(g,id) {
    const sign=id==='sideL'?-1:1, lo=grooveZ-grooveHalf, hi=grooveZ+grooveHalf;
    const toe=[[-118,0],[-121,22],[-130,46],[wallZ,60]];
    function floor(z) {
      if(z>=toe[0][0]) return 0;
      const j=toe.findIndex(([x])=>z>=x), [a,y]=toe[j-1], [b,k]=toe[j];
      return y+(k-y)*(z-a)/(b-a);
    }
    const panel=(a,b)=>[[b,floor(b)],...toe.filter(([z])=>z>a&&z<b),[a,floor(a)],[a,H],[b,H]].map(([z,y])=>[-z,y-H/2]);
    const bolt=boardY.flatMap(y=>camZ.map(z=>[y,z,3.15]));
    const tenons=[...boardY.flatMap(y=>dowelZ.map(z=>[y,z,4.2])),...railPins.map(z=>[railY+28,z,4.2])];
    const supports=sidePinY.flatMap(y=>supportZ.map(z=>[y,z,2.85]));
    const all=[...bolt,...tenons,...supports];
    function slice(a,b,start,end,bores=[],annotate=false) {
      cut(g,panel(a,b),bores.map(([y,z,r])=>[-z,y-H/2,r]),end-start,'x',sign<0?start-T/2:T/2-end,wood,
        annotate?bores.map(([y,z,r])=>mouth([-sign*T/2,y-H/2,z],[-sign,0,0],r)):[]);
    }
    slice(wallZ,front,0,2.5);
    slice(wallZ,hi,2.5,T-grooveDepth);
    slice(hi,front,2.5,T-grooveDepth,[...bolt,...tenons]);
    slice(wallZ,lo,T-grooveDepth,T);
    slice(hi,front,T-grooveDepth,T,all,true);
  }
  function fixed(g,isTop) {
    const end=inside-16, rear=panelRear-boardZ, f=front-boardZ, band=rear+14, face=isTop?1:-1;
    const receiver=camZ.map(z=>z-boardZ), dowels=dowelZ.map(z=>z-boardZ);
    const sideHoles=[...receiver.map(z=>[-z,0,3.55]),...dowels.map(z=>[-z,0,4.25])];
    for(const s of [-1,1]) {
      const annot=sideHoles.map(([z,y,r])=>mouth([s*inside,y,-z],[s,0,0],r));
      cut(g,rect(-f,-rear,-T/2,T/2),sideHoles,16,'x',s<0?-inside:end,wood,annot);
    }
    cut(g,rect(-end,end,-T/2,T/2),retainerX.map(x=>[x,0,3.3]),14,'z',rear,wood,
      retainerX.map(x=>mouth([x,0,rear],[0,0,-1],3.3)));
    const outline=rect(-end,end,-f,-band);
    const camHoles=[-1,1].flatMap(s=>receiver.map(z=>[s*camX,-z,7.25]));
    const screws=isTop?wallX.map(x=>[x,boardZ-bracketScrewZ,2.65]):[];
    cut(g,outline,[...camHoles,...screws],2,'y',isTop?7:-9,wood,
      [...camHoles,...screws].map(([x,z,r])=>mouth([x,face*T/2,-z],[0,face,0],r)));
    // Relieve the cam pockets inside the board; the narrow cap still has a circular cam opening.
    const intervals=receiver.map(z=>-z).sort((a,b)=>a-b);
    const pockets=(s,rows)=>rows.flatMap(z=>[[s*end,z-8*s],[s*(camX-8),z-8*s],[s*(camX-8),z+8*s],[s*end,z+8*s]]);
    const chamber=[[-end,-f],[end,-f],...pockets(1,intervals),[end,-band],[-end,-band],...pockets(-1,intervals.toReversed())];
    cut(g,chamber,screws,12,'y',isTop?-5:-7);
    cut(g,outline,[],4,'y',isTop?-9:5);
  }
  function rail(g) {
    const [,h,d]=shapes.rail;
    box(g,inside*2-32,h,d);
    const holes=railPins.map(z=>[railZ-z,28,4.2]);
    for(const s of [-1,1]) cut(g,rect(-d/2,d/2,-h/2,h/2),holes,16,'x',s<0?-inside:inside-16,wood,
      holes.map(([z,y,r])=>mouth([s*inside,y,-z],[s,0,0],r)));
  }
  function back(g) {
    const w=backW/3;
    for(const i of [-1,0,1]) {
      const leaf=new Group(); leaf.name=`leaf-${i}`; leaf.position.x=i*w/2;
      const center=i*w/2, half=w/2, gap=.18;
      const left=center-half+(i>=0?gap:0), right=center+half-(i<=0?gap:0);
      const holes=retainerX.filter(x=>Math.abs(x-i*w)<half).flatMap(x=>boardY.map(y=>[x-i*w/2,y-backY,3.5]));
      cut(leaf,rect(left,right,-backH/2,backH/2),holes,backT,'z',-backT/2,i===0?wood:fiber,
        holes.map(([x,y,r])=>mouth([x+i*w/2,y,-backT/2],[0,0,-1],r)));
      g.add(leaf);
    }
    for(const s of [-1,1]) box(g,.9,backH,.24,s*w/2,0,-backT/2-.12,nylon);
  }
  function shelf(g) {
    const [w,h,d]=shapes.shelf;
    const holes=[-supportX,supportX].flatMap(x=>supportZ.map(z=>[x,shelfZ-z,3.25]));
    cut(g,rect(-w/2,w/2,-d/2,d/2),holes,7,'y',-h/2);
    box(g,w,h-7,d,0,3.5,0);
  }
  function bracket(g) {
    cut(g,rect(-9.5,9.5,2,35),[slot(0,18,3.45,8,true)],2,'z',0,steel,
      [mouth([0,18,2],[0,0,1],3.45)]);
    cut(g,rect(-9.5,9.5,-56,0),[slot(0,-37,3.45,10,true)],2,'y',0,steel,
      [mouth([0,2,37],[0,1,0],3.45)]);
  }
  const ring=(g,r,hole,y,thickness,m,n)=>cut(g,circle(r,n),[[0,0,hole]],thickness,'y',y,m);
  const recess=rect(-4.8,4.8,-.85,.85);
  const cross=[[-.62,-2], [.62,-2],[.62,-.62],[2,-.62],[2,.62],[.62,.62],[.62,2],[-.62,2],[-.62,.62],[-2,.62],[-2,-.62],[-.62,-.62]];
  const head=(g,r,y,cutout)=>cut(g,circle(r),[cutout],1.3,'y',y,steel);
  function hardware(g,shape) {
    switch(shape) {
      case 'dowel':
        cyl(g,3.85,3.85,-13.4,13.4,timber,12); cyl(g,3,3.85,13.4,15,timber,12); cyl(g,3.85,3,-15,-13.4,timber,12); break;
      case 'bolt':
        cyl(g,2.6,1.1,-7.7,-4.8); cyl(g,2.6,2.6,-4.8,24); cyl(g,1.9,1.9,24,27.5);
        cyl(g,3.38,3.38,27.5,29.7); head(g,3.38,29.7,cross); break;
      case 'cam':
        cyl(g,6.55,6.55,-12,-2,steel,24); cyl(g,7,7,-2,-1.3,steel,24); head(g,7,-1.3,recess); break;
      case 'sleeve':
        ring(g,3.18,1.8,-11.5,11.5,nylon); ring(g,4.55,1.8,0,1.2,nylon); break;
      case 'pin':
        cyl(g,1.68,1.68,-9.9,1.2,nylon,16); cyl(g,3.45,2.9,1.2,2.5,nylon); break;
      case 'washer': ring(g,6.5,2.6,0,1.6,steel); break;
      case 'screw':
        cyl(g,2.25,.75,-14,-10.6); cyl(g,2.25,2.25,-10.6,0); cyl(g,3.65,3.65,0,1.9);
        head(g,3.65,1.9,cross); break;
      case 'support': {
        cyl(g,2.65,2.65,4,10.2,steel,16); cyl(g,4.6,4.6,2,4,steel,16);
        box(g,11.7,3,6,-3.8,.6,0,steel);
        const pin=new CylinderGeometry(2.5,2.35,5.5,16); pin.rotateZ(Math.PI/2);
        add(g,pin,steel,-10.55,0,0); break;
      }
      case 'target': ring(g,5.65,4.35,0,.6,target); break;
    }
  }

  return {
    instantiate(part) {
      const {id,shape}=part, key=shape==='side'?id:shape;
      if(!templates.has(key)) {
        const g=new Group();
        if(shape==='side') side(g,id);
        else if(shape==='lowerBoard'||shape==='upperBoard') fixed(g,shape==='upperBoard');
        else if(shape==='rail') rail(g);
        else if(shape==='back') back(g);
        else if(shape==='shelf') shelf(g);
        else if(shape==='bracket') bracket(g);
        else hardware(g,shape);
        templates.set(key,g);
      }
      const model=templates.get(key).clone(true);
      if(shape==='back') {
        const left=model.getObjectByName('leaf--1'), right=model.getObjectByName('leaf-1');
        model.userData.setCaptive=value=>{ left.rotation.y=right.rotation.y=(1-value)*Math.PI*.88; };
        model.userData.setCaptive(0);
      } else if(shape==='cam') {
        model.userData.setCaptive=value=>{ for(const mesh of model.children) mesh.rotation.y=value*Math.PI*.65; };
      }
      return model;
    },
    dispose() {
      for(const geo of assets) geo.dispose();
      for(const mat of [wood,fiber,steel,nylon,timber,target]) mat.dispose();
    }
  };
}
