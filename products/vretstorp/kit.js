import { pages } from './manual.js';

export const shapes={
  seat:[2000,160,720],back:[2000,515,145],arm:[216,556,960],frontRail:[2008,265,46],rearRail:[2008,265,94],
  liner:[1970,289,564],bar:[2008,62,25],outer:[670,510,172],center:[650,510,172],
  seatCover:[2010,464,732],backCover:[2010,525,155],armCover:[220,610,968],outerCover:[676,516,178],centerCover:[656,516,178],
  riser:[81,238,70],guide:[42,112,216],hinge:[59,350,595],driver:[122,218,22],foot:[53,62,53],clip:[26,33,47],
  pad:[33,3,33],wing:[30,24,13],rearBolt:[15,28,15],shortBolt:[15,23,15],flatBolt:[17,44,17],longBolt:[15,84,15]
};
export const families={}, parts=new Map();
const P=(x,y,z,q=[0,0,0,1])=>[x,y,z,...q];
const {PI}=Math;
const pitch=a=>[Math.sin(a/2),0,0,Math.cos(a/2)];
const roll=a=>[0,0,Math.sin(a/2),Math.cos(a/2)];
const halfYaw=[0,1,0,0];
const up=[0,1,0], down=[0,-1,0], front=[0,0,1], rear=[0,0,-1];
const X=s=>[s,0,0];
const xyz=p=>p.slice(0,3);
const add=(a,b)=>a.map((v,i)=>v+b[i]);
const mul=(v,s)=>v.map(c=>c*s);
const cross=([x,y,z],[a,b,c])=>[y*c-z*b,z*a-x*c,x*b-y*a];
const inverse=([x,y,z,w])=>[-x,-y,-z,w];
function turn(v,q) {
  const t=mul(cross(q,v),2);
  return add(v,add(mul(t,q[3]),cross(q,t)));
}
function compose(a,b) {
  const q=a.slice(3), r=b.slice(3), [x,y,z]=xyz(q), [i,j,k]=xyz(r);
  const v=add(add(mul(xyz(q),r[3]),mul(xyz(r),q[3])),cross(q,r));
  return P(...add(xyz(a),turn(xyz(b),q)),[...v,q[3]*r[3]-x*i-y*j-z*k]);
}
const shift=(p,v)=>P(...add(xyz(p),v),p.slice(3));
const about=(p,point,q)=>compose(P(...point,q),shift(p,mul(point,-1)));
const at=new Map();
const point=(id,v)=>xyz(compose(at.get(id),P(...v)));
const side=(left,right)=>[[-1,left],[1,right]];

function stock(key,name,number,shape,group,page,entries,role='kit') {
  families[key]={name,number,group,page,role};
  for(const [id,x,z,q] of entries) parts.set(id,{id,family:key,shape,packet:group,unpacked:P(x,shapes[shape][1]/2,z,q)});
}
const frame='Frame modules', hardware='Hardware', loose='Loose fittings', external='Required, not supplied';
stock('seat','Upholstered seat frame',null,'seat',frame,6,[['seat',-1550,-810]]);
stock('back','Upholstered folding backrest',null,'back',frame,14,[['back',650,-1770,pitch(PI/2)]]);
stock('arm','Handed rolled arm',null,'arm',frame,18,[['armL',-2670,35,roll(PI/2)],['armR',-2140,35,roll(-PI/2)]]);
for(const [key,name,z,page] of [['frontRail','Plain-top front frame rail',-630,21],['rearRail','Tab-top rear frame rail',-455,22],['bar','Keeper crossbar',-258,33]])
  stock(key,name,null,key,frame,page,[[key,670,z]]);
stock('liner','Storage liner with rods, six clips and eight straps',null,'liner',frame,29,[['liner',402,130]]);
stock('outer','Handed outer cushion insert',null,'outer',frame,42,[['outerL',-835,825,pitch(PI/2)],['outerR',625,825,pitch(PI/2)]]);
stock('center','Center cushion insert',null,'center',frame,43,[['center',-105,825,pitch(PI/2)]]);
stock('riser','Pinned seat-leg bracket',null,'riser',loose,4,[['riserL',-1760,525],['riserR',-1645,525]]);
stock('guide','Forked backrest guide',null,'guide',loose,4,[['guideL',-1750,674],['guideR',-1625,674]]);
stock('hinge','Handed spring seat mechanism',null,'hinge',loose,4,[['hingeL',-1690,1130],['hingeR',-1500,1130]]);
const packet=[['10003880','T-driver','driver',1,'tool'],['141454','Threaded foot','foot',6],['10004419','Loose liner end clip','clip',4],
  ['10050334','Foot pad (four per sheet)','pad',8],['130550','Wing screw','wing',2],['152546','Rear round-head screw','rearBolt',4],
  ['10050529','Short round-head screw','shortBolt',18],['121365','Flat-head seat bracket screw','flatBolt',4],['152122','Long pointed screw','longBolt',2]];
for(const [row,[key,label,shape,count,role]] of packet.entries()) {
  stock(key,label,key,shape,hardware,3,Array.from({length:count},(_,i)=>[`${key}-${i+1}`,1140+i%9*57,720+row*115+Math.floor(i/9)*49]),role);
}
for(const [key,label,entries,page] of [
  ['seatCover','Seat cover with skirt and loops',[['seatCover',-1540,-2190]],10],['backCover','Backrest cover',[['backCover',670,-2420,pitch(PI/2)]],14],
  ['armCover','Handed rolled-arm cover',[['armCoverL',1810,-530],['armCoverR',2120,-530]],26],
  ['outerCover','Handed outer cushion cover',[['outerCoverL',-835,1500,pitch(PI/2)],['outerCoverR',625,1500,pitch(PI/2)]],42],
  ['centerCover','Center cushion cover',[['centerCover',-105,1500,pitch(PI/2)]],43]
]) stock(key,label,null,key,external,page,entries,'external');
for(const p of parts.values()) {
  if(p.unpacked[3] || p.unpacked[5]) {
    const [w,,d]=shapes[p.shape];
    p.unpacked[1]=(p.unpacked[3]?d:w)/2;
  }
}

// Finished-view datums shared by the actual receiver and its insertion path.
export const railY=220, railZ=270, railStudHeights=[168,272], railDrop=16;
export const strapXs=[-780,-260,260,780], clipXs=[-970,-485,0,485,970];
export const hingeBores=[[-68,-126],[59,-71],[-78,100]]; // y,z relative to each arm mechanism
const wide={direction:[-.62,.44,.85],span:1430};
const preparation={direction:[-.58,.65,.85],span:1180};
export const setup={text:'Work with two people on a protected surface. Contact IKEA if you are unsure about a step.',page:2};
const labelCare={text:'Check the cover care label first. Do not iron a cover marked “do not iron,” or the marked fastening panel.',page:5};
export const steps=[];
let operations;
const used={};
function step(title,action,build,warning) {
  operations=[]; build();
  steps.push({number:steps.length+1,page:pages[steps.length],title,action,warning,operations});
}
function op(kind,ids,paths,axis,receivers=[],caption=families[parts.get(ids[0]).family].name,view=null,extra={}) {
  const axes=Array.isArray(axis[0])?axis:ids.map(()=>axis);
  axis=axes[0];
  const target=xyz(paths[0].at(-1));
  operations.push({kind,ids,prerequisites:receivers,poses:paths,axes,joint:{target,axis,outward:mul(axis,-1),receivers,caption,view},...extra});
  ids.forEach((id,i)=>at.set(id,paths[i].at(-1)));
  return ids;
}
function place(id,end,receivers=[],axis=down,reach=115,view=null,via=[]) {
  const first=via[0]??end;
  op('place',[id],[[shift(first,mul(axis,-reach)),...via,end]],axis,receivers,undefined,view);
}
function move(ids,frames,axis,caption,receivers=[],view=wide,localPivot=[0,0,0]) {
  const anchor=ids[0], start=at.get(anchor), q=inverse(start.slice(3));
  const rigidFrames=[start,...frames].map(p=>compose(p,P(...localPivot)));
  const undo=P(...turn(mul(xyz(rigidFrames[0]),-1),q),q);
  const offsets=ids.map(id=>compose(undo,at.get(id)));
  const targets=rigidFrames.slice(1);
  const paths=ids.map((id,i)=>[at.get(id),...targets.map(frame=>compose(frame,offsets[i]))]);
  paths[0]=[start,...frames];
  op('move',[...ids],paths,axis,receivers,caption,view,{rigid:{anchor,frames:rigidFrames,offsets}});
}
function adjust(ids,to,axis,caption,receivers,view=null,ends=ids.map(id=>at.get(id))) {
  op('adjust',ids,ids.map((id,i)=>[at.get(id),ends[i]]),axis,receivers,caption,view,{captive:{from:0,to}});
}
function facing(axis) {
  const n=mul(axis,-1);
  if(n[1]<-0.999) return pitch(PI);
  const q=[...cross(up,n),1+n[1]], scale=1/Math.hypot(...q);
  return mul(q,scale);
}
function fit(key,positions,axes,receivers) {
  const ids=positions.map(()=>`${key}-${used[key]=(used[key]??0)+1}`);
  if(!Array.isArray(axes[0])) axes=ids.map(()=>axes);
  const paths=positions.map((pos,i)=>{
    const end=P(...pos,facing(axes[i]));
    return [shift(end,mul(axes[i],-54)),end];
  });
  return op('place',ids,paths,axes,receivers);
}

const seatGroup=['seat'], backGroup=['back'];
const seatBench=(y,q)=>P(-1560,y,1260,q);
const backBench=(y,q)=>P(1550,y,-1270,q);
const seatCorners=side('riserL','riserR').map(([s,id])=>[s,id,[s*923,-195,314]]);
step('Locate the seat-leg brackets','Set the seat upside down. Locate both bracket pins in the underside corner holes and lower the risers flush.',()=>{
  place('seat',seatBench(340,pitch(PI)),[],down,110,preparation);
  for(const [s,id,v] of seatCorners) place(id,P(...point('seat',v),s>0?pitch(PI):[0,0,1,0]),['seat'],down,95);
  seatGroup.push('riserL','riserR');
},setup);
step('Screw down the brackets','Use four flat-head 121365 screws and the supplied T-driver. Do not substitute the short round-head or long pointed screws.',()=>{
  for(const [s,id] of seatCorners) seatGroup.push(...fit('121365',[point('seat',[s*951,-87,315]),point('seat',[s*910,-87,291])],down,[id,'seat']));
});
step('Thread in the seat feet','Screw one 141454 foot into the free end of each riser.',()=>{
  for(const [s,id] of seatCorners) seatGroup.push(...fit('141454',[point('seat',[s*923,-344,314])],down,[id]));
});
step('Pad the seat feet','Peel two pads from the supplied sheets and center one on each seat foot.',()=>{
  for(const [i,[s]] of seatCorners.entries()) seatGroup.push(...fit('10050334',[point('seat',[s*923,-378,314])],down,[`141454-${i+1}`]));
});
step('Draw on the seat cover','With a helper, turn the seat onto its edge. Draw the separate seat cover over the padded face in the orientation shown.',()=>{
  move(seatGroup,[seatBench(386,pitch(-PI/2))],up,'Turn the seat onto its edge',[],preparation);
  place('seatCover',at.get('seat'),['seat'],front,135,preparation);
  seatGroup.push('seatCover');
},labelCare);
step('Align the long seat edge','Turn to the underside. Smooth and align the long edge, then press it onto the fastening strip; do not trap a fold at the corner.',()=>{
  move(seatGroup,[seatBench(398,pitch(-PI/2-.38))],rear,'Turn to expose the underside',[],preparation);
  adjust(['seatCover'],1,rear,'Close the first long strip',['seat'],preparation);
});
step('Wrap the seat-cover ends','Turn the seat face-down on the protected surface, then fold both short end strips in.',()=>{
  move(seatGroup,[seatBench(342,pitch(PI))],down,'Return the seat face-down',[],preparation);
  adjust(['seatCover'],2,down,'Fold in the short end strips',['seat'],preparation);
});
step('Close the second seat edge','Smooth the opposite long edge along its entire length and press it onto the mating strip.',()=>{
  adjust(['seatCover'],3,down,'Close the second long strip',['seat'],preparation);
});
step('Loop the skirt around both feet','Stretch each end loop over its seat foot. Check that the loop sits around the foot, not on its end.',()=>{
  adjust(['seatCover'],4,down,'Retain both skirt loops',['141454-1','141454-2'],preparation);
});
step('Draw on the backrest cover','Stand the backrest on its long edge. With a helper, align the separate cover and its fastening edge with the receiver-plate side.',()=>{
  place('back',backBench(262),[],down,125,preparation);
  place('backCover',at.get('back'),['back'],down,155,preparation);
  backGroup.push('backCover');
},labelCare);
step('Settle the backrest cover ends','Pull both ends down evenly. Keep the top seam smooth rather than folded over itself.',()=>{
  adjust(['backCover'],1,down,'Settle both cover ends',['back'],preparation);
});
step('Lay down the backrest','Turn the same covered backrest onto the protected surface with a helper. Wrap the lower edge at both ends.',()=>{
  move(backGroup,[backBench(83,pitch(-PI/2))],down,'Turn the backrest onto its rear face',[],preparation);
  adjust(['backCover'],2,up,'Wrap both cover ends',['back'],preparation);
});
step('Smooth the backrest strip','Fold the loose long edge over. Work along the strip to align the fabric end to end.',()=>{
  adjust(['backCover'],3,up,'Align the long strip',['back'],preparation);
});
step('Press the backrest strip closed','Press the long strip onto its mating strip along the backrest.',()=>{
  adjust(['backCover'],4,up,'Press the long strip closed',['back'],preparation);
});

const armGroups=new Map(), armEnd=s=>P(s*1112,317,0);
const armSides=side('armL','armR');
const footSpots=[-351,351];
step('Thread feet into both arms','Put each arm on its outer face. Screw in two 141454 feet on each arm.',()=>{
  for(const [s,id] of armSides) {
    place(id,P(s*1590,113,-1100,roll(-s*PI/2)),[],down,110,preparation);
    armGroups.set(id,[id,...fit('141454',footSpots.map(z=>point(id,[-s*7,-288,z])),X(s),[id])]);
  }
});
step('Pad the four arm feet','Peel and center one pad on each existing arm foot. Leave the two leftover pads unused.',()=>{
  for(const [s,id] of armSides) {
    const group=armGroups.get(id);
    group.push(...fit('10050334',footSpots.map(z=>point(id,[-s*7,-319,z])),X(s),group.slice(1)));
  }
});
const railStuds=new Map();
step('Start the eight rail studs','Stand both arm modules upright. Use eight short 10050529 screws in the shown holes. Leave the heads proud for the keyholes.',()=>{
  for(const [s,id] of armSides) {
    const group=armGroups.get(id), end=armEnd(s);
    if(s<0) end[0]-=240;
    move(group,[shift(end,[0,125,-350]),end],up,'Turn the padded arm upright');
    const studs=fit('10050529',[railZ,-railZ].flatMap(z=>railStudHeights.map(y=>[end[0]-s*122,y,z])),X(s),[id]);
    railStuds.set(id,studs); group.push(...studs);
  }
});
step('Key in the plain-top front rail','Use the rail without the raised tabs. With a helper, push both wide entries over the proud right-arm heads, then lower the rail to lock them in the narrow slots.',()=>{
  place('frontRail',P(0,railY,railZ),['armR',...railStuds.get('armR').slice(0,2)],X(1),190,wide,[P(0,railY+railDrop,railZ)]);
});
step('Key in the tab-top rear rail','Fit the rail with the raised tabs onto the other right-arm studs. Engage the wide entries first, then lower.',()=>{
  place('rearRail',P(0,railY,-railZ),['armR',...railStuds.get('armR').slice(2)],X(1),190,wide,[P(0,railY+railDrop,-railZ)]);
});
step('Connect the left arm','Bring the left arm to both ends and engage all four proud heads. Lower the two rails onto them as shown.',()=>{
  const rails=['frontRail','rearRail'], end=at.get('frontRail');
  move(rails,[about(end,[1004,railY,railZ],roll(-railDrop/2008))],up,'Align the two left keyhole entries',['armR'],wide,[1004,0,0]);
  move(armGroups.get('armL'),[armEnd(-1)],X(1),'Bring the left-arm studs through the entries',rails);
  move(rails,[end],down,'Lower both rails onto the left studs',['armL','armR'],wide,[1004,0,0]);
});
step('Fasten the rail end tabs','With the driver, add one short 10050529 at each lower end tab, four in total.',()=>{
  for(const [z,id] of [[railZ,'frontRail'],[-railZ,'rearRail']]) {
    for(const [s,arm] of armSides) fit('10050529',[[s*991,130,z]],X(s),[id,arm]);
  }
});
step('Tighten the eight rail studs','Tighten the same eight proud screws with the driver only after both rails are seated at both arms.',()=>{
  for(const [s,id] of armSides) {
    const ids=railStuds.get(id);
    adjust(ids,1,X(s),'Tighten the seated studs',[id,'frontRail','rearRail'],wide,ids.map(bolt=>shift(at.get(bolt),[s*7,0,0])));
  }
});
step('Fit both rolled-arm covers','With a helper, pull one separate cover down onto each arm. Match the curved seam to the rolled edge; do not trap a fold.',()=>{
  for(const [s,id] of side('armCoverL','armCoverR')) place(id,armEnd(s),[s<0?'armL':'armR'],down,135,wide);
},labelCare);
step('Close the inside arm strips','Pull the lower fabric edge down and press the long inside strip on both arms.',()=>{
  adjust(['armCoverL','armCoverR'],1,down,'Close the inner fastening strips',['armL','armR'],wide);
});
step('Close the arm end strips','Fold the two end strips against their mating edges as shown. Repeat at the other arm.',()=>{
  adjust(['armCoverL','armCoverR'],2,down,'Close both sets of end strips',['armL','armR'],wide);
});
const hingeIds=['hingeL','hingeR'];
step('Install the handed spring mechanisms','Match the locating end shown in the inset and fit one mechanism to each inner arm. Use three 10050529 per side.',()=>{
  for(const [s,id] of side(...hingeIds)) {
    const arm=s<0?'armL':'armR', z=-32;
    place(id,P(s*971,230,z),[arm],X(s),96);
    fit('10050529',hingeBores.map(([y,b])=>[s*977,230+y,z+b]),X(s),[id,arm]);
  }
});

const linerBench=P(-1580,220,-1320);
const clipGroup=[[-1,-1],[1,-1],[-1,1],[1,1]].map(([x,z],i)=>[`10004419-${i+1}`,x,z]);
step('Cap the storage-liner rods','Lay out the storage liner. Slide one loose clip onto each of the four rod ends. The six middle clips are already attached.',()=>{
  place('liner',linerBench,[],down,90,preparation);
  for(const [id,x,z] of clipGroup) place(id,P(...point('liner',[x*970,126,z*railZ]),z<0?halfYaw:undefined),['liner'],X(-x),53);
});
step('Lower the liner into the frame','With a helper, carry the liner by its edges and lower it, with its rods and all ten clips, into the frame. Leave the straps loose.',()=>{
  move(['liner',...clipGroup.map(([id])=>id)],[P(0,425,0),P(0,railY,0)],down,'Lower the complete liner',['frontRail','rearRail']);
});
step('Snap ten clips onto the upper rails','Match each clip tab to its locating point. Press both sets of five clips down until they click, including the four end clips.',()=>{
  adjust(['liner',...clipGroup.map(([id])=>id)],1,down,'Engage all ten upper clips',['frontRail','rearRail'],wide);
});
step('Wrap and close both strap groups','Wrap and close the four rear straps around the rear lower rail. Then wrap and close the four front straps around the front lower rail.',()=>{
  adjust(['liner'],2,up,'Close the four rear straps',['rearRail'],{direction:[-.53,.3,-.83],span:1150});
  adjust(['liner'],3,up,'Close the four front straps',['frontRail'],{direction:[-.53,.3,.83],span:1150});
});
step('Secure the keeper bar','Lower the keeper bar between the arms with both end tabs pointing up. Fasten with one 130550 wing screw per side.',()=>{
  place('bar',P(0,351,-164),['armL','armR'],down,126,wide);
  for(const [s,id] of armSides) fit('130550',[[s*986,371,-164]],X(s),['bar',id]);
});
step('Open the seat mechanisms','Operate the linked seat mechanisms toward the front. Check that both seat-support ends reach the position shown in the second inset.',()=>{
  adjust(hingeIds,1,front,'Bring both seat locators forward',['armL','armR'],wide);
});
const openSeat=P(0,380,557), closedSeat=P(0,380,122);
step('Lower and draw the seat forward','With a helper, lower the same covered seat onto both locators. Check that the pins enter their receivers, then draw the seat forward.',()=>{
  move(seatGroup,[P(0,649,448),P(0,380,448)],down,'Lower onto both mechanism locators',hingeIds);
  move(seatGroup,[openSeat],front,'Draw the covered seat forward',hingeIds);
});
step('Fasten the seat brackets from below','Reach under the two bracket positions and drive the two long pointed 152122 screws upward, not 152546.',()=>{
  for(const [s,id] of side(...hingeIds)) seatGroup.push(...fit('152122',[[s*968,271,262]],up,[id,'seat']));
});
const backEnd=P(0,585,-349), backPivot=[0,422,-395], backPivotLocal=[0,-163,-46];
const guideIds=['guideL','guideR'];
step('Fit the two backrest guides','Stand the backrest upright. Slide the forked guides onto the indicated top pins, with each fork down and the indicated face exposed.',()=>{
  move(backGroup,[backBench(264)],up,'Stand the same covered backrest upright');
  for(const [s,id] of side(...guideIds)) place(id,P(...point('back',[s*973,-205,44])),['back'],X(s),73);
});
step('Lower both backrest forks onto the tabs','With a helper, move the backrest into position, align both forks with the rear rail, and lower them onto its tabs.',()=>{
  move([...backGroup,...guideIds],[P(0,759,-448),P(0,759,-349),backEnd],down,'Seat both forks on the rear locating tabs',['rearRail','frontRail']);
});
step('Fold forward and fasten the backrest','Fold the backrest down toward the front to expose the rear joints. Fit four 152546 screws, two per end, with the supplied driver.',()=>{
  move(backGroup,[about(backEnd,backPivot,pitch(PI/2))],front,'Fold the attached backrest forward',guideIds,wide,backPivotLocal);
  for(const [s,id] of side(...guideIds)) {
    fit('152546',[-24,3].map(y=>point(id,[-s*15,y,-24])),front,[id,'rearRail']);
  }
});
step('Raise the backrest and close the seat','Return the backrest upright. Lift the front of the seat and guide the covered seat rearward until it is in its sofa position.',()=>{
  move(backGroup,[backEnd],up,'Raise the attached backrest',guideIds,wide,backPivotLocal);
  move(seatGroup,[P(0,421,428,pitch(-.12)),closedSeat],rear,'Lift and guide the seat rearward',hingeIds);
  adjust(hingeIds,0,rear,'Settle the linked mechanism behind the seat',['armL','armR'],wide);
});
function cushion(id,cover,x) {
  const end=P(x,664,-237,pitch(-.14)), bench=P(x,313,1550);
  place(id,bench,[],down,95);
  place(cover,bench,[id],down,140);
  adjust([cover],1,down,'Tuck the closure and zip the cover',[id]);
  move([id,cover],[P(x,901,-30,pitch(-.14)),end],down,'Lower the covered cushion into position',['seat','back']);
}
const expansion={text:'Open the cushion packaging by hand, without scissors or a knife, and allow up to 72 hours for expansion (official page 41).',page:41};
step('Cover and seat the outer cushions','Fit the handed outer covers to the two shaped inserts, matching their corners. Tuck in the closure and zip each cushion, then lower both onto the sofa.',()=>{
  cushion('outerL','outerCoverL',-665);
  cushion('outerR','outerCoverR',665);
},expansion);
step('Cover and seat the center cushion','Fit the center cover to its own insert. Line up the corners and close its zip, then place it between the two outer cushions.',()=>{
  cushion('center','centerCover',0);
},expansion);
