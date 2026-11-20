import { BoxGeometry, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneGeometry, RingGeometry } from 'three';
export { createGeometry } from './geometry.js';

export function createPresentation({scene,own,ring}) {
  const trays=new Group(), trayMat=own(new MeshStandardMaterial({color:0xd0d3bf,roughness:0.88}));
  const zones = [
    ['Case panels',[-2220,5,-1448]],['Glass doors',[315,5,-1320]],['Drawer pieces',[315,5,-629]],
    ['Loose fittings',[-2120,5,729]],['Packet 1',[-1380,5,729]],['Packet 2',[-845,5,729]],['Packet 3',[-310,5,729]]
  ];
  for (const [x,z,w,d] of [[-1821,1040,604,540],[-1125,1042,500,549],[-590,974,500,410],[-55,921,500,304]]) {
    const t=new Mesh(own(new BoxGeometry(w,4,d)),trayMat);
    t.position.set(x,-1,z); t.receiveShadow=true; trays.add(t);
  }
  scene.add(trays);
  const wall=new Group();
  const wallSurface=new Mesh(own(new PlaneGeometry(1560,930)),own(new MeshBasicMaterial({color:0x919c83,opacity:0.18,transparent:true,depthWrite:false,side:2})));
  wallSurface.position.y=465; wall.add(wallSurface);
  const skirting=new Mesh(own(new BoxGeometry(1560,60,35)),own(new MeshBasicMaterial({color:0x939b83,opacity:0.28,transparent:true,depthWrite:false})));
  skirting.position.set(0,30,17.5); wall.add(skirting);
  const wallTargetGeo=own(new RingGeometry(6.5,9.3,24));
  const markerMat=own(new MeshBasicMaterial({color:0x77812a,transparent:true,opacity:0.75,depthWrite:false,side:2}));
  for(const x of [-663,663]) {
    const marker=new Mesh(wallTargetGeo,markerMat); marker.position.set(x,674,1); wall.add(marker);
  }
  scene.add(wall);
  const dowelRings=Array.from({length:6},()=>{
    const marker=ring.clone(); marker.rotation.x=-Math.PI/2; marker.scale.setScalar(13);
    scene.add(marker); return marker;
  });
  return {
    zones,
    update(frame,{number,progress,record,route},showJoint) {
      trays.visible=number===0;
      wall.visible=(number===32||number===33) && (record.events[0].kind!=='move'||progress>=record.events[0].t1);
      if(wall.visible) {
        wall.position.z=route.skirting?-263.5:-240;
        skirting.visible=route.skirting;
      }
      for(let i=0;i<dowelRings.length;i++) {
        const marker=dowelRings[i];
        marker.visible=number===26 && showJoint;
        if(!marker.visible) continue;
        const dowel=frame.poses[record.events[0].ids[i]];
        marker.position.set(dowel[0],dowel[1]+16,dowel[2]);
      }
    }
  };
}
