import {
  Box3, BoxGeometry, Color, DirectionalLight, EdgesGeometry, GridHelper, HemisphereLight, LineBasicMaterial,
  LineSegments, Matrix4, Mesh, MeshBasicMaterial, MeshStandardMaterial, PCFShadowMap,
  PerspectiveCamera, PlaneGeometry, Quaternion, RingGeometry, Scene, Spherical, Vector3, WebGLRenderer
} from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const WORLD_UP = new Vector3(0,1,0);
const FACE = new Vector3(0,0,1);
const directions = {
  inventory:new Vector3(0.09,0.81,0.58).normalize(), overview:new Vector3(-0.61,0.43,0.77).normalize(),
  hero:new Vector3(-0.57,0.28,0.77).normalize()
};
const ease = n => { const x=Math.max(0,Math.min(1,n)); return x*x*(3-2*x); };
const fov = 33;
const halfFovTan = Math.tan(fov*Math.PI/360);
const viewDepth = 18000;
const svgNS = 'http://www.w3.org/2000/svg';
const poseChanged = (a,b) => a!==b && (!a || !b || a.some((x,i)=>x!==b[i]));

export function createView(container,onUnavailable,{families,parts,shapes},sceneModule) {
  const stage=container.parentElement;
  const badge=stage.querySelector('.stage-badge'), cameraControls=stage.querySelector('.camera');
  const renderer = new WebGLRenderer({antialias:true,powerPreference:'high-performance',logarithmicDepthBuffer:true});
  renderer.setPixelRatio(Math.min(1.65,devicePixelRatio));
  renderer.shadowMap.enabled=true; renderer.shadowMap.type=PCFShadowMap; renderer.shadowMap.autoUpdate=false;
  renderer.domElement.setAttribute('aria-hidden','true');
  container.prepend(renderer.domElement);
  const scene=new Scene(); scene.background=new Color(0xeae9df);
  const camera=new PerspectiveCamera(fov,1,3,viewDepth);
  const orbit=new OrbitControls(camera,renderer.domElement);
  orbit.enablePan=false; orbit.enableDamping=false; orbit.minDistance=55;
  orbit.maxPolarAngle=Math.PI*0.65; orbit.zoomSpeed=0.8;
  const geometry=sceneModule.createGeometry(), assets=new Set();
  const own = asset => { assets.add(asset); return asset; };
  scene.add(new HemisphereLight(0xfffcf4,0xb0b4a5,1.9));
  const sunlight = new DirectionalLight(0xfffbef,2.1);
  sunlight.position.set(-1550,3350,1750); sunlight.castShadow=true;
  Object.assign(sunlight.shadow.camera,{left:-2650,right:2650,top:2650,bottom:-2650,near:100,far:7200});
  sunlight.shadow.mapSize.set(2048,2048); sunlight.shadow.bias=-0.00045; sunlight.shadow.normalBias=2;
  scene.add(sunlight,sunlight.target);
  const floor=new Mesh(own(new PlaneGeometry(24000,24000)),own(new MeshStandardMaterial({color:0xdbdcd1,roughness:0.92})));
  floor.rotation.x=-Math.PI/2; floor.position.y=-2; floor.receiveShadow=true; scene.add(floor);
  const grid=new GridHelper(16000,100,0xa6a995,0xbcc0ad);
  grid.position.y=-1.3; grid.material.transparent=true; grid.material.opacity=0.23;
  own(grid.geometry); own(grid.material); scene.add(grid);

  const ring=new Mesh(own(new RingGeometry(0.78,1.0,32)),own(new MeshBasicMaterial({color:0xdafa54,transparent:true,opacity:0.86,depthTest:false,depthWrite:false,side:2})));
  const boreRingMat=own(new MeshBasicMaterial({color:0xdafa54,depthWrite:false}));
  const boreRings=[], boreShots=new WeakMap();
  ring.renderOrder=3; scene.add(ring);
  const presentation=sceneModule.createPresentation?.({scene,own,ring});
  const cube=new BoxGeometry(1,1,1), outlineGeo=own(new EdgesGeometry(cube)); cube.dispose();
  const outlineMat=own(new LineBasicMaterial({color:0x9dae21,depthTest:false,transparent:true,opacity:0.95}));
  const instances=new Map();
  for(const p of parts.values()) {
    const node=geometry.instantiate(p);
    const [w,h,d]=shapes[p.shape], dimensions=new Vector3(w,h,d);
    const local=new Box3(dimensions.clone().multiplyScalar(-0.5), dimensions.clone().multiplyScalar(0.5));
    scene.add(node);
    const mouths=[];
    node.traverse(mesh=>{ if(mesh.geometry?.userData.mouths) mouths.push(...mesh.geometry.userData.mouths); });
    instances.set(p.id,{p,node,local,mouths,last:null});
  }

  const hud=document.createElement('div'); hud.className='scene-annotations'; hud.setAttribute('aria-hidden','true');
  const svg=document.createElementNS(svgNS,'svg'); hud.append(svg);
  function label(className) {
    const text=document.createElement('span'); text.className=className; hud.append(text); return text;
  }
  const leaders=Array.from({length:3},()=>{
    const line=document.createElementNS(svgNS,'line'), dot=document.createElementNS(svgNS,'circle');
    dot.setAttribute('r','3.5'); svg.append(line,dot);
    return {line,dot,text:label('scene-label'),x:0,y:0,w:0};
  });
  const mounted=document.createElementNS(svgNS,'g');
  mounted.setAttribute('class','mounted-parts'); svg.append(mounted);
  let mountedRecord=null;
  const names=(presentation?.zones??[]).map(([name,p])=>({name,point:new Vector3(...p),text:label('zone-label')}));
  names.forEach(({name,text})=>{text.textContent=name;});
  container.append(hud);

  const bounds=new Box3(), transformed=new Box3();
  const projected=new Vector3(), point=new Vector3(), horizontal=new Vector3(), vertical=new Vector3(), dir=new Vector3();
  const target=new Vector3(), nearTarget=new Vector3(), overview=new Vector3(), mixTarget=new Vector3(), priorTarget=new Vector3();
  const nearDirection=new Vector3(), priorDirection=new Vector3();
  const fromAngles=new Spherical(), toAngles=new Spherical();
  const matrix=new Matrix4(), q=new Quaternion(), location=new Vector3(), scale=new Vector3(1,1,1);
  const boxCache=new WeakMap();
  let width=1,height=1, frame=null, drawInfo, step=0, progress=1, record=null, complete=false, selected=null;
  let activeIndex=-1, activeBores=null;
  let tanX=halfFovTan,tanY=halfFovTan;
  let left=0, top=0, right=1, bottom=1;
  let live=true, automatic=true, syncing=false, prevPoses=null, prevCaptive=null;
  const put = (node,p) => { node.position.set(p[0],p[1],p[2]); node.quaternion.set(p[3],p[4],p[5],p[6]); node.updateMatrix(); };
  function box(snapshot,targetBox,onlyFamily) {
    const cached=!onlyFamily && boxCache.get(snapshot);
    if(cached) return targetBox.copy(cached);
    targetBox.makeEmpty();
    for(const [id,o] of instances) {
      const p=snapshot.poses[id];
      if(!p || (onlyFamily && o.p.family!==onlyFamily)) continue;
      transformed.copy(o.local);
      o.node.userData.adjustBounds?.(transformed,snapshot.captive[id]??0);
      location.set(p[0],p[1],p[2]); q.set(p[3],p[4],p[5],p[6]);
      transformed.applyMatrix4(matrix.compose(location,q,scale));
      targetBox.union(transformed);
    }
    if(!onlyFamily) boxCache.set(snapshot,targetBox.clone());
    return targetBox;
  }
  function poseNodes() {
    for(const [id,o] of instances) {
      const p=frame.poses[id]; o.node.visible=Boolean(p);
      if(!p) continue;
      if(poseChanged(o.last,p)) { put(o.node,p); o.last=p; }
      o.node.userData.setCaptive?.(frame.captive[id]??0);
    }
  }
  function fit(b,center,d) {
    if(b.isEmpty()) { center.set(0,0,0); return 260; }
    b.getCenter(center);
    horizontal.crossVectors(WORLD_UP,d).normalize(); vertical.crossVectors(d,horizontal).normalize();
    let distance=75;
    for (const x of [b.min.x,b.max.x]) for (const y of [b.min.y,b.max.y]) for (const z of [b.min.z,b.max.z]) {
      point.set(x,y,z).sub(center);
      distance=Math.max(distance,point.dot(d)+1.13*Math.max(Math.abs(point.dot(horizontal))/tanX,Math.abs(point.dot(vertical))/tanY));
    }
    return distance;
  }
  function boreShot(event) {
    const cached=boreShots.get(event);
    if(cached) return cached;
    const mounts=[], region=new Box3();
    const axis=new Vector3(), seat=new Vector3(), start=new Vector3(), normal=new Vector3(), delta=new Vector3();
    for(let i=0;i<event.paths.length;i++) {
      const path=event.paths[i];
      axis.fromArray(event.op.axes[i]); seat.fromArray(path.at(-1)); start.fromArray(path[0]);
      let nearest=Infinity, entry, entryPose;
      for(const id of event.op.prerequisites) {
        const pose=event.before.poses[id];
        q.fromArray(pose,3); location.fromArray(pose);
        for(const mouth of instances.get(id).mouths) {
          if(normal.fromArray(mouth.normal).applyQuaternion(q).dot(axis)>-0.99) continue;
          delta.fromArray(mouth.point).applyQuaternion(q).add(location).sub(start);
          const travel=delta.dot(axis);
          if(travel<0 || travel>=nearest || delta.addScaledVector(axis,-travel).lengthSq()>0.04) continue;
          nearest=travel; entry=mouth; entryPose=pose;
        }
      }
      if(!entry) continue;
      q.fromArray(entryPose,3);
      const surface=new Vector3().fromArray(entry.point).applyQuaternion(q).add(location.fromArray(entryPose));
      mounts.push({surface,normal:new Vector3().fromArray(entry.normal).applyQuaternion(q),radius:entry.radius});
      region.expandByPoint(surface).expandByPoint(seat).expandByPoint(start);
    }
    const shot={mounts,region};
    boreShots.set(event,shot);
    return shot;
  }
  function closeUp(event,center,direction,tan) {
    const {joint}=event;
    center.fromArray(joint.target); direction.fromArray(joint.direction);
    const region=event.hold ? boreShot(event).region : null;
    return Math.max(145,joint.span*0.55/tan,region && !region.isEmpty() ? fit(region,center,direction) : 0);
  }
  function overviewDirection() {return step===0 ? directions.inventory : complete ? directions.hero : directions.overview;}
  function blendDirection(out,from,to,t) {
    if(t===0) return out.copy(from);
    if(t===1) return out.copy(to);
    fromAngles.setFromVector3(from); toAngles.setFromVector3(to);
    const turn=toAngles.theta-fromAngles.theta;
    fromAngles.theta+=Math.atan2(Math.sin(turn),Math.cos(turn))*t;
    fromAngles.phi+=(toAngles.phi-fromAngles.phi)*t;
    return out.setFromSpherical(fromAngles);
  }
  function setCamera() {
    if (!automatic || !frame) return;
    const end=record?.end ?? frame, start=record?.start ?? frame;
    const farDir=overviewDirection();
    box(progress<0.5&&start.installed.length?start:end,bounds,selected);
    if(complete && presentation?.bounds) bounds.union(presentation.bounds);
    let farDist=fit(bounds,overview,farDir);
    if (selected && !bounds.isEmpty()) farDist=Math.max(110,farDist);
    if(selected && bounds.isEmpty()) farDist=fit(box(end,bounds),overview,farDir);
    if(record && bounds.isEmpty() && presentation?.bounds) farDist=fit(presentation.bounds,overview,farDir);
    target.copy(overview); dir.copy(farDir);
    let distance=farDist;
    if(record?.events.length && progress<1 && !selected) {
      const index=activeIndex<0 ? record.events.length-1 : activeIndex;
      const event=record.events[index];
      const approach=record.events[0].t0, pullback=1-record.events.at(-1).t1;
      const factor=ease(Math.min(progress/approach,(1-progress)/pullback));
      const tan=Math.min(tanX,tanY);
      let nearDistance=closeUp(event,nearTarget,nearDirection,tan);
      const previous=record.events[index-1];
      if(previous) {
        const blend=ease((progress-event.t0)*record.duration/300);
        const priorDistance=closeUp(previous,priorTarget,priorDirection,tan);
        nearTarget.lerpVectors(priorTarget,nearTarget,blend);
        nearDistance=priorDistance+(nearDistance-priorDistance)*blend;
        blendDirection(nearDirection,priorDirection,nearDirection,blend);
      }
      mixTarget.lerpVectors(overview,nearTarget,factor); target.copy(mixTarget);
      blendDirection(dir,farDir,nearDirection,factor);
      distance=farDist+(nearDistance-farDist)*factor;
    }
    if(target.y+dir.y*distance<10) {
      fromAngles.setFromVector3(dir);
      fromAngles.phi=Math.acos(Math.min(1,(10-target.y)/distance));
      dir.setFromSpherical(fromAngles);
    }
    syncing=true;
    camera.position.copy(target).addScaledVector(dir,distance); orbit.target.copy(target); orbit.update();
    syncing=false;
  }
  function project(o) {
    projected.copy(o).project(camera);
    projected.x=(projected.x+1)*width/2; projected.y=(1-projected.y)*height/2;
  }
  function inView({x,y,z}) {
    return Math.abs(z)<=1 && x>=left+4 && x<=right-4 && y>=top+4 && y<=bottom-4;
  }
  function annotateMounted() {
    const ids=record?.mountedIds;
    const show=progress>=1 && ids?.length>0 && !selected;
    mounted.style.display=show?'':'none';
    if(!show) return;
    if(mountedRecord!==record) {
      mounted.replaceChildren(...ids.map(id=>{
        const dot=document.createElementNS(svgNS,'circle');
        dot.setAttribute('r','3.5'); dot.setAttribute('data-mounted-id',id);
        return dot;
      }));
      mountedRecord=record;
    }
    for(let i=0;i<ids.length;i++) {
      const dot=mounted.children[i];
      project(point.fromArray(frame.poses[ids[i]]));
      const visible=inView(projected);
      dot.style.display=visible?'':'none';
      if(!visible) continue;
      dot.setAttribute('cx',projected.x); dot.setAttribute('cy',projected.y);
    }
  }
  function annotate() {
    const active=frame?.joint;
    ring.visible=Boolean(active && !activeBores && !selected);
    const count=selected ? 0 : (activeBores?.length ?? 0);
    while(boreRings.length<count) {
      const marker=new Mesh(ring.geometry,boreRingMat);
      boreRings.push(marker); scene.add(marker);
    }
    for(let i=0;i<boreRings.length;i++) {
      const marker=boreRings[i];
      marker.visible=i<count;
      if(!marker.visible) continue;
      const {surface,normal,radius}=activeBores[i];
      marker.position.copy(surface).addScaledVector(normal,0.35);
      marker.quaternion.setFromUnitVectors(FACE,normal);
      const depth=-point.copy(surface).applyMatrix4(camera.matrixWorldInverse).z;
      marker.scale.setScalar(Math.max(radius+1.4,16*halfFovTan*depth/height));
    }
    presentation?.update(frame,drawInfo,ring.visible);
    const zones=step===0&&!selected;
    for(const label of names) {
      project(label.point);
      const {x,y}=projected, w=label.name.length*6.5+18;
      label.text.hidden=!(zones && inView(projected) && right-left>=w && bottom-top>=22);
      if(!label.text.hidden) label.text.style.transform=`translate(${Math.min(right-w,x)}px,${Math.min(bottom-22,y)}px)`;
    }
    if(active) {
      ring.position.fromArray(active.target); point.copy(camera.position).sub(ring.position).normalize();
      ring.position.addScaledVector(point,4); ring.quaternion.setFromUnitVectors(FACE,point);
      ring.scale.setScalar(Math.min(25,Math.max(8,active.span*0.035)));
    }
    for(let i=0;i<leaders.length;i++) {
      const {line,dot,text}=leaders[i];
      const o=instances.get(active?.labels[i]);
      if(!o?.node.visible || selected) {
        text.hidden=true; line.style.display=dot.style.display='none'; continue;
      }
      if(i===0 && active.span<400 && !families[o.p.family].number) point.fromArray(active.target);
      else point.copy(o.node.position);
      project(point);
      const show=inView(projected) && bottom-top>=24;
      text.hidden=!show; line.style.display=dot.style.display=show?'':'none';
      if(!show) continue;
      const {x,y}=projected;
      const name=families[o.p.family].name+(o.node.userData.labelSuffix?.(frame.captive[o.p.id]??0)??'');
      if(text.textContent!==name) text.textContent=name;
      const w=Math.min(right-left,name.length*7.15+17), dest=leaders[i];
      dest.x=Math.min(right-w,Math.max(left,x<(left+right)/2?x+42:x-w-38));
      dest.y=Math.min(bottom-24,Math.max(top,y-42+i*18)); dest.w=w;
      text.style.maxWidth=`${w}px`;
      for(let j=0;j<i;j++) {
        const p=leaders[j];
        if(p.text.hidden || p.x+p.w<dest.x || dest.x+w<p.x || Math.abs(p.y-dest.y)>28) continue;
        dest.y=p.y+29>bottom-24?Math.max(top,p.y-29):p.y+29;
      }
      text.style.transform=`translate(${dest.x}px,${dest.y}px)`;
      line.setAttribute('x1',x); line.setAttribute('y1',y); line.setAttribute('x2',dest.x+(dest.x<x?w:0)); line.setAttribute('y2',dest.y+12);
      dot.setAttribute('cx',x); dot.setAttribute('cy',y);
    }
    annotateMounted();
  }
  function render() {
    if(!live || !frame) return;
    camera.updateMatrixWorld(); annotate(); renderer.render(scene,camera);
  }
  function resize() {
    width=Math.max(1,container.clientWidth); height=Math.max(1,container.clientHeight);
    const canvasRect=container.getBoundingClientRect(), stageRect=stage.getBoundingClientRect();
    const badgeRect=badge.getBoundingClientRect(), controlsRect=cameraControls.getBoundingClientRect();
    left=Math.max(0,stageRect.left-canvasRect.left)+4;
    right=Math.min(width,stageRect.right-canvasRect.left)-4;
    top=Math.max(0,badgeRect.bottom-canvasRect.top)+4;
    bottom=Math.min(height,(cameraControls.hidden?stageRect.bottom:controlsRect.top)-canvasRect.top)-4;
    if(right-left<1 || bottom-top<1) { left=top=0; right=width; bottom=height; }
    hud.style.clipPath=`inset(${top}px ${width-right}px ${height-bottom}px ${left}px)`;
    tanX=halfFovTan*(right-left)/height; tanY=halfFovTan*(bottom-top)/height;
    // A narrower field of view fits the same subject from farther away.
    const depth=viewDepth*halfFovTan/Math.min(tanX,tanY);
    camera.far=orbit.maxDistance=automatic?depth:Math.max(depth,orbit.maxDistance);
    const cx=(left+right)/2, cy=(top+bottom)/2;
    // Shift the optical center without cropping the full-viewport render.
    camera.setViewOffset(width,height,width/2-cx,height/2-cy,width,height);
    renderer.setSize(width,height);
    setCamera(); if(frame) poseNodes(); render();
  }
  const observer=new ResizeObserver(resize); observer.observe(container); observer.observe(stage);
  observer.observe(cameraControls);
  orbit.addEventListener('start',()=>{ if(!syncing) automatic=false; });
  orbit.addEventListener('change',()=>{ if(!syncing) render(); });
  renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault(); onUnavailable();},{once:true});
  function inspect(family) {
    selected=family; automatic=true;
    for(const o of instances.values()) {
      if(family===o.p.family && !o.outline) {
        const edge=new LineSegments(outlineGeo,outlineMat);
        edge.scale.fromArray(shapes[o.p.shape]).multiplyScalar(1.045); edge.renderOrder=4;
        o.node.add(edge); o.outline=edge;
      }
      if(o.outline) o.outline.visible=family===o.p.family;
    }
    if(frame) { setCamera(); poseNodes(); render(); }
  }
  function dispose() {
    if(!live) return;
    live=false; observer.disconnect(); orbit.dispose(); geometry.dispose(); sunlight.shadow.dispose();
    for(const asset of assets) asset.dispose();
    renderer.dispose(); renderer.domElement.remove(); hud.remove();
  }
  resize();
  return {
    resize, inspect, dispose,
    auto() { automatic=true; },
    draw(snapshot,info) {
      frame=snapshot; drawInfo=info; ({number:step,progress,record,complete}=info);
      activeIndex=record?.events.findIndex(event=>progress<event.t1) ?? -1;
      const event=record?.events[activeIndex];
      const mounts=event?.hold ? boreShot(event).mounts : null;
      activeBores=mounts?.length ? mounts : null;
      const changed=prevPoses!==frame.poses||prevCaptive!==frame.captive;
      if(changed) {prevPoses=frame.poses; prevCaptive=frame.captive; renderer.shadowMap.needsUpdate=true;}
      setCamera(); poseNodes();
      render();
    },
    rotate() {
      if(!frame) return;
      automatic=false; camera.position.sub(orbit.target).applyAxisAngle(WORLD_UP,Math.PI/10).add(orbit.target);
      orbit.update(); render();
    },
    reset() { automatic=true; if(selected) inspect(null); else if(frame) { setCamera(); poseNodes(); render(); } }
  };
}
