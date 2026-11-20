import { createStorage } from './geometry.js';
export { createGeometry } from './geometry.js';

export function createPresentation({scene,own}) {
  const right=createStorage(own,1), left=createStorage(own,-1);
  scene.add(right.tower,left.tower);
  return {
    update(_frame,{number,route}) {
      const layout=route.layout??'right-upper';
      right.tower.visible=number>=15&&layout.startsWith('right');
      left.tower.visible=number>=15&&layout.startsWith('left');
      right.lower.visible=left.lower.visible=layout.endsWith('lower');
    }
  };
}
