import { BoxGeometry, CylinderGeometry, ExtrudeGeometry, Group, Mesh, MeshStandardMaterial, Path, Shape } from 'three';
import { clipXs, hingeBores, railDrop, railStudHeights, railY, railZ, shapes, strapXs } from './kit.js';

const {PI}=Math;
const hand=id=>id.endsWith('L')?-1:1;
const limit=x=>Math.max(0,Math.min(1,x));
const rectangle=(w,h)=>{
  const x=w/2,y=h/2,s=new Shape();
  s.moveTo(-x,-y); s.lineTo(x,-y); s.lineTo(x,y); s.lineTo(-x,y); s.closePath();
  return s;
};
function roundRect(w,h,r,notch=0) {
  const x=w/2,y=h/2,s=new Shape(), left=notch<0?99:0, right=notch>0?99:0;
  function side(a,t) {
    s.lineTo(a*(x-t-r),-y); s.quadraticCurveTo(a*(x-t),-y,a*(x-t),-y+r);
    if(t) {
      s.lineTo(a*(x-t),-y+116); s.quadraticCurveTo(a*(x-t),-y+145,a*(x-t+32),-y+145);
      s.lineTo(a*(x-r),-y+145); s.quadraticCurveTo(a*x,-y+145,a*x,-y+145+r);
    }
  }
  s.moveTo(-x+left+r,-y);
  side(1,right);
  s.lineTo(x,y-r); s.quadraticCurveTo(x,y,x-r,y);
  s.lineTo(-x+r,y); s.quadraticCurveTo(-x,y,-x,y-r);
  if(left) {
    s.lineTo(-x,-y+145+r); s.quadraticCurveTo(-x,-y+145,-x+r,-y+145);
    s.lineTo(-x+left-32,-y+145); s.quadraticCurveTo(-x+left,-y+145,-x+left,-y+116);
  }
  s.lineTo(-x+left,-y+r); s.quadraticCurveTo(-x+left,-y,-x+left+r,-y); s.closePath();
  return s;
}
function hole(s,x,y,r) {
  const p=new Path(); p.absarc(x,y,r,0,2*PI,true); s.holes.push(p);
}
function slot(s,y) {
  const r=9,x=4, low=y-railDrop, knee=low+Math.sqrt(r*r-x*x), a=Math.acos(x/r), p=new Path();
  p.moveTo(-x,knee); p.lineTo(-x,y+7); p.lineTo(x,y+7); p.lineTo(x,knee);
  p.absarc(0,low,r,a,PI-a,true); p.closePath(); s.holes.push(p);
}

export function createGeometry() {
  const materials=[];
  const material=(color,roughness=0.88,metalness=0)=>{
    const m=new MeshStandardMaterial({color,roughness,metalness}); materials.push(m); return m;
  };
  const padding=material(0xc4bca8), interior=material(0xb2a894), board=material(0xaf9674);
  const textile=material(0x708187), seam=material(0x52666e), lining=material(0x8a8e87), strip=material(0x4e514a);
  const steel=material(0x737f83,.52,.54), chrome=material(0xa6b2bc,.38,.69), base=material(0x373d3e,.62,.3);
  const clipMaterial=material(0x707e7f,.65), webbing=material(0xb3a17c), rubber=material(0x555653), felt=material(0xb3a47c);
  const cache=new Map();
  function mesh(g,key,make,m,x=0,y=0,z=0) {
    if(!cache.has(key)) cache.set(key,make());
    const o=new Mesh(cache.get(key),m); o.position.set(x,y,z); o.castShadow=true; o.receiveShadow=true; g.add(o); return o;
  }
  const box=(g,w,h,d,x,y,z,m)=>mesh(g,`box/${w}/${h}/${d}`,()=>new BoxGeometry(w,h,d),m,x,y,z);
  function cyl(g,r,R,h,x,y,z,m,n=20) {
    return mesh(g,`cyl/${r}/${R}/${h}/${n}`,()=>new CylinderGeometry(r,R,h,n),m,x,y,z);
  }
  function profile(g,key,make,depth,x,y,z,m,axis='z',bevel=0) {
    return mesh(g,`profile/${key}`,()=>{
      const geo=new ExtrudeGeometry(make(),{depth,curveSegments:16,bevelEnabled:bevel>0,bevelSize:bevel,bevelThickness:bevel,bevelSegments:3,steps:1});
      geo.translate(0,0,-depth/2);
      if(axis==='x') geo.rotateY(PI/2);
      if(axis==='y') geo.rotateX(-PI/2);
      return geo;
    },m,x,y,z);
  }
  function upholstered(g,key,w,h,d,r,x,y,z,m,axis='z',notch=0) {
    return profile(g,key,()=>roundRect(w,h,r,notch),d,x,y,z,m,axis,Math.min(8,d/3));
  }
  const pivot=(g,x,y,z)=>{const p=new Group(); p.position.set(x,y,z); g.add(p); return p;};
  function setCaptive(g,apply) {
    g.userData.setCaptive=apply;
    apply(0);
  }
  function pin(g,r,length,x,y,z,m=chrome) {
    cyl(g,r,r,length,x,y,z,m).rotation.z=PI/2;
  }
  function seat(g) {
    upholstered(g,'seat-foam',1984,704,105,33,0,20,0,padding,'y');
    box(g,1974,17,680,0,-41,0,interior);
    for(const z of [-326,326]) box(g,1986,30,30,0,-63,z,base);
    for(const x of [-975,-330,330,975]) box(g,25,31,643,x,-63,0,base);
    for(const s of [-1,1]) {
      const flange=()=>{
        const f=roundRect(79,74,6);
        hole(f,25*s,0,4); hole(f,-14*s,22,4); hole(f,-10*s,-17,4); return f;
      };
      profile(g,`seat-flange${s}`,flange,7,s*923,-77,312,steel,'y');
      for(const x of [s*950,s*979]) box(g,7,17,187,x,-76,-285,steel);
      box(g,36,5,192,s*965,-64,-285,steel);
    }
  }
  function seatCover(g) {
    upholstered(g,'seat-cover-cap',1994,718,57,34,0,46,0,textile,'y');
    box(g,1963,5,7,0,20,360,seam);
    const skirt=profile(g,'seat-skirt',()=>roundRect(1985,365,20),5,0,-190,359,textile,'z',1);
    skirt.rotation.x=.025;
    const back=pivot(g,0,-18,-357), first=pivot(g,0,-25,356), ends=[];
    box(back,1970,69,5,0,-28,0,seam);
    box(first,1970,51,5,0,-24,0,seam);
    for(const s of [-1,1]) {
      const p=pivot(g,s*997,-24,0);
      box(p,5,56,692,0,-27,0,textile); ends.push(p);
    }
    const loops=[-923,923].map(x=>{
      const p=pivot(g,x,-348,320);
      profile(p,'skirt-loop',()=>{const s=roundRect(66,59,24); hole(s,0,0,22); return s;},4,0,0,0,seam,'y');
      return p;
    });
    setCaptive(g,v=>{
      first.rotation.x=limit(v)*.72;
      ends[0].rotation.z=-limit(v-1)*.84; ends[1].rotation.z=limit(v-1)*.84;
      back.rotation.x=-limit(v-2)*.82;
      for(const p of loops) { p.rotation.x=(1-limit(v-3))*.91; p.position.z=314+(1-limit(v-3))*33; }
    });
    g.userData.adjustBounds=b=>{ b.min.y=-379; b.max.y=84; };
  }
  function backrest(g) {
    upholstered(g,'back-front',1850,499,65,22,0,0,-37,padding);
    for(const x of [-975,975]) box(g,45,368,72,x,62,-31,padding);
    for(const x of [-330,330]) box(g,33,464,32,x,0,43,board);
    for(const y of [-239,235]) box(g,1976,33,31,0,y,43,board);
    for(const s of [-1,1]) {
      box(g,24,88,57,s*992,-196,-30,base);
      pin(g,6,34,s*981,-163,-46);
      pin(g,6,29,s*981,-222,-44);
    }
  }
  function backCover(g) {
    upholstered(g,'back-cover-skin',1994,505,16,24,0,0,-71,textile);
    box(g,1953,40,144,0,241,-4,textile);
    box(g,1960,5,5,0,223,70,seam);
    const bottom=pivot(g,0,-249,51), ends=[];
    box(bottom,1870,51,5,0,18,0,textile);
    box(bottom,1850,8,6,0,39,2,seam);
    for(const s of [-1,1]) {
      box(g,8,450,141,s*999,1,-3,textile);
      const p=pivot(g,s*997,0,66);
      box(p,6,440,42,0,1,-15,textile); ends.push(p);
    }
    setCaptive(g,v=>{
      const wrap=limit(v/2);
      for(const [i,p] of ends.entries()) { p.position.y=28*(1-limit(v)); p.rotation.y=(i===0?1:-1)*.84*wrap; }
      bottom.rotation.x=.9*(1-limit(v-2))+.19*(1-limit(v-3));
    });
  }
  function armShape(s,coat=false) {
    const outer=coat?111:107, top=coat?280:272, s2=new Shape();
    s2.moveTo(s*-95,77); s2.quadraticCurveTo(s*-98,133,s*-105,204);
    s2.quadraticCurveTo(s*-118,top,s*-44,top);
    s2.quadraticCurveTo(s*82,top,s*outer,199);
    s2.quadraticCurveTo(s*(outer-10),145,s*(outer-34),103);
    s2.lineTo(s*(outer-37),-268);
    if(coat) {
      s2.lineTo(s*(outer-48),-268); s2.lineTo(s*(outer-46),101);
      s2.quadraticCurveTo(s*96,186,s*92,207); s2.quadraticCurveTo(s*48,277,s*-44,269);
      s2.quadraticCurveTo(s*-105,269,s*-98,208);
    } else {
      s2.lineTo(s*-98,-268); s2.lineTo(s*-101,73);
    }
    s2.closePath(); return s2;
  }
  function arm(g,s) {
    profile(g,`roll-arm${s}`,()=>armShape(s),944,0,0,0,padding,'z',7);
    const f=()=>{
      const plate=roundRect(829,338,11);
      for(const z of [-railZ,railZ]) for(const y of [130,...railStudHeights]) hole(plate,-z,y-187,4);
      for(const [y,z] of hingeBores) hole(plate,32-z,230+y-187,4);
      return plate;
    };
    profile(g,'inner arm plate',f,9,-s*104,-130,0,board,'x');
    for(const z of [-351,351]) box(g,100,12,92,-s*7,-270,z,board);
  }
  function armCover(g,s) {
    profile(g,`roll-arm-cover${s}`,()=>armShape(s,true),952,0,0,0,textile,'z',3);
    upholstered(g,`arm-front-${s}`,182,188,7,61,s*-1,176,478,textile,'z');
    upholstered(g,`arm-back-${s}`,182,188,7,61,s*-1,176,-478,textile,'z');
    const hem=pivot(g,s*88,99,0), inside=pivot(g,-s*106,107,0), ends=[];
    box(hem,8,387,942,0,-194,0,textile);
    box(inside,7,64,911,0,-27,0,seam);
    for(const z of [-1,1]) {
      const p=pivot(g,s*46,96,z*478);
      box(p,103,386,6,0,-191,0,textile); ends.push(p);
    }
    setCaptive(g,v=>{
      hem.rotation.z=s*.16*(1-limit(v)); inside.rotation.z=-s*.97*(1-limit(v));
      ends[0].rotation.y=-.81*(1-limit(v-1)); ends[1].rotation.y=.81*(1-limit(v-1));
    });
    g.userData.adjustBounds=b=>{ b.min.y=-289; b.max.y=283; };
  }
  function rail(g,back) {
    for(const y of [-115,115]) box(g,1988,20,30,0,y,0,base);
    for(const x of [-960,-332,332,960]) box(g,18,226,23,x,0,0,base);
    function receiver() {
      const s=roundRect(42,233,5);
      for(const y of railStudHeights) slot(s,y-railY);
      hole(s,0,-90,4.2);
      return s;
    }
    for(const sign of [-1,1]) {
      profile(g,'keyhole-end-plate',receiver,9,sign*999,0,0,steel,'x');
      box(g,41,9,36,sign*977,-98,0,steel);
      if(back) {
        box(g,14,28,48,sign*989,109,-19,steel);
        pin(g,5,34,sign*977,125,-35);
      }
    }
    for(const x of clipXs) box(g,12,3,13,x,126,0,steel);
  }
  function clip(p,m=clipMaterial) {
    box(p,25,5,41,0,10,0,m); box(p,25,19,5,0,1,19,m);
    box(p,25,21,5,0,1,-19,m); box(p,11,5,6,0,5,0,m);
  }
  function liner(g) {
    box(g,1920,6,504,0,-91,0,lining);
    for(const x of [-963,963]) box(g,6,210,520,x,13,0,lining);
    const retained=[], groups=[];
    for(const s of [-1,1]) {
      const side=box(g,1924,211,6,0,13,s*259,lining); side.rotation.x=s*.098;
      cyl(g,4,4,1960,0,124,s*railZ,steel).rotation.z=PI/2;
      for(const x of clipXs.slice(1,-1)) {
        const p=pivot(g,x,126,s*railZ); clip(p); retained.push([p,s]);
      }
      const straps=strapXs.map((x,i)=>{
        const p=pivot(g,x,-115,s*railZ); p.name=`${s<0?'rear':'front'}-strap-${i+1}`;
        const cuff=()=>{
          const ring=roundRect(49,34,7);
          const middle=rectangle(33,23); ring.holes.push(middle); return ring;
        };
        profile(p,'sewn-strap-cuff',cuff,26,0,0,0,webbing,'x');
        box(p,25,12,4,0,17,s*16,strip);
        return p;
      });
      groups.push([s,straps]);
    }
    setCaptive(g,v=>{
      for(const [p,s] of retained) p.rotation.x=s*.78*(1-limit(v));
      for(const [s,strapGroup] of groups) {
        const open=1-limit(v-(s<0?1:2));
        for(const p of strapGroup) {
          p.rotation.x=s*open*1.16;
          p.position.set(p.position.x,-115+37*open,s*(railZ-30*open));
        }
      }
    });
  }
  function bar(g) {
    box(g,1984,20,25,0,0,0,base);
    for(const s of [-1,1]) profile(g,'bar end',()=>{
      const f=roundRect(42,52,7); hole(f,0,20,4.5); return f;
    },7,s*998,0,0,steel,'x');
  }
  function hinge(g,s) {
    const plate=()=>{
      const f=roundRect(245,183,13);
      for(const [y,z] of hingeBores) hole(f,-z-12,y+12,4.3);
      return f;
    };
    profile(g,'spring hinge base',plate,8,s*14,-12,-12,steel,'x');
    const carriage=pivot(g,0,0,0); carriage.name='seat-locator';
    box(carriage,16,18,220,0,0,0,steel);
    box(carriage,21,27,11,0,3,-110,steel);
    pin(carriage,6,42,-s*2,5,0);
    const tab=()=>{ const f=roundRect(27,39,4); hole(f,0,-7,4.5); return f; };
    profile(carriage,'seat mount angled tab',tab,5,-s*3,-8,44,steel,'y');
    const arms=[box(g,12,1,18,-s*11,0,0,chrome),box(g,15,1,22,-s*22,0,0,steel)];
    const spring=cyl(g,11,11,1,-s*28,0,0,base,12);
    for(const [y,z] of [[-64,96],[-47,-86]]) pin(g,7,25,-s*4,y,z);
    function link(o,y,z,fy,fz) {
      o.position.y=(y+fy)/2; o.position.z=(z+fz)/2;
      o.rotation.x=Math.atan2(fz-z,fy-y); o.scale.y=Math.hypot(fy-y,fz-z);
    }
    // Pose cues only: the linkage interpolates between diagram-based endpoints, not physical spring forces.
    setCaptive(g,v=>{
      const y=45+13*v,z=-73+323*v;
      carriage.position.set(0,y,z); carriage.rotation.x=(1-v)*-.11;
      link(arms[0],-47,-86,y,z-88); link(arms[1],-64,96,y,z+88);
      link(spring,-53,-51,y*.54,z+51);
    });
    g.userData.adjustBounds=b=>{ b.min.z=-197; b.max.z=368; b.min.y=-115; b.max.y=112; };
  }
  function guide(g,s) {
    const fork=()=>{
      const f=new Shape();
      f.moveTo(-20,-56); f.lineTo(-6,-56); f.lineTo(-6,-35);
      f.quadraticCurveTo(0,-27,6,-35); f.lineTo(6,-56); f.lineTo(20,-56);
      f.lineTo(20,-9); f.lineTo(108,28); f.lineTo(108,51); f.quadraticCurveTo(108,56,102,56);
      f.lineTo(73,56); f.lineTo(-20,15); f.closePath();
      hole(f,90,42,6.5);
      return f;
    };
    profile(g,'fork-guide',fork,9,0,0,0,chrome,'x');
    const flange=()=>{
      const f=roundRect(31,51,4); hole(f,0,-13,4.8); hole(f,0,14,4.8); return f;
    };
    profile(g,'guide rear flange',flange,7,-s*15,-11,-24,steel);
  }
  function riser(g,s) {
    box(g,31,222,33,0,4,0,steel);
    box(g,70,7,63,s*5,114,0,steel);
    box(g,8,47,48,s*30,91,0,base);
    box(g,48,8,44,0,-113,0,steel);
    for(const [x,z] of [[s*19,3],[-s*13,-18]]) cyl(g,4,4,16,x,112,z,chrome);
  }
  function cushion(g,id,shape,cover) {
    const [w,h,d]=shapes[shape];
    const hasShape=shape.startsWith('outer'), s=hasShape?hand(id):0;
    upholstered(g,shape+s,w-15,h-16,d-14,31,0,0,0,cover?textile:padding,'z',s);
    if(!cover) return;
    const zip=pivot(g,0,-h/2+19,d/2-8);
    box(zip,w-(s?147:53),4,6,s?-s*45:0,0,0,seam);
    const pull=box(zip,17,7,4,0,0,4,steel);
    setCaptive(g,v=>{ pull.position.x=(v-.5)*(w-164); pull.rotation.z=(1-v)*.62; });
  }
  function bolt(g,shape) {
    const [w,h]=shapes[shape], r=w/2;
    cyl(g,shape==='longBolt'?3.4:4.1,4.2,h-6,0,-3,0,chrome,12);
    cyl(g,r,r*.89,5,0,h/2-3,0,steel,16);
    cyl(g,2.4,2.4,1,0,h/2-.1,0,base,6);
  }
  return {
    instantiate({id,shape}) {
      const g=new Group(), s=hand(id);
      switch(shape) {
        case 'seat': seat(g); break;
        case 'seatCover': seatCover(g); break;
        case 'back': backrest(g); break;
        case 'backCover': backCover(g); break;
        case 'arm': arm(g,s); break;
        case 'armCover': armCover(g,s); break;
        case 'frontRail': case 'rearRail': rail(g,shape==='rearRail'); break;
        case 'liner': liner(g); break;
        case 'bar': bar(g); break;
        case 'hinge': hinge(g,s); break;
        case 'guide': guide(g,s); break;
        case 'riser': riser(g,s); break;
        case 'outer': case 'outerCover': case 'center': case 'centerCover': cushion(g,id,shape,shape.endsWith('Cover')); break;
        case 'clip': {
          const p=pivot(g,0,0,0); clip(p);
          setCaptive(g,v=>{ p.rotation.x=.78*(1-limit(v)); }); break;
        }
        case 'foot': cyl(g,26,24,47,0,6,0,rubber); cyl(g,5,5,19,0,-23,0,chrome,12); break;
        case 'pad': cyl(g,16,16,3,0,0,0,felt,6); break;
        case 'driver':
          box(g,118,24,21,0,-87,0,base); cyl(g,3,3,195,0,14,0,chrome,6); break;
        case 'wing':
          cyl(g,4,4,22,0,-5,0,chrome,12);
          for(const x of [-1,1]) box(g,10,11,6,x*10,8,0,steel).rotation.z=-x*.38;
          break;
        default: bolt(g,shape);
      }
      return g;
    },
    dispose() { for(const geo of cache.values()) geo.dispose(); for(const m of materials) m.dispose(); }
  };
}
