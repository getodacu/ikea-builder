import { BoxGeometry, CylinderGeometry, ExtrudeGeometry, Group, Mesh, MeshStandardMaterial, Path, Quaternion, Shape, Vector3 } from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { capPins, lift, shapes, slatRows } from './kit.js';

export function createGeometry() {
  const wood=new MeshStandardMaterial({color:0xf3f0e9,roughness:.8});
  const edge=new MeshStandardMaterial({color:0xe5e2d8,roughness:.76});
  const metal=new MeshStandardMaterial({color:0x9ba2a6,roughness:.47,metalness:.68});
  const paint=new MeshStandardMaterial({color:0xe4e4dc,roughness:.49,metalness:.28});
  const dark=new MeshStandardMaterial({color:0x3d4149,roughness:.64,metalness:.15});
  const rubber=new MeshStandardMaterial({color:0x5d6562,roughness:.92});
  const slatWood=new MeshStandardMaterial({color:0xc6a878,roughness:.8});
  const floor=new MeshStandardMaterial({color:0xc9c3b6,roughness:.87});
  const fabric=new MeshStandardMaterial({color:0xc2c9d3,roughness:.96});
  const materials=[wood,edge,metal,paint,dark,rubber,slatWood,floor,fabric];
  const geometries=new Map();
  const pi=Math.PI, uX=new Vector3(1,0,0), uY=new Vector3(0,1,0);
  const rx=a=>new Quaternion().setFromAxisAngle(uX,a), ry=a=>new Quaternion().setFromAxisAngle(uY,a);
  const v=(...p)=>new Vector3(...p);

  function mesh(group,key,make,material,x=0,y=0,z=0) {
    if(!geometries.has(key)) geometries.set(key,make());
    const node=new Mesh(geometries.get(key),material);
    node.position.set(x,y,z); node.castShadow=true; node.receiveShadow=true; group.add(node);
    return node;
  }
  const box=(g,w,h,d,x=0,y=0,z=0,m=wood)=>mesh(g,`box/${w}/${h}/${d}`,()=>new BoxGeometry(w,h,d),m,x,y,z);
  const cyl=(g,a,b,h,x=0,y=0,z=0,m=metal,n=20)=>mesh(g,`cyl/${a}/${b}/${h}/${n}`,()=>new CylinderGeometry(a,b,h,n),m,x,y,z);
  function outline(points,holes) {
    const shape=new Shape();
    shape.moveTo(...points[0]);
    for(const point of points.slice(1)) shape.lineTo(...point);
    shape.closePath();
    for(const [x,y,r] of holes) {
      const hole=new Path(); hole.absarc(x,y,r,0,2*pi,true); shape.holes.push(hole);
    }
    return shape;
  }
  const extrude=(shape,depth)=>new ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:12});
  function skin(g,key,w,h,d,holes,m,at,q=new Quaternion()) {
    mesh(g,`skin/${key}`,()=>{
      const x=w/2,y=h/2;
      const geo=extrude(outline([[-x,-y],[x,-y],[x,y],[-x,y]],holes),d);
      geo.translate(0,0,-d); geo.applyQuaternion(q); geo.translate(...at);
      const normal=v(0,0,1).applyQuaternion(q).toArray(), offset=v(...at);
      geo.userData.mouths=holes.map(([a,b,r])=>({point:v(a,b,0).applyQuaternion(q).add(offset).toArray(),normal,radius:r}));
      return geo;
    },m);
  }
  function ring(g,outer,inner,height,m=metal) {
    mesh(g,`ring/${outer}/${inner}/${height}`,()=>{
      const profile=new Shape(), hole=new Path();
      profile.absarc(0,0,outer,0,2*pi,false); hole.absarc(0,0,inner,0,2*pi,true); profile.holes.push(hole);
      const geo=extrude(profile,height); geo.rotateX(-pi/2); geo.translate(0,-height/2,0); return geo;
    },m);
  }
  const slatSockets=slatRows.flatMap(z=>capPins.map(pin=>[0,-z-pin,2.7]));
  const carriageSockets=lift.mounts.map(z=>[0,-z,5.8]);
  function rail(g,shape,w,d) {
    const outer=shape==='outerRail';
    skin(g,`${shape}/top`,w,d,3,outer?[...slatSockets,...carriageSockets]:slatSockets,paint,[0,14,0],rx(-pi/2));
    skin(g,`${shape}/bottom`,w,d,3,outer?lift.mounts.map(z=>[0,z,5.8]):[],paint,[0,-14,0],rx(pi/2));
    for(const s of [-1,1]) {
      const sideHoles=[-800,-580,-372,-144].map(z=>[-s*z,0,3.4]);
      skin(g,`${shape}/side/${s}`,d,22,3,sideHoles,paint,[s*w/2,0,0],ry(s*pi/2));
    }
  }
  function endRail(g,id) {
    const foot=id==='deckFoot', positions=[-650,-12,12,650];
    const fastenerHoles=positions.map(x=>[x,0,5.5]);
    const hoopHoles=[[-326,0,4],[326,0,4]];
    for(const s of [-1,1]) {
      const tag=s===(foot?1:-1)?[...hoopHoles,...(foot?[[-34,-5,2.6],[34,-5,2.6]]:[])]:[];
      skin(g,`${id}/face/${s}`,1330,28,3,[...fastenerHoles,...tag],paint,[0,0,s*14],ry(s===1?0:pi));
    }
    const inset=[[-22,6,2.2],[22,6,2.2],[-38,-4,2.4],[38,-4,2.4]];
    skin(g,`${id}/top`,1330,22,3,foot?[...inset,[-19,0,4],[19,0,4]]:inset,paint,[0,14,0],rx(-pi/2));
    box(g,1330,3,22,0,-12.5,0,paint);
  }
  const angleOf=q=>-2*Math.atan2(q.x,q.w);
  function rod(g,width,depth,m=metal) { return box(g,width,1,depth,0,0,0,m); }
  function between(node,a,b,delta) {
    delta.subVectors(b,a);
    node.scale.y=delta.length();
    node.position.copy(a).lerp(b,.5);
    node.quaternion.setFromUnitVectors(uY,delta.normalize());
  }
  function linkage(g,s) {
    const base=new Group(); g.add(base);
    box(base,51,7,503,0,-184,272,metal);
    for(const k of [-1,1]) {
      const wallHoles=[[-202,-3,8],[203,-3,8],[-160,9,3.7],[-90,9,3.7],[-15,9,3.7],[89,9,3.7],[170,9,3.7]];
      skin(base,`base/${k}`,503,45,4,wallHoles,metal,[22*k,-161,273],ry(k*pi/2));
    }
    box(base,11,10,422,s*18,-133,270,dark);
    const [x,y,z]=lift.upper;
    skin(g,'upper lift bores',29,480,5,lift.mounts.map(a=>[0,-a+lift.z+z,6]),metal,[x,y+8,z],rx(-pi/2));
    box(g,29,5,480,x,y-6,z,metal);
    for(const k of [-1,1]) box(g,4,9,480,k*12.5,y,z,metal);
    const links=[rod(g,12,27),rod(g,12,27)];
    const starts=[v(s*10,-165,98),v(s*10,-174,465)], ends=[v(s*10,-30,100),v(s*10,-30,335)];
    const guards=[];
    for(let i=0;i<3;i++) {
      const guard=new Group(); guard.position.set(s*(14+i*3),-26,232); g.add(guard);
      mesh(guard,`guard/${s}/${i}`,()=>{
        const broad=62+i*14, length=237-i*9, notch=i===1 ? (s===1?17:31) : 24;
        const holes=i===1?[[34,-11,4]]:[[34,-11,4],[length-23,-broad+16,4]];
        const p=[[0,0],[length,0],[length+6,-broad],[length-33,-broad-8],[length-notch-40,-33],[24,-19],[0,-15]];
        const geo=extrude(outline(p,holes),3); geo.rotateY(-pi/2); return geo;
      },i===1?paint:edge);
      guards.push(guard);
    }
    const turn=new Quaternion(), point=new Vector3(), delta=new Vector3();
    let last;
    g.userData.setCaptive=()=>{
      const angle=angleOf(g.quaternion);
      if(angle===last) return;
      last=angle; base.rotation.x=angle;
      turn.setFromAxisAngle(uX,angle);
      for(let i=0;i<2;i++) between(links[i],point.copy(starts[i]).applyQuaternion(turn),ends[i],delta);
      for(let i=0;i<3;i++) guards[i].rotation.x=-(.08+.48*i)*angle;
    };
    g.userData.adjustBounds=b=>{ b.min.set(-36,-436,-45); b.max.set(36,7,565); };
    g.userData.setCaptive();
  }
  function strut(g) {
    const sleeve=cyl(g,12,12,1,0,0,0,dark), piston=cyl(g,5,5,1), eye=cyl(g,13,13,11,0,0,0,dark);
    const top=v(...lift.springTop), fixed=v(...lift.lower), free=v(...lift.loose);
    const anchor=cyl(g,12,12,10,...lift.springTop,dark);
    anchor.rotation.z=eye.rotation.z=pi/2;
    const turn=new Quaternion(), lower=new Vector3(), midpoint=new Vector3(), delta=new Vector3();
    let lastAngle,lastLatch;
    g.userData.setCaptive=value=>{
      const angle=angleOf(g.quaternion), latch=Math.min(1,Math.max(0,value-1));
      if(angle===lastAngle && latch===lastLatch) return;
      lastAngle=angle; lastLatch=latch;
      lower.copy(free).lerp(fixed,latch).applyQuaternion(turn.setFromAxisAngle(uX,angle));
      eye.position.copy(lower);
      const shellLength=Math.min(154,top.distanceTo(lower)*.7);
      midpoint.copy(top).addScaledVector(delta.subVectors(lower,top).normalize(),shellLength);
      between(sleeve,top,midpoint,delta);
      between(piston,midpoint,lower,delta);
    };
    g.userData.adjustBounds=b=>{ b.min.set(-17,-405,87); b.max.set(17,0,490); };
    g.userData.setCaptive(0);
  }
  function tool(g,shape) {
    if(shape==='wrench') {
      box(g,10,115,4,0,0,0,metal);
      const top=new Group(); top.position.y=62; top.rotation.x=pi/2; g.add(top); ring(top,11,6,4);
      for(const s of [-1,1]) box(g,5.5,19,4,s*7.8,-62,0,metal);
      return;
    }
    cyl(g,3.6,3.6,83,0,0,0,metal,6);
    const end=cyl(g,3.6,3.6,38,15,40,0,metal,6); end.rotation.z=pi/2;
    if(shape==='offsetKey') cyl(g,3.6,3.6,24,-8,-38,0,metal,6).rotation.z=pi/2;
  }
  function latch(g) {
    box(g,54,3,45,0,7,6,metal);
    for(const s of [-1,1]) box(g,5,12,38,s*25,2,4,metal);
    const pin=cyl(g,5,5,23,0,-3,27); pin.rotation.x=pi/2;
    const loose=box(g,24,3,62,0,4,-34,dark);
    const tongue=box(g,24,3,48,0,12,22,dark); tongue.rotation.x=-.48;
    g.userData.setCaptive=t=>{
      pin.position.z=27+8*Math.max(0,1-Math.abs(t-4));
      loose.rotation.x= -.6*(1-Math.min(1,t*.5));
      loose.position.y=4-12*(1-Math.min(1,t*.5));
      tongue.position.z=22+6*Math.max(0,1-Math.abs(t-3));
    };
  }
  function create(g,{id,shape}) {
    const [w,h,d]=shapes[shape];
    switch(shape) {
      case 'outerRail':case 'centerRail': rail(g,shape,w,d); break;
      case 'endRail':endRail(g,id); break;
      case 'liftL':case 'liftR': linkage(g,shape==='liftL'?1:-1); break;
      case 'strut': strut(g); break;
      case 'side': {
        const s=id==='sideL'?1:-1;
        box(g,57,h,d,s*6.5,0,0);
        const holes=[...[-630,-210,210,630].map(z=>[s*z,153,8.5]),...[-912,912].map(z=>[s*z,10,19.7])];
        for(const [y,z,r] of [[38,-406,6],[16,-426,8],[16,-805,8],[138,113,3],[138,87,3],[159,113,3],[159,87,3]]) holes.push([s*z,y,r]);
        skin(g,id,d,h,13,holes,wood,[-s*35,0,0],ry(-s*pi/2));
        break;
      }
      case 'endBoard': {
        const s=id==='headBase'?1:-1;
        box(g,w,h,27,0,0,-s*6.5);
        const fits=[[-715,0,4],[715,0,4],[-13,128,3],[13,128,3],[-13,149,3],[13,149,3]];
        for(const x of [-715,715]) {
          for(const y of [-125,116]) fits.push([x,y,4.5]);
          fits.push([x-14,174,4.5],[x+14,174,4.5]);
        }
        if(s>0) for(const x of [-530,-175,175,530]) fits.push([x,139,18]);
        else for(const x of [-21,21]) for(const y of [105,143]) fits.push([x,y,3]);
        skin(g,id,w,h,13,fits,wood,[0,0,s*20],ry(s===1?0:pi));
        break;
      }
      case 'headboard': {
        box(g,w,h-25,d,0,12.5,0);
        const holes=[...[-650,-325,0,325,650].map(x=>[x,0,5.4]),...[-530,-175,175,530].map(x=>[x,0,4.8])];
        skin(g,'head-dowels',w,d,25,holes,wood,[0,-h/2,0],rx(pi/2));
        break;
      }
      case 'cap':box(g,w,h,d,0,0,0,edge); break;
      case 'corner':
        box(g,w,4,d,0,-h/2+2,0,metal);
        box(g,w,h,4,0,0,-d/2+2,metal); box(g,4,h,d,-w/2+2,0,0,metal);
        box(g,16,h-20,7,-4,0,-18,metal); box(g,7,h-20,16,-18,0,-4,metal);
        break;
      case 'rest':
        box(g,40,h,3,0,0,-4,metal); box(g,w,4,33,0,17,13,metal);
        box(g,16,12,24,0,12,10,dark); break;
      case 'strike':
        box(g,w,8,3,0,-25,-7,metal); box(g,w,8,3,0,23,-7,metal);
        box(g,w,55,4,0,0,5,metal).rotation.x=-.27; break;
      case 'brace':box(g,w,h,d,0,0,0,paint); break;
      case 'retainer': {
        cyl(g,4,4,w-18,0,32,-9,paint).rotation.z=pi/2;
        for(const s of [-1,1]) cyl(g,4,4,70,s*(w/2-9),-1,-6,paint).rotation.x=-.12;
        break;
      }
      case 'slat': mesh(g,shape,()=>{
        const x=w/2,p=new Shape();
        p.moveTo(-x,2); p.quadraticCurveTo(0,22,x,2); p.lineTo(x,-5); p.quadraticCurveTo(0,15,-x,-5); p.closePath();
        const geo=extrude(p,d); geo.translate(0,0,-d/2); return geo;
      },slatWood); break;
      case 'slatCap':
        box(g,w,4,d,0,-5,0,dark); box(g,8,10,d,-8,0,0,rubber);
        for(const s of [-1,1]) box(g,w,9,3,0,1,s*18,rubber);
        for(const z of capPins) cyl(g,2.4,2.2,7,0,-9,z,rubber,12);
        break;
      case 'floorEdge': mesh(g,shape,()=>{
        const x=w/2,z=d/2,c=51;
        const geo=extrude(outline([[-x+c,z],[x-c,z],[x,z-c],[x,-z],[-x,-z],[-x,z-c]],[]),h);
        geo.rotateX(-pi/2); geo.translate(0,-h/2,0); return geo;
      },floor); break;
      case 'floorCenter':box(g,w,h,d,0,0,0,floor); break;
      case 'mattress':mesh(g,shape,()=>new RoundedBoxGeometry(w,h,d,3,41),fabric); break;
      case 'latch':latch(g); break;
      case 'keeper':
        box(g,w,3,d,0,-4,0,metal); box(g,25,4,17,0,4,0,metal);
        for(const s of [-1,1]) box(g,4,8,17,s*12,1,0,metal);
        break;
      case 'glide':cyl(g,w*.49,w*.43,h,0,0,0,rubber); break;
      case 'pad':cyl(g,w/2,w/2,h,0,0,0,rubber); break;
      case 'cam':case 'endCam': {
        cyl(g,w/2,w*.42,h,0,-h*.26,0,metal);
        box(g,w*.61,1.4,w*.12,0,h*.26,0,dark);
        box(g,w*.12,1.4,w*.61,0,h*.26,0,dark);
        break;
      }
      case 'sleeve':case 'liftBoss':case 'bushing':case 'nut':
        ring(g,w/2,w*.27,h,metal); break;
      case 'nutClip':
        box(g,w,h,4,0,0,-8,rubber);
        for(const s of [-1,1]) box(g,4,h,d-3,s*(w/2-2),0,1,rubber);
        break;
      case 'dowel':case 'bigDowel':cyl(g,w*.5,w*.5,h,0,0,0,slatWood,12); break;
      case 'stud':case 'headStud':case 'trimStud':
        cyl(g,w*.44,w*.44,h,0,0,0,metal);
        cyl(g,w*.56,w*.56,3,0,h/2,0,metal); break;
      case 'key':case 'offsetKey':case 'wrench':tool(g,shape); break;
      default: {
        cyl(g,w*.31,w*.25,h-5,0,-h*.44,0,metal,14);
        cyl(g,w*.49,w*.44,5,0,2,0,metal,20);
        box(g,w*.47,.6,w*.07,0,4.56,0,dark);
        box(g,w*.07,.6,w*.47,0,4.56,0,dark);
      }
    }
  }
  return {
    instantiate(p) { const group=new Group(); create(group,p); return group; },
    dispose() { for(const geometry of geometries.values()) geometry.dispose(); for(const material of materials) material.dispose(); }
  };
}
