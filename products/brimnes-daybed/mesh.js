import {BoxGeometry,BufferGeometry,CylinderGeometry,Float32BufferAttribute,LatheGeometry,Mesh,MeshStandardMaterial,ShapeUtils,Vector2} from 'three';

// Work a face at a time. Coaxial cuts can meet or step down to a smaller pilot.
function drilled(size,center,holes) {
  const vertices=[], mouths=[], half=size.map(v=>v/2), groups=[new Map(),new Map(),new Map()];
  for(const {point,normal,radius,depth,slot=0,slotAxis=0} of holes) {
    const n=normal.findIndex(v=>Math.abs(v)>.99); if(n<0) continue;
    const a=(n+1)%3,b=(n+2)%3, u=point[a]-center[a],v=point[b]-center[b];
    if(Math.abs(u)+radius+(a===slotAxis?slot/2:0)>half[a]+.001 || Math.abs(v)+radius+(b===slotAxis?slot/2:0)>half[b]+.001) continue;
    const start=point[n]-center[n], end=start-depth*normal[n];
    const lo=Math.max(-half[n],Math.min(start,end)), hi=Math.min(half[n],Math.max(start,end));
    if(hi-lo<.001) continue;
    const key=`${u},${v}`, group=groups[n].get(key)??{u,v,cuts:[]};
    group.cuts.push({lo,hi,radius,slot,alongU:slotAxis===a}); groups[n].set(key,group);
  }
  if(groups.every(g=>g.size===0)) return;
  for(let n=0;n<3;n++) {
    const a=(n+1)%3,b=(n+2)%3,h=half[n], apertures=[[],[]];
    function vertex(w,{x,y}) {const v=[];v[n]=w;v[a]=x;v[b]=y;return v;}
    function face(w,sign,edge,cutouts=[]) {
      const all=edge.concat(...cutouts);
      for(const [i,j,k] of ShapeUtils.triangulateShape(edge,cutouts)) {
        vertices.push(...vertex(w,all[i]),...vertex(w,all[sign>0?j:k]),...vertex(w,all[sign>0?k:j]));
      }
    }
    for(const {u,v,cuts} of groups[n].values()) {
      function outline(c) {
        const points=[];
        for(let i=0;i<16;i++) {
          const angle=(i+.5)*Math.PI/8, x=Math.cos(angle), y=Math.sin(angle);
          points.push(new Vector2(u+x*c.radius+(c.alongU?Math.sign(x)*c.slot/2:0),v+y*c.radius+(c.alongU?0:Math.sign(y)*c.slot/2)));
        }
        return points;
      }
      const levels=[...new Set(cuts.flatMap(c=>[c.lo,c.hi]))].sort((a,b)=>a-b);
      let prev=null;
      for(const [j,lo] of levels.entries()) {
        const hi=levels[j+1];
        let cut=null;
        if(hi!==undefined) for(const c of cuts) {
          if(c.lo<=lo&&hi<=c.hi&&(!cut||c.radius>cut.radius)) cut=c;
        }
        if(cut!==prev) {
          if(Math.abs(Math.abs(lo)-h)<1e-5) {
            const sign=Math.sign(lo), rim=cut||prev, side=sign<0?0:1;
            apertures[side].push(outline(rim));
            const normal=[0,0,0];normal[n]=sign;
            mouths.push({point:vertex(lo,{x:u,y:v}).map((x,i)=>x+center[i]),normal,radius:rim.radius});
          } else if((cut?.radius??0)!==(prev?.radius??0)) {
            const opening=(cut?.radius??0)>(prev?.radius??0), outer=opening?cut:prev, inner=opening?prev:cut;
            face(lo,opening?1:-1,outline(outer),inner?[outline(inner)]:[]);
          }
        }
        if(cut) {
          const rim=outline(cut);
          for(const [i,p] of rim.entries()) {
            const q=rim[(i+1)%rim.length],a=vertex(lo,p),b=vertex(hi,p),c=vertex(hi,q),d=vertex(lo,q);
            vertices.push(...a,...b,...c,...a,...c,...d);
          }
        }
        prev=cut;
      }
    }
    const rect=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([u,v])=>new Vector2(u*half[a],v*half[b]));
    face(-h,-1,rect,apertures[0]);face(h,1,rect,apertures[1]);
  }
  const geo=new BufferGeometry();geo.setAttribute('position',new Float32BufferAttribute(vertices,3));geo.computeVertexNormals();
  geo.userData.mouths=mouths; return geo;
}

export function meshTools() {
  const owned=new Set(),cache=new Map();
  const material=(color,roughness=.72,metalness=0)=>{const m=new MeshStandardMaterial({color,roughness,metalness});owned.add(m);return m;};
  const shared=(key,make)=>{if(!cache.has(key))cache.set(key,make());return cache.get(key);};
  function mesh(g,geo,mat,center=[0,0,0]) {
    owned.add(geo);const node=new Mesh(geo,mat);node.position.fromArray(center);node.castShadow=node.receiveShadow=true;g.add(node);return node;
  }
  const white=material(0xf3f1eb),zinc=material(0xa8acaf,.44,.55),steel=material(0x8b9396,.48,.55);
  function box(g,size,center=[0,0,0],mat=white) {
    return mesh(g,shared(`box/${size}`,()=>new BoxGeometry(...size)),mat,center);
  }
  const orient=(node,axis)=>{if(axis==='x')node.rotation.z=-Math.PI/2;else if(axis==='z')node.rotation.x=Math.PI/2;return node;};
  return {white,inset:material(0xe5e3dc),pine:material(0xdcb887),wood:material(0xb99463),steel,dark:material(0x50595d,.58,.28),
    rubber:material(0x44484a),plastic:material(0xdedcd3),zinc,mesh,box,
    block(g,part,size,center=[0,0,0],mat=white,holes=part.holes) {
      const geo=drilled(size,center,holes);return geo?mesh(g,geo,mat,center):box(g,size,center,mat);
    },
    cylinder(g,radius,height,center=[0,0,0],mat=zinc,axis='y',top=radius,segments=18) {
      return orient(mesh(g,shared(`c/${radius}/${top}/${height}/${segments}`,()=>new CylinderGeometry(top,radius,height,segments)),mat,center),axis);
    },
    ring(g,outer,inner,height,center=[0,0,0],mat=steel,axis='y') {
      const h=height/2;
      return orient(mesh(g,shared(`ring/${outer}/${inner}/${height}`,()=>new LatheGeometry([[inner,-h],[outer,-h],[outer,h],[inner,h],[inner,-h]].map(([x,y])=>new Vector2(x,y)),24)),mat,center),axis);
    },
    dispose(){for(const resource of owned)resource.dispose();owned.clear();cache.clear();}
  };
}
