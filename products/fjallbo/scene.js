import { Mesh, MeshBasicMaterial, PlaneGeometry, DoubleSide } from 'three';
export { createGeometry } from './geometry.js';

export function createPresentation({scene,own}) {
  const wall=new Mesh(own(new PlaneGeometry(2240,735)),
    own(new MeshBasicMaterial({color:0x849682,opacity:.17,transparent:true,depthWrite:false,side:DoubleSide})));
  wall.position.set(0,367.5,-225);
  wall.visible=false;
  scene.add(wall);
  return {update(_frame,{number}) {wall.visible=number>=29;}};
}
