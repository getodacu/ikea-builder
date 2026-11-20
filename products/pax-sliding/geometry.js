import { BoxGeometry, CylinderGeometry, ExtrudeGeometry, Group, Mesh, MeshStandardMaterial, Path, Shape } from 'three';
import { shapes } from './kit.js';

export function createGeometry() {
  const enamel=new MeshStandardMaterial({color:0xf3f1eb,roughness:.48,metalness:.14});
  const aluminum=new MeshStandardMaterial({color:0xa2aaad,roughness:.46,metalness:.52});
  const steel=new MeshStandardMaterial({color:0x7b8587,roughness:.39,metalness:.65});
  const rubber=new MeshStandardMaterial({color:0x4c5657,roughness:.77});
  const textile=new MeshStandardMaterial({color:0x7b8580,roughness:.9});
  const tape=new MeshStandardMaterial({color:0x6da5b0,roughness:.72});
  const white=new MeshStandardMaterial({color:0xf1eee5,roughness:.85});
  const oak=new MeshStandardMaterial({color:0xd4c29d,roughness:.82});
  const cache=new Map();
  function mesh(g,k,make,material,x=0,y=0,z=0) {
    if(!cache.has(k)) cache.set(k,make());
    const node=new Mesh(cache.get(k),material);
    node.position.set(x,y,z); node.castShadow=material!==tape; node.receiveShadow=true; g.add(node);
    return node;
  }
  const box=(g,w,h,d,x=0,y=0,z=0,m=enamel)=>mesh(g,`box/${w}/${h}/${d}`,()=>new BoxGeometry(w,h,d),m,x,y,z);
  const cylinder=(g,r,b,h,x,y,z,m=steel)=>mesh(g,`cyl/${r}/${b}/${h}`,()=>new CylinderGeometry(r,b,h,20),m,x,y,z);
  function disc(g,r,h,x,y,z,m=steel) {
    const node=cylinder(g,r,r,h,x,y,z,m);
    node.rotation.x=Math.PI/2;
    return node;
  }
  function polygon(points) {
    const s=new Shape(); s.moveTo(...points[0]);
    for(const p of points.slice(1)) s.lineTo(...p);
    s.closePath(); return s;
  }
  const extrude=(s,depth)=>new ExtrudeGeometry(s,{depth,bevelEnabled:false,curveSegments:16});
  function pierced(w,h,holes) {
    const s=polygon([[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]]);
    for(const [x,y,r,elongation=0] of holes) {
      const p=new Path(); p.absellipse(x,y,r,r+elongation,0,Math.PI*2,true); s.holes.push(p);
    }
    return s;
  }
  function face(g,key,w,h,z,t,holes,material,side=1,x=0,y=0) {
    return mesh(g,`face/${key}`,()=>{
      const geo=extrude(pierced(w,h,holes),t);
      geo.translate(x,y,side===1?z-t:z);
      geo.userData.mouths=holes.map(([u,v,radius])=>({point:[x+u,y+v,z],normal:[0,0,side],radius}));
      return geo;
    },material);
  }
  function flange(g,key,w,d,y,z,t,holes,material,side=1) {
    return mesh(g,`flange/${key}`,()=>{
      const geo=extrude(pierced(w,d,holes.map(([x,v,r])=>[x,-v,r])),t);
      geo.rotateX(-Math.PI/2); geo.translate(0,side===1?y-t:y,z);
      geo.userData.mouths=holes.map(([x,v,radius])=>({point:[x,y,z+v],normal:[0,side,0],radius}));
      return geo;
    },material);
  }
  function crossSection(g,key,len,points,m) {
    return mesh(g,`section/${key}`,()=>{
      const geo=extrude(polygon(points.map(([z,y])=>[-z,y])),len);
      geo.rotateY(Math.PI/2); geo.translate(-len/2,0,0);
      return geo;
    },m);
  }
  function track(g,lower) {
    const w=2000;
    const flangeY=lower?11:-7;
    flange(g,lower?'base-track':'top-track',w,27,flangeY,-10,4,[-530,-65,65,530].map(x=>[x,0,3.5]),aluminum,lower?1:-1);
    box(g,w,lower?34:25,3,0,0,4,aluminum);
    if(lower) {
      // The small inner catch runs in the upper channel; the long outer catch enters the lower channel.
      for(const [y,z] of [[6,27],[-10,19]]) {
        const way=new Group(); way.name=y>0?'inner catch lane':'outer catch lane'; way.position.set(0,y,z); g.add(way);
        box(way,w,2.5,25,0,-4,-6,aluminum);
        box(way,w,2.5,25,0,4,-6,aluminum);
        box(way,w,6,2,0,0,-11,steel);
        for(const x of [-958,958]) {
          box(way,34,4.5,2,x,0,6,steel);
          for(const dx of [-13,13]) box(way,3,2.5,10,x+dx,0,2,rubber);
        }
      }
      for(const x of [-18,18]) box(g,1.6,1.1,20,x,11.6,-7,steel);
    } else {
      // Stepped section: the outer guide passes over the inner one to the higher rear lip.
      for(const [label,y,z] of [['inner',-8,27],['outer',4,19]]) {
        const way=new Group(); way.name=`${label} running lip`; way.position.set(0,y,z); g.add(way);
        box(way,w,3,14,0,-1.5,0,aluminum);
        box(way,w,4,2.3,0,1.9,-6.2,steel);
        box(way,w,4,2.3,0,1.9,6.2,steel);
      }
    }
    for(const x of [-982,982]) {
      const y=lower?-2:-1;
      face(g,`${lower}/${x}`,26,12,33,4,[[0,0,3.2]],steel,1,x,y);
      box(g,26,3,27,x,y-6.8,19,aluminum);
    }
  }
  function stile(g,s) {
    box(g,10,1940,16,s*6,0,-7,aluminum);
    box(g,14,1940,3,-s*4,0,-3.7,enamel);
    box(g,3,1940,12,s*2,0,1,aluminum);
    for(const y of [-943,943]) {
      box(g,23,36,8,0,y,-5,enamel);
      box(g,4,32,2,-s*8,y,0.6,steel);
    }
    for(const y of [-958,958]) {
      box(g,40,24,5,-s*27,y,-3,aluminum);
      for(const x of [8,46]) box(g,2,21,4,-s*x,y,-7.4,steel);
    }
    const cams=[-946,946].map(y=>{
      const cam=new Group(); cam.position.set(0,y,-10); g.add(cam);
      disc(cam,6,3,0,0,0,steel);
      box(cam,7,1.1,.7,0,0,-1.8,rubber);
      return cam;
    });
    const cover=new Group(); cover.name='captive stile cover'; cover.position.set(s*9,0,4); g.add(cover);
    box(cover,21,1925,3,-s*9,0,1);
    box(cover,3,1925,6,-s*17,0,0.7);
    g.userData.setCaptive=v=>{
      for(const cam of cams) cam.rotation.z=s*Math.min(v,1)*Math.PI/2;
      cover.rotation.y=s*Math.max(0,v-1)*1.48;
    };
  }
  function head(g,w) {
    box(g,w,11,16,0,3,-3.8,aluminum);
    box(g,w,18,2.4,0,0,-5,enamel);
    const cap=new Group(); cap.name='captive top cover'; cap.position.set(0,6,4); g.add(cap);
    box(cap,w,17,3,0,-5,2.7);
    box(cap,w,3,8,0,3,0);
    const tab=new Group(); tab.position.set(0,8,9.4); cap.add(tab);
    box(tab,38,13,.9,0,-5,0,tape);
    g.userData.setCaptive=v=>{
      tab.rotation.x=-Math.min(v,1)*2.2;
      cap.rotation.x=-Math.max(0,v-1)*1.55;
    };
  }
  function foot(g,w) {
    box(g,w,14,17,0,0,0,aluminum);
    box(g,w,8,3,0,9,-4,enamel);
    box(g,w,8,3,0,9,4,enamel);
    box(g,w,11,3,0,-6,9,enamel);
  }
  function divider(g,w) {
    flange(g,'divider-pin-mouths',w,15,7,-2.5,2.6,[[-463,-1.5,3.1],[463,-1.5,3.1]],aluminum);
    box(g,w,3,16,0,0,0,aluminum);
    box(g,w,9,3,0,0,5,enamel);
    box(g,w,8,2,0,0,-7,enamel);
  }
  function bracket(g,name) {
    const roller=name.endsWith('Roller'), tall=name.startsWith('long');
    const z=tall?-47:-16;
    face(g,'bracket',40,24,-9,3,[[-9,0,3.4,2],[9,0,3.4,2]],steel,-1);
    if(roller) {
      const y=tall?28:20;
      crossSection(g,name,24,[[-8,9],[-8,y+4],[z-2,y+4],[z-5,y-1],[z-2,y-4],[-13,y-4],[-13,9]],aluminum);
      const wheel=disc(g,8,7,0,y,z,rubber); wheel.name='roller';
      disc(g,4.8,9,0,y,z,aluminum);
      disc(g,2.4,10,0,y,z,steel);
    } else {
      const y=tall?-27:-7;
      crossSection(g,name,10,[[-8,6],[-14,6],[-14,y+4],[z+8,y+4],[z+8,y-3],[-7,y-3]],aluminum);
      const tongue=new Group(); tongue.name='catch tongue'; tongue.position.set(0,y,z+3); g.add(tongue);
      box(tongue,26,3.6,9,0,0,0,steel);
      for(const x of [-9,0,9]) box(tongue,5,3.6,5,x,0,-5,steel);
      for(const x of [-9,9]) box(tongue,3,1.1,4,x,2.35,1,rubber);
      g.userData.setCaptive=v=>{ tongue.position.z=z+3*(1-v); };
    }
  }
  function screw(g,w,h,shape) {
    const r=w/2, shaft=h-2, pin=shape==='pin';
    cylinder(g,r,pin?r*.89:r*.78,2.4,0,1.1,0,pin?rubber:steel);
    cylinder(g,r*(pin?.57:.47),r*.38,shaft-3,0,-(shaft-3)/2,0,pin?aluminum:steel);
    cylinder(g,r*.38,.25,3,0,-shaft+1.5,0,pin?aluminum:steel);
    if(!pin) {
      box(g,r*1.22,.18,.7,0,2.38,0,rubber);
      box(g,.7,.18,r*1.22,0,2.39,0,rubber);
    }
  }
  function make(g,{id,shape}) {
    const [w,h,d]=shapes[shape];
    switch(shape) {
      case 'upperTrack': case 'lowerTrack': track(g,shape==='lowerTrack'); break;
      case 'stile': stile(g,id.endsWith('-left')?-1:1); break;
      case 'head': head(g,w); break;
      case 'foot': foot(g,w); break;
      case 'divider': divider(g,w); break;
      case 'panel': {
        const m=box(g,w,h,d);
        m.material=[oak,oak,oak,oak,white,oak]; break;
      }
      case 'shortRoller': case 'longRoller': case 'shortCatch': case 'longCatch': bracket(g,shape); break;
      case 'railScrew': case 'joinScrew': case 'flangeScrew': case 'machineScrew': case 'pin': screw(g,w,h,shape); break;
      case 'pad': box(g,w,h,d,0,0,0,textile); break;
      case 'key':
        cylinder(g,2.5,2.5,73,-10,0,0);
        cylinder(g,2.5,2.5,24,.5,34.8,0).rotation.z=Math.PI/2;
        break;
      case 'trim':
        face(g,'side-trim',w,h,8,3,[-906,-305,305,906].map(y=>[0,y,3.1]),enamel);
        box(g,3,h,11,id.endsWith('-left')?-13:13,0,2,aluminum);
        break;
      case 'edging':
        box(g,w,h,2,0,0,1,rubber);
        box(g,3,h,8,id.endsWith('-left')?-3.5:3.5,0,-3,enamel);
        break;
      case 'dustCover':
        crossSection(g,'dust',w,[[-31,1],[8,1],[14,-1],[31,-1],[31,-4],[13,-4],[7,-2],[-31,-2]],enamel);
        box(g,w,2,1,0,-2.6,26,aluminum);
        break;
      case 'brush':
        box(g,6,h,7,0,0,4,aluminum);
        box(g,8,h,8,1,0,-1,textile);
        box(g,5,h,2,1,0,-6,rubber);
        break;
    }
  }
  return {
    instantiate(p) { const g=new Group(); make(g,p); return g; },
    dispose() {
      for(const geo of cache.values()) geo.dispose();
      for(const mat of [enamel,aluminum,steel,rubber,textile,tape,white,oak]) mat.dispose();
    }
  };
}
