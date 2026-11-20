import {
  BoxGeometry, BufferGeometry, CatmullRomCurve3, CubicBezierCurve3, CylinderGeometry, DoubleSide, ExtrudeGeometry,
  Float32BufferAttribute, Group, LatheGeometry, Mesh, MeshStandardMaterial, Path, Shape, TubeGeometry, Vector2, Vector3
} from 'three';
import { frame, shapes } from './kit.js';

const {PI}=Math, half=PI/2;
const sides=[-1,1];
const {sideX,armWidth,railWidth,halfSpan,backOrigin,seatOrigin,armOrigin,slats,splice,armScrew,frontPin,
  ties,tabDepth,tabHalfWidth,tabHalfHeight,braceX,nutX,bracePins,braces,arm}=frame;
const [by,bz]=backOrigin, [sy,sz]=seatOrigin, [ay,az]=armOrigin;
const rect=(w,h)=>[[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]];
const v=(y,z)=>new Vector3(0,y,z);

export function createGeometry() {
  const material=(color,roughness=.65,metalness=0)=>new MeshStandardMaterial({color,roughness,metalness});
  const birch=material(0xd9af76), face=material(0xe2bb85), layer=material(0xbf8d54), tieWood=material(0xd2a46d),
    fabric=new MeshStandardMaterial({color:0x888278,roughness:1,side:DoubleSide}),
    seam=new MeshStandardMaterial({color:0x69645c,roughness:1,side:DoubleSide}), strip=material(0x817967,.96),
    steel=material(0x879096,.39,.68), dark=material(0x34373a,.63,.24), rubber=material(0x35322d,.91);
  const materials=[birch,face,layer,tieWood,fabric,seam,strip,steel,dark,rubber];
  const cache=new Map(), geometries=new Set();
  function mesh(g,geo,mat,x=0,y=0,z=0) {
    geometries.add(geo);
    const node=new Mesh(geo,mat); node.position.set(x,y,z); node.castShadow=true; node.receiveShadow=true; g.add(node);
    return node;
  }
  const box=(g,w,h,d,x,y,z,m=birch)=>mesh(g,new BoxGeometry(w,h,d),m,x,y,z);
  const cylinder=(g,r,h,x,y,z,m=steel,s=22)=>mesh(g,new CylinderGeometry(r,r,h,s),m,x,y,z);
  function outline(points,depth,holes=[]) {
    const poly=new Shape(points.map(pt=>new Vector2(...pt)));
    for(const [x,y,r] of holes) poly.holes.push(new Path().absarc(x,y,r,0,2*PI,true));
    return new ExtrudeGeometry(poly,{depth,bevelEnabled:false,curveSegments:16}).translate(0,0,-depth/2);
  }
  function plate(g,w,h,d,x,y,z,holes=[],axis='z',m=birch) {
    const node=mesh(g,outline(rect(w,h),d,holes),m,x,y,z);
    if(axis==='y') node.rotation.x=-half;
    if(axis==='x') node.rotation.y=-half;
    return node;
  }
  function ribbon(points,thickness) {
    const edges=[[],[]];
    for(const [i,[x,y]] of points.entries()) {
      const a=points[Math.max(i-1,0)], b=points[Math.min(i+1,points.length-1)];
      const dx=b[0]-a[0], dy=b[1]-a[1], n=thickness/(2*Math.hypot(dx,dy));
      sides.forEach((s,j)=>edges[j].push([x-s*dy*n,y+s*dx*n]));
    }
    return edges[0].concat(edges[1].reverse());
  }
  function sideProfile(g,points,w,t,x,m=birch,holes=[]) {
    const path=points.map(([y,z])=>[z,y]);
    const node=mesh(g,outline(ribbon(path,t),w,holes.map(([y,z,r])=>[z,y,r])),m,x);
    node.rotation.y=-half;
    return node;
  }
  function curved(points,count=32) {
    return new CatmullRomCurve3(points.map(([y,z])=>v(y,z)),false,'centripetal').getPoints(count).map(({y,z})=>[y,z]);
  }
  function bendBetween(g,[y,z,a],[yy,zz,b],t=20) {
    const start=v(y-by,z-bz), end=v(yy-by,zz-bz), span=start.distanceTo(end)/3;
    const curve=new CubicBezierCurve3(start,start.clone().addScaledVector(v(Math.cos(a),Math.sin(a)),span),
      end.clone().addScaledVector(v(Math.cos(b),Math.sin(b)),-span),end);
    sideProfile(g,curve.getPoints(12).map(k=>[k.y,k.z]),railWidth,t,0);
  }
  function register(g,mouths) { g.children[0].geometry.userData.mouths=mouths; }
  const mouth=(point,normal,radius)=>({point,normal,radius});
  function makeStile(g,s) {
    const [y0,z0]=splice;
    plate(g,railWidth,24,12,0,y0-by,z0-bz-6,[[0,0,4.3]]);
    const stations=[...slats.map(([y,z,a])=>[y,z,a,false]),[...armScrew,true]].sort((a,b)=>a[0]-b[0]);
    const mouths=[];
    let from=[y0+12,z0,0];
    for(const [y,z,a,isArm] of stations) {
      const r=isArm?13:14, offset=d=>[y+d*Math.cos(a),z+d*Math.sin(a),a];
      bendBetween(g,from,offset(-r));
      from=offset(r);
      if(isArm) {
        sideProfile(g,[offset(-r),from].map(([yy,zz])=>[yy-by,zz-bz]),railWidth,20,0,birch,[[y-by,z-bz,4.8]]);
        mouths.push(mouth([s*10,y-by,z-bz],[s,0,0],4.8));
      } else {
        const station=new Group(); station.position.set(0,y-by,z-bz); station.rotation.x=a; g.add(station);
        plate(station,20,28,6.8,0,0,6.6,[[-s*4,0,3.5]],'z',face);
        box(station,20,28,6.8,0,0,-6.6);
        for(const k of sides) box(station,20,3.3,6.4,0,k*12.35,0);
        box(station,6.5,21.4,6.4,s*6.75,0,0);
        mouths.push(mouth([-s*4,y-by-10*Math.sin(a),z-bz+10*Math.cos(a)],[0,-Math.sin(a),Math.cos(a)],3.5));
      }
    }
    bendBetween(g,from,[940,-397,0]);
    register(g,mouths);
  }
  function bow(g,w,height,sag,t,m,axis='z') {
    const samples=Array.from({length:31},(_,i)=>{
      const u=(i-15)/15;
      return [w*u/2,-sag*(1-u*u)];
    });
    const body=mesh(g,outline(ribbon(samples,t),height),m);
    if(axis==='z') body.rotation.x=half;
    return body;
  }
  function makeSlat(g,id) {
    const i=Number(id.at(-1))-1, height=slats[i][3];
    // The top slat is shallower where the stiles reach the rear of the article envelope.
    const sag=[19,19,19,8.5][i];
    bow(g,2*halfSpan,height,sag,8,face);
    for(const s of sides) plate(g,12,20,5,s*(halfSpan+6),0,0,[[0,0,3.2]],'z',tieWood);
    if(id==='slat3') {
      const span=halfSpan*1.92;
      const ratio=span/(2*halfSpan);
      bow(g,span,18,sag*ratio**2,1.8,strip).position.z=sag*(ratio**2-1)+4.2;
    }
  }
  function seatSocket(g,s,y,z,extent) {
    const x=s*sideX, gap=tabHalfWidth+1.6;
    plate(g,20,extent*2,6.4,x,y+7.8,z,[[0,0,4.6]],'y',face);
    for(const end of sides) box(g,20,15.6,extent-gap,x,y-3.2,z+end*(extent+gap)/2);
    box(g,1.6,15.6,2*gap,x+s*9.2,y-3.2,z);
    if(s===1) box(g,18.4,6.4,2*gap,x-.8,y-7.8,z);
  }
  function seatFabric(g,minX,maxX,m,raise) {
    const vertices=[], indices=[], nx=24, nz=22;
    for(let j=0;j<=nz;j++) for(let i=0;i<=nx;i++) {
      const u=minX+(maxX-minX)*i/nx, t=j/nz, z=-100+505*t;
      vertices.push(u,322+35*t-(19+6*Math.sin(PI*t))*(1-(u/halfSpan)**2)+raise-sy,z-sz);
    }
    for(let j=0;j<nz;j++) for(let i=0;i<nx;i++) {
      const n=j*(nx+1)+i;
      indices.push(n,n+nx+1,n+1,n+1,n+nx+1,n+nx+2);
    }
    const geo=new BufferGeometry(); geo.setAttribute('position',new Float32BufferAttribute(vertices,3)); geo.setIndex(indices); geo.computeVertexNormals();
    mesh(g,geo,m);
  }
  function makeSeat(g) {
    const [yy,zz]=splice, [[a,b],[c,d]]=ties, [py,pz]=frontPin;
    const mouths=[];
    for(const s of sides) {
      const x=s*sideX, profile=points=>points.map(([y,z])=>[y-sy,z-sz]);
      plate(g,20,24,12,x,yy-sy,zz-sz+6,[[0,0,4.8]],'z',face);
      sideProfile(g,curved(profile([[yy-12,zz+3],[353,-139],[323,-125],[a,-109],[a,b-15]])),20,22,x);
      seatSocket(g,s,a-sy,b-sz,15);
      sideProfile(g,curved(profile([[a,b+15],[a,b+20],[321,26],[333,249],[c,d-17],[c,d-12]])),20,22,x);
      seatSocket(g,s,c-sy,d-sz,12);
      sideProfile(g,profile([[c,d+12],[c,409.5]]),20,22,x,birch,[[py-sy,pz-sz,4.55]]);
      for(const [y,z] of ties) mouths.push(mouth([x,y-sy+11,z-sz],[0,1,0],4.6));
      mouths.push(mouth([x,yy-sy,zz-sz+12],[0,0,1],4.8),mouth([x+s*10,py-sy,pz-sz],[s,0,0],4.55));
    }
    seatFabric(g,-halfSpan,halfSpan,fabric,0);
    for(const s of sides) seatFabric(g,s*halfSpan-1.7,s*halfSpan+1.7,seam,.45);
    register(g,mouths);
  }
  function makeTie(g) {
    bow(g,halfSpan*2,22,19,9,tieWood,'y');
    for(const s of sides) plate(g,tabDepth,2*tabHalfWidth,2*tabHalfHeight,s*(halfSpan+tabDepth/2),0,0,
      [[s*(sideX-halfSpan-tabDepth/2),0,4.25]],'y',tieWood);
  }
  function makeArm(g,s) {
    const path=curved(arm.map(([y,z])=>[y-ay,z-az]),80);
    const bolts=[armScrew,...braces.map(([,y,z])=>[y,z])].map(([y,z])=>[y-ay,z-az,4.75]);
    const pinHoles=braces.flatMap(([,y,z,a])=>sides.map(k=>[y-ay+k*bracePins*Math.cos(a),z-az+k*bracePins*Math.sin(a),3.15]));
    sideProfile(g,path,10,24,-s*13,birch,[...bolts,...pinHoles,[frontPin[0]-ay,frontPin[1]-az,4.6]]);
    sideProfile(g,path,2,24,-s*7,layer,bolts);
    sideProfile(g,path,22,24,s*5,face,bolts);
    sideProfile(g,path,2,24,s*17,birch,bolts.map(([y,z])=>[y,z,6.7]));
    box(g,20,6,26,-s*6,3-ay,314-az,rubber);
    register(g,bolts.map(([y,z])=>mouth([s*armWidth/2,y,z],[s,0,0],6.7)));
  }
  function makeBrace(g,h) {
    const shelf=9, split=nutX+shelf;
    box(g,2*(nutX-shelf),h,22,0,0,0,face);
    for(const s of sides) {
      // The transverse screw and face-loaded barrel share the pocket in the core.
      plate(g,2*shelf,h,5,s*nutX,0,-8.5,[[0,0,6.3]],'z',birch);
      box(g,2*shelf,h,5,s*nutX,0,8.5);
      for(const k of sides) box(g,2*shelf,h/2-6.4,12,s*nutX,k*(h/2+6.4)/2,0);
      plate(g,22,h,braceX-split,s*(braceX+split)/2,0,0,[[0,0,4.75]],'x',face);
      for(const k of sides) cylinder(g,2.75,8,s*(braceX+4),k*bracePins,0,tieWood,14).rotation.z=half;
    }
    register(g,sides.flatMap(s=>[mouth([s*braceX,0,0],[s,0,0],4.75),mouth([s*nutX,0,-11],[0,0,-1],6.3)]));
  }
  function lathe(g,points,m) { return mesh(g,new LatheGeometry(points.map(pt=>new Vector2(...pt)),24),m); }
  function screw(g,k) {
    const [w,h]=shapes[k], r=w/2, shank={slatScrew:2.65,tieScrew:3.8,armScrew:3.65,longScrew:4.1}[k];
    const l=h-3, f=k==='armScrew'||k==='longScrew', tip=f?3:1.5;
    lathe(g,[[0,-l],[shank*.58,-l+.75],[shank,-l+tip],[shank,-1],[r*.79,0],[r,0],[r,1.5],[r*.82,3],[r*.36,3],[r*.36,1.1],[0,1.1]],steel);
    cylinder(g,r*.34,.35,0,1.24,0,dark,6);
    for(let y=-l+tip+1;y<-(f?l*.63:3);y+=f?3:2.4) {
      const ring=new CylinderGeometry(shank+.25,shank-.2,.8,16);
      mesh(g,ring,steel,0,y,0);
    }
  }
  function makeBarrel(g) {
    const r=5.9, theta=Math.asin(3.95/r);
    cylinder(g,r,2.05,0,-4.975,0);
    cylinder(g,r,2.05,0,4.975,0);
    for(const offset of [0,PI]) {
      const arc=Array.from({length:19},(_,i)=>{
        const a=offset+theta+(PI-2*theta)*i/18;
        return [r*Math.cos(a),r*Math.sin(a)];
      });
      mesh(g,outline(arc,7.9),steel).rotation.x=-half;
    }
    box(g,9.6,.15,1.2,0,6,0,dark);
  }
  function makeKey(g) {
    const curve=new CatmullRomCurve3([[-16,-27],[-12,-25],[-8,-30],[6,25],[10,29],[17,27]].map(([x,z])=>new Vector3(x,0,z)));
    mesh(g,new TubeGeometry(curve,24,2.8,6,false),steel);
  }
  function template({id,shape}) {
    const g=new Group();
    const s=id.endsWith('L')?-1:1;
    switch(shape) {
      case 'stile': makeStile(g,s); break;
      case 'slat': case 'markedSlat': makeSlat(g,id); break;
      case 'seat': makeSeat(g); break;
      case 'seatTie': makeTie(g); break;
      case 'arm': makeArm(g,s); break;
      case 'frontBrace': case 'lowBrace': makeBrace(g,shapes[shape][1]); break;
      case 'barrel': makeBarrel(g); break;
      case 'spacer': lathe(g,[[4.7,-4.75],[8.5,-4.75],[8.5,4.75],[4.7,4.75],[4.7,-4.75]],rubber); break;
      case 'pin':
        cylinder(g,4.1,28,0,0,0); cylinder(g,5.3,2.7,0,0,0); break;
      case 'slatScrew': case 'tieScrew': case 'longScrew': case 'armScrew': screw(g,shape); break;
      case 'key': makeKey(g); break;
      default: throw new RangeError(`Unknown POÄNG geometry: ${shape}`);
    }
    return g;
  }
  return {
    instantiate(part) {
      const key=['stile','slat','arm'].includes(part.shape)?part.id:part.shape;
      if(!cache.has(key)) cache.set(key,template(part));
      return cache.get(key).clone();
    },
    dispose() { for(const g of geometries) g.dispose(); for(const m of materials) m.dispose(); }
  };
}
