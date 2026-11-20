import { BoxGeometry, CylinderGeometry, Group, LatheGeometry, Mesh, MeshPhysicalMaterial, MeshStandardMaterial, Vector2 } from 'three';
import { shapes } from './kit.js';
import { boreBox, receivingBores } from './joinery.js';

export function createGeometry() {
  const material = (color,roughness=0.69,metalness=0) => new MeshStandardMaterial({color,roughness,metalness});
  const wood=material(0x55575c), edge=material(0x66686d), recess=material(0x393b40), back=material(0x56585c),
    metal=material(0x9da59c,0.35,0.66), zinc=material(0x68716a,0.43,0.42), plastic=material(0x333a32),
    natural=material(0xbf9b61,0.83), knob=material(0x525349,0.42,0.37), rubber=material(0x394238),
    glass=new MeshPhysicalMaterial({color:0xc3dace,transparent:true,opacity:0.24,depthWrite:false,roughness:0.16,metalness:0.12});
  const glare = new MeshPhysicalMaterial({color:0xdeede2,transparent:true,opacity:0.12,depthWrite:false,roughness:0.3});
  const materials = [wood,edge,recess,back,metal,zinc,plastic,natural,knob,rubber,glass,glare];
  const geometries = new Map();
  function mesh(group,key,create,m,x,y,z,rx=0,ry=0,rz=0) {
    if (!geometries.has(key)) geometries.set(key,create());
    const node=new Mesh(geometries.get(key),m);
    node.position.set(x,y,z); node.rotation.set(rx,ry,rz);
    node.castShadow=!m.transparent; node.receiveShadow=!m.transparent;
    group.add(node); return node;
  }
  function box(g,w,h,d,x=0,y=0,z=0,m=wood,rz=0) {
    return mesh(g,`b${w}/${h}/${d}`,()=>new BoxGeometry(w,h,d),m,x,y,z,0,0,rz);
  }
  function cy(g,r,h,x=0,y=0,z=0,m=metal,rx=0,s=16,rt=r) {
    return mesh(g,`c${rt}/${r}/${h}/${s}`,()=>new CylinderGeometry(rt,r,h,s),m,x,y,z,rx);
  }
  function tube(g,r,bore,h,m,depth=h) {
    const bottom=-h/2, top=h/2, floor=top-depth;
    const profile=depth===h
      ? [[bore,bottom],[r,bottom],[r,top],[bore,top],[bore,bottom]]
      : [[0,bottom],[r,bottom],[r,top],[bore,top],[bore,floor],[0,floor]];
    return mesh(g,`tube${r}/${bore}/${h}/${depth}`,()=>{
      const tube=new LatheGeometry(profile.map(p=>new Vector2(...p)),16);
      tube.userData.mouths=[{point:[0,top,0],normal:[0,1,0],radius:bore}];
      return tube;
    },m,0,0,0);
  }
  function channel(g,w,y,z,open=1) {
    box(g,w,2,16,0,y,z,zinc);
    for (const dz of [-7.5,7.5]) box(g,w,5,1.6,0,y+open*3,z+dz,metal);
  }
  function frameXY(g,w,h,d,rail,middle,mat=wood) {
    if (middle) box(g,w-2*rail+2,h-2*rail+2,middle,0,0,0,mat);
    for (const s of [-1,1]) {
      box(g,rail,h,d,s*(w-rail)/2,0,0,wood);
      box(g,w-2*rail,rail,d,0,s*(h-rail)/2,0,wood);
      box(g,3,h-2*rail+4,d+1,s*(w-2*rail)/2,0,0,edge);
      box(g,w-2*rail,3,d+1,0,s*(h-2*rail)/2,0,edge);
    }
  }
  function screw(g,k,r,h) {
    const flat=k==='hexScrew'||k==='flatScrew', nail=k==='nail', machine=k==='machineScrew';
    const body=r*(nail?0.39:0.55), ht=machine?2.7:Math.min(4,h*0.22);
    cy(g,body,h-ht,0,-ht/2,0,machine?zinc:metal,0,10);
    cy(g,flat?body:r,ht,0,(h-ht)/2,0,metal,0,14,r);
    if (!nail) {
      if (k==='hexScrew') cy(g,r*0.48,0.4,0,h/2+0.05,0,recess,0,6);
      else {box(g,r*1.05,0.35,r*0.24,0,h/2+0.03,0,recess); box(g,r*0.24,0.35,r*1.05,0,h/2+0.04,0,recess);}
    }
  }
  function captive(g,role) { const p=new Group(); p.name=role; g.add(p); return p; }
  function make(k,inside,shaped) {
    const g=new Group();
    const [w,h,d]=shapes[k];
    switch (k) {
      case 'plinthLong': case 'plinthSide':
        box(g,w,h-8,d,0,-4,0); box(g,w,h*0.19,d,0,h/2-4,0,wood);
        if (shaped) {
          box(g,w,7,4,0,h/2-4,d/2+1,edge);
          box(g,w,5,6,0,h/2-9,d/2+2,recess);
        }
        break;
      case 'base':
        box(g,w,h,d); box(g,w,7,d+4,0,-h/2+6,0,edge);
        for (const z of [154,196]) channel(g,w-44,h/2,z); break;
      case 'side': {
        box(g,18,h-84,d-78,inside*3,0,0,recess);
        for (const s of [-1,1]) {
          box(g,s<0?w-8:w,h,44,s<0?-inside*4:0,0,s*(d-44)/2);
          if(s<0) box(g,8,h,36,inside*(w-8)/2,0,-(d-52)/2);
          box(g,w,44,d-88,0,s*(h-44)/2,0);
          box(g,w+1,5,d-84,0,s*(h-85)/2,0,edge); box(g,w+1,h-85,5,0,0,s*(d-85)/2,edge);
        }
        break;
      }
      case 'doorRail':
        box(g,w,h,d); box(g,w,6,5,0,-h/2+5,d/2+1,edge);
        for (const z of [-26,16]) channel(g,w-11,-h/2,z,-1); break;
      case 'rail':
        box(g,w,h,d); box(g,w,8,2,0,-h/2+4,-d/2,edge); break;
      case 'top':
        box(g,w,15,d,0,9.5,0,wood); box(g,w-8,7,d-8,0,-1.5,0,edge); box(g,w-22,12,d-22,0,-11,0,recess); break;
      case 'back': {
        box(g,w,h/2-1,d,0,-h/4,0,back);
        box(captive(g,'fold'),w,h/2-1,d,0,h/4,0,back);
        box(g,w,2,d+1,0,0,0,recess); break;
      }
      case 'door':
        frameXY(g,w,h,d,25,4,glass);
        for (const offset of [-133,-95]) {
          const streak = box(g,4,310,0.4,offset,25,2.8,glare,-0.56);
          streak.renderOrder=2;
        }
        break;
      case 'drawerFront':
        frameXY(g,w,h,d,25,15,recess); break;
      case 'drawerTray':
        box(g,w,6,d,0,-h/2+3,0,recess);
        for (const s of [-1,1]) {box(g,w,h,9,0,0,s*(d-9)/2,edge);box(g,9,h,d-18,s*(w-9)/2,0,0,edge);}
        for (const x of [-w/5,w/5]) box(g,7,h-5,d-18,x,1,0,edge);
        box(g,w/2, h-5,7,w/5,1,d*0.1,edge); break;
      case 'drawerSide': {
        const low=-52.5, high=-43.5;
        box(g,w,h/2-high,d,0,(h/2+high)/2,0);
        box(g,w,low+h/2,d,0,(low-h/2)/2,0);
        box(g,w-3,high-low,d,-inside*1.5,(low+high)/2,0,recess); break;
      }
      case 'drawerBottom':
        box(g,w+4,h,d); break;
      case 'lowerDivider': case 'upperDivider': case 'drawerBack': case 'drawerPartition': case 'shelf':
        box(g,w,h,d); break;
      case 'runnerL': case 'runnerR': {
        const s=k==='runnerR'?1:-1;
        box(g,2,27,d-35,s*7,0,-5,zinc); box(g,18,3,d,0,-12,0,metal);
        box(g,2,10,d,-s*8,-7,0,metal); box(g,11,5,d-45,0,-7,16,zinc);
        box(g,7,11,7,0,-2,-d/2+16,metal); box(g,4,4,13,0,4,-d/2+16,metal);
        for (const z of [-144,144]) {
          for (const offset of [-10,0,10]) cy(g,2,0.5,s*5.8,3,z+offset,recess,0,9).rotation.z=Math.PI/2;
        }
        break;
      }
      case 'drawerCatchL': case 'drawerCatchR': {
        const s=k==='drawerCatchR'?1:-1;
        box(g,w,4,d,0,-9,0,plastic); box(g,w-18,12,d-14,0,-1,0,zinc);
        box(g,19,16,10,s*5,5,-9,plastic,0.32*s); cy(g,8,4,-s*5,3,6,rubber,0,12); break;
      }
      case 'damper':
        box(g,w,4,d,0,-2,0,zinc); cy(g,5,w*0.48,w*0.18,1,0,plastic,0,12).rotation.z=Math.PI/2;
        box(g,w*0.4,6,4,-w*0.24,1,0,metal); break;
      case 'strike':
        box(g,w,3,d,0,1,0,metal); cy(g,3,6,w/3,2,0,zinc,0,12); break;
      case 'roller':
        box(g,w,16,4,0,4,-3,zinc); cy(g,11,5,0,-3,0,metal,Math.PI/2);
        cy(g,8,5.8,0,-3,0,rubber,Math.PI/2); cy(g,3,7.4,0,-3,0,zinc,Math.PI/2); break;
      case 'lock': {
        box(g,w,21,6,0,-2,0,zinc);box(g,w-6,10,3,0,-10,4,plastic);
        const tab=captive(g,'slide'); box(tab,9,33,3,0,3,4,plastic);box(tab,10,5,7,0,17,4,metal);
        for (const x of [-11,11]) cy(g,2.5,2,x,0,4,metal,Math.PI/2,10);
        break;
      }
      case 'pull':
        box(g,w-4,h-5,4,0,0,0,recess);
        for (const s of [-1,1]) {box(g,2.5,h-8,3,s*(w/2-1.25),0,1,metal);box(g,w-2,4,3,0,s*(h/2-2),1,metal);}
        box(g,w-8,h-19,2,0,0,-2,zinc); break;
      case 'angle':
        box(g,w,2,d,0,-6,0,zinc); box(g,w,h,2,0,0,-d/2+1,metal); break;
      case 'key':
        box(g,5,5,d,0,0,0,zinc);box(g,w*0.85,5,5,w*0.38,0,d/2-2,zinc);
        box(g,w*0.44,5,5,-w*0.15,0,-d/2+2,zinc); break;
      case 'anchor':
        box(g,8,5,d,11,-5,0,zinc); box(g,5,h,d-3,w/2-2.5,0,0,zinc);
        for (const z of [-4,4]) cy(g,2.2,10,19,-10,z,metal).rotation.z=Math.PI/2;
        tube(g,9.6,4.4,h,metal); break;
      case 'washer':
        mesh(g,'dished washer',()=>new LatheGeometry([[3,-2],[12,-2],[14,0],[14,2],[12,2],[10,0],[3,0],[3,-2]]
          .map(p=>new Vector2(...p)),24),metal,0,0,0); break;
      case 'spacer': {
        cy(g,w/2,h,0,0,0,plastic,0,12); cy(captive(g,'spin'),w*0.16,0.8,0,h/2,0,zinc,0,6); break;
      }
      case 'cover': box(g,w,h,d,0,0,0,plastic);box(g,w-3,1,d-3,0,h/2+0.2,0,zinc); break;
      case 'cam': case 'crossCam': {
        cy(g,w*0.45,h*0.8,0,-1,0,zinc,0,16);
        const face=captive(g,'spin'); cy(face,w/2,h*0.24,0,h*0.38,0,metal,0,18);
        box(face,w*0.65,0.35,w*0.14,0,h/2+0.15,0,recess);
        if (k==='crossCam') box(face,w*0.14,0.35,w*0.65,0,h/2+0.19,0,recess); break;
      }
      case 'bolt':
        cy(g,w*0.43,h*0.57,0,-2,0,zinc,0,12);cy(g,w*0.28,h*0.93,0,0,0,metal,0,12);
        cy(g,w*0.4,3.8,0,h/2-2,0,metal,0,14);box(g,w*0.52,0.35,1.5,0,h/2,0,recess); break;
      case 'elbow':
        box(g,7,h*0.88,7,0,0,0,zinc);cy(g,5,5,0,h/2-3,0,metal,0,10);
        cy(g,4,d,0,-h/2+5,-d*0.28,metal,Math.PI/2,10); break;
      case 'dowel': case 'skinnyDowel':
        cy(g,w/2,h,0,0,0,natural,0,10,0.94*w/2); break;
      case 'pin': cy(g,w*0.28,h,0,0,0,metal,0,12);cy(g,w/2,2,0,0,0,zinc,0,12);break;
      case 'sleeve': tube(g,w/2,2.65,h,rubber);break;
      case 'backSocket': tube(g,w/2,3.2,h,zinc,7);break;
      case 'backPin': cy(g,w*0.24,h,0,0,0,zinc,0,10);cy(g,w/2,3,0,h/2-1.5,0,metal,0,14);break;
      case 'foot': case 'trayFoot':
        box(g,w,h/2,d,0,h/4,0,rubber); for (const s of [-1,1]) cy(g,3.5,h/2, s*w*0.24,-h/4,0,plastic,0,10);break;
      case 'knob':
        cy(g,w*0.37,3,0,-h/2+1.5,0,knob);cy(g,w*0.22,11,0,-2,0,knob,0,14);
        cy(g,w/2,7,0,h/2-4,0,knob,0,18,w*0.42);break;
      case 'bumper': tube(g,w/2,2.3,h,rubber); break;
      case 'cap': cy(g,w/2,h,0,0,0,plastic,0,12,w*0.46);break;
      case 'cable':
        box(g,w,2,d,0,0,0,edge);for (const x of [-w/2,w/2]) box(g,1.8,h,d,x,2,0,wood);break;
      default: screw(g,k,w/2,h);
    }
    return g;
  }
  const templates = new Map(), bores=receivingBores();
  return {
    instantiate({id,shape}) {
      const handed=shape==='side'||shape==='drawerSide';
      const inside=handed?(id.endsWith('L')?1:-1):0;
      const shaped=id==='pf', key=`${shape}/${inside}/${shaped}`;
      if(!templates.has(key)) templates.set(key,make(shape,inside,shaped));
      const model=templates.get(key).clone(true), cuts=bores.get(id);
      if(cuts) {
        let index=0;
        model.traverse(node=>{
          const key=`bore:${id}/${index++}`;
          const cut=geometries.get(key)??boreBox(node,cuts);
          if(cut) {
            geometries.set(key,cut);
            node.geometry=cut; node.material=[node.material,recess];
          }
        });
      }
      const motion=model.children.find(child=>['fold','spin','slide'].includes(child.name));
      if(motion?.name==='fold') {
        model.userData.setCaptive=amount=>{
          motion.rotation.x=(1-amount)*Math.PI;
          motion.position.z=-(1-amount)*6;
        };
      } else if(motion?.name==='slide') {
        model.userData.setCaptive=amount=>{motion.position.y=amount*9;};
      } else if(motion) {
        model.userData.setCaptive=amount=>{motion.rotation.y=amount*Math.PI*0.9;};
      }
      if(shape==='back') model.userData.adjustBounds=(box,amount)=>{if(!amount) box.max.y=0;};
      if(shape==='lock') model.userData.labelSuffix=amount=>amount>0.91?' · Click':'';
      return model;
    },
    dispose() { for (const g of geometries.values()) g.dispose(); for (const m of materials) m.dispose(); }
  };
}
