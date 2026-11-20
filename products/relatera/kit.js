import { pages } from './manual.js';

export const setup = 'Work with two people on a protected surface. Bring a cross-head screwdriver and a spirit level; the three hex keys are supplied.';
export const capWarning = 'Always cover every tabletop accessory hole with the included caps or compatible RELATERA accessories to reduce the risk of fingers getting pinched or stuck.';

const X=[1,0,0], Y=[0,1,0], Z=[0,0,1], down=[0,-1,0], {PI}=Math;
const pose=(x,y,z,axis=Y,a=0)=>[x,y,z,...axis.map(v=>v*Math.sin(a/2)),Math.cos(a/2)];
const shift=(p,d,n)=>p.map((v,i)=>i<3?v+d[i]*n:v);
const rotate=([x,y,z],[,,,a,b,c,d])=>{
  const u=2*(b*z-c*y),v=2*(c*x-a*z),w=2*(a*y-b*x);
  return [x+d*u+b*w-c*v,y+d*v+c*u-a*w,z+d*w+a*v-b*u];
};
function compose(p,q) {
  const [x,y,z]=rotate(q,p), [,,,a,b,c,d]=p, [,,,e,f,g,h]=q;
  return [x+p[0],y+p[1],z+p[2],d*e+a*h+b*g-c*f,d*f-a*g+b*h+c*e,d*g+a*f-b*e+c*h,d*h-a*e-b*f-c*g];
}
function inverse(p) {
  const [x,y,z,a,b,c,d]=p, q=[0,0,0,-a,-b,-c,d];
  return [...rotate([-x,-y,-z],q),...q.slice(3)];
}
const screwPose=([x,y,z],[a,b,c])=>pose(x,y,z,a||c?[-c,0,a]:X,Math.acos(-b));
const point=p=>p.slice(0,3);

// Shared coordinates for the stock and the authored receivers, in the finished low pose.
export const layout = {
  legX:523, legY:315, legZ:-130, railY:610, railX:192, trayX:-45, trayY:559.5, trayZ:-219,
  armY:624, topY:641.5, topW:1172, topD:600, topH:19, topFace:651, footY:14, glideZ:[-268,268],
  armZ:[-265,257], lapX:[-41,58], endX:[464,496], beamTopX:[-26,70], beamTopZ:-88,
  footScrew:[[-12,-14],[12,-14],[-12,14],[12,14]], mountX:551, mountY:609, mountZ:-119,
  shoulderZ:[-27,27], crankHoles:[[-13,-16],[-13,16],[13,-16],[13,16]], hookHoles:[[14,-24],[-14,24]],
  capsX:[-490,-163,163,490], capsZ:-251, traySlots:[-74,74], trayPads:[-96,96], travel:180
};
const L=layout, signs=[-1,1];
export const shapes = {
  railWide:[630,42,74], railNarrow:[630,36,62], column:[62,612,75], arm:[58,46,556], base:[64,16,581], shaft:[1028,16,18],
  crank:[46,84,64], hook:[54,56,66], top:[L.topW,L.topH,L.topD], tray:[258,74,101],
  ballKey:[8,136,35], offsetKey:[9,64,42], smallKey:[5,65,22], lapNut:[12,5,12], lapScrew:[10,17,10],
  beamScrew:[13,20,13], shoulder:[13,16,13], footScrew:[11,40,11], glide:[35,22,35],
  crankScrew:[9,11,9], hookScrew:[10,10,10], topScrew:[10,15,10], centerScrew:[8,12,8], pad:[12,10,2], cap:[20,11,20]
};
export const families={}, parts=new Map();
function stock(key,name,shape,ids,group,page,number,staged,role='kit') {
  families[key]=Object.freeze({name,number,group,page,role});
  for(const [i,id] of ids.entries()) {
    const unpacked=Object.freeze(staged(i));
    parts.set(id,Object.freeze({id,family:key,shape,packet:group,unpacked}));
  }
}
const structure='Underframe and mechanisms', fittings='Fittings and supplied keys', covers='Tabletop and caps';
const beams=['railWide','railNarrow'], legs=['columnL','columnR'], arms=['armL','armR'], feet=['baseL','baseR'];
stock('railWide','Outer crossrail channel','railWide',[beams[0]],structure,5,null,()=>pose(-344,23,-312));
stock('railNarrow','Nested crossrail channel','railNarrow',[beams[1]],structure,5,null,()=>pose(329,21,-312));
stock('column','Telescoping column with gearbox','column',legs,structure,7,null,i=>pose(677+i*92,42,-79,X,PI/2));
stock('arm','Tabletop support arm','arm',arms,structure,8,null,i=>pose(887+i*69,23,-72));
stock('base','Base foot','base',feet,structure,9,null,i=>pose(1040+i*72,10,-62));
stock('shaft','Drive shaft and captive collar','shaft',['shaft'],structure,10,null,()=>pose(4,9,-394));
stock('crank','Folding crank and mounting plate','crank',['crank'],structure,12,null,()=>pose(700,25,300,Z,PI/2));
stock('hook','Bag hook','hook',['hook'],structure,13,null,()=>pose(815,24,300,Z,PI/2));
stock('tray','Under-top cable holder','tray',['tray'],structure,15,null,()=>pose(968,37,350));
stock('top','Wide tabletop, 305.402.95','top',['top'],covers,13,null,()=>pose(17,10,36));
const ids=(key,n)=>Array.from({length:n},(_,i)=>`${key}-${i+1}`);
let slot=0;
for(const [key,name,shape,n,role] of [
  ['10118114','Flanged nut','lapNut',4], ['10118113','Overlap socket screw','lapScrew',4],
  ['10036539','Stepped-tip beam screw','beamScrew',10], ['10106891','Support arm shoulder screw','shoulder',4],
  ['148236','Long foot socket screw','footScrew',8], ['112762','Threaded leveling glide','glide',4],
  ['101076','Flat-head crank screw','crankScrew',4], ['143670','Button-head hook screw','hookScrew',2],
  ['107624','Pan-head tabletop screw','topScrew',4], ['109067','Short coarse screw','centerScrew',2],
  ['119500','Cable-holder pad (two on one sheet)','pad',2], ['10096992','Tabletop cover cap','cap',4],
  ['124325','Long ball-ended hex key','ballKey',1,'tool'], ['10067513','Offset hex key','offsetKey',1,'tool'], ['100006','Small hex key','smallKey',1,'tool']
]) stock(key,name,shape,ids(key,n),key==='10096992'?covers:fittings,key==='10096992'?4:3,key,()=>{
  const p=slot++;
  const tool=role==='tool';
  return pose(tool?360+(p-52)*88:-552+(p%18)*36,tool?5:shapes[shape][1]/2,tool?493:383+Math.floor(p/18)*48,tool?X:Y,tool?PI/2:0);
},role);

function author(crankSide) {
  const assembly=[], at=new Map();
  let operations;
  function step(title,action,run,warning,extraPage) {
    const number=assembly.length+1;
    operations=[]; run();
    const record={number,page:extraPage??pages[number-1],title,action,operations,warning};
    if(!extraPage) assembly.push(record);
    return record;
  }
  function add(kind,ids,prerequisites,paths,axis,caption,captive,view,previewBores=false) {
    const axes=Array.isArray(axis[0])?axis:ids.map(()=>axis);
    operations.push({kind,ids,prerequisites,poses:paths,axes,captive,previewBores,
      joint:{target:point(paths[0].at(-1)),axis:axes[0],outward:axes[0].map(v=>-v),receivers:prerequisites,caption,view}});
    ids.forEach((id,i)=>at.set(id,paths[i].at(-1)));
  }
  function place(ids,receivers,ends,axis,caption,clear=66,view,previewBores) {
    add('place',ids,receivers,ends.map((p,i)=>[shift(p,Array.isArray(axis[0])?axis[i]:axis,-clear),p]),axis,caption,null,view,previewBores);
  }
  function adjust(ids,receivers,ends,axis,caption,captive,view) {
    add('adjust',ids,receivers,ids.map((id,i)=>[at.get(id),ends?.[i]??at.get(id)]),axis,caption,captive,view);
  }
  const whole={direction:[-.55,.43,.72],span:1120};
  function move(ids,anchor,frames,receivers,axis,caption,view=whole) {
    const start=at.get(anchor), local=inverse(start), offsets=ids.map(id=>compose(local,at.get(id)));
    add('move',ids,receivers,ids.map((id,i)=>[at.get(id),...frames.map(f=>compose(f,offsets[i]))]),axis,caption,null,view);
    operations.at(-1).rigid={anchor,frames:[start,...frames],offsets};
  }
  const upside=pose(0,L.topFace,0,X,PI), upright=pose(0,0,0);
  let rig=upright;
  const world=p=>compose(rig,p), beam=signs.map(s=>pose(s*L.railX,L.railY,L.legZ));
  const sideAxis=s=>[-s,0,0];
  const turned=(p,axis)=>rotate(axis,p);
  const fast=(key,receivers,points,axis,caption,{clear=40,view,previewBores}={})=>{
    const byPart=Array.isArray(axis[0]);
    const directions=byPart?axis.map(v=>turned(rig,v)):turned(rig,axis);
    place(ids(key,points.length),receivers,points.map((p,i)=>world(screwPose(p,byPart?axis[i]:axis))),directions,caption,clear,view,previewBores);
  };
  const centerView={direction:[-.22,.37,-.9],span:320};
  step('Nest the wide crossrail','Select the wide position. On protection, lower the narrower channel into the outer channel and align the overlap holes.',()=>{
    rig=pose(0,23-L.railY,130);
    place([beams[0]],[],[world(beam[0])],down,'Outer channel',25,whole);
    place([beams[1]],[beams[0]],[world(beam[1])],down,'Wide overlap',68,centerView);
    operations.at(-1).joint.target=[8,23,0];
  });
  step('Bolt the overlapping channels','Hold four flanged nuts 10118114 inside the overlap and install four 10118113 screws from the outside with the offset key.',()=>{
    const station=signs.flatMap(s=>L.lapX.map(x=>[x,L.railY,L.legZ,s]));
    const center=(s,z)=>z+s*34;
    fast('10118114',beams,station.map(([x,y,z,s])=>[x,y,center(s,z)-s*8]),station.map(([, , ,s])=>[0,0,s]),'Flanged nuts inside the channel',{clear:19,view:centerView});
    fast('10118113',[...beams,...ids('10118114',4)],station.map(([x,y,z,s])=>[x,y,center(s,z)+s*3]),station.map(([, , ,s])=>[0,0,-s]),'Four overlap screws',{view:centerView});
  });
  const turnover=pose(0,355,0,X,PI/2);
  const anchor=beams[0];
  step('Turn the beam and fit both columns','Roll the crossrail over. Slide the two column ends inward from opposite sides, gearbox ends against the beam.',()=>{
    const half=pose(0,95,0,X,PI/2);
    move([...at.keys()],anchor,[compose(half,pose(beam[0][0],0,0)),compose(upside,beam[0])],[],down,'Roll the bolted channel');
    rig=upside;
    for(const [i,s] of signs.entries()) place([legs[i]],beams,[world(pose(s*L.legX,L.legY,L.legZ))],sideAxis(s),'Slide the keyed column end over the beam',95,whole);
  });
  const beamPoints=signs.flatMap(s=>[[s*480,L.railY-22,L.legZ],...signs.flatMap(z=>L.endX.map(x=>[s*x,L.railY,L.legZ+z*36]))]);
  const beamAxes=signs.flatMap(()=>[Y,...signs.flatMap(s=>[[0,0,-s],[0,0,-s]])]);
  const beamBolts=ids('10036539',10);
  step('Start the stepped beam screws','Use the long hex key to start one stepped-tip 10036539 on the horizontal face and four on the sides of each column joint. Do not tighten them yet.',()=>{
    fast('10036539',[...beams,...legs],beamPoints.map((p,i)=>shift(p,beamAxes[i],i%5?-3:-7)),beamAxes,'Start the ten stepped screws');
  });
  step('Tighten the ten beam screws','Return to the same screws and tighten them, including both previously proud screws. No new fittings.',()=>{
    adjust(beamBolts,[...beams,...legs],beamPoints.map((p,i)=>world(screwPose(p,beamAxes[i]))),beamAxes.map(v=>turned(rig,v)),'Seat all ten screws flush');
  });
  const shoulders=s=>L.shoulderZ.map(z=>[s*(L.mountX+2),L.mountY,L.mountZ+z]);
  step('Fit the tabletop support arms','Slide the two supports onto the outside faces of the column heads. Secure each with two 10106891 shoulder screws and the long hex key.',()=>{
    for(const [i,s] of signs.entries()) place([arms[i]],[legs[i]],[world(pose(s*L.legX,L.armY,0))],sideAxis(s),'Outside support arm');
    fast('10106891',[...arms,...legs],signs.flatMap(shoulders),signs.flatMap(s=>[sideAxis(s),sideAxis(s)]),'Two shoulder screws per support');
  });
  const footPoints=(localY,stations)=>signs.flatMap(s=>stations.map(([x,z])=>[s*L.legX+x,localY,z]));
  step('Bolt on the two base feet','Fit the long feet to the exposed column ends. Install all four 148236 long screws per foot with the offset key.',()=>{
    place(feet,legs,signs.map(s=>world(pose(s*L.legX,L.footY,0))),down,'Base feet on exposed column ends',76,whole);
    fast('148236',[...feet,...legs],footPoints(6,L.footScrew.map(([x,z])=>[x,L.legZ+z])),Y,'Four foot screws per base');
  });
  step('Thread in the four leveling glides','Thread one 112762 glide into each end of both feet. Level once the desk is assembled, using the figure on page 18.',()=>{
    fast('112762',feet,footPoints(6,L.glideZ.map(z=>[0,z])),Y,'Glide threads enter the ends of both feet',{clear:48});
  });
  const shaft=pose(0,L.mountY,L.mountZ);
  step('Stand the frame and engage the shaft','With two people, turn the frame onto its feet. Lower the shaft between the columns, then spread its ends to engage both gearbox sockets.',()=>{
    move([...at.keys()],anchor,[compose(turnover,beam[0]),beam[0]],[],Y,'Two-person turn');
    rig=upright;
    place(['shaft'],legs,[shaft],down,'Lower the telescoping drive shaft',95,whole);
    adjust(['shaft'],legs,null,X,'Extend the two ends into both sockets',{from:0,to:1},whole);
  },{text:'Use two people to turn the frame.',page:10});
  step('Seat the shaft collar','Slide the central collar of the installed drive shaft into the position shown. No loose part is added.',()=>{
    adjust(['shaft'],legs,null,X,'Slide the captive center collar',{from:1,to:2},centerView);
  });
  const s=crankSide==='left'?-1:1, other=-s, sideIndex=side=>side<0?0:1;
  const mount=(side,delta=0)=>pose(side*(L.mountX+delta),L.mountY,L.mountZ,Y,side<0?PI:0);
  function mountPoints(side,x,holeOffsets) {
    return holeOffsets.map(([y,z])=>[side*(L.mountX+x),L.mountY+y,L.mountZ+side*z]);
  }
  const sideView=side=>({direction:[.8*side,.25,.54],span:205});
  step(`Mount the crank on the ${crankSide}`,`Viewed from the front, mount the crank on the ${crankSide} side, with its pin in the gear receiver. Secure the plate with all four 101076 flat-head screws.`,()=>{
    const i=sideIndex(s);
    place(['crank'],[arms[i],legs[i],'shaft'],[mount(s,6)],sideAxis(s),'Crank input and receiver',65,sideView(s));
    operations.at(-1).captive={from:0,to:0};
    fast('101076',['crank',arms[i],legs[i]],mountPoints(s,7,L.crankHoles),sideAxis(s),'Four flat-head crank screws',{view:sideView(s),previewBores:true});
  });
  step('Fit the hook on the other side','Seat the hook on the opposite mounting plate, clearing the existing shoulder screw heads. Secure with the two 143670 buttons and the small hex key.',()=>{
    const i=sideIndex(other);
    place(['hook'],[arms[i],legs[i]],[mount(other,4)],sideAxis(other),'Hook opposite the crank',66,sideView(other));
    fast('143670',['hook',arms[i],legs[i]],mountPoints(other,5,L.hookHoles),sideAxis(other),'Two hook screws',{view:sideView(other),previewBores:true});
  });
  const top=pose(0,L.topY,0);
  const bench=pose(0,L.topFace,690,X,PI), benchTurn=compose(pose(0,370,345,X,PI/2),beam[0]);
  step('Turn the frame onto the face-down top','Put the tabletop face-down on protection. With two people, turn the frame over and lower it onto the top. Secure the supports with four 107624 screws.',()=>{
    rig=bench;
    place(['top'],[],[world(top)],down,'Wide tabletop, face-down',25,whole);
    move([...at.keys()].filter(id=>id!=='top'),anchor,[benchTurn,shift(world(beam[0]),Y,64),world(beam[0])],['top'],down,'Lower the turned frame onto the top');
    fast('107624',[...arms,'top'],footPoints(L.armY+5,L.armZ.map(z=>[0,z])),Y,'Four screws through the support arms',{previewBores:true});
  },{text:'Use two people for the turn and protect the tabletop face.',page:13});
  step('Fasten the center tabs and turn upright','Drive two 109067 through the center beam tabs into the top, then have two people turn the desk upright.',()=>{
    fast('109067',[anchor,'top'],L.beamTopX.map(x=>[x,629,L.beamTopZ]),Y,'Two short tabletop screws',{view:centerView,previewBores:true});
    move([...at.keys()],anchor,[benchTurn,beam[0]],[],Y,'Turn with two people');
    rig=upright;
  },{text:'Use two people to turn the desk upright.',page:14});
  const looseTray=pose(0,45,434), tray=pose(L.trayX,L.trayY,L.trayZ);
  step('Apply both cable-holder pads','Peel the 119500 sheet and apply its two pads to the cable holder. Leave the slots free for the mounting tabs.',()=>{
    place(['tray'],[],[looseTray],down,'Loose under-top cable holder');
    place(ids('119500',2),['tray'],L.trayPads.map(x=>compose(looseTray,pose(x,17,50.5))),[0,0,-1],'Two pads from one backing sheet',24);
  });
  step('Hang and seat the cable holder','From behind the desk lift the holder to the beam, slide its openings over the tabs, then lower it to seat.',()=>{
    const lifted=shift(tray,Y,10.5);
    move(['tray',...ids('119500',2)],'tray',[pose(tray[0],tray[1]-57,tray[2]-88),shift(lifted,Z,-25),lifted,tray],beams,down,'Lift, engage the tabs, and lower',centerView);
  });
  step('Cover all four tabletop holes','Press the four supplied 10096992 caps into the wide top. Confirm all four accessory openings are covered before use.',()=>{
    fast('10096992',['top'],L.capsX.map(x=>[x,L.topFace,L.capsZ]),down,'Press the four caps flush',{clear:57,view:{direction:[-.49,.72,-.46],span:990},previewBores:true});
  },{text:capWarning,page:16});

  const stationary=[...legs,...feet,...ids('112762',4),...ids('148236',8)];
  const demo=step('Raise the desk with the crank','Pull out and unfold the crank. Turn it to raise both columns together; the shown travel is illustrative.',()=>{
    adjust(['crank'],[arms[sideIndex(s)]],null,[s,0,0],'Unlock and unfold the grip',{from:0,to:2},sideView(s));
    const moving=[...at.keys()].filter(id=>!stationary.includes(id));
    // One synchronized beat drives translation, both captive carriages and the crank angle.
    const ids=[...moving,...legs];
    adjust(ids,[],ids.map(id=>moving.includes(id)?shift(at.get(id),Y,L.travel):at.get(id)),Y,'Turn the crank and raise both carriages',{from:2,to:6},whole);
  },null,19);
  return {assembly,demo:[...assembly,demo]};
}

export const routes={left:author('left'), right:author('right')};
export const steps=routes.left.assembly;
