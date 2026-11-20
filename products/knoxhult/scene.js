import { Group, Mesh, MeshBasicMaterial, PlaneGeometry, RingGeometry } from 'three';
export { createGeometry } from './geometry.js';

export function createPresentation({scene,own}) {
  const wall=new Group();
  wall.position.z=-303;
  const surface=new Mesh(own(new PlaneGeometry(2200,1160)),own(new MeshBasicMaterial({
    color:0x909883,transparent:true,opacity:.18,depthWrite:false
  })));
  surface.position.y=580; wall.add(surface);
  const ring=own(new RingGeometry(6,8,24));
  const ink=own(new MeshBasicMaterial({color:0x778633}));
  const marks=Array.from({length:4},()=>{
    const mark=new Mesh(ring,ink);
    wall.add(mark);
    return mark;
  });
  scene.add(wall);
  return {
    update(frame,{number}) {
      wall.visible=number>=35&&number<=38;
      if(!wall.visible) return;
      for(const [i,mark] of marks.entries()) {
        mark.visible=number<=36;
        const [x,y]=frame.poses[`115753-${i+1}`];
        mark.position.set(x,y,1);
      }
    }
  };
}
