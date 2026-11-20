import { Box3, BoxGeometry, Group, Mesh, MeshStandardMaterial } from 'three';
import { datum } from './kit.js';
export { createGeometry } from './geometry.js';

export function createPresentation({scene,own}) {
  const bays=new Group(), levels=new Group();
  const caseMaterial=own(new MeshStandardMaterial({color:0xdedbd1,roughness:.82}));
  const backMaterial=own(new MeshStandardMaterial({color:0xd3d1c8,roughness:.91}));
  const levelMaterial=own(new MeshStandardMaterial({color:0x737e69,roughness:.78}));
  const vial=own(new MeshStandardMaterial({color:0xc4d78c,roughness:.38}));
  const trayMaterial=own(new MeshStandardMaterial({color:0xb6c9c1,roughness:.89}));
  const boxes=new Map();
  function box(group,w,h,d,x,y,z,material,shadow=true) {
    const key=`${w}/${h}/${d}`;
    if(!boxes.has(key)) boxes.set(key,own(new BoxGeometry(w,h,d)));
    const m=new Mesh(boxes.get(key),material);
    m.position.set(x,y,z); m.castShadow=shadow; m.receiveShadow=true; group.add(m);
    return m;
  }
  const {width,height,depth}=datum, bay=width/2, thickness=19, inside=bay-2*thickness;
  for(const x of [-bay/2,bay/2]) {
    for(const sign of [-1,1]) box(bays,thickness,height,depth,x+sign*(bay-thickness)/2,height/2,-depth/2,caseMaterial);
    for(const y of [29,height-thickness/2]) box(bays,inside,thickness,depth,x,y,-depth/2,caseMaterial);
    box(bays,inside,19,17,x,9.5,-37,caseMaterial);
    box(bays,inside,height-2*thickness,4,x,height/2,-depth+6,backMaterial);
    box(levels,600,18,22,x,height+9,-63,levelMaterial);
    box(levels,40,3,17,x,height+19,-63,vial);
  }
  box(levels,21,540,23,-1010,1140,-64,levelMaterial);
  box(levels,3,40,17,-1022,1140,-64,vial);
  const tray=new Group();
  box(tray,2050,4,2000,1610,-1,790,trayMaterial,false);
  scene.add(bays,levels,tray);
  const bounds=new Box3().setFromObject(bays);
  bays.visible=levels.visible=false;
  return {
    bounds,
    zones:[['PAX frame and rail kit',[-450,9,450]],['Required, not supplied',[1610,9,785]]],
    update(_frame,{number}) {
      bays.visible=number>0;
      levels.visible=number===1;
      tray.visible=number===0;
    }
  };
}
