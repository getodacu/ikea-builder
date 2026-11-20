import {BoxGeometry,BufferGeometry,CylinderGeometry,ExtrudeGeometry,Float32BufferAttribute,Group,Mesh,MeshStandardMaterial,
  Shape,ShapeUtils,Vector2,Vector3} from 'three';
import {cabinet as c, drawerFit as f, drawerSizes, shapes} from './kit.js';

const signs=[-1,1];
// Cross sections and clearance are schematic. Keep placements and their receivers on the kit datums.
const rearLip=2.5, rearRelief=2.8, grooveDepth=4, sideInner=f.sideX-f.sideWidth/2;
const screwBore=2.2;
const drill=(n,side,at,r,depth)=>({n,side,at,r,depth});

function boredBlock(size,holes) {
  const vertices=[], half=size.map(v=>v/2);
  function vertex(n,h,p) {
    const a=[];
    a[n]=h; a[(n+1)%3]=p.x; a[(n+2)%3]=p.y;
    return a;
  }
  function tri(a,b,c,positive) { vertices.push(...a,...(positive?b:c),...(positive?c:b)); }
  function face(n,h,side,rim,cutouts=[]) {
    const points=[...rim,...cutouts.flat()].map(p=>vertex(n,h,p));
    for(const [a,b,c] of ShapeUtils.triangulateShape(rim,cutouts)) tri(points[a],points[b],points[c],side>0);
  }
  const cutouts=Array.from({length:6},()=>[]);
  for(const {n,side,at,r,depth} of holes) {
    const u=(n+1)%3, v=(n+2)%3, mouth=side*half[n];
    const loop=Array.from({length:16},(_,i)=>{
      const rad=i*Math.PI/8;
      return new Vector2(at[u]+r*Math.cos(rad),at[v]+r*Math.sin(rad));
    });
    cutouts[2*n+Number(side>0)].push(loop);
    const through=depth>=size[n], end=through ? -mouth : mouth-side*depth;
    if(through) cutouts[2*n+Number(side<0)].push(loop);
    else face(n,end,side,loop);
    for(let i=0;i<loop.length;i++) {
      const j=(i+1)%loop.length, a=vertex(n,mouth,loop[i]), b=vertex(n,mouth,loop[j]);
      const e=vertex(n,end,loop[i]), d=vertex(n,end,loop[j]);
      tri(a,b,d,side>0); tri(a,d,e,side>0);
    }
  }
  for(let n=0;n<3;n++) for(const side of signs) {
    const u=half[(n+1)%3], v=half[(n+2)%3];
    const rim=[new Vector2(-u,-v),new Vector2(u,-v),new Vector2(u,v),new Vector2(-u,v)];
    face(n,side*half[n],side,rim,cutouts[2*n+Number(side>0)]);
  }
  const geo=new BufferGeometry();
  geo.setAttribute('position',new Float32BufferAttribute(vertices,3)); geo.computeVertexNormals();
  return geo;
}

export function createGeometry() {
  const material=(color,roughness=.72,metalness=0)=>new MeshStandardMaterial({color,roughness,metalness});
  const white=material(0xf5f3ef), bottom=material(0xe6e3db), metal=material(0xa7adb0,.38,.64), zinc=material(0x707981,.43,.55),
    dark=material(0x333d42), wood=material(0xc09a66), rubber=material(0xd5d7d2), glue=material(0xf1e9db);
  const materials=[white,bottom,metal,zinc,dark,wood,rubber,glue];
  const geometries=new Set(), cache=new Map(), templates=new Map();
  function mesh(g,geo,m,x=0,y=0,z=0) {
    geometries.add(geo);
    const o=new Mesh(geo,m); o.position.set(x,y,z); o.castShadow=true; o.receiveShadow=true; g.add(o); return o;
  }
  function primitive(key,create) {
    if(!cache.has(key)) cache.set(key,create());
    return cache.get(key);
  }
  function box(g,w,h,d,x,y,z,m=white) {
    return mesh(g,primitive(`b${w},${h},${d}`,()=>new BoxGeometry(w,h,d)),m,x,y,z);
  }
  function cylinder(g,r,h,y,m=metal,top=r,facets=18) {
    return mesh(g,primitive(`c${r},${top},${h},${facets}`,()=>new CylinderGeometry(top,r,h,facets)),m,0,y,0);
  }
  function panel(g,size,center,holes=[],m=white) {
    const relative=holes.flatMap(h=>{
      const at=h.at.map((v,i)=>v-center[i]), {n,side,r}=h;
      return at.every((v,i)=>i===n?Math.abs(v-side*size[i]/2)<1e-5:Math.abs(v)+r<size[i]/2)
        ? [{...h,at}] : [];
    });
    if(relative.length) mesh(g,boredBlock(size,relative),m,...center);
    else box(g,...size,...center,m);
  }
  function caseSide(g,s) {
    const inner=-s*c.board/2, localY=y=>y-c.sideY;
    const cuts=[...c.backCamY.map(y=>drill(0,-s,[inner,localY(y),c.rearZ],3.7,10)),
      ...c.backDowelY.map(y=>drill(0,-s,[inner,localY(y),c.rearZ],3.2,14))];
    signs.forEach((t,i)=>{
      const y=localY(c.endY[i]);
      for(const z of c.capZ) {
        cuts.push(drill(0,-s,[inner,y-t*16,z],7.6,13));
        cuts.push(drill(1,t,[0,y,z],3.9,19));
      }
      for(const z of c.endDowelZ) cuts.push(drill(1,t,[0,y,z],3.2,14));
    });
    panel(g,shapes.caseSide,[0,0,0],cuts);
    for(const bay of f.bayY) {
      const y=localY(bay+f.railY);
      // The stationary channel is open along its length and through its leading end.
      box(g,2.3,11,508,inner-s*1.15,y,6,zinc);
      for(const t of signs) box(g,6.7,2.5,508,inner-s*5.65,y+t*4.25,6,metal);
      box(g,6.1,2,12,inner-s*5.35,y+5.75,247,dark);
    }
  }
  function caseBack(g) {
    const cuts=signs.flatMap(s=>[
      ...c.backCamY.flatMap(y=>[
        drill(2,1,[s*(c.inside-16),y-c.sideY,c.rearT/2],7.6,12.2),
        drill(0,s,[s*c.inside,y-c.sideY,0],4,19)
      ]),
      ...c.backDowelY.map(y=>drill(0,s,[s*c.inside,y-c.sideY,0],3.2,14))
    ]);
    panel(g,shapes.caseBack,[0,0,0],cuts);
  }
  function caseEnd(g,key) {
    const lower=key==='caseBase', s=lower?1:-1, y=s*c.board/2;
    const holes=signs.flatMap(t=>[
      ...c.capZ.map(z=>drill(1,s,[t*c.sideX,y,z],3.7,10)),
      ...c.endDowelZ.map(z=>drill(1,s,[t*c.sideX,y,z],3.2,14))
    ]);
    if(lower) {
      for(const [x,z] of c.plateHoles) holes.push(drill(1,-s,[x,-y,z],1.7,6));
      for(const [x,z] of c.deskHoles) holes.push(drill(1,-s,[x,-y,z],2.8,9));
    }
    panel(g,shapes[key],[0,0,0],holes);
  }
  function front(g,d) {
    const h=d.frontH, y0=-h/2, z0=-c.board/2, w=319;
    const [grooveLo,grooveHi]=f.grooveY;
    const cuts=signs.flatMap(s=>[
      ...d.boltY.map(y=>drill(2,-1,[s*f.sideX,y+y0,z0],3.7,10)),
      ...d.pegY.map(y=>drill(2,-1,[s*f.sideX,y+y0,z0],3.2,14))
    ]);
    box(g,w,grooveLo,c.board,0,y0+grooveLo/2,0);
    box(g,w,grooveHi-grooveLo,c.board-grooveDepth,0,y0+(grooveLo+grooveHi)/2,grooveDepth/2);
    panel(g,[w,h-25-grooveHi,c.board],[0,y0+(h-25+grooveHi)/2,0],cuts);
    const y=h/2, lip=new Shape();
    lip.moveTo(-w/2,y-25); lip.lineTo(w/2,y-25); lip.lineTo(w/2,y); lip.lineTo(79,y);
    lip.bezierCurveTo(59,y,60,y-20,36,y-20); lip.lineTo(-36,y-20);
    lip.bezierCurveTo(-60,y-20,-59,y,-79,y); lip.lineTo(-w/2,y); lip.closePath();
    const geo=new ExtrudeGeometry(lip,{depth:c.board,bevelEnabled:false,curveSegments:10});
    mesh(g,geo,white,0,0,z0);
  }
  function drawerSide(g,d,s) {
    const h=d.sideH, main=f.sideWidth, span=f.sideDepth, cy=f.sideStart+h/2, z=v=>v-f.sideZ, y=v=>v-cy;
    const [grooveLo,grooveHi]=f.grooveY, top=f.sideStart+h, tail=f.panelZ+f.panelT/2;
    const outside=s*main/2, inside=-outside;
    const cuts=[...d.boltY.flatMap(v=>[
      drill(0,s,[outside,y(v),z(f.camZ)],6.15,10.2), drill(2,1,[0,y(v),span/2],3.9,19)
    ]),
      ...d.pegY.map(v=>drill(2,1,[0,y(v),span/2],3.2,14)),
      ...f.rearPinYs.map(v=>drill(0,s,[outside,y(v),z(f.panelZ)],2.45,main)),
      drill(0,-s,[inside,y(f.railY),z(f.railZ)],screwBore,main)];
    const board=(lo,hi,frontZ,rearZ,recess=0)=>panel(g,[main-recess,hi-lo,frontZ-rearZ],
      [s*recess/2,y((lo+hi)/2),z((rearZ+frontZ)/2)],cuts);
    const rear=f.sideZ-span/2, leading=f.sideZ+span/2;
    board(f.sideStart,grooveLo,leading,rear);
    board(grooveLo,grooveHi,leading,rear,grooveDepth);
    board(grooveHi,top,leading,tail);
    board(grooveHi,top,tail,rear,rearRelief);
    // Latch tongue travels with the drawer and passes between the case channel's two lips.
    panel(g,[3.4,5,485],[outside+s*1.7,y(f.railY),z(.5)],
      [drill(0,-s,[outside,y(f.railY),z(f.railZ)],screwBore,3.4)],zinc);
  }
  function drawerBack(g,shape) {
    const [,h,t]=shapes[shape], w=sideInner*2+rearLip*2;
    const cuts=signs.flatMap(s=>f.rearPinYs.map(y=>drill(0,s,[s*w/2,y-f.panelBase-h/2,0],2.5,17.4)));
    panel(g,[w,h,t],[0,0,0],cuts);
  }
  function drive(g,cross,r,height,material=dark) {
    box(g,r*1.35,.3,1,0,height,0,material);
    if(cross) box(g,1,.31,r*1.35,0,height,0,material);
  }
  function cam(g,shape) {
    const small=shape==='drawerCam', r=small?5.8:7.3, h=shapes[shape][1];
    const spin=new Group(); spin.name='cam-turn'; g.add(spin);
    cylinder(spin,r*.83,h-3,-(h+3)/2,zinc);
    cylinder(spin,r,2.1,-1.05);
    cylinder(spin,r*.95,1.5,-h+.75);
    drive(spin,small,r,.06);
  }
  function hardware(g,shape) {
    switch(shape) {
      case 'caseCam': case 'drawerCam': cam(g,shape); break;
      case 'dowel': cylinder(g,2.9,27,0,wood,2.8,10); break;
      case 'camBolt':
        cylinder(g,2.8,9,-4.5,zinc,2.6); cylinder(g,3.6,1.6,.8,zinc);
        cylinder(g,3.25,10,6.6,zinc); cylinder(g,1.85,8,15.6); cylinder(g,3.5,2,19.7); drive(g,true,3.5,20.75);
        break;
      case 'pad': cylinder(g,7.5,c.floor-.5,c.floor/2+.25,rubber); cylinder(g,7.1,.5,.25,glue); break;
      case 'knockIn':
        cylinder(g,2.15,27,-13.5,zinc); cylinder(g,3.5,1.7,.85,metal,2.7); break;
      case 'retainer':
        cylinder(g,1.95,18,-9,zinc,2); cylinder(g,4,1.6,.8,metal,3.5); drive(g,true,3.5,1.67); break;
      case 'deskScrew':
        cylinder(g,3,23,-11.5,zinc,3.1); cylinder(g,4.5,2,1,metal,3.8); cylinder(g,1.7,.24,2.08,dark,1.7,6); break;
      case 'key': {
        const joints=[[10,0,-25],[-9,0,-14],[9,0,13],[2,0,25]];
        for(let i=1;i<joints.length;i++) {
          const a=new Vector3(...joints[i-1]), b=new Vector3(...joints[i]), d=b.clone().sub(a);
          const segment=cylinder(g,2.4,d.length()+1.2,0,zinc,2.4,6);
          segment.position.copy(a.lerp(b,.5)); segment.quaternion.setFromUnitVectors(new Vector3(0,1,0),d.normalize());
        }
        break;
      }
    }
  }
  function make(shape,side) {
    const g=new Group();
    const d=shape.endsWith('Shallow') ? drawerSizes.Shallow : drawerSizes.Deep;
    if(shape==='caseSide') caseSide(g,side);
    else if(shape==='caseBack') caseBack(g);
    else if(shape==='caseTop'||shape==='caseBase') caseEnd(g,shape);
    else if(shape.startsWith('front')) front(g,d);
    else if(shape.startsWith('side')) drawerSide(g,d,side);
    else if(shape.startsWith('back')) drawerBack(g,shape);
    else if(shape.startsWith('bottom')) box(g,...shapes[shape],0,0,0,bottom);
    else hardware(g,shape);
    return g;
  }
  return {
    instantiate({id,shape}) {
      const side=id.endsWith('-left')?-1:1;
      const key=shape==='caseSide'||shape.startsWith('side')?`${shape}/${side}`:shape;
      if(!templates.has(key)) templates.set(key,make(shape,side));
      const g=templates.get(key).clone(true), spin=g.getObjectByName('cam-turn');
      if(spin) g.userData.setCaptive=value=>{spin.rotation.y=value*Math.PI*.72;};
      return g;
    },
    dispose() { for(const g of geometries) g.dispose(); for(const m of materials) m.dispose(); }
  };
}
