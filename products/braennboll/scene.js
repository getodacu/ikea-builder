import { BoxGeometry, DoubleSide, Group, Mesh, MeshBasicMaterial, PlaneGeometry } from 'three';
import { frame } from './kit.js';
export { createGeometry } from './geometry.js';

export function createPresentation({scene,own}) {
  const wall=new Group();
  const wallFace=new Mesh(own(new PlaneGeometry(1680,1850)),
    own(new MeshBasicMaterial({color:0x759594,transparent:true,opacity:.20,side:DoubleSide,depthWrite:false})));
  wallFace.position.y=925;
  const baseboard=new Mesh(own(new BoxGeometry(1680,68,34)),
    own(new MeshBasicMaterial({color:0x76928e,transparent:true,opacity:.38,depthWrite:false})));
  baseboard.position.set(0,34,17);
  wall.add(wallFace,baseboard); wall.visible=false; scene.add(wall);
  return {
    zones:[['Steel frame',[-1200,6,-1550]],['Work surfaces',[775,6,-1600]],['Felt and door pieces',[1770,6,-1750]],
      ['Fittings · p. 6',[-1300,6,695]],['Fittings · p. 7',[-1300,6,1060]],['Required, not supplied',[120,6,1036]]],
    update(_,{number,route}) {
      wall.visible=route.skirting?number>=44:number===43;
      wall.position.z=route.skirting?frame.wallSpaced:frame.wallDirect;
      baseboard.visible=route.skirting;
    }
  };
}
