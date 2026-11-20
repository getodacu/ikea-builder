import { pages } from './manual.js';

const X=[1,0,0], Y=[0,1,0], Z=[0,0,1], up=Y, down=[0,-1,0], rear=[0,0,-1];
const { PI } = Math;
const pose=(x,y,z,axis=Y,angle=0)=>[x,y,z,...axis.map(v=>v*Math.sin(angle/2)),Math.cos(angle/2)];
const shift=(p,d,n)=>p.map((v,i)=>i<3?v+n*d[i]:v);
function rotate([x,y,z],[,,,a,b,c,d]) {
  const u=2*(b*z-c*y), v=2*(c*x-a*z), w=2*(a*y-b*x);
  return [x+d*u+b*w-c*v,y+d*v+c*u-a*w,z+d*w+a*v-b*u];
}
function compose(p,q) {
  const [x,y,z]=rotate(q,p), [,,,a,b,c,d]=p, [,,,e,f,g,h]=q;
  return [x+p[0],y+p[1],z+p[2],d*e+a*h+b*g-c*f,d*f-a*g+b*h+c*e,d*g+a*f-b*e+c*h,d*h-a*e-b*f-c*g];
}
function inverse([x,y,z,a,b,c,d]) {
  const q=pose(0,0,0); q.splice(3,4,-a,-b,-c,d);
  q.splice(0,3,...rotate([-x,-y,-z],q));
  return q;
}
function facing([x,y,z],[i,j,k]) {
  return pose(x,y,z,i||k?[-k,0,i]:X,Math.acos(-j));
}

export const wallWarning='Tip-over can cause serious or fatal crushing injuries. Use both supplied wall brackets to secure this bookcase to the wall before fitting the adjustable shelves or using it. Wall screws and plugs are not included; use fixings suitable for your wall and seek professional advice if unsure.';
const safety={text:wallWarning,page:2};
export const W=800, H=2019, D=279, T=18;
export const inside=W/2-T, front=D/2, wallZ=-D/2, panelRear=-122, boardZ=(panelRear+front)/2;
export const grooveZ=-123.75, grooveHalf=2.75, grooveDepth=6;
export const bottomY=87, middleY=1001, topY=H-T/2, railY=45, railZ=130;
export const boardY=[bottomY,middleY,topY], camZ=[-62,70], dowelZ=[-103,112], railPins=[125,135];
export const camX=inside-28, retainerX=[-320,-192,-64,64,192,320];
export const backY=(bottomY+topY)/2, backW=2*(inside+4.5), backH=topY-bottomY+14, backT=3.5;
export const wallX=[-238,238], wallHoleY=H+18, bracketScrewZ=wallZ+37;
export const supportZ=[-88,102], supportRows=[376,600,1400,1656], supportX=inside-8;
export const shelfZ=(front-118)/2, shelfSeatOffset=4;
export const sidePinY=[...Array.from({length:26},(_,i)=>152+32*i),...Array.from({length:27},(_,i)=>1080+32*i)];

export const shapes={
  side:[T,H,D], lowerBoard:[inside*2,T,front-panelRear], upperBoard:[inside*2,T,front-panelRear],
  rail:[inside*2,90,19], back:[backW,backH,backT], shelf:[inside*2-1.2,T,front+118],
  dowel:[8,30,8], bolt:[8,43,8], cam:[14,13,14], sleeve:[8,13,8], pin:[7,12,7],
  bracket:[19,35,56], washer:[13,1.6,13], screw:[8,16,8], support:[22,16,11], target:[12,1,12]
};
export const groups=['Carcass panels','Back and adjustable shelves','Fittings · p. 7','Required, not supplied'];
export const families={}, parts=new Map();
function stock(key,name,number,group,page,entries,role='kit') {
  families[key]=Object.freeze({name,number,group,page,role});
  for(const [id,shape,unpacked] of entries) {
    parts.set(id,Object.freeze({id,family:key,shape,unpacked:Object.freeze(unpacked),packet:group}));
  }
}
const flat=([x,y,z])=>pose(x,y,z,X,PI/2);
stock('side','Grooved side panel',null,groups[0],8,[['sideL','side',pose(-1400,9,-580,Z,PI/2)],['sideR','side',pose(-1050,9,-580,Z,-PI/2)]]);
stock('bottom','Bottom panel',null,groups[0],7,[['bottom','lowerBoard',pose(-400,9,-1320)]]);
stock('fixed','Fixed middle shelf',null,groups[0],7,[['fixed','lowerBoard',pose(-400,9,-1020)]]);
stock('top','Top panel',null,groups[0],7,[['top','upperBoard',pose(-400,9,-720)]]);
stock('rail','Toe rail',null,groups[0],7,[['rail','rail',flat([-400,9.5,-490])]]);
stock('back','Folding fiberboard back',null,groups[1],12,[['back','back',flat([500,262,-510])]]);
stock('shelf','Adjustable shelf',null,groups[1],16,Array.from({length:4},(_,i)=>[`shelf-${i+1}`,'shelf',pose(1200,9,-1300+i*305)]));
let cell=0;
for(const [key,name,shape,n] of [
  ['101351','Wood dowel','dowel',16],['118331','Cam bolt','bolt',12],['119081','Slotted cam lock','cam',12],
  ['151706','Back retainer sleeve','sleeve',18],['151705','Back retainer pin','pin',18],
  ['106989','Slotted wall bracket','bracket',2],['100823','Washer','washer',4],
  ['109041','Bookcase bracket screw','screw',2],['131372','Shelf support peg','support',16]
]) stock(key,name,key,groups[2],7,Array.from({length:n},(_,i)=>{
  const p=cell++;
  return [`${key}-${i+1}`,shape,pose(-600+(p%15)*65,shape==='bracket'?0:12,-320+Math.floor(p/15)*70)];
}));
stock('wall','Wall fixing position (fixing not supplied)',null,groups[3],14,
  wallX.map((_,i)=>[`wall-${i+1}`,'target',pose(620+i*60,1,200)]),'external');

function author() {
  const records=[], at=new Map(), count=new Map();
  let operations;
  function step(title,action,run,warning) {
    const number=records.length+1;
    operations=[]; run(); records.push({number,page:pages[number-1],title,action,operations,warning});
  }
  function event(kind,ids,prerequisites,poses,axis,{caption,view,captive,rigid,previewBores}={}) {
    const axes=Array.isArray(axis[0])?axis:ids.map(()=>axis), [direction]=axes;
    const receiver=parts.get(ids[0]);
    operations.push({kind,ids,prerequisites,poses,axes,captive,rigid,previewBores,
      joint:{target:poses[0].at(-1).slice(0,3),axis:direction,outward:direction.map(v=>-v),receivers:prerequisites,
        caption:caption??families[receiver.family].name,view}});
    ids.forEach((id,i)=>at.set(id,poses[i].at(-1)));
    return ids;
  }
  function place(ids,ends,axis,prereqs=[],distance=65,options) {
    return event('place',ids,prereqs,ends.map((end,i)=>[shift(end,Array.isArray(axis[0])?axis[i]:axis,-distance),end]),axis,options);
  }
  function ids(key,n) {
    const start=count.get(key)??0; count.set(key,start+n);
    return Array.from({length:n},(_,i)=>`${key}-${start+i+1}`);
  }
  function fit(key,points,axis,receivers,distance,options) {
    return place(ids(key,points.length),points.map((p,i)=>facing(p,Array.isArray(axis[0])?axis[i]:axis)),axis,receivers,distance,options);
  }
  function carry(anchor,members,start,waypoints,receivers,axis,options) {
    const offsets=members.map(id=>compose(inverse(start),at.get(id)));
    const frames=[start,...waypoints];
    event('move',members,receivers,offsets.map((offset,i)=>[at.get(members[i]),...waypoints.map(p=>compose(p,offset))]),axis,
      {...options,rigid:{anchor,frames,offsets}});
  }
  function turn(ids,receivers,axis,caption,view) {
    event('adjust',ids,receivers,ids.map(id=>[at.get(id),at.get(id)]),axis,{caption,view,captive:{from:0,to:1}});
  }

  const side=['sideL','sideR'];
  const benches=Object.fromEntries(['bottom','fixed','top','rail'].map((id,i)=>[id,pose(-965,id==='rail'?45:9,-100+i*310)]));
  const sideLay=(y,angle)=>compose(pose(0,y,front,Z,angle),pose(0,0,0,X,PI/2));
  const lay=sideLay(W/2,PI/2), faceDown=sideLay(front,0);
  const sideWorld=sign=>pose(sign*(W-T)/2,H/2,0);
  const firstSide=compose(lay,sideWorld(-1)), secondSide=compose(lay,sideWorld(1));
  const secondBench=shift(compose(sideLay(W/2,-PI/2),sideWorld(1)),X,570);
  const boardWorld={bottom:pose(0,bottomY,boardZ),fixed:pose(0,middleY,boardZ),top:pose(0,topY,boardZ),rail:pose(0,railY,railZ)};
  const stockDowel={}, studs=[];
  const layView={direction:[-.85,.64,-.72],span:1050}, backView={direction:[-.46,.85,.52],span:1200};
  const wallView={direction:[.58,.47,1],span:292};
  function joinBoard(id) {
    const end=compose(lay,boardWorld[id]);
    const q=end.slice(3);
    carry(id,[id,...stockDowel[id]],at.get(id),[shift(at.get(id),up,260),[...shift(end,up,105).slice(0,3),...q],end],
      ['sideL'],down,{caption:'Seat the dowelled panel',view:layView});
  }
  function cams(boards,sign) {
    for(const id of boards) {
      const top=id==='top', axis=rotate(top?down:up,lay), y=boardWorld[id][1]+(top?T/2:-T/2);
      const points=camZ.map(z=>compose(lay,pose(sign*camX,y,z)).slice(0,3));
      const base=boardY.indexOf(boardWorld[id][1])*2;
      const receiver=[id,...studs[sign<0?0:1].slice(base,base+2)];
      const locks=fit('119081',points,axis,receiver,38,{previewBores:true});
      turn(locks,receiver,axis,'Turn the same cam locks');
    }
  }
  step('Dowel the horizontal panels and toe rail','Lay out the top, fixed shelf, bottom and narrow toe rail. Push two wood dowels into each end of all four pieces, using the holes shown in the inset.',()=>{
    for(const [id,base] of Object.entries(benches)) {
      const isRail=id==='rail', originZ=isRail?railZ:boardZ;
      place([id],[base],down,[],54,{view:{direction:[-.38,.75,.75],span:850}});
      const xs=[-1,-1,1,1], points=xs.map((sign,i)=>[base[0]+sign*inside,base[1]+(isRail?28:0),base[2]+(isRail?railPins:dowelZ)[i%2]-originZ]);
      stockDowel[id]=fit('101351',points,xs.map(sign=>[-sign,0,0]),[id],54,{previewBores:true,view:{direction:[-.65,.58,.65],span:850}});
    }
  });
  step('Prepare both grooved sides','Lay the side panels with their inside faces up. Turn six cam bolts into each side at the bottom, middle and top panel stations, keeping the back grooves clear.',()=>{
    place(side,[firstSide,secondBench],down,[],65,{view:layView});
    for(const [i,p] of [lay,compose(pose(570,0,0),sideLay(W/2,-PI/2))].entries()) {
      const sign=i===0?-1:1;
      const points=boardY.flatMap(y=>camZ.map(z=>compose(p,pose(sign*inside,y,z)).slice(0,3)));
      studs.push(fit('118331',points,down,[side[i]],63,{previewBores:true,view:layView}));
    }
  });
  step('Seat the bottom, fixed shelf and toe rail','Fit these three prepared pieces to the first side. The small holes on the narrow shelf edges face the rear groove, as in the insets.',()=>{
    for(const id of ['rail','bottom','fixed']) joinBoard(id);
  });
  step('Lock the bottom and fixed shelf','Insert and turn two cams in the bottom and two in the fixed middle shelf to capture the cam bolts.',()=>cams(['bottom','fixed'],-1));
  step('Fit and lock the top panel','Set the top onto the first side with the small holes toward the rear groove. Keep its cam openings on the outer face shown in the figure. Insert and turn the two cams.',()=>{
    joinBoard('top'); cams(['top'],-1);
  });
  step('Lower the second grooved side','Align the rear groove with the first side. Lower the whole second side and its six attached bolts over the dowels and the top, middle and bottom panels.',()=>{
    carry('sideR',['sideR',...studs[1]],secondBench,[shift(secondBench,up,370),shift(secondSide,up,120),secondSide],
      ['sideL','rail','bottom','fixed','top'],down,{view:layView});
  });
  step('Lock the second side','Fit and turn the six remaining cams at the top, fixed middle shelf and bottom. Do not add another set of bolts.',()=>cams(['bottom','fixed','top'],1));
  step('Unfold and slide the back into both grooves','With your helper turn the case so its rear faces up. Unfold the one back fully and feed it squarely from the bottom end through both grooves until the pilot rows line up.',()=>{
    const whole=[...at.keys()], lift=Math.hypot(W/2,front)+8;
    carry('sideL',whole,lay,[sideLay(lift,PI/2),sideLay(lift,0),faceDown],[],down,{caption:'Turn the carcass onto its front',view:backView});
    const end=compose(faceDown,pose(0,backY,grooveZ)), start=shift(end,Z,-H-41);
    place(['back'],[start],down,[],28,{caption:'Prepare the folding back',view:backView});
    turn(['back'],[],Z,'Unfold the same back',backView);
    carry('back',['back'],start,[end],['sideL','sideR','top','fixed','bottom'],Z,{caption:'Feed both long edges into the rear grooves',view:backView});
  });
  step('Lock the back with 18 sleeve and pin pairs','Insert the sleeves in the three rows through the back, then press the matching pins into those same sleeves.',()=>{
    for(const y of boardY) {
      const points=retainerX.map(x=>compose(faceDown,pose(x,y,grooveZ-backT/2)).slice(0,3));
      const row=boardY.indexOf(y), sleeves=fit('151706',points,down,['back',['bottom','fixed','top'][row]],65,{previewBores:true,view:backView});
      fit('151705',points,down,sleeves,45,{view:backView});
    }
  });
  step('Stand and attach the bookcase to the wall','With a helper stand the bookcase upright. Use both supplied brackets: one washer for each suitable wall fixing through its vertical slot, then one washer and supplied short screw through each horizontal slot into the top.',()=>{
    const pivot=pose(0,0,front,X,PI/2);
    carry('sideL',[...at.keys()],pivot,[pose(0,0,front)],[],up,{caption:'Stand the complete carcass with a helper',view:{direction:[.81,.56,.8],span:1370}});
    const brackets=place(ids('106989',2),wallX.map(x=>pose(x,H,wallZ)),down,['top','sideL','sideR'],54,{view:wallView});
    const wallFaces=wallX.map(x=>[x,wallHoleY,wallZ+2]);
    const wallWashers=fit('100823',wallFaces,rear,brackets,36,{view:wallView});
    fit('wall',wallFaces.map(([x,y,z])=>[x,y,z+2.15]),rear,[...brackets,...wallWashers],35,{view:wallView});
    const roofWashers=fit('100823',wallX.map(x=>[x,H+2,bracketScrewZ]),down,brackets,40,{view:wallView});
    fit('109041',wallX.map(x=>[x,H+3.6,bracketScrewZ]),down,['top',...brackets,...roofWashers],40,{previewBores:true,view:wallView});
  },safety);
  step('Press in the shelf supports','Once the bookcase is attached to the wall, fit four supports at each of the four illustrated levels. The side shank goes into the panel and the vertical peg faces up.',()=>{
    for(const y of supportRows) {
      const ends=[-1,1].flatMap(sign=>supportZ.map(z=>pose(sign*supportX,y,z,Y,sign>0?PI:0)));
      place(ids('131372',4),ends,[[-1,0,0],[-1,0,0],X,X],['sideL','sideR','wall-1','wall-2'],34,{previewBores:true});
    }
  },safety);
  step('Lower the four adjustable shelves onto the pegs','Bring each shelf into its own bay just above the supports, line up the underside holes and lower it onto all four pegs. The bookcase must remain secured to the wall.',()=>{
    for(const [i,y] of supportRows.entries()) {
      const end=pose(0,y+shelfSeatOffset+T/2,shelfZ), raised=shift(end,up,32);
      event('place',[`shelf-${i+1}`],Array.from({length:4},(_,j)=>`131372-${4*i+j+1}`),
        [[shift(raised,Z,300),raised,end]],down,{caption:'Engage the four upward pegs',view:{direction:[-.36,.26,.9],span:525}});
    }
  },safety);
  return records;
}

export const steps=author();
