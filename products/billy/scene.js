import { Mesh, MeshBasicMaterial, PlaneGeometry } from 'three';
import { H, wallZ } from './kit.js';
export { createGeometry } from './geometry.js';

export function createPresentation({scene,own}) {
  const wall=new Mesh(own(new PlaneGeometry(1120,H+126)),
    own(new MeshBasicMaterial({color:0x8e9d8a,transparent:true,opacity:.17,depthWrite:false,side:2})));
  wall.position.set(0,(H+126)/2,wallZ-.5);
  wall.visible=false;
  scene.add(wall);
  return {update(frame,{number}) { wall.visible=number>=10 && Boolean(frame.poses['106989-1']); }};
}
