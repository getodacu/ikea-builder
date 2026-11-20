import { Mesh, MeshBasicMaterial, PlaneGeometry } from 'three';
export { createGeometry } from './geometry.js';

export function createPresentation({scene,own}) {
  const wall=new Mesh(own(new PlaneGeometry(1370,1510)),
    own(new MeshBasicMaterial({color:0x829780,transparent:true,opacity:.2,depthWrite:false,side:2})));
  wall.position.set(0,755,-150);
  wall.visible=false;
  scene.add(wall);
  return {update(_frame,{number,progress,record}) {
    wall.visible=number>21||(number===21&&progress>=record.events[0].t1);
  }};
}
