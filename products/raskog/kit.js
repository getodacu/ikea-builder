import { pages } from './manual.js';

const { PI, sin, cos } = Math;
const X=[1,0,0], Y=[0,1,0], Z=[0,0,1], down=[0,-1,0];
const pose=(x=0,y=0,z=0,axis=Y,angle=0)=>[x,y,z,...axis.map(v=>v*sin(angle/2)),cos(angle/2)];
function compose([x,y,z,a,b,c,d],[u,v,w,e,f,g,h]) {
  const i=2*(b*w-c*v), j=2*(c*u-a*w), k=2*(a*v-b*u);
  return [x+u+d*i+b*k-c*j,y+v+d*j+c*i-a*k,z+w+d*k+a*j-b*i,
    d*e+a*h+b*g-c*f,d*f-a*g+b*h+c*e,d*g+a*f-b*e+c*h,d*h-a*e-b*f-c*g];
}
function inverse(p) {
  const pInv=[0,0,0,-p[3],-p[4],-p[5],p[6]];
  return compose(pInv,pose(-p[0],-p[1],-p[2]));
}
const offset=(p,axis,d)=>p.map((v,i)=>i<3?v+axis[i]*d:v);

// The same local dimensions locate the key, mouth and mating fastener.
export const frame = {
  x:204, tubeZ:15, tubeRadius:9, spigotRadius:6.6, spigotLength:18,
  baseJoint:120, upperJoint:457, top:769, spliceInset:9.5,
  tubeBore:2.65, wheelX:204, wheelZ:137, casterSeat:59, casterBore:4.9, stem:7.5,
  depth:349, hoopY:76, hoopZ:165.5, tabX:6, tabDepth:2,
  tabBore:3.6, trayInset:192.5, traySeat:197, clampFace:214.5,
  trayH:92, trayMount:4, traySkin:2.3, levels:[156,443,730],
  trays:[[451,349],[447,344],[443,339]]
};
export const shapes = {
  lower:[18,337,48], upper:[18,330,48], hoop:[426,79,159.5], tray:[451,92,349], clamp:[14,63,48],
  screw:[8,9,8], bolt:[12,34,12], nut:[13,9,13], wrench:[112,5,23], brake:[38,67,55], caster:[23,67,54]
};
export const setupNote = 'Protect the work surface and use a cross-head screwdriver. The wrench is supplied.';
const groups=['Steel frame','Trays and clamps','Fittings and tool · p. 3'];
export const families={};
export const parts=new Map();
function family(key,name,number,shape,group,page,entries,role='kit') {
  families[key]=Object.freeze({name,number,group:groups[group],page,role});
  for (const [id,unpacked] of entries) parts.set(id,Object.freeze({id,family:key,shape,unpacked,packet:groups[group]}));
}
const entries=(ids,park)=>ids.map((id,i)=>[id,park(i)]);
const series=(key,n)=>Array.from({length:n},(_,i)=>`${key}-${i+1}`);
const lower=['lower-left','lower-right'], upper=['upper-left','upper-right'], hoops=['hoop-front','hoop-back'];
const clamps=series('clamp',6), screws=series('121194',8), bolts=series('124154',6), nuts=series('10119612',6);
const braked=series('braked-swivel',2), plain=series('plain-swivel',2);
family('lower','Lower paired uprights',null,'lower',0,4,entries(lower,i=>pose(-42+i*420,9,-372,Z,PI/2)));
family('upper','Upper paired uprights',null,'upper',0,4,entries(upper,i=>pose(275+i*420,9,-301,Z,PI/2)));
family('hoop','Curved base hoop',null,'hoop',0,4,entries(hoops,i=>pose(-260+i*520,-59,-225)));
for (const [i] of frame.levels.entries()) {
  const id=`tray-${i+1}`;
  family(id,`Tray ${i+1} (${['bottom','middle','top'][i]})`,null,'tray',1,i===0?5:6,[[id,pose((i-1)*485,frame.trayH/2,140)]]);
}
family('clamp','Curved tray clamp plate',null,'clamp',1,5,entries(clamps,i=>pose(-552+i*75,32,388)));
family('124154','Round-head tray bolt','124154','bolt',2,3,entries(bolts,i=>pose(-535+i*42,6,485,Z,PI/2)));
family('10119612','Domed flange nut','10119612','nut',2,3,entries(nuts,i=>pose(-535+i*31,0,522)));
family('121194','Short cross-head tube screw','121194','screw',2,3,entries(screws,i=>pose(-285+i*31,4,522,Z,PI/2)));
family('130772','Open and ring wrench','130772','wrench',2,3,[['wrench',pose(123,3,476)]],'tool');
family('braked','Braked swivel caster','10121215 / 10121236 / 10169640','brake',2,3,entries(braked,i=>pose(251+i*77,frame.casterSeat,491)));
family('plain','Plain swivel caster','10121224 / 10121235 / 10169527','caster',2,3,entries(plain,i=>pose(437+i*77,frame.casterSeat,491)));

function author() {
  const records=[], at=new Map();
  let operations;
  const sides=[-1,1];
  // The twin end frames are staged out of the way of the base while joined on p. 4.
  const staged=pose(0,-frame.baseJoint,-309), standing=pose(0,-frame.casterSeat,0);
  const angle=PI/2, sideOn=pose(0,frame.depth/2,0,X,-angle);
  const uprightEnd=s=>pose(s*frame.x,0,0,Y,s===1?PI:0);
  const protect={text:'Lay the cart on a protected surface before fitting the casters.',page:2};
  function step(page,title,action,run,warning) {
    operations=[]; run();
    records.push({number:records.length+1,page,title,action,operations,warning});
  }
  function add(kind,ids,prerequisites,poses,axis,target,caption,extra={}) {
    operations.push({kind,ids,prerequisites,poses,axes:ids.map(()=>axis),
      joint:{target,axis,outward:axis.map(v=>-v),receivers:prerequisites,caption},...extra});
    for(const [i,id] of ids.entries()) at.set(id,poses[i].at(-1));
  }
  function place(ids,receivers,ends,axis,travel,caption,target=ends[0].slice(0,3),previewBores=false) {
    add('place',ids,receivers,ends.map(end=>[offset(end,axis,-travel),end]),axis,target,caption,{previewBores});
  }
  function move(ids,anchor,waypoints,receivers,target,caption) {
    const start=at.get(anchor), undo=inverse(start);
    const offsets=ids.map(id=>compose(undo,at.get(id)));
    const frames=[start,...waypoints];
    const paths=ids.map((id,i)=>[at.get(id),...waypoints.map(p=>compose(p,offsets[i]))]);
    add('move',ids,receivers,paths,down,target,caption,{rigid:{anchor,frames,offsets}});
    operations.at(-1).joint.view={direction:[-.56,.4,.88],span:440};
  }
  function splice(i,y,work,receivers,fixings) {
    const side=sides[i], axis=[-side,0,0];
    const x=side*(frame.x+frame.tubeRadius*cos(PI/6));
    const ends=sides.map(z=>compose(work,pose(x,y,z*frame.tubeZ,Z,-side*PI/2)));
    place(fixings,receivers,ends,axis,37,'Align both holes and seat the short cross-head screws',
      [x,y+work[1],work[2]],true);
  }
  step(pages[0],'Join the paired uprights','Match the holes on the reduced ends with the lower tubes. Keep the welded tabs facing the trays and secure the joints with four short cross-head screws.',()=>{
    for(const [i,s] of sides.entries()) {
      const end=compose(staged,uprightEnd(s));
      place([lower[i]],[],[end],down,24,'Set out the lower paired uprights',[end[0],end[1]+288,end[2]]);
      place([upper[i]],[lower[i]],[end],down,52,'Slide both keyed ends into the lower tubes',
        [end[0],end[1]+frame.upperJoint,end[2]]);
      splice(i,frame.upperJoint-frame.spliceInset,staged,[lower[i],upper[i]],screws.slice(i*2,i*2+2));
    }
  });
  step(pages[1],'Join the frame to the base','Align the holes in the base ends with the holes in the uprights and secure each end with two more short cross-head screws.',()=>{
    place(hoops,[],[standing,compose(standing,pose(0,0,0,Y,PI))],down,28,'Set out both curved base hoops',[0,25,0]);
    for(const [i,s] of sides.entries()) {
      const end=compose(standing,uprightEnd(s));
      const lift=offset(at.get(lower[i]),Y,128);
      move([lower[i],upper[i],...screws.slice(i*2,i*2+2)],lower[i],[lift,offset(end,Y,64),end],hoops,
        [end[0],end[1]+frame.baseJoint,0],'Seat the joined uprights over both base spigots');
      splice(i,frame.baseJoint+frame.spliceInset,standing,[lower[i],...hoops],screws.slice(4+i*2,6+i*2));
    }
  });
  for(const [i,y] of frame.levels.entries()) {
    const tray=`tray-${i+1}`, risers=i===2?upper:lower, rung=['bottom','middle','top'][i];
    step(pages[2+i],`Fit tray ${i+1} at the ${rung}`,`Match the tray marked ${i+1} to the ${rung} station. Wrap the plates around the outside of the uprights; put the bolt heads outside and tighten the domed nuts from inside with the supplied wrench.`,()=>{
      const level=y+standing[1];
      place([tray],risers,[pose(0,level-frame.trayMount,0)],down,74,`Seat tray ${i+1} at its marked level`);
      for(const [j,s] of sides.entries()) {
        const n=2*i+j, clamp=clamps[n], side=[-s,0,0];
        const mount=pose(s*frame.x,level,0,Y,s===1?PI:0);
        place([clamp],[risers[j],tray],[mount],side,43,'Nest the curved clamp outside both tubes',[s*frame.clampFace,level,0]);
        const bolt=pose(s*frame.clampFace,level,0,Z,-s*PI/2);
        place([bolts[n]],[clamp,risers[j],tray],[bolt],side,43,'Seat the smooth bolt from outside',bolt.slice(0,3),true);
        const nut=pose(s*(frame.trayInset-frame.traySkin),level,0,Z,s*PI/2);
        place([nuts[n]],[bolts[n],tray],[nut],[-side[0],0,0],26,'Fit the domed nut from inside the tray');
      }
    });
  }
  function wheels(ids,s) {
    const ends=sides.map(z=>compose(sideOn,pose(s*frame.wheelX,frame.casterSeat,z*frame.wheelZ)));
    place(ids,hoops,ends,[0,0,-1],65,s<0?'Thread the two braked casters':'Thread the two plain casters',ends[0].slice(0,3),true);
  }
  function turnFrames(startHeight,endHeight,standUp) {
    return [1,2,3,4].map(i=>{
      const a=(standUp?4-i:i)*angle/4;
      const y=i===4?endHeight:frame.depth/2*sin(a)+startHeight*cos(a)+4;
      return pose(0,y,0,X,-a);
    });
  }
  step(pages[5],'Fit both braked casters','Lay the cart down as shown. Thread the two casters with brake levers into the two sockets at the same short end, and use the supplied wrench at the flats.',()=>{
    move([...at.keys()],hoops[0],turnFrames(-frame.casterSeat,sideOn[1],false),[],[0,180,-285],'Lay the cart on its protected side');
    wheels(braked,-1);
  },protect);
  step(pages[6],'Fit both plain casters','Keep the braked pair in place. Thread the two plain casters into the two sockets at the opposite short end. Stand the cart upright after fitting all four wheels.',()=>{
    wheels(plain,1);
  },protect);
  const assembly=records.slice();
  step(8,'Stand the cart upright','Stand the completed cart upright on all four casters.',()=>{
    move([...at.keys()],hoops[0],turnFrames(0,0,true),[],[0,320,0],'Stand the same cart on all four wheels');
  });
  const prep=records.at(-1).operations[0];
  const uprightPoses=Object.freeze(Object.fromEntries(prep.ids.map((id,i)=>[id,prep.poses[i].at(-1)])));
  step(8,'Lock the caster brakes','Lower both integral brake levers to lock the parked cart.',()=>{
    add('adjust',braked,[],braked.map(id=>[at.get(id),at.get(id)]),down,[-frame.wheelX,31,frame.wheelZ],
      'Lower both integral brake levers',{captive:{from:0,to:1}});
  });
  return {assembly,demo:records,uprightPoses};
}
const {assembly,demo,uprightPoses}=author();
export const steps=assembly;
export const useRecords=demo;
export function completeFrame(end) { return {...end,poses:uprightPoses}; }
