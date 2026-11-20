import {
  BoxGeometry, BufferGeometry, CylinderGeometry, DoubleSide, ExtrudeGeometry, Float32BufferAttribute,
  Group, LatheGeometry, LineBasicMaterial, LineSegments, Mesh, MeshStandardMaterial, Path, Shape, Vector2
} from 'three';
import {
  adjustY, baseY, braceFast, catchY, doorBottom, doorData, doorTop, hingeDoorX, hingeDrill, hingePostX, hingeY,
  postBottom, postCenter, postTop, postZ, railY, railZ, rimY, shapes, shelfScrews, stations, stopY, topBoltY,
  topFixings, topScrews, wallY
} from './kit.js';

const {PI}=Math, half=PI/2;
const rect=(w,h,x=0,y=0)=>[[x-w/2,y-h/2],[x+w/2,y-h/2],[x+w/2,y+h/2],[x-w/2,y+h/2]];
function trace(path,points) {
  points.forEach(([x,y],i)=>i?path.lineTo(x,y):path.moveTo(x,y));
  path.closePath();
  return path;
}

export function createGeometry() {
  const objects=new Map(), geometries=new Map(), materials=[];
  function material(color,roughness=.65,metalness=.22,side) {
    const mat=new MeshStandardMaterial({color,roughness,metalness,...(side===undefined?{}:{side})}); materials.push(mat); return mat;
  }
  const steel=material(0x272829), rimSteel=material(0x383b3d), meshSteel=material(0x3a3d3f,.61,.34,DoubleSide);
  const zinc=material(0x777b7f,.41,.7), dark=material(0x15191b,.79), rubber=material(0x303137,.85);
  const pine=material(0x98704b,.72,0), pineEdge=material(0x704c33,.76,0), cue=material(0x96b58e,.65,0);
  // Bias the pine faces in depth, not the grain in world space.
  pine.polygonOffset=true; pine.polygonOffsetUnits=1;
  const grain=new LineBasicMaterial({color:0x563b2a,opacity:.32,transparent:true}); materials.push(grain);
  function get(key,build) {
    if(!geometries.has(key)) geometries.set(key,build());
    return geometries.get(key);
  }
  function make(g,key,build,mat,x=0,y=0,z=0) {
    const m=new Mesh(get(key,build),mat);
    m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true; g.add(m); return m;
  }
  const box=(g,w,h,d,x=0,y=0,z=0,m=steel)=>make(g,`b/${w}/${h}/${d}`,()=>new BoxGeometry(w,h,d),m,x,y,z);
  const cyl=(g,r,h,x=0,y=0,z=0,m=zinc,r2=r,n=20)=>make(g,`c/${r}/${r2}/${h}/${n}`,()=>new CylinderGeometry(r,r2,h,n),m,x,y,z);
  function plate(g,key,w,h,t,holes,at,rx=0,ry=0,mat=steel,edge=rect(w,h),window=null) {
    const obj=make(g,`p/${key}`,()=>{
      const s=trace(new Shape(),edge);
      for(const [x,y,r,yr=r] of holes) {
        const p=new Path(); p.absellipse(x,y,r,yr,0,2*PI,true); s.holes.push(p);
      }
      if(window) s.holes.push(trace(new Path(),window.slice().reverse()));
      const geo=new ExtrudeGeometry(s,{depth:t,bevelEnabled:false,curveSegments:12}); geo.translate(0,0,-t/2); return geo;
    },mat,...at);
    obj.rotation.set(rx,ry,0);
    return obj;
  }
  const ring=(g,key,ro,ri,h,x,y,z,m=zinc)=>make(g,`r/${key}`,()=>new LatheGeometry(
    [[ri,-h/2],[ro,-h/2],[ro,h/2],[ri,h/2],[ri,-h/2]].map(([r,v])=>new Vector2(r,v)),24),m,x,y,z);
  const mountTab=(g,key,x,z,y)=>plate(g,key,20,16,2,[[0,0,3.4]],[x,y,z],-half,0,rimSteel);

  function lattice(g,w,h,x=0,y=0,z=0,rx=0,ry=0) {
    const m=make(g,`lattice/${w}/${h}`,()=>{
      const vertices=[], indices=[], pitch=10, gauge=.91;
      for(const k of [-.56,.56]) for(let b=-Math.ceil((h/2+Math.abs(k)*w/2)/pitch)*pitch;b<=h/2+Math.abs(k)*w/2;b+=pitch) {
        const a=(-h/2-b)/k, c=(h/2-b)/k;
        const lo=Math.max(-w/2,Math.min(a,c)), hi=Math.min(w/2,Math.max(a,c));
        if(lo>=hi) continue;
        const y1=k*lo+b, y2=k*hi+b, q=vertices.length/3;
        const clip=y=>Math.min(h/2,Math.max(-h/2,y));
        vertices.push(lo,clip(y1-gauge),0,hi,clip(y2-gauge),0,hi,clip(y2+gauge),0,lo,clip(y1+gauge),0);
        indices.push(q,q+1,q+2,q,q+2,q+3);
      }
      const geo=new BufferGeometry(); geo.setAttribute('position',new Float32BufferAttribute(vertices,3));
      geo.setIndex(indices); geo.computeVertexNormals(); return geo;
    },meshSteel,x,y,z);
    m.rotation.set(rx,ry,0); m.name='Open diamond steel mesh';
  }

  function post(g,k,x,z,y=postCenter) {
    const h=postTop-postBottom, isFront=!k.startsWith('postRear')&&z>=0;
    const outer=isFront?1:-1;
    for(const f of [-1,1]) {
      const holes=[];
      if(k.startsWith('end')&&isFront) {
        holes.push(...adjustY.map(v=>[0,v-postCenter,3.8]));
        if(f===outer) holes.push(...hingeY.flatMap(v=>hingeDrill.map(dy=>[0,v+dy-postCenter,2.9])));
      }
      if(k==='postHinge'&&f===outer) holes.push(...hingeY.flatMap(v=>hingeDrill.map(dy=>[0,v+dy-postCenter,2.9])));
      if(k==='postRearWall') holes.push([0,wallY-postCenter,4.6]);
      if(k==='postRearWall'||k==='postHinge'||k==='postFrontCenter'||(k.startsWith('end')&&isFront)) holes.push([0,topBoltY-postCenter,3.3]);
      if(!k.startsWith('end')) holes.push([0,baseY-postCenter,3.2],[0,railY-postCenter,3.2]);
      if(k.startsWith('post')&&isFront&&f===-1) holes.push([0,stopY-postCenter,3.1]);
      plate(g,`${k}/${isFront}/face/${f}`,20,h,1.8,holes,[x,y,z+f*9.1]);
      box(g,1.8,h,16.4,x+f*9.1,y,z);
    }
    ring(g,'leg-end',8.1,3.2,9,x,y+postBottom-postCenter+4.5,z,steel).name='Threaded foot receiver';
  }
  function endFrame(g,k) {
    const s=k==='endL'?-1:1;
    post(g,k,0,-postZ); post(g,k,0,postZ);
    for(const y of [126,493]) box(g,18,12,396,0,y,0);
    lattice(g,394,366,0,309.5,0,0,half);
    box(g,13,14,396,0,railY,0);
    mountTab(g,'side shelf tab',-s*14,0,299);
    for(const y of [railY,baseY]) for(const z of [-railZ,railZ]) {
      for(const f of [-1,1]) plate(g,'end clevis face',27,19,1.8,[[0,0,3.3]],[-s*24,y,z+f*9.1]);
      for(const f of [-1,1]) box(g,27,1.8,16.4,-s*24,y+f*8.6,z);
      box(g,3,19,19,-s*9.5,y,z);
    }
  }
  function key(g,x,z,hasBolt) {
    plate(g,hasBolt?'pierced steel tongue':'plain steel tongue',27,14,11,hasBolt?[[0,0,3.1]]:[],[x,0,z],0,0,rimSteel).name='Square keyed rail tongue';
  }
  function longRail(g,k) {
    const s=k==='railFront'?1:-1;
    for(const f of [-1,1]) {
      plate(g,'shelf rail transverse face',1876,20,1.8,stations.slice(1,-1).map(x=>[x,0,3.3]),[0,0,f*9.1]);
      box(g,1876,1.8,16.4,0,f*9.1,0);
      key(g,f*951,0,true);
    }
    for(const [x,z] of shelfScrews) if(Math.sign(z)===s) {
      box(g,17,10,3,x,9,-s*9);
      mountTab(g,'long rail shelf tab',x,z-s*railZ,13);
    }
  }
  function base(g) {
    for(const s of [-1,1]) {
      for(const f of [-1,1]) {
        plate(g,'lower mesh long rail',1876,20,1.8,stations.slice(1,-1).map(x=>[x,0,3.3]),[0,0,s*(railZ+f*9.1)]);
        box(g,1876,1.8,16.4,0,f*9.1,s*railZ);
        key(g,s*951,f*railZ,f===1);
      }
      box(g,14,18,356,s*931,0,0);
    }
    for(const x of [-325,325]) box(g,15,16,356,x,0,0);
    lattice(g,1850,356,0,7.2,0,-half);
    for(const s of [-1,1]) {
      const x=s*922;
      const holes=braceFast.map(dx=>[s*(975-dx)-x,0,3.3]);
      plate(g,`brace receiver/${s}`,100,20,1.6,holes,[x,0,19+railZ]);
      box(g,100,2,23,x,-9,railZ+8);
    }
  }
  function brace(g,k) {
    const s=k==='braceL'?1:-1;
    const edge=[[-9,27],[9,27],[10,67],[16,84],[31,95],[69,104],[69,121],[-9,121]].map(([x,y])=>[s*x,y]);
    plate(g,k,0,0,3,[...adjustY.map(y=>[0,y,4]),...braceFast.map(x=>[s*x,baseY,3.3])],[0,0,0],0,0,rimSteel,edge);
  }
  function pinePanel(g,k) {
    const [w,h,d]=shapes[k];
    const m=box(g,w,h,d,0,0,0,pine); m.material=[pineEdge,pineEdge,pine,pine,pineEdge,pineEdge];
    const geo=get(`grain-${k}`,()=>{
      const vertices=[];
      for(let i=0;i<57;i++) {
        let x=-w/2+24+((i*373)%(w-115)), z=-d/2+12+((i*149)%(d-24));
        for(let j=1;j<=5&&x<w/2-56;j++) {
          const dx=19+((i*43+j*13)%30), dz=Math.sin(i*6+j)*1.7;
          vertices.push(x,h/2,z,x+dx,h/2,z+dz); x+=dx; z+=dz;
        }
      }
      return new BufferGeometry().setAttribute('position',new Float32BufferAttribute(vertices,3));
    });
    g.add(new LineSegments(geo,grain));
  }
  function topRim(g) {
    for(const z of [-postZ,postZ]) box(g,1930,8,18,0,0,z);
    for(const x of [-975,975]) box(g,18,8,398,x,0,0);
    for(const [x,z] of topScrews.slice(0,6)) mountTab(g,'top rim end tab',x,z,-6);
    for(const x of [-325,325]) plate(g,'top rim crossmember',17,434,4,[[0,-207,3.3],[0,207,3.3]],[x,-4,0],-half,0,rimSteel);
    const keysWithHoles=new Set(topFixings.map(([x,z])=>`${x}/${z}`));
    for(const x of stations) for(const z of [-postZ,postZ]) {
      const center=topBoltY-rimY+1;
      plate(g,keysWithHoles.has(`${x}/${z}`)?'pierced upright key':'plain upright key',15,19,15,
        keysWithHoles.has(`${x}/${z}`)?[[0,-1,3.2]]:[],[x,center,z],0,0,rimSteel).name='Top locating key';
    }
  }
  function stop(g) {
    plate(g,'offset stop base',54,17,2,[[0,0,3.2]],[0,0,-1]);
    for(const s of [-1,1]) {
      box(g,15,11,10,s*24,-5,5,rimSteel);
      box(g,17,12,4,s*28,-5,13,rubber);
    }
  }
  function door(g,k) {
    const {s,w}=doorData[Number(k.at(-1))-1], h=doorTop-doorBottom, center=(doorTop+doorBottom)/2;
    const xr=w/2-32, yr=h/2-25, x0=s*w/2;
    const cuts=[[-xr+15,-yr],[xr-15,-yr],[xr,-yr+15],[xr,yr-15],[xr-15,yr],[-xr+15,yr],[-xr,yr-15],[-xr,-yr+15]].map(([x,y])=>[x+x0,y]);
    const hinges=hingeY.flatMap(y=>hingeDrill.map(dy=>[s*hingeDoorX,y+dy-center,2.9]));
    const catchHole=[s*(w-15),catchY-center,2.9];
    for(const f of [-1,1]) plate(g,`${k}/surround/${f}`,w-2,h,2,[...hinges,...(f===-1?[catchHole]:[])],[0,0,f*2.5],0,0,steel,rect(w-2,h,x0+s),cuts);
    for(const y of [-h/2+2,h/2-2]) box(g,w-2,4,5,x0+s,y,0,rimSteel);
    lattice(g,w-62,h-48,x0,0,0);
    const x=s*(w-10);
    for(const y of [-13,13]) box(g,6,5,8,x,y,6,rimSteel);
    box(g,6,30,5,x,0,10,rimSteel).name='Integral door pull';
  }
  function hinge(g,k) {
    const s=k==='hingeL'?1:-1;
    const fixed=new Group(); fixed.name='Frame hinge leaf'; g.add(fixed);
    plate(g,`${k}/moving`,34,44,1.8,hingeDrill.map(y=>[s*hingeDoorX,y,3.2]),[0,0,3.55],0,0,rimSteel,rect(34,44,s*19));
    plate(fixed,`${k}/fixed`,29,44,1.8,hingeDrill.map(y=>[-s*hingePostX,y,3.2,5.6]),[0,0,-.9],0,0,rimSteel,rect(29,44,-s*16));
    cyl(g,2.2,45,0,0,0,zinc);
    for(const y of [-15,0,15]) cyl(y===0?fixed:g,3.9,14,0,y,0,rimSteel);
  }
  function cross(g,r,y) {
    box(g,r*1.45,.32,.95,0,y,0,dark);
    box(g,.95,.32,r*1.45,0,y,0,dark);
  }
  function thread(g,r,length,from,z=0,wide=false) {
    const geo=get(`thread/${r}/${length}/${wide}`,()=>{
      const profile=[[r,0]];
      for(let y=2;y<length-1;y+=wide?4:2.7) profile.push([r,y-.7],[r+.58,y],[r,y+.7]);
      profile.push([r,length]); return new LatheGeometry(profile.map(([x,y])=>new Vector2(x,y)),16);
    });
    const m=new Mesh(geo,zinc); m.position.set(0,from,z); g.add(m);
  }
  function fitting(g,k) {
    if(k==='foot') {
      const edge=Array.from({length:32},(_,i)=>[10*Math.cos(i*PI/16),10*Math.sin(i*PI/16)]);
      plate(g,'glide slotted sole',0,0,1.3,[],[0,-3.35,0],-half,0,rubber,edge,rect(6.96,.95));
      cyl(g,10,6.7,0,.65,0,rubber,10,32); cyl(g,8.4,1.4,0,4.4,0,rimSteel);
      for(let i=0;i<24;i++) {
        const a=i*PI/12, ridge=box(g,1,5,.65,9.8*Math.cos(a),0,9.8*Math.sin(a),rimSteel); ridge.rotation.y=-a;
      }
      cyl(g,2.4,18,0,12,0); thread(g,2.4,18,3);
    } else if(k==='sleeve') {
      ring(g,'sleeve',3.6,2.45,16,0,-8,0);
      cyl(g,5,2.4,0,1.2,0); cross(g,4.5,2.5);
    } else if(k==='washer') {
      ring(g,'catch',8,3,3.5,0,0,0,rimSteel);
      ring(g,'catch accent',6.5,3.5,.6,0,1.75,0,zinc);
    } else if(k==='anchor') {
      const m=ring(g,'wall position',9,6.8,1.8,0,0,0,cue);m.rotation.x=half;m.name='External wall fixing location, not a supplied fastener';
    } else if(k==='clip') {
      box(g,18,20,2,0,0,1,rubber);
      const liner=new Group(); liner.name='Peel-off release liner'; liner.position.set(0,-9,-.25); g.add(liner);
      box(liner,17,19,.35,0,9.5,0,cue);
      const jaw=[[-7,1],[-7,8],[-5,11],[-2,12],[-2,10],[-4,8],[-4,2]];
      for(const s of [-1,1]) plate(g,`clip jaw/${s}`,0,0,12,[],[0,0,1.7],half,0,rimSteel,jaw.map(([x,y])=>[s*x,y]));
    } else {
      const wood=k==='woodScrew', long=k==='longScrew', shoulder=k==='shoulder', [w,len]=shapes[k];
      const r=w/2, root=shoulder?2.8:wood?2.35:2.45, h=long?2.2:shoulder?2.6:3.2, tip=wood?3.7:0;
      cyl(g,r,h,0,h/2,0,zinc,long?r*.54:r*.91);
      if(shoulder) cyl(g,3.65,3.4,0,-1.7,0);
      cyl(g,root,len-tip,0,-(len+tip)/2,0,zinc);
      if(tip) cyl(g,root,tip,0,-len+tip/2,0,zinc,.35);
      thread(g,root,len-tip-(shoulder?3:0),-len+tip,0,wood||long);
      cross(g,r,h+.15);
    }
  }
  function build(k) {
    const g=new Group();
    if(k==='endL'||k==='endR') endFrame(g,k);
    else if(k==='railFront'||k==='railRear') longRail(g,k);
    else if(k==='base') base(g);
    else if(k.startsWith('brace')) brace(g,k);
    else if(k.startsWith('post')) post(g,k,0,0,0);
    else if(k==='shelf'||k==='top') pinePanel(g,k);
    else if(k==='rim') topRim(g);
    else if(k==='stop') stop(g);
    else if(k.startsWith('door')) door(g,k);
    else if(k.startsWith('hinge')) hinge(g,k);
    else fitting(g,k);
    return g;
  }
  return {
    instantiate(part) {
      const k=part.shape;
      if(!objects.has(k)) objects.set(k,build(k));
      const node=objects.get(k).clone(true);
      if(k==='hingeL'||k==='hingeR') {
        const fixed=node.getObjectByName('Frame hinge leaf');
        node.userData.setCaptive=angle=>{fixed.rotation.y=angle;};
      }
      if(k==='clip') {
        const liner=node.getObjectByName('Peel-off release liner');
        node.userData.setCaptive=value=>{liner.visible=value<.96; liner.rotation.x=-value*2.4;};
      }
      if(k.startsWith('end')) node.userData.adjustBounds=b=>{b.min.y=postBottom; b.max.y=postTop;};
      if(k.startsWith('brace')) node.userData.adjustBounds=b=>{b.min.y=27; b.max.y=121;};
      if(k.startsWith('door')) {
        const {s,w}=doorData[Number(k.at(-1))-1];
        node.userData.adjustBounds=b=>{b.min.x=s>0?0:-w; b.max.x=s>0?w:0;};
      }
      return node;
    },
    dispose() {
      for(const geo of geometries.values()) geo.dispose();
      for(const mat of materials) mat.dispose();
    }
  };
}