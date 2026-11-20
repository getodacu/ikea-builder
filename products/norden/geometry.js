import { BoxGeometry, CylinderGeometry, ExtrudeGeometry, Group, LatheGeometry, Mesh, MeshStandardMaterial, Path, Shape, Vector2 } from 'three';
import { layout } from './kit.js';

export function createGeometry() {
  const wood = new MeshStandardMaterial({color:0xf0efeb,roughness:.79});
  const edge = new MeshStandardMaterial({color:0xe4e1d9,roughness:.81});
  const hardboard = new MeshStandardMaterial({color:0xeeeae1,roughness:.9});
  const steel = new MeshStandardMaterial({color:0x686e72,metalness:.66,roughness:.38});
  const hingeSteel = new MeshStandardMaterial({color:0x393c40,metalness:.42,roughness:.48});
  const zinc = new MeshStandardMaterial({color:0xb4b2a5,metalness:.68,roughness:.34});
  const plastic = new MeshStandardMaterial({color:0xd6d3cb,roughness:.72});
  const dowel = new MeshStandardMaterial({color:0xc3a180,roughness:.81});
  const driver = new MeshStandardMaterial({color:0x3e4d53,roughness:.81});
  const cache = new Map(), templates = new Map();
  const {footY,topY,topDepth,hingeX,hingeZ,hingeScrewX,hingeScrewZ,locatorX,locatorZ,locatorRadius,gateReach,gateZ,beamY,stile,frameRailY,plateHoles,drawer:D}=layout;
  const TAU=2*Math.PI;
  function mesh(g,key,make,material,x=0,y=0,z=0) {
    if(!cache.has(key)) cache.set(key,make());
    const m=new Mesh(cache.get(key),material);
    m.position.set(x,y,z);
    m.castShadow=m.receiveShadow=true;
    g.add(m);
    return m;
  }
  const box=(g,w,h,d,x=0,y=0,z=0,m=wood)=>mesh(g,`box/${w}/${h}/${d}`,()=>new BoxGeometry(w,h,d),m,x,y,z);
  const cyl=(g,a,b,h,x=0,y=0,z=0,m=steel,sides=24)=>mesh(g,`cyl/${a}/${b}/${h}/${sides}`,()=>new CylinderGeometry(a,b,h,sides),m,x,y,z);
  const rect=(a,b,c,d)=>[[a,c],[b,c],[b,d],[a,d]];
  function polygon(out,points) {
    points.forEach(([x,y],i)=>i?out.lineTo(x,y):out.moveTo(x,y));
    out.closePath();
    return out;
  }
  function profile(points,holes) {
    const s=polygon(new Shape(),points);
    for(const [x,y,r,ry=r,sides] of holes) {
      const h=new Path();
      if(sides) polygon(h,Array.from({length:sides},(_,i)=>[x+r*Math.cos(-i*TAU/sides),y+ry*Math.sin(-i*TAU/sides)]));
      else h.absellipse(x,y,r,ry,0,TAU,true);
      s.holes.push(h);
    }
    return s;
  }
  function extrude(g,key,shape,depth,orient,m) {
    mesh(g,key,()=>{
      const geo=new ExtrudeGeometry(shape(),{depth,bevelEnabled:false,curveSegments:16});
      orient(geo);
      return geo;
    },m);
  }
  const xy=(g,key,points,z,d,holes=[],m=wood)=>extrude(g,`xy/${key}`,()=>profile(points,holes),d,geo=>geo.translate(0,0,z),m);
  const xz=(g,key,points,y,h,holes=[],m=wood)=>extrude(g,`xz/${key}`,()=>profile(points,holes),h,geo=>geo.rotateX(Math.PI/2).translate(0,y+h,0),m);
  const yz=(g,key,points,x,w,holes=[],m=wood)=>extrude(g,`yz/${key}`,()=>profile(points,holes),w,geo=>geo.rotateZ(Math.PI/2).rotateY(Math.PI/2).translate(x,0,0),m);
  const subgroup=(g,name)=>{const node=new Group(); node.name=name; g.add(node); return node;};

  function frame(g) {
    const ladder=subgroup(g,'fixed ladder'), gate=subgroup(g,'gate');
    const e=[gateZ-361,gateZ+361], x0=(e[0]+e[1])/2, z0=-33, h=stile/2;
    for (const [i,x] of e.entries()) {
      const drill=[-14,0,14].map(d=>[x,beamY+d,d===0?3.7:4.3]);
      xz(ladder,`stile-foot-${i}`,rect(x-h,x+h,z0-h,z0+h),footY,16,[[x,z0,4.7]]);
      xy(ladder,`stile-body-${i}`,rect(x-h,x+h,20,708),z0-h,stile,drill);
      xz(ladder,`stile-head-${i}`,rect(x-h,x+h,z0-h,z0+h),708,10,[[x,z0+1,2.5]]);
    }
    for (const [i,y] of frameRailY.entries()) {
      box(ladder,684,i===3?48:36,26,x0,y,z0);
      if(i<3) box(ladder,684,9,15,x0,y+13.5,z0-16,edge);
    }
    for(const y of [102,671]) {
      box(ladder,21,13,20,0,y,-16,hingeSteel);
      cyl(ladder,5,5,20,0,y,0,steel);
    }
    const gatePost=rect(gateReach-14,gateReach+14,-14,14);
    xz(gate,'gate-foot-bottom',gatePost,footY,11,[[-7,0,3.1],[7,0,3.1]].map(([x,z,r])=>[gateReach+x,z,r]));
    box(gate,28,691,28,gateReach,360.5,0);
    xz(gate,'gate-receiver',gatePost,706,14,[[gateReach,0,5.3]]);
    box(gate,23,696,24,7,356,0);
    for(const y of [105,677]) box(gate,gateReach-31,43,22,gateReach/2+2,y,0);
  }
  function beam(g) {
    for(const s of [-1,1]) yz(g,`beam-cap-${s}`,rect(-21,21,-15,15),s===-1?-64:52,12,[[-14,0,4.3],[0,0,3.8],[14,0,4.3]]);
    const holes=[[-46,0,5.4],[46,0,5.4]];
    xz(g,'beam-core-base',rect(-52,52,-15,15),-21,17,holes);
    xz(g,'beam-core-joint',[[-52,-15],[52,-15],[52,-5.5],[40,-5.5],[40,5.5],[52,5.5],[52,15],[-52,15],[-52,5.5],[-40,5.5],[-40,-5.5],[-52,-5.5]],-4,9);
    box(g,104,16,30,0,13,0);
  }
  function board(g,leaf) {
    const w=leaf?[1,630]:[-129,129], points=rect(...w,-topDepth/2,topDepth/2);
    const holes=(leaf?[0]:[-1,1]).flatMap(s=>hingeZ.flatMap(z=>hingeScrewX.flatMap(x=>
      hingeScrewZ.map(d=>[leaf?x:s*(hingeX-x),z+d,2.5]))));
    if(!leaf) for(const z of [-layout.plateZ,layout.plateZ]) for(const x of plateHoles.slice(1,-1)) holes.push([x,z,2.5]);
    const lower=leaf?4:-10;
    xz(g,`top-pilots-${leaf}`,points,lower,11,holes);
    xz(g,`top-finish-${leaf}`,points,lower+11,9);
    if(leaf) {
      cyl(g,locatorRadius,locatorRadius,11,locatorX,-1.5,locatorZ,dowel);
      cyl(g,locatorRadius,locatorRadius-1,1,locatorX,-7.5,locatorZ,dowel);
    }
  }
  function hinge(g) {
    for(const s of [-1,1]) {
      const side=s===-1?subgroup(g,'fixed flange'):g, xs=hingeScrewX.map(x=>s*x);
      const flange=s===-1?[-29,-3]:[3,29];
      xz(side,`hinge-flange-${s}`,rect(...flange,-15,15),2.5,1.5,xs.flatMap(x=>hingeScrewZ.map(z=>[x,z,2.6])),hingeSteel);
      const zs=s===-1?[-10,10]:[0];
      for(const z of zs) cyl(side,3.7,3.7,s===-1?9:10,0,0,z,hingeSteel).rotation.x=Math.PI/2;
    }
    cyl(g,2.3,2.3,33,0,0,0,steel).rotation.x=Math.PI/2;
  }
  function sidePanel(g,s) {
    const h=D.halfHeight, low=D.bottomY-2.7, high=D.bottomY+2.7;
    const back=-179, end=159, upper=166, outside=s===-1?-6:3, inside=s===-1?-3:-6;
    const pinHoles=D.fastY.map(y=>[y,D.backZ,2.8]), cams=D.fastY.map(y=>[y,D.camZ,6.6]);
    yz(g,`side-core-${s}`,rect(-h,h,back,end),outside,3,pinHoles,wood);
    yz(g,`side-groove-lip-${s}`,rect(-h,low,back,end),inside,9,[],edge);
    yz(g,`side-inner-${s}`,rect(high,h,back,end),inside,9,[...pinHoles,...cams]);
    xy(g,`side-front-pilots-${s}`,rect(-6,6,high,h),end,upper-end,
      [...D.fastY.map(y=>[0,y,3]),[0,D.dowelY,3.3]]);
    xy(g,`side-front-lip-${s}`,rect(-6,6,-h,low),end,upper-end);
    xy(g,`side-front-groove-${s}`,rect(outside,outside+3,low,high),end,upper-end);
  }
  function drawerBack(g) {
    const h=D.halfHeight, low=D.bottomY-2.7, high=D.bottomY+2.7;
    yz(g,'rear-lower',rect(-h,low,-6,6),-50,100,[],edge);
    yz(g,'rear-core',rect(low,high,-6,0),-50,100);
    yz(g,'rear-upper',rect(high,h,-6,6),-50,100,D.fastY.map(y=>[y,0,2.8]));
  }
  function drawerFront(g) {
    const w=D.halfWidth, h=D.halfHeight, points=y=>[[-w,y],[w,y],[w,h],[14,h],[11,h-22],[8,h-25],[-8,h-25],[-11,h-22],[-14,h],[-w,h]];
    const holes=[-1,1].flatMap(s=>[...D.fastY.map(y=>[s*D.sideX,y,3.1]),[s*D.sideX,D.dowelY,3.3]]);
    xy(g,'drawer-front-face',points(-h),1,9);
    xy(g,'drawer-front-pilot-outer',rect(-w,w,-h,D.bottomY-2.7),-10,4,[],edge);
    xy(g,'drawer-front-pilot-inner',points(D.bottomY+2.7),-10,4,holes);
    xy(g,'drawer-front-pilot-mid',points(-h),-6,7,holes);
  }
  function threaded(g,key,tip,head,threadEnd,pitch,root,crest) {
    mesh(g,key,()=>{
      const rings=[new Vector2(0,tip),new Vector2(root*.74,tip)];
      for(let y=tip+.45;y+pitch*.72<threadEnd;y+=pitch) {
        rings.push(new Vector2(root,y),new Vector2(crest,y+pitch*.34),new Vector2(root,y+pitch*.72));
      }
      rings.push(new Vector2(root,head),new Vector2(0,head));
      return new LatheGeometry(rings,16);
    },zinc);
  }
  function countersunk(g,long=false) {
    const r=long?6.4:4.2, d=long?62:11;
    const top=Array.from({length:24},(_,i)=>[r*Math.cos(i*TAU/24),r*Math.sin(i*TAU/24)]);
    xz(g,`screw-head-${long}`,top,-.8,.8,[[0,0,long?2.55:1.65,long?2.55:1.65,long?6:4]],long?zinc:steel);
    cyl(g,r,2.1,long?2.8:2,0,long?-2.2:-1.8,0,long?zinc:steel);
    threaded(g,`screw-thread-${long}`,-d,-2.3,long?-37:-3,long?2.7:1.25,long?2.85:1.8,long?3.5:2.2);
    if(!long) for(const a of [-1,1]) box(g,4.9,.32,.6,0,-.58,0,hingeSteel).rotation.y=a*Math.PI/4;
  }
  function dowelPiece(g,long) {
    const r=long?4:3, h=long?34:24;
    mesh(g,`fluted-dowel-${long}`,()=>{
      const outline=Array.from({length:30},(_,i)=>{
        const radius=i%3===0?r-.53:r-.22;
        return [radius*Math.cos(i*TAU/30),radius*Math.sin(i*TAU/30)];
      });
      return new ExtrudeGeometry(profile(outline,[]),{depth:h-2,bevelSize:.24,bevelThickness:1,bevelSegments:1})
        .rotateX(Math.PI/2).translate(0,(h-2)/2,0);
    },dowel);
  }
  function barrel(g) {
    cyl(g,5,5,15,0,-7.5,0,zinc);
    yz(g,'barrel-thread-port',[[-27,-2.7],[-25,-4.75],[-15,-4.75],[-15,4.75],[-25,4.75],[-27,2.7]],
      -4.7,9.4,[[-21,0,3.5]],zinc);
    box(g,8,.48,1.05,0,.24,0,hingeSteel);
  }
  function make(g,key) {
    switch(key) {
      case 'frame':frame(g);break;
      case 'crossblock':beam(g);break;
      case 'leaf':board(g,true);break;
      case 'center':board(g,false);break;
      case 'hinge':hinge(g);break;
      case 'plate':xz(g,'mounting-strip',rect(-92.5,92.5,-11,11),0,2,plateHoles.map((x,i)=>[x,0,i===1||i===3?6.3:2.6,2.6]),steel);break;
      case 'longBolt':countersunk(g,true);break;
      case 'shortScrew':countersunk(g);break;
      case 'longDowel':case 'shortDowel':dowelPiece(g,key==='longDowel');break;
      case 'barrel':barrel(g);break;
      case 'stud':
        cyl(g,2.6,2.6,11,0,-5.5,0,zinc); cyl(g,3.2,3.2,11,0,5.5,0,plastic);
        cyl(g,2.05,2.05,4,0,13,0,steel); cyl(g,3.5,3.5,2.7,0,16.3,0,zinc); break;
      case 'tapPin':
        threaded(g,'hammer-pin-stem',-23,0,-7,1.8,1.95,2.65);
        cyl(g,3.8,3.8,2,0,1,0,zinc); break;
      case 'cam':
        cyl(g,6.35,6.35,8,0,-4,0,zinc);
        box(g,9,.4,1.15,0,.2,0,hingeSteel); box(g,1.15,.4,6,0,.2,0,hingeSteel); break;
      case 'glide':
        cyl(g,9.3,9.3,4,0,2,0,plastic); cyl(g,4.1,3.5,8,0,-4,0,plastic,8);break;
      case 'gateGlide':
        xz(g,'gate-glide',[[-13,-6],[-11,-8],[11,-8],[13,-6],[13,6],[11,8],[-11,8],[-13,6]],0,4,[],plastic);
        for(const x of [-7,7]) cyl(g,2.9,2.36,8,x,-4,0,plastic,12);
        break;
      case 'drawerL':case 'drawerR':sidePanel(g,key==='drawerL'?-1:1);break;
      case 'drawerBack':drawerBack(g);break;
      case 'drawerFront':drawerFront(g);break;
      case 'drawerBottom':box(g,114,4,340,0,0,0,hardboard);break;
      case 'hex':
        cyl(g,3.1,3.1,53,-16,0,-3,steel,6).rotation.x=Math.PI/2;
        cyl(g,3.1,3.1,35,.7,0,22,steel,6).rotation.z=Math.PI/2;
        break;
      case 'driver':
        cyl(g,14,10,31,0,16,0,driver,14); cyl(g,13,13,5,0,-1,0,driver,12);
        cyl(g,3,3,25,0,-15,0,zinc,10); cyl(g,3,0,6,0,-30,0,zinc,4);break;
    }
  }
  return {
    instantiate({shape}) {
      if(!templates.has(shape)) {
        const template=new Group();
        make(template,shape);
        templates.set(shape,template);
      }
      const node=templates.get(shape).clone(true);
      // Counter-rotate only the fixed half; the moving half and its fittings share the timeline pivot.
      if(shape==='frame') {
        const fixed=node.getObjectByName('fixed ladder');
        node.userData.setCaptive=value=>{fixed.rotation.y=-value;};
      } else if(shape==='hinge') {
        const fixed=node.getObjectByName('fixed flange');
        node.userData.setCaptive=value=>{fixed.rotation.z=-value;};
      }
      return node;
    },
    dispose() {
      for(const geo of cache.values()) geo.dispose();
      for(const m of [wood,edge,hardboard,steel,hingeSteel,zinc,plastic,dowel,driver]) m.dispose();
    }
  };
}
