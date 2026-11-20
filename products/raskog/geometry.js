import {
  Box3, BoxGeometry, CatmullRomCurve3, CylinderGeometry, DoubleSide, ExtrudeGeometry, FrontSide, Group,
  LatheGeometry, Mesh, MeshStandardMaterial, Path, Shape, TubeGeometry, Vector2, Vector3
} from 'three';
import { frame } from './kit.js';

const {PI,cos,sin}=Math;
const outline=points=>new Shape(points.map(p=>new Vector2(...p)));
const arc=(x,z,r,a,b,n=8)=>Array.from({length:n+1},(_,i)=>{
  const t=a+(b-a)*i/n;
  return [x+r*cos(t),z+r*sin(t)];
});

export function createGeometry() {
  const material=(color,metalness=0,side=FrontSide)=>new MeshStandardMaterial({color,metalness,roughness:.64,side});
  const enamel=material(0xedece4,.15,DoubleSide), rim=material(0xf9f8f0,.1), lattice=material(0xdee0d7,.12);
  const steel=material(0xa0a29a,.56), dark=material(0x4c504e,.14), rubber=material(0x60625d);
  const geometries=new Set(), templates=new Map();
  function mesh(g,geometry,m=enamel,x=0,y=0,z=0) {
    geometries.add(geometry);
    const o=new Mesh(geometry,m);
    o.position.set(x,y,z);
    o.castShadow=o.receiveShadow=true;
    g.add(o);
    return o;
  }
  function box(g,w,h,d,x=0,y=0,z=0,m=enamel) {
    return mesh(g,new BoxGeometry(w,h,d),m,x,y,z);
  }
  function cylinder(g,r,h,x=0,y=0,z=0,m=steel,n=24,top=r,start=0,length=2*PI,open=false) {
    return mesh(g,new CylinderGeometry(top,r,h,n,1,open,start,length),m,x,y,z);
  }
  function lathe(g,points,m,x=0,y=0,z=0) {
    return mesh(g,new LatheGeometry(points.map(p=>new Vector2(...p)),24),m,x,y,z);
  }
  function ring(g,r,inlet,bottom,top,m,x,z) {
    return lathe(g,[[inlet,bottom],[r,bottom],[r,top],[inlet,top],[inlet,bottom]],m,x,0,z);
  }
  function extrusion(shape,depth) {
    return new ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:16});
  }
  function punch(g,x,z,bottom,top,halfWidth,depth,y,r,m=enamel) {
    const face=outline([[-halfWidth,bottom],[halfWidth,bottom],[halfWidth,top],[-halfWidth,top]]);
    const bore=new Path();
    bore.absarc(0,y,r,0,2*PI,true);
    face.holes.push(bore);
    const geometry=extrusion(face,depth);
    geometry.userData.mouths=[{point:[x,y,z],normal:[-1,0,0],radius:r},
      {point:[x+depth,y,z],normal:[1,0,0],radius:r}];
    mesh(g,geometry,m,x,0,z).rotation.y=PI/2;
  }
  // The X-facing flat at each splice is punched rather than painted on the tube.
  function pipe(g,x,z,bottom,top,r,bores,side=-1) {
    bores.sort((a,b)=>a-b);
    let y0=bottom;
    for (const y of bores) {
      tubeWall(y0,y-4);
      cylinder(g,r,8,x,y,z,enamel,24,r,side===-1?-PI/3:2*PI/3,5*PI/3,true);
      const depth=1.05, face=x+side*r*cos(PI/6);
      punch(g,side===-1?face:face-depth,z,y-4,y+4,r/2,depth,y,frame.tubeBore);
      y0=y+4;
    }
    tubeWall(y0,top);
    function tubeWall(a,b) {
      if (b>a) cylinder(g,r,b-a,x,(a+b)/2,z,enamel,24,r,0,2*PI,true);
    }
  }
  function tab(g,y) {
    punch(g,frame.tabX-frame.tabDepth/2,0,y-30,y+30,12,frame.tabDepth,y,frame.tabBore);
  }
  function upright(g,upper) {
    const {baseJoint,upperJoint,top,tubeZ,tubeRadius,spigotRadius,spliceInset,spigotLength,levels}=frame;
    for (const z of [-tubeZ,tubeZ]) {
      if (upper) {
        pipe(g,0,z,upperJoint-spigotLength,upperJoint,spigotRadius,[upperJoint-spliceInset]);
        ring(g,spigotRadius,5,upperJoint-spigotLength,upperJoint-spigotLength+1,steel,0,z);
        pipe(g,0,z,upperJoint,top,tubeRadius,[]);
        cylinder(g,tubeRadius-.15,2.4,0,top-1.2,z,rim);
      } else {
        pipe(g,0,z,baseJoint,upperJoint,tubeRadius,[baseJoint+spliceInset,upperJoint-spliceInset]);
        for (const y of [baseJoint,upperJoint-1.2]) ring(g,tubeRadius,7.12,y,y+1.2,enamel,0,z);
      }
    }
    (upper?levels.slice(2):levels.slice(0,2)).forEach(y=>tab(g,y));
  }
  function hoop(g) {
    const {x,baseJoint,tubeZ,tubeRadius,spigotRadius,spigotLength,spliceInset,wheelX,wheelZ,casterSeat,casterBore,hoopY,hoopZ}=frame;
    const bend=28, r=hoopZ-142;
    const corner=arc(-x+r,hoopZ-r,r,PI,PI/2).map(([a,b])=>[a,hoopY,b]);
    const rise=arc(tubeZ+bend,hoopY+bend,bend,PI,3*PI/2).map(([z,y])=>[-x,y,z]);
    const side=[[-x,baseJoint,tubeZ],...rise,...corner];
    const path=[...side,...side.toReversed().map(([x,y,z])=>[-x,y,z])];
    mesh(g,new TubeGeometry(new CatmullRomCurve3(path.map(p=>new Vector3(...p))),120,tubeRadius,12,false));
    for (const s of [-1,1]) {
      const px=s*x, cx=s*wheelX;
      pipe(g,px,tubeZ,baseJoint,baseJoint+spigotLength,spigotRadius,[baseJoint+spliceInset],s);
      ring(g,spigotRadius,5,baseJoint+spigotLength-1,baseJoint+spigotLength,steel,px,tubeZ);
      const collar=ring(g,7.7,casterBore,casterSeat,hoopY,steel,cx,wheelZ);
      collar.geometry.userData.mouths=[{point:[cx,casterSeat,wheelZ],normal:[0,-1,0],radius:casterBore}];
      cylinder(g,casterBore,4,cx,casterSeat+frame.stem+2,wheelZ,steel);
    }
  }
  function clamp(g) {
    const outer=frame.x-frame.clampFace;
    punch(g,outer,0,-31.5,31.5,11,1.7,0,frame.tabBore);
    for (const z of [-frame.tubeZ,frame.tubeZ]) {
      const r=frame.tubeRadius+.7;
      cylinder(g,r,63,0,0,z,enamel,14,r,-PI/2-1.09,2.18,true);
      for (const y of [-30.8,30.8]) cylinder(g,r+.8,1.4,0,y,z,enamel,14,r+.8,-PI/2-1.09,2.18,true);
    }
  }
  function basket(g,index) {
    const [w,d]=frame.trays[index], a=w/2,b=d/2, r=24, h=frame.trayH/2, inset=frame.trayInset;
    const edge=[[inset,7],[inset,26],[a-12,37],[a,45],...arc(a-r,b-r,r,0,PI/2)];
    const front=[...edge,...edge.toReversed().map(([x,z])=>[-x,z])];
    const back=front.toReversed().map(([x,z])=>[x,-z]);
    const shrink=([x,z],t)=>[x*(a-t)/a,z*(b-t)/b];
    function strip(p,outer,inner,bottom,height,mat) {
      const face=[...p.map(v=>shrink(v,outer)),...p.toReversed().map(v=>shrink(v,inner))];
      mesh(g,extrusion(outline(face.map(([x,z])=>[x,-z])),height),mat,0,bottom,0).rotation.x=-PI/2;
    }
    for (const p of [front,back]) {
      strip(p,.6,2.3,-h,2*h-3,enamel);
      strip(p,0,3.4,h-3,3,rim);
      strip(p,0,3.5,-h,3,enamel);
    }
    for (const s of [-1,1]) {
      const outside=(x,depth)=>s*x-(s===1?depth:0);
      punch(g,outside(inset,frame.traySkin),0,-h,h,7.1,frame.traySkin,frame.trayMount,frame.tabBore);
      const flange=frame.traySeat-inset;
      punch(g,outside(frame.traySeat,flange),0,frame.trayMount-9,frame.trayMount+9,7.1,flange,frame.trayMount,frame.tabBore);
      box(g,3.4,3,15,s*(inset-1.7),h-1.5,0,rim);
      // A small stamp above the punched ear identifies each tier, independent of its placement.
      const xs=s*(inset+.12);
      for (const [y,z,w,h] of [
        [28,0,6,1.2],[24,0,6,1.2],[20,0,6,1.2],[26,2.7,1.2,4],[22,2.7,1.2,4],[22,-2.7,1.2,4]
      ].filter((_,i)=>[[3,4],[0,1,2,3,5],[0,1,2,3,4]][index].includes(i))) box(g,.24,h,w,xs,y,s*z,steel);
    }
    // Two open diagonal runs terminate at the inside boundary, leaving real through-holes.
    const polygon=[...front,...back].map(v=>shrink(v,1.2));
    for (const m of [-1,1]) {
      const strands=[];
      for (let k=-390;k<=390;k+=13) {
        const cuts=[];
        for (const [i,[x,z]] of polygon.entries()) {
          const [u,v]=polygon[(i+1)%polygon.length], p=z-m*x, q=v-m*u;
          if ((p<=k && q>k)||(q<=k && p>k)) cuts.push(x+(u-x)*(k-p)/(q-p));
        }
        cuts.sort((x,y)=>x-y);
        for (let i=0;i<cuts.length;i+=2) {
          const a=cuts[i]-.14,b=cuts[i+1]+.14,t=.59;
          strands.push(outline([[a-m*t,-(m*a+k+t)],[b-m*t,-(m*b+k+t)],
            [b+m*t,-(m*b+k-t)],[a+m*t,-(m*a+k-t)]]));
        }
      }
      mesh(g,extrusion(strands,1.8),lattice,0,-h+.75+(m+1)*.53,0).rotation.x=-PI/2;
    }
  }
  function threads(g,r,start,end,pitch) {
    const lo=Math.min(start,end), hi=Math.max(start,end);
    const stem=r*.86, profile=[[0,lo],[stem,lo]];
    for (let y=lo+.4;y+.6<hi;y+=pitch) profile.push([stem,y],[r,y+.1],[r*.94,y+.58],[stem,y+.6]);
    lathe(g,[...profile,[stem,hi],[0,hi]],steel);
  }
  function screw(g) {
    threads(g,2.45,-8,0,1.18);
    lathe(g,[[0,0],[2.6,0],[4.15,1.15],[3.9,2.15],[3.3,2.5],[0,2.5]],steel);
    box(g,5.3,.08,.75,0,2.54,0,dark);
    box(g,.75,.08,5.3,0,2.54,0,dark);
  }
  function bolt(g) {
    threads(g,3.15,-27.5,-3,1.5);
    box(g,5,3,5,0,-1.5,0,steel);
    lathe(g,[[0,0],[6,0],[5.9,.8],[4.75,2.15],[2.8,2.85],[0,3.15]],steel);
  }
  function nut(g) {
    ring(g,6.9,3.23,0,1.4,steel,0,0);
    const face=outline(arc(0,0,5.85,0,2*PI,6).slice(0,-1));
    const hole=new Path();
    hole.absarc(0,0,3.23,0,2*PI,true);
    face.holes.push(hole);
    mesh(g,extrusion(face,5),steel,0,1.4,0).rotation.x=-PI/2;
    lathe(g,[[3.25,6.4],[4.7,6.4],[4,7.7],[2.7,8.7],[0,9],[0,7.9],[3.25,7.9],[3.25,6.4]],steel);
  }
  function wrench(g) {
    const face=outline([[-56,-8],[-51,-12],[-40,-12],[-32,-5],[30,-4],[39,-10],[52,-9],[56,-4],
      [56,5],[50,10],[39,10],[30,4],[-32,5],[-40,12],[-51,12],[-56,8],[-54,5],[-43,5],[-40,0],[-43,-5],[-54,-5]]);
    const hole=new Path(arc(46,0,5.9,0,2*PI,6).slice(0,-1).map(p=>new Vector2(...p)));
    face.holes.push(hole);
    mesh(g,extrusion(face,4),steel,0,-2,0).rotation.x=-PI/2;
  }
  function caster(g,brake) {
    threads(g,4.65,0,frame.stem,1.18);
    cylinder(g,7.4,4,0,-2,0,steel,6);
    cylinder(g,11.4,3.4,0,-5.7,0);
    cylinder(g,9.8,3,0,-8.6,0,enamel);
    const axleY=-35, axleZ=-8;
    lathe(g,[[0,-7.5],[20.6,-7.5],[23,-6.3],[24,-4.4],[24,4.4],[23,6.3],[20.6,7.5],[0,7.5]],
      rubber,0,axleY,axleZ).rotation.z=PI/2;
    cylinder(g,18.2,15.9,0,axleY,axleZ,enamel).rotation.z=PI/2;
    cylinder(g,6.4,23.5,0,axleY,axleZ,steel).rotation.z=PI/2;
    const fork=outline([[-11,-9],[9,-9],[11,-14],[8,-22],[-1,-33],[-4.5,-40],[-12.5,-41],[-16,-37],[-15,-29],[-9,-18]]);
    for (const x of [-8.1,11.1]) mesh(g,extrusion(fork,2.6),enamel,x,0,0).rotation.y=-PI/2;
    if (brake) {
      const pedal=new Group();
      pedal.name='brake lever'; pedal.position.set(-12.25,axleY,axleZ); g.add(pedal);
      cylinder(pedal,5.4,3.5,0,0,0,steel).rotation.z=PI/2;
      box(pedal,3.5,4,25,0,0,12,dark);
      box(pedal,13,5.4,8,3,0,24,dark);
      for (const x of [-.7,2.3,5.3,8.3]) box(pedal,1,1.3,6,x,3.25,24,steel);
      pedal.rotation.x=-PI/3;
    }
  }
  const builders={lower:g=>upright(g,false),upper:g=>upright(g,true),hoop,clamp,screw,bolt,nut,wrench,
    brake:g=>caster(g,true),caster:g=>caster(g,false)};
  return {
    instantiate({id,shape}) {
      const key=shape==='tray'?id:shape;
      if (!templates.has(key)) {
        const g=new Group();
        if (shape==='tray') basket(g,Number(id.at(-1))-1);
        else builders[shape](g);
        templates.set(key,{g,bounds:new Box3().setFromObject(g,true)});
      }
      const {g,bounds}=templates.get(key), model=g.clone(true);
      model.userData.adjustBounds=box=>box.copy(bounds);
      if (shape==='brake') {
        const pedal=model.getObjectByName('brake lever');
        model.userData.setCaptive=amount=>{pedal.rotation.x=-(1-amount)*PI/3;};
      }
      return model;
    },
    dispose() {
      for (const g of geometries) g.dispose();
      for (const m of [enamel,rim,lattice,steel,dark,rubber]) m.dispose();
    }
  };
}
