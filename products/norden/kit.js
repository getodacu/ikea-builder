import { pages } from './manual.js';

export const layout = {
  footY:4, topY:720, topDepth:800, hingeX:130, hingeY:716, hingeZ:[-281,281],
  hingeScrewX:[14,24], hingeScrewZ:[-9,9], locatorX:496, locatorZ:335, locatorRadius:4.4,
  gateX:116, gateZ:335, gateReach:510, beamY:84, beamZ:[-361,361],
  frameX:83, stile:38, frameRailY:[90,288,486,694],
  plateHoles:[-84,-48,0,48,84], plateZ:361,
  drawer:{halfWidth:63, halfHeight:94, sideX:56, sideT:12, backZ:-173, frontZ:176,
    bottomY:-78, camZ:151, fastY:[-50,54], dowelY:3}
};
export const shapes = {
  frame:[764,720,90], crossblock:[128,42,30], center:[258,20,800], leaf:[629,20,800],
  drawerL:[12,188,345], drawerR:[12,188,345], drawerBack:[100,188,12], drawerFront:[126,188,20], drawerBottom:[114,4,340],
  longBolt:[13,65,13], stud:[7,29,7], tapPin:[8,25,8], longDowel:[8,34,8], barrel:[10,27,10],
  shortDowel:[6,25,6], shortScrew:[8,12,8], glide:[19,12,19], gateGlide:[26,12,17], cam:[13,9,13],
  hinge:[54,9,30], plate:[185,2,24], hex:[45,8,64], driver:[30,65,30]
};
export const families = {}, parts = new Map();
const {PI, sin, cos, hypot} = Math, yaw = a=>[0,sin(a/2),0,cos(a/2)], roll = a=>[0,0,sin(a/2),cos(a/2)], pitch=a=>[sin(a/2),0,0,cos(a/2)];
const up=[0,1,0], down=[0,-1,0], right=[1,0,0], front=[0,0,1], back=[0,0,-1], sameQ=[0,0,0,1];
const xyz=p=>p.slice(0,3), quat=p=>p.slice(3), pose=(x,y,z,q=sameQ)=>[x,y,z,...q];
const add=(a,b)=>a.map((v,i)=>v+b[i]), mul=(a,k)=>a.map(v=>v*k);
const unit=a=>mul(a,1/hypot(...a));
const cross=([x,y,z],[a,b,c])=>[y*c-z*b,z*a-x*c,x*b-y*a];
const inverse=([x,y,z,w])=>[-x,-y,-z,w];
function rotate(v,q) {
  const t=mul(cross(q,v),2);
  return add(v,add(mul(t,q[3]),cross(q,t)));
}
function product(a,b) {
  return [...add(add(mul(xyz(a),b[3]),mul(xyz(b),a[3])),cross(a,b)),a[3]*b[3]-a[0]*b[0]-a[1]*b[1]-a[2]*b[2]];
}
const compose=(a,b)=>pose(...add(xyz(a),rotate(xyz(b),quat(a))),product(quat(a),quat(b)));
const translate=(p,v)=>pose(...add(xyz(p),v),quat(p));
const facing=axis=>axis[1]>0.999 ? [1,0,0,0] : unit([...cross(up,mul(axis,-1)),1-axis[1]]);

const structure='Table pieces', drawers='Drawer pieces', fittings='Fittings', tools='Tools';
const sides=[-1,1], sidesByName=['left','right'];
const frameIDs=sidesByName.map(side=>`frame-${side}`), leafIDs=sidesByName.map(side=>`leaf-${side}`);
const beamIDs=['crossblock-rear','crossblock-front'];
function stock(key,name,shape,ids,group,page,number=null,role='kit') {
  families[key]={name,number,group,page,role};
  for (const [id,p] of ids) parts.set(id,{id,family:key,shape,packet:group,unpacked:p});
}
stock('frame','Side ladder with captive gateleg','frame',frameIDs.map((id,i)=>[id,pose(-680,0,-488+i*240)]),structure,4);
stock('crossblock','Low crossblock','crossblock',beamIDs.map((id,i)=>[id,pose(1050,21,-660+i*75)]),structure,4);
stock('center','Narrow center tabletop','center',[['center',pose(0,10,-1060)]],structure,5);
stock('leaf','Drop leaf with locating pin','leaf',leafIDs.map((id,i)=>[id,pose(sides[i]*154,24,-1060,product(pitch(PI),yaw(i?0:PI)))]),structure,5);
const sets=Array.from({length:6},(_,i)=>({
  ids:Object.fromEntries(['drawerL','drawerR','drawerBack','drawerBottom','drawerFront'].map(s=>[s,`${s}-${i+1}`])),
  x:(i%3-1)*540, z:940+Math.floor(i/3)*750, bank:i<3?1:-1, level:i%3
}));
for (const [j,[key,name]] of Object.entries({drawerL:'Grooved left drawer side',drawerR:'Grooved right drawer side',
  drawerBack:'Drawer back',drawerFront:'Notched drawer front',drawerBottom:'Grooved drawer bottom'}).entries()) {
  stock(key,name,key,sets.map((d,i)=>[d.ids[key],pose((i%3-1)*670+(j-2)*124,shapes[key][1]/2,560+Math.floor(i/3)*450)]),drawers,key==='drawerFront'?11:key==='drawerBottom'?10:9);
}
const hardware=[
  ['105330','Long hex bolt','longBolt',4],['112996','Cam stud','stud',24,'112996 / 118331'],['110519','Hammer pin','tapPin',24],
  ['101352','Long wooden dowel','longDowel',8],['121121','Cross barrel','barrel',4],['101345','Short wooden dowel','shortDowel',12],
  ['100372','Short countersunk screw','shortScrew',42],['107271','Round fixed-foot glide','glide',4],['156508','Two-peg gate-foot glide','gateGlide',2],
  ['110689','Drawer cam lock','cam',24],['10005601','Two-flange leaf hinge','hinge',4],['120139','Slotted top mounting plate','plate',2],
  ['10083377','Hex key','hex',1],['110018','Stubby cross-head screwdriver','driver',1]
];
for (const [i,[key,name,shape,count,number=key]] of hardware.entries()) {
  const tool=i>=12, pointSize=shape==='plate'?205:shape==='hinge'?64:35;
  stock(key,name,shape,Array.from({length:count},(_,j)=>[`${key}-${j+1}`,pose(770+(j%6)*pointSize,shapes[shape][1]/2,
    -490+i*120+Math.floor(j/6)*14)]),tool?tools:fittings,3,number,tool?'tool':'kit');
}

export const setup = {text:'Assemble with a helper, on a protected work surface. Use the hand tools shown in the IKEA manual.',page:2};
export const steps=[];
const at=new Map(), used={};
let operations=[];
function step(number,title,action,build,warning) {
  operations=[];
  build();
  return {number,page:pages[number-1],title,action,operations,warning};
}
function op(kind,ids,receivers,poses,axes,caption,extras={}) {
  const axis=axes[0], target=xyz(poses[0].at(-1));
  operations.push({kind,ids,prerequisites:receivers,poses,axes,
    joint:{target,axis,outward:mul(axis,-1),receivers,caption},...extras});
  ids.forEach((id,i)=>at.set(id,poses[i].at(-1)));
  return ids;
}
function place(ids,ends,axis=down,receivers=[],dist=70,captive) {
  const axes=Array.isArray(axis[0])?axis:ids.map(()=>axis);
  const paths=ends.map((p,i)=>[translate(p,mul(axes[i],-dist)),p]);
  return op('place',ids,receivers,paths,axes,families[parts.get(ids[0]).family].name,captive?{captive}:{});
}
function fit(key,positions,axis,receivers,dist=36) {
  const ids=positions.map(()=>`${key}-${used[key]=(used[key]??0)+1}`);
  const axes=Array.isArray(axis[0])?axis:ids.map(()=>axis);
  return place(ids,positions.map((P,i)=>pose(...P,facing(axes[i]))),axes,receivers,dist);
}
function move(ids,frames,receivers,axis,caption,captive) {
  const anchor=ids[0], initial=at.get(anchor), q=inverse(quat(initial));
  const inv=pose(...rotate(mul(xyz(initial),-1),q),q);
  const offsets=ids.map(id=>compose(inv,at.get(id)));
  const paths=ids.map((id,i)=>[at.get(id),...frames.map(p=>compose(p,offsets[i]))]);
  op('move',ids,receivers,paths,ids.map(()=>axis),caption,{rigid:{anchor,frames:[initial,...frames],offsets},...(captive&&{captive})});
}
function shift(ids,v,receivers,caption) {
  move(ids,[translate(at.get(ids[0]),v)],receivers,unit(v),caption);
}

const {footY,topY,hingeX,hingeY,hingeZ,hingeScrewX,hingeScrewZ,gateX,gateZ,gateReach,beamY,beamZ,stile,frameX,plateHoles,plateZ,drawer:D}=layout;
const baseZ=-1000, inverted=pose(0,740,0,pitch(PI));
const bench=p=>compose(inverted,p);
const overhead=(p,lift,z)=>compose(pose(0,370+lift,z),compose(p,pose(0,-370,-z)));
const basePoint=(x,y,z)=>pose(x,y,z+baseZ);
const turnFrame=(id,z,from,to)=>[.25,.5,.75,1].map((u,i)=>
  compose(overhead(pose(0,0,0,pitch((to-from)*u)),[175,194,175,0][i],z),at.get(id)));
const tabletop=[];
const leaves=sides.map((s,i)=>({s,id:leafIDs[i],name:sidesByName[i],hinges:[],screws:[], q:yaw(i?0:PI)}));
const frames=sides.map((s,i)=>({s,id:frameIDs[i],name:sidesByName[i],q:yaw(i?PI/2:3*PI/2)}));
const initialGate=-PI/5, openGate=-PI/2, foldedLeaf=-89*PI/180, liftedLeaf=3*PI/180;
const frameAt=(F,z,angle=0)=>pose(F.s*gateX,0,F.s*gateZ+z,product(F.q,yaw(angle)));
const bladeAt=(L,angle=0)=>pose(L.s*hingeX,hingeY,0,product(L.q,roll(angle)));
function moveGate(F,z,from,to) {
  move(F.glide?[F.id,F.glide]:[F.id],[frameAt(F,z,to)],[],right,`${to===0?'Tuck':'Swing out'} the ${F.name} gateleg`,{from,to});
}
function moveLeaf(L,from,to,invertedWork=false) {
  const target=bladeAt(L,to);
  move([L.id,...L.hinges,...L.screws],[invertedWork?bench(target):target],['center'],
    to<from?down:up,`${to<from?'Lower':'Lift'} the ${L.name} leaf`,{from,to});
}

steps.push(step(1,'Key the low crossblocks','Use the eight long dowels, two at each crossblock end. Keep the center holes empty for the bolts, then bring the two side frames onto the dowels.',()=>{
  const beams=beamIDs.map((_,i)=>basePoint(0,beamY,beamZ[i]));
  place(beamIDs,beams);
  for (const [i,id] of beamIDs.entries()) {
    for (const s of sides) fit('101352',[beamY-14,beamY+14].map(y=>[s*64,y,baseZ+beamZ[i]]),[-s,0,0],[id]);
  }
  for (const F of frames) place([F.id],[frameAt(F,baseZ,initialGate)],[-F.s,0,0],beamIDs,160,{from:initialGate,to:initialGate});
}));
steps.push(step(2,'Mount the two top plates','Drive a short screw in each small round outer hole. Leave the center holes and slots empty for the top.',()=>{
  for (const z of [-plateZ,plateZ]) {
    const plate=fit('120139',[[0,topY-2,baseZ+z]],down,frameIDs);
    fit('100372',[plateHoles[0],plateHoles.at(-1)].map(x=>[x,topY,baseZ+z]),down,plate);
  }
}));
steps.push(step(3,'Hinge the three tabletop panels','On protection, lay the center panel and both leaves upside down. Position two hinges at each seam and fit eight short screws to each hinge.',()=>{
  place(['center'],[bench(pose(0,topY+10,0))]);
  tabletop.push('center');
  for (const L of leaves) {
    const root=bladeAt(L);
    place([L.id],[bench(root)],[-L.s,0,0],['center'],125);
    tabletop.push(L.id);
    for (const z of hingeZ) {
      const hinge=`10005601-${(used['10005601']=(used['10005601']??0)+1)}`;
      const hp=compose(root,pose(0,0,z));
      place([hinge],[bench(hp)],down,['center',L.id],58);
      L.hinges.push(hinge);
      tabletop.push(hinge);
      for (const s of sides) {
        const holes=hingeScrewX.flatMap(x=>hingeScrewZ.map(z1=>xyz(bench(compose(hp,pose(s*x,2.5,z1))))));
        const screws=fit('100372',holes,down,[hinge,s>0?L.id:'center'],24);
        if (s>0) L.screws.push(...screws);
        tabletop.push(...screws);
      }
    }
  }
}));
steps.push(step(4,'Bolt the inverted base together','Tuck in the gate supports and turn the base over. Align each barrel nut with the side bolt, then tighten all four long bolts with the supplied hex key.',()=>{
  frames.forEach(F=>moveGate(F,baseZ,initialGate,0));
  const base=[...at.keys()].filter(id=>!tabletop.includes(id));
  move(base,turnFrame(base[0],baseZ,0,PI),[],up,'Turn the base upside down');
  for (const [i,z] of beamZ.entries()) {
    const barrels=fit('121121',sides.map(s=>[s*46,740-(beamY-21),baseZ-z]),down,[beamIDs[i]]);
    const bolts=fit('105330',sides.map(s=>[s*(frameX+stile/2),740-beamY,baseZ-z]),sides.map(s=>[-s,0,0]),[...frameIDs,...barrels],72);
    op('adjust',bolts,barrels,bolts.map(id=>{const p=at.get(id); return [p,compose(p,pose(0,0,0,yaw(PI/2)))];}),sides.map(s=>[-s,0,0]),'Tighten the long hex bolts');
  }
},setup));
steps.push(step(5,'Fasten the base to the center top','Seat the inverted base over the narrow panel. At each mounting plate, fasten the middle round hole first and then the two slots.',()=>{
  const base=[...at.keys()].filter(id=>!tabletop.includes(id)), anchor=at.get(base[0]);
  move(base,[[0,118,0],[0,118,-baseZ],[0,0,-baseZ]].map(v=>translate(anchor,v)),['center'],down,'Lower the inverted base onto the tabletop');
  for (const [i,z] of [-plateZ,plateZ].entries()) {
    const plate=`120139-${i+1}`;
    fit('100372',[[0,22,-z]],down,[plate,'center']);
    fit('100372',[plateHoles[1],plateHoles[3]].map(x=>[x,22,-z]),down,[plate,'center']);
  }
}));
steps.push(step(6,'Tap in the round foot glides','Tap one round glide into the single hole of each fixed post.',()=>{
  for (const F of frames) fit('107271',beamZ.map(z=>xyz(bench(pose(F.s*frameX,footY,z)))),down,[F.id]);
}));
steps.push(step(7,'Fit the gate-foot glides and turn upright','Tap the two-peg glides into the free gate feet. Fold both hinged leaves toward the frame, then turn the whole table upright with a helper.',()=>{
  for (const F of frames) {
    const gateFoot=compose(frameAt(F,0),pose(gateReach,footY,0,pitch(PI)));
    const p=bench(gateFoot), id=`156508-${(used['156508']=(used['156508']??0)+1)}`;
    place([id],[p],down,[F.id],58);
    F.glide=id;
  }
  for (const L of leaves) moveLeaf(L,0,foldedLeaf,true);
  const joined=[...at.keys()];
  move(joined,turnFrame(joined[0],0,PI,0),[],up,'Turn the folded table upright with a helper');
},setup));

const loc={drawerL:pose(-D.sideX,0,0),drawerR:pose(D.sideX,0,0),drawerBack:pose(0,0,D.backZ),
  drawerBottom:pose(0,D.bottomY,-2),drawerFront:pose(0,0,D.frontZ)};
const work=(d,angle)=>pose(d.x,78,d.z,roll(angle));
const onFront=d=>pose(d.x,186,d.z+272,pitch(PI/2));
const dx=(d,s,y,z)=>xyz(compose(d,pose(s*(D.sideX+D.sideT/2),y,z)));
const arrayKey=(obj,key)=>Object.values(obj).map(d=>d[key]);

steps.push(step(8,'Start the drawer-side pins','Repeat this sequence for six drawers. On each left side, start two hammer pins in the indicated rear holes; leave them ready to tap into the back.',()=>{
  for (const d of sets) {
    const frame=translate(work(d,-PI/2),[0,-125,0]);
    const id=d.ids.drawerL;
    place([id],[compose(frame,loc.drawerL)]);
    d.pins=fit('110519',D.fastY.map(y=>add(dx(frame,-1,y,D.backZ),[0,13,0])),down,[id],28);
  }
}));
steps.push(step(9,'Offer the prepared sides to the drawer backs','Align the left sides over the backs; match the groove at the bottom edge. Do this for all six drawers.',()=>{
  for (const d of sets) {
    const {drawerL,drawerBack}=d.ids;
    shift([drawerL,...d.pins],[0,188,0],[],'Lift the prepared side');
    place([drawerBack],[compose(work(d,-PI/2),loc.drawerBack)],down,[drawerL],53);
    shift([drawerL,...d.pins],[0,-63,0],[drawerBack],'Seat the side on the rear edge');
  }
}));
steps.push(step(10,'Tap the started pins home','Finish driving the same two pins into each drawer back. Do not add another pair here.',()=>{
  for (const d of sets) op('adjust',d.pins,[d.ids.drawerL,d.ids.drawerBack],d.pins.map(id=>[at.get(id),translate(at.get(id),[0,-13,0])]),[down,down],'Tap the same pins flush');
}));
steps.push(step(11,'Slide in the six drawer bottoms','Turn each joined side and back together. Slide its thin bottom into the grooves, keeping the open side uppermost.',()=>{
  for (const d of sets) {
    const {drawerL,drawerBack,drawerBottom}=d.ids;
    const frames=[[-PI/2,182],[0,182],[PI/2,182],[PI/2,78]].map(([a,y])=>compose(pose(d.x,y,d.z,roll(a)),loc.drawerL));
    move([drawerL,drawerBack,...d.pins],frames,[],up,'Turn the joined panels together');
    place([drawerBottom],[compose(work(d,PI/2),loc.drawerBottom)],down,[drawerL,drawerBack],128);
  }
}));
steps.push(step(12,'Close each drawer with its right side','Fit the opposite grooved side over the bottom edge as shown. Tap two remaining pins through it into each back.',()=>{
  for (const d of sets) {
    const {drawerL,drawerR,drawerBack,drawerBottom}=d.ids, frame=work(d,PI/2);
    place([drawerR],[compose(frame,loc.drawerR)],down,[drawerL,drawerBack,drawerBottom]);
    d.pins=[...d.pins,...fit('110519',D.fastY.map(y=>dx(frame,1,y,D.backZ)),down,[drawerR,drawerBack])];
  }
}));
steps.push(step(13,'Fit the four studs in each drawer front','Lay all six grip-notched fronts face down. Use the supplied short cross-head driver to fit four cam studs per front.',()=>{
  for (const d of sets) {
    const frame=onFront(d), id=d.ids.drawerFront;
    place([id],[compose(frame,loc.drawerFront)]);
    d.studs=fit('112996',sides.flatMap(s=>D.fastY.map(y=>xyz(compose(frame,pose(s*D.sideX,y,D.frontZ-10))))),down,[id]);
  }
}));
steps.push(step(14,'Key and seat the drawer fronts','Use two of the short dowels per drawer. Turn the drawer body and seat it over the front studs and dowels, with the bottom in its groove.',()=>{
  for (const d of sets) {
    const {drawerL,drawerR,drawerBack,drawerBottom,drawerFront}=d.ids, frame=onFront(d), raised=translate(frame,[0,132,0]);
    const casing=[drawerL,drawerR,drawerBack,drawerBottom,...d.pins];
    move(casing,[translate(at.get(drawerL),[0,200,0]),compose(raised,loc.drawerL)],[drawerFront],up,'Turn and bring the drawer body over the front');
    d.dowels=fit('101345',sides.map(s=>xyz(compose(raised,pose(s*D.sideX,D.dowelY,D.frontZ-10)))),up,[drawerL,drawerR],56);
    move([...casing,...d.dowels],[compose(frame,loc.drawerL)],[drawerFront,...d.studs],down,'Seat the body over the front studs');
  }
}));
steps.push(step(15,'Lock the drawer fronts','Insert and turn four cams from the inside faces of each drawer. All six fronts lock onto their existing studs.',()=>{
  for (const d of sets) {
    const {drawerL,drawerR}=d.ids, frame=onFront(d);
    const positions=sides.flatMap(s=>D.fastY.map(y=>xyz(compose(frame,pose(s*(D.sideX-D.sideT/2),y,D.camZ)))));
    const axes=sides.flatMap(s=>D.fastY.map(()=>rotate([s,0,0],quat(frame))));
    d.cams=fit('110689',positions,axes,[drawerL,drawerR,...d.studs],28);
    op('adjust',d.cams,[drawerL,drawerR,...d.studs],d.cams.map(id=>{const p=at.get(id);return [p,compose(p,pose(0,0,0,yaw(PI/2)))];}),axes,'Turn the cams onto the stud heads');
  }
}));
steps.push(step(16,'Slide in all six drawers','Set three drawers on the rails from the front of the center section and three from the opposite end. Push each straight into its own bay.',()=>{
  for (const d of sets) {
    const {ids,bank,level}=d, q=yaw(bank===1?0:PI), y=202+level*198;
    const approach=pose(0,y,bank*670,q), end=pose(0,y,bank*196,q);
    const drawer=[ids.drawerFront,...Object.values(ids).filter(id=>id!==ids.drawerFront),...d.pins,...d.studs,...d.dowels,...d.cams];
    const frames=[translate(at.get(drawer[0]),[0,790,0]),pose(0,1080,bank*670,q),approach,end].map((p,i)=>i===0?p:compose(p,loc.drawerFront));
    move(drawer,frames,frameIDs,bank===1?back:front,`Slide the ${['lower','middle','upper'][level]} drawer in from the ${bank===1?'front':'opposite'} end`);
  }
}));

export const useRecord=step(17,'Open both gateleg leaves','Lift a leaf, swing its gate support out, then lower the locating pin into the hole in the top of the gate post. Repeat on the other side.',()=>{
  for (const [i,L] of leaves.entries()) {
    moveLeaf(L,foldedLeaf,liftedLeaf);
    moveGate(frames[i],0,0,openGate);
    moveLeaf(L,liftedLeaf,0);
  }
});
useRecord.page=12;
