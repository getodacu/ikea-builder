import { pages } from './manual.js';

export const wallWarning = 'Tip-over can cause serious or fatal crushing injuries. Attach the unit to the wall at both provided attachment points before use. Wall screws and plugs are not supplied; use fixings suitable for your wall and seek professional advice if unsure.';
const handling = {text:'Use two people to support the frame and align the three connections.',page:5};
const wall = {text:wallWarning,page:2};
const X=[1,0,0], Y=[0,1,0], Z=[0,0,1], up=Y, down=[0,-1,0], back=[0,0,-1];
const {PI}=Math, half=PI/2;
const pose=(x,y,z,axis=Y,a=0)=>[x,y,z,...axis.map(n=>n*Math.sin(a/2)),Math.cos(a/2)];
function rotate([x,y,z],[,,,a,b,c,d]) {
  const u=2*(b*z-c*y), v=2*(c*x-a*z), w=2*(a*y-b*x);
  return [x+d*u+b*w-c*v,y+d*v+c*u-a*w,z+d*w+a*v-b*u];
}
function compose(p,q) {
  const [x,y,z]=rotate(q,p), [,,,a,b,c,d]=p, [,,,e,f,g,h]=q;
  return [x+p[0],y+p[1],z+p[2],d*e+a*h+b*g-c*f,d*f-a*g+b*h+c*e,d*g+a*f-b*e+c*h,d*h-a*e-b*f-c*g];
}
function inverse([x,y,z,a,b,c,d]) {
  const q=[0,0,0,-a,-b,-c,d];
  q.splice(0,3,...rotate([-x,-y,-z],q));
  return q;
}
const shift=(p,d,s)=>p.map((v,i)=>i<3?v+d[i]*s:v);
function screwPose(p,[x,y,z]) {
  const cross=Math.hypot(x,z), axis=cross<1e-10?X:[-z/cross,0,x/cross];
  return pose(...p,axis,Math.acos(Math.max(-1,Math.min(1,-y))));
}

// Joint datums in finished product coordinates, except the hinge and catch offsets.
export const stations=[-975,-487,0,487,975], postZ=208, railZ=188;
export const postBottom=16, postTop=513, postCenter=(postBottom+postTop)/2;
export const railY=286, baseY=112, shelfY=308, rimY=518, topY=531;
export const topBoltY=505, wallY=471, stopY=498, adjustY=[39,67];
export const hingeY=[207,405], hingeDrill=[-12,12], hingeDoorX=19, hingePostX=15, pivotZ=220;
export const doorBottom=126, doorTop=508, catchY=490;
export const doorData=[0,1,2,3].map(i=>{
  const s=i<2?1:-1, column=i<2?i:i+1, x=stations[column]+s*hingePostX;
  return {id:`door-${i+1}`,s,column,x,w:stations[i+1]-stations[i]-32};
});
export const shelfScrews=[...[-1,1].flatMap(s=>stations.slice(0,-1).map((x,i)=>[(x+stations[i+1])/2,s*169])),[-961,0],[961,0]];
export const topScrews=[...[-959,959].flatMap(x=>[-125,0,125].map(z=>[x,z])),...[-325,325].flatMap(x=>[-207,207].map(z=>[x,z]))];
export const topFixings=[...stations.map((x,c)=>[x,postZ,c]),...[-487,487].map((x,i)=>[x,-postZ,i===0?1:3])];
export const wallPoints=[-487,487].map(x=>[x,wallY,-postZ-13]);
export const clipPoint=[975,395,-postZ+10];
export const braceFast=[24,58];

export const families={}, parts=new Map();
export const shapes={
  endL:[22,513,436],endR:[22,513,436],railFront:[1930,30,54],railRear:[1930,30,54],base:[1930,22,396],
  braceL:[82,88,3],braceR:[82,88,3],postHinge:[20,497,20],postFrontCenter:[20,497,20],
  postRearWall:[20,497,20],postRearCenter:[20,497,20],shelf:[1928,16,397],rim:[1970,29,436],top:[1981.2,18,450.85],
  stop:[56,22,18],door1:[456,382,14],door2:[455,382,14],door3:[455,382,14],door4:[456,382,14],
  foot:[20,23,20],woodScrew:[8.6,15,8.6],panScrew:[8.8,14,8.8],shoulder:[10,15,10],sleeve:[10,19,10],
  longScrew:[9.2,38,9.2],clip:[18,21,12],hingeL:[51,46,9],hingeR:[51,46,9],washer:[16,4,16],
  catchScrew:[8.2,14,8.2],anchor:[19,19,3]
};
function stock(key,name,group,page,items,number=null,role='kit') {
  families[key]=Object.freeze({name,number,group,page,role});
  for (const [id,shape,unpacked] of items) parts.set(id,Object.freeze({id,family:key,shape,unpacked:Object.freeze(unpacked),packet:group}));
}
const frameGroup='Steel frame', woodGroup='Pine panels', doorGroup='Mesh doors';
const flat=(x,y,z)=>pose(x,y,z,X,half);
stock('end','Mesh end frame',frameGroup,7,[['endL','endL',pose(-1190,0,-430,Y,half)],['endR','endR',pose(1190,0,-430,Y,half)]]);
for(const [name,k,z] of [['Shelf rail, front tabs','railFront',-215],['Shelf rail, rear tabs','railRear',-330]])
  stock(k,name,frameGroup,7,[[k,k,pose(0,15,z)]]);
stock('base','Lower mesh shelf',frameGroup,8,[['base','base',pose(0,13,-700)]]);
stock('brace','Curved lower corner brace',frameGroup,11,[['braceL','braceL',flat(-1000,45,900)],['braceR','braceR',flat(-890,45,900)]]);
for(const [shape,name,list,p] of [
  ['postHinge','Four-hole front upright',[['front1',-870],['front3',-400]],13],['postFrontCenter','Front center upright',[['front2',-635]],14],
  ['postRearWall','Rear upright with wall receiver',[['rear1',-165],['rear3',305]],15],['postRearCenter','Rear center upright',[['rear2',70]],16]
]) stock(shape,name,frameGroup,p,list.map(([id,x])=>[id,shape,pose(x,11,1370,Z,half)]));
stock('shelf','Narrower pine shelf',woodGroup,18,[['shelf','shelf',pose(0,9,60)]]);
stock('top','Wider pine top',woodGroup,20,[['top','top',pose(0,9,-1220)]]);
stock('rim','Steel top rim with keys',frameGroup,20,[['rim','rim',pose(0,16,-1675)]]);
stock('stop','Offset door stop',doorGroup,24,[1,2,3].map((i)=>[`stop-${i}`,'stop',flat(590+i*69,14,920)]));
const looseDoor=new Map(doorData.map(({id,s,w},i)=>[id,pose(785+i*507-s*w/2,10,-400,X,-half)]));
stock('door','Handed mesh door and integral pull',doorGroup,25,doorData.map(({id},i)=>[id,`door${i+1}`,looseDoor.get(id)]));
let cell=0;
function packet(list,group) {
  for(const [id,name,shape,count] of list) stock(id,name,group,6,Array.from({length:count},(_,i)=>{
    const slot=cell++, k=Array.isArray(shape)?shape[Math.floor(i/2)]:shape;
    return [`${id}-${i+1}`,k,pose(-975+(slot%20)*59,shapes[k][1]/2+1,525+Math.floor(slot/20)*51)];
  }),id);
}
packet([
  ['122158','Threaded leveling glide','foot',10],['152497','Short pointed wood screw','woodScrew',20],['107616','Pan-head machine screw','panScrew',52],
  ['152527','Shoulder screw','shoulder',4],['152526','Opposing threaded sleeve','sleeve',4],['139212','Long countersunk screw','longScrew',12],
  ['123742','Adhesive cable clip','clip',14]
],'Case fittings · p. 6');
packet([
  ['153334','Slotted two-leaf hinge',['hingeL','hingeL','hingeR','hingeR'],8],['139578','Round catch washer','washer',4],
  ['114755','Catch washer screw','catchScrew',4]
],'Door fittings · p. 6');
stock('wall','Wall fixing positions (not supplied)','Required, not supplied',29,[1,2].map(i=>[`wall-${i}`,'anchor',pose(825+i*51,12,994,X,-half)]),null,'external');

function author() {
  const positions=new Map(), counts=new Map(), records=[];
  let operations, datum=pose(0,226,0,X,-half);
  const R=p=>compose(datum,p), V=d=>rotate(d,datum);
  const wide={direction:[.45,.47,.98],span:1770};
  function step(title,action,write,warning=null) {
    operations=[];write();
    const number=records.length+1;
    records.push({number,page:pages[number-1],title,action,operations,warning});
  }
  function op(kind,ids,receivers,paths,axes,caption,view,target=paths[0].at(-1).slice(0,3)) {
    const prerequisites=[...new Set(receivers)], axis=axes[0];
    const operation={kind,ids,poses:paths,axes,prerequisites,joint:{target,axis,outward:axis.map(n=>-n),receivers:prerequisites,caption,view}};
    operations.push(operation);
    ids.forEach((id,i)=>positions.set(id,paths[i].at(-1)));
    return operation;
  }
  function place(ids,receivers,ends,axis,travel,caption,view,previewBores=false) {
    const axes=Array.isArray(axis[0])?axis:ids.map(()=>axis);
    const operation=op('place',ids,receivers,ends.map((p,i)=>[shift(p,axes[i],-travel),p]),axes,caption,view);
    operation.previewBores=previewBores;
    return operation;
  }
  function next(key,count) {
    const start=counts.get(key)??0;
    counts.set(key,start+count);
    return Array.from({length:count},(_,i)=>`${key}-${start+i+1}`);
  }
  function fast(key,receivers,points,axes,caption,view,travel=42) {
    const ids=next(key,points.length), dirs=Array.isArray(axes[0])?axes:ids.map(()=>axes);
    place(ids,receivers,points.map((p,i)=>screwPose(p,dirs[i])),dirs,travel,caption,view,true);
    return ids;
  }
  function rigid(ids,anchor,waypoints,receivers,axis,caption,view,captive) {
    const p=positions.get(anchor), inv=inverse(p), frames=[p,...waypoints];
    const initial=ids.map(id=>positions.get(id)), offsets=initial.map(loc=>compose(inv,loc));
    const a=op('move',ids,receivers,initial.map((loc,i)=>[loc,...waypoints.map(q=>compose(q,offsets[i]))]),ids.map(()=>axis),caption,view);
    a.rigid={anchor,frames,offsets};
    if(captive) a.captive=captive;
  }
  function adjust(ids,receivers,change,axis,caption,view) {
    op('adjust',ids,receivers,ids.map((id,i)=>change(positions.get(id),i,id)),ids.map(()=>axis),caption,view);
  }
  const endIds=['endL','endR'], rails=['railRear','base','railFront'];
  const railPos={railRear:[railY,-railZ],railFront:[railY,railZ],base:[baseY,railZ]};
  const endPose=x=>pose(x,0,0);
  const railPose=id=>pose(0,railPos[id][0],id==='base'?0:railPos[id][1]);
  function railFit(id,caption) {place([id],['endR'],[R(railPose(id))],X,129,caption,wide);}
  function endBolts(ids,end,caption) {
    const x=end==='endR'?951:-951;
    fast('107616',[end,...ids],ids.map(id=>R(pose(x,railPos[id][0],railPos[id][1]+10)).slice(0,3)),V(back),caption,{direction:[end==='endR'?.3:-.3,.94,.45],span:420});
  }
  step('Key the first shelf rail','Build on a protected surface. Identify the end frame by its pictured hole face. Slide the shelf rail into its matching receiver with the slotted tabs as shown.',()=>{
    place(['endR'],[],[R(endPose(975))],down,42,'Set down the first mesh end frame',wide);
    railFit('railRear','Key the first shelf rail into the end frame');
  });
  step('Fasten the first rail','Hold the rail in its receiver and drive one 107616 through the end joint.',()=>endBolts(['railRear'],'endR','Seat the first rail screw'));
  step('Fit the lower mesh shelf','Align the pierced edge as pictured and slide the mesh shelf into the same end frame.',()=>railFit('base','Engage both bottom shelf keys together'));
  step('Fasten the mesh shelf joint','Use one 107616 through the illustrated hole in the shelf frame.',()=>endBolts(['base'],'endR','Fasten the lower mesh shelf'));
  step('Key the second shelf rail','Fit the other rail into the upper receiver in this assembly position. Keep its tabs down, toward the inside.',()=>railFit('railFront','Engage the second rail with its tab face inward'));
  step('Fasten the second rail','Support the rail while you drive one 107616 through the second shelf-rail joint.',()=>endBolts(['railFront'],'endR','Seat the second rail screw'));
  step('Fit the second mesh end','With two people, slide the remaining end frame onto the three exposed shelf and rail ends together.',()=>
    place(['endL'],rails,[R(endPose(-975))],X,125,'Support both ends and guide all three connections together',wide),handling);
  step('Secure the three exposed joints','Use three 107616 at the second end: one at each shelf-rail joint and one at the mesh shelf joint.',()=>endBolts(rails,'endL','Fix the three joints at the second end'));
  const bracePoint=(s,y)=>[s*975,y,220];
  const lowerBraceIds=['braceL','braceR'];
  const braceBolts=[];
  step('Fit both lower corner braces','Line up the curved braces at the outside front legs. Use two 107616 per brace through the shelf-side holes; leave the two lower holes open.',()=>{
    for(const [i,s] of [-1,1].entries()) {
      const id=lowerBraceIds[i];
      place([id],[endIds[i],'base'],[R(pose(...bracePoint(s,0)))],V(back),48,'Present the lower corner brace',wide);
      braceBolts.push(...fast('107616',[id,'base'],braceFast.map(x=>R(pose(s*(975-x),baseY,221)).slice(0,3)),V(back),'Use the two shelf-side holes'));
    }
  });
  let sleeves, shoulders;
  step('Start the opposing adjusters','Fit two sockets and two shoulder screws per outside front leg from opposite faces. Leave the shoulder heads visibly proud until squaring.',()=>{
    sleeves=fast('152526',endIds,[-1,1].flatMap(s=>adjustY.map(y=>R(pose(s*975,y,198)).slice(0,3))),V(Z),'Insert sockets from the inside');
    shoulders=fast('152527',[...endIds,...lowerBraceIds,...sleeves],[-1,1].flatMap(s=>adjustY.map(y=>R(pose(s*975,y,224)).slice(0,3))),V(back),'Start opposite screws without seating the heads');
  });
  function feetAt(list) {
    const ids=next('122158',list.length);
    place(ids,list.map(([id])=>id),list.map(([,x,z])=>R(pose(x,7,z))),V(up),32,'Thread each glide into the open leg end',wide,true);
    return ids;
  }
  const allFeet=[];
  step('Add the four end-frame feet','Thread one glide into each leg of the two end frames. Six feet are still needed later.',()=>allFeet.push(...feetAt(endIds.flatMap((id,i)=>[-postZ,postZ].map(z=>[id,stations[i*4],z])))));
  function postsAt(side,columns,caption) {
    const z=side*postZ, dir=[0,0,side], ids=columns.map(c=>`${side>0?'front':'rear'}${c}`);
    place(ids,['base',side>0?'railFront':'railRear'],columns.map(c=>R(pose(stations[c],postCenter,z))),V(dir.map(n=>-n)),73,caption,wide);
    fast('139212',[...ids,'base',side>0?'railFront':'railRear'],columns.flatMap(c=>[baseY,railY].map(y=>R(pose(stations[c],y,side*(railZ-10))).slice(0,3))),V(dir),'Use the long countersunk screws through the cross-drilled rail and post',wide,48);
  }
  step('Add the two four-hole uprights','Choose the two uprights with both paired hole groups. Match the pictured faces and fix with four long 139212.',()=>postsAt(1,[1,3],'Align the paired holes on the front face'));
  step('Add the first plain upright','Use the plain upright at this middle station, with its concealed drill on the pictured face. Fix it with two 139212.',()=>postsAt(1,[2],'Fit the front center upright'));
  function turn(nextDatum,mid,caption) {
    const rs=positions.get('endR'), local=compose(inverse(datum),rs);
    rigid([...positions.keys()],'endR',[...(mid?[compose(mid,local)]:[]),compose(nextDatum,local)],[],up,caption,wide);
    datum=nextDatum;
  }
  step('Turn the frame and add the drilled pair','Support the entire assembly while turning it to the other face. Orient the two uprights with upper holes as shown and use four 139212.',()=>{
    turn(pose(0,226,0,X,half),pose(0,135,0),'Turn all fitted members and feet together');
    postsAt(-1,[1,3],'Set both upper-punched rear uprights');
  });
  step('Fit the second plain upright','Put the remaining plain post in the middle of the rear face, keeping the concealed drill as pictured. Fix with two 139212.',()=>postsAt(-1,[2],'Fit the rear center upright'));
  step('Add six intermediate feet','Thread one 122158 into each intermediate upright. Leave the four end-frame feet in place.',()=>
    allFeet.push(...feetAt([-1,1].flatMap(s=>[1,2,3].map(c=>[`${s>0?'front':'rear'}${c}`,stations[c],s*postZ])))));
  step('Stand the frame and lower the shelf','Turn the fitted frame upright with help. Lower the narrower pine panel onto the middle shelf supports, not the wider tabletop.',()=>{
    turn(pose(0,0,0),pose(0,182,0,X,PI/4),'Stand the connected steel frame and all ten feet upright');
    place(['shelf'],['railRear','railFront','endL','endR'],[pose(0,shelfY,0)],down,200,'Lower the narrower shelf into the frame',wide);
  });
  step('Fasten the pine shelf','Mark through all ten tabs from below as shown. Drive ten short 152497 into the pine shelf through those tabs.',()=>
    fast('152497',['shelf','railFront','railRear','endL','endR'],shelfScrews.map(([x,z])=>[x,298,z]),up,'Fasten from below through the ten shelf tabs',wide));
  const off=pose(0,13,-653,X,PI), topLocal=p=>compose(off,p);
  step('Prepare the wider top face-down','On protection, lay the wider top face-down beside the frame. Put the steel rim on its underside, keys pointing up.',()=>{
    place(['top'],[],[off],down,52,'Protect the finished face of the top',wide);
    place(['rim'],['top'],[topLocal(pose(0,rimY-topY,0))],down,92,'Keep every locating key facing out from the top',wide);
  });
  let topWood;
  step('Fasten the top rim','Mark the six tab and four crossmember holes. Fasten the rim with ten short 152497.',()=>{
    topWood=fast('152497',['top','rim'],topScrews.map(([x,z])=>topLocal(pose(x,511-topY,z)).slice(0,3)),down,'Fix six tab and four crossmember locations',wide);
  });
  const caseIds=['endL','endR','front1','front2','front3','rear1','rear2','rear3'];
  step('Turn and lower the fitted top','Turn the top and rim over together. Lower the keys squarely into the upright sockets.',()=>
    rigid(['top','rim',...topWood],'top',[pose(0,470,-410,X,half),pose(0,653,0),pose(0,topY,0)],caseIds,down,'Carry the rim and screws while seating the top keys',wide));
  let upperScrews;
  step('Secure the top at seven points','Use seven 107616 through the indicated upright holes. The lower rear wall holes are not used for these screws.',()=>{
    upperScrews=fast('107616',['rim',...caseIds],topFixings.map(([x,z])=>[x,topBoltY,z+Math.sign(z)*10]),topFixings.map(([,z])=>[0,0,-Math.sign(z)]),'Fix the top through the seven punched post faces',wide);
  });
  const stopAt=c=>pose(stations[c],stopY,postZ-10);
  step('Fit the three door stops','Orient the offset faces as shown. Fasten the three plates under the front of the top, one 107616 apiece.',()=>{
    const ids=[1,2,3].map(c=>`stop-${c}`), receivers=['front1','front2','front3'];
    place(ids,receivers,[1,2,3].map(stopAt),Z,48,'Face the shallow offset toward the door contact points',wide);
    fast('107616',[...ids,...receivers],[1,2,3].map(c=>[stations[c],stopY,postZ-12]),Z,'Fasten each stop at its middle hole',wide);
  });
  step('Level with the ten fitted feet','Use a spirit level. Turn the ten installed glides as necessary to support and level the unit; the illustrated travel is not a setting.',()=>
    adjust(allFeet,[],(p,i)=>[p,pose(p[0],4,p[2],Y,(i%2?1:-1)*PI*.75)],down,'Turn the fitted glides and check with the level',wide));

  const doorSets=doorData.map(d=>({...d,post:d.column===0?'endL':d.column===4?'endR':`front${d.column}`,yaw:0}));
  const onDoor=(d,p)=>compose(positions.get(d.id),p);
  const aboard=(d,p,caption,captive,receivers=[d.post])=>rigid([d.id,...d.hinges,...d.doorBolts,...(d.catch??[])],d.id,[p],receivers,down,caption,wide,captive);
  function swing(d,angle,caption) {
    const p=positions.get(d.id);
    aboard(d,pose(p[0],p[1],p[2],Y,angle),caption,{from:-d.yaw,to:-angle});
    d.yaw=angle;
  }
  step('Fit two hinges to each loose mesh door','Identify each door by its drilled edge and integral pull. Fix two hinges per door, using two 107616 through each door-side leaf.',()=>{
    for(const d of doorSets) {
      const p=looseDoor.get(d.id), dir=rotate(back,p);
      place([d.id],[],[p],down,45,'Set down the handed door, drilled edge visible',{direction:[.31,.95,.59],span:530});
      d.hinges=next('153334',2);
      place(d.hinges,[d.id],hingeY.map(y=>onDoor(d,pose(0,y-(doorBottom+doorTop)/2,0))),dir,53,'Align the hinge leaf with the two door drills');
      d.doorBolts=fast('107616',[d.id,...d.hinges],hingeY.flatMap(y=>hingeDrill.map(dy=>onDoor(d,pose(d.s*hingeDoorX,y+dy-(doorBottom+doorTop)/2,4.45)).slice(0,3))),dir,'Fasten the door-side half of both hinges');
    }
  });
  step('Hang and align the four doors','Fix both hinges on each door with the remaining sixteen 107616. Use the slots for vertical alignment, then tighten. Match the hinge side shown for each bay.',()=>{
    const center=(doorBottom+doorTop)/2;
    for(const d of doorSets) {
      const p=pose(d.x,center-2,pivotZ);
      rigid([d.id,...d.hinges,...d.doorBolts],d.id,[pose(d.x,center+70,pivotZ+86),p],[d.post],back,'Bring the hinge plates to the matching post face',wide);
      const bolts=d.frameBolts=fast('107616',[d.post,...d.hinges],hingeY.flatMap(y=>hingeDrill.map(dy=>[d.x-d.s*hingePostX,y+dy,pivotZ+.9])),back,'Start the screws through the vertical slots');
      aboard(d,pose(d.x,center,pivotZ),'Slide the door to align the slots and edges');
      adjust(bolts,d.hinges,p=>[p,compose(shift(p,Z,-1.1),pose(0,0,0,Y,half))],back,'Tighten the same four frame-side screws');
    }
  });
  step('Install the four door catches','Open as needed to reach the upper inside latch corners. Fit one 139578 catch washer and one 114755 screw per door opposite its hinges.',()=>{
    swing(doorSets[3],1.37,'Open the rightmost mesh leaf for access');
    for(const d of doorSets) {
      const p=positions.get(d.id), dir=rotate(Z,p), y=catchY-(doorBottom+doorTop)/2;
      const washer=next('139578',1);
      place(washer,[d.id],[onDoor(d,screwPose([d.s*(d.w-15),y,-3],Z))],dir,32,'Set the washer at the upper latch corner');
      const bolt=fast('114755',[d.id,...washer],[onDoor(d,pose(d.s*(d.w-15),y,-6)).slice(0,3)],dir,'Use the dedicated catch screw');
      d.catch=[...washer,...bolt];
    }
  });
  step('Square the frame and tighten both braces','Close the doors. Check that the sides are plumb and the frame is square. Correct any lean before tightening all four opposing screw and sleeve pairs.',()=>{
    swing(doorSets[3],0,'Close the access leaf before checking square');
    const posts=new Set([...caseIds,...doorSets.flatMap(d=>[d.id,...d.hinges,...d.doorBolts,...d.frameBolts,...d.catch]),
      ...sleeves,...shoulders,...lowerBraceIds,...braceBolts]);
    const top=new Set(['top','rim',...topWood,...upperScrews]);
    const feet=new Set(allFeet);
    const tilt=pose(0,baseY,0,Z,.019);
    adjust([...positions.keys()],[],(p,_,id)=>{
      const flex=posts.has(id)?compose(tilt,shift(p,Y,-baseY)):
        shift(p,X,-.019*((feet.has(id)?4:top.has(id)?topY:p[1])-baseY));
      return [p,flex,p];
    },X,'Bring the loosely joined frame square before locking the adjusters',wide);
    adjust([...shoulders,...sleeves],[...endIds,...lowerBraceIds],(p,i)=>[
      p,compose(shift(p,Z,i<4?-2.4:.35),pose(0,0,0,Y,PI*.78))
    ],back,'Seat the original opposing screws and sleeves');
  });
  step('Attach at both wall positions','Open the access door. Secure both rear attachment points to the wall using hardware suitable for the actual wall. Do not use the unit without anchoring it.',()=>{
    swing(doorSets[3],1.37,'Open the rightmost leaf for access');
    place(['wall-1','wall-2'],['rear1','rear3'],wallPoints.map(p=>pose(...p)),back,26,
      'Use both external wall attachment positions; screws and plugs are not supplied',{direction:[.37,.56,-1],span:1230},false);
  },wall);
  step('Apply the adhesive cable clip','Peel the backing, press the clip onto the inside rear upright face as shown, and route the cord through it. The remaining clips are available as needed for cable routing.',()=>{
    const clip=place(next('123742',1),['endR','wall-1','wall-2'],[pose(...clipPoint)],back,51,
      'Peel the liner, then press the clip against the inside rear upright',{direction:[-.5,.45,1],span:435});
    clip.captive={from:0,to:1};
  },wall);
  return records;
}

export const steps=author();
