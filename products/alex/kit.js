import { pages } from './manual.js';

export const stackingWarning = 'Do not stack ALEX drawer units.';
const X=[1,0,0], Y=[0,1,0], Z=[0,0,1];
const opposite = axis => axis.map(v => -v);
const LEFT=opposite(X), DOWN=opposite(Y), REAR=opposite(Z);
const signs=[-1,1], Q=Math.PI/2;

function pose(x,y,z,axis=X,angle=0) {
  const s=Math.sin(angle/2);
  return [x,y,z,axis[0]*s,axis[1]*s,axis[2]*s,Math.cos(angle/2)];
}
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
  return [...rotate([-x,-y,-z],q),...q.slice(3)];
}
const shift = (p,axis,n) => p.map((v,i) => i<3 ? v+n*axis[i] : v);
const across = (side,coords) => coords.map(v => side*v);
function fitting([x,y,z],[a,b,c]) {
  return pose(x,y,z,c ? [-c,0,a] : a ? [0,0,a] : X,Math.acos(-b));
}

const width=359, height=698.5, depth=581, board=18, floor=4;
const inside=width/2-board, sideX=inside+board/2, sideY=(height+floor)/2, sideH=height-floor-2*board;
const rearT=16, rearZ=(rearT-depth)/2;
export const cabinet = {
  depth,width,height,board,floor,inside,sideX,sideY,sideH,rearT,rearZ,
  endY:[floor+board,height-board], backCamY:[42,sideY,660.5], backDowelY:[175,526],
  capZ:[-244,0,244], endDowelZ:[-168,168],
  padPoints:signs.flatMap(s => signs.map(t => [s*151,floor,t*265])),
  plateHoles:signs.flatMap(s => signs.flatMap(t => [-6,6].flatMap(u => [-6,6].map(v => [s*146+u,t*259+v])))),
  deskHoles:signs.flatMap(s => signs.map(t => [s*28,t*178]))
};
export const drawerFit = {
  sideWidth:14, sideX:145, sideStart:5, sideZ:6, sideDepth:533, faceZ:281.5,
  panelZ:-254.5, panelT:12, panelBase:18.5, bottomY:16, grooveY:[13,19],
  rearPinYs:[34,63], railY:46, railZ:228, camZ:256.5,
  bayY:[579,478,327,176,25], extension:160
};
const f=drawerFit;
const shallow={shape:'Shallow',title:'Shallow',frontH:98,sideH:80,boltY:[52],pegY:[25]};
const deep={shape:'Deep',title:'Deep',frontH:148,sideH:130,boltY:[42,104],pegY:[]};
export const drawerSizes = { Shallow:shallow, Deep:deep };
export const drawers = f.bayY.map((bayY,i) => {
  const size=i<2 ? shallow : deep, n=i+1, prefix=`drawer-${n}`;
  return { ...size,bayY,x:i<2 ? (i*2-1)*200 : (i-3)*390,z:i<2 ? 1910 : 1200,
    front:`${prefix}-front`,left:`${prefix}-left`,right:`${prefix}-right`,bottom:`${prefix}-bottom`,back:`${prefix}-back` };
});

export const shapes = {
  caseSide:[board,sideH,depth], caseTop:[width,board,depth], caseBase:[width,board,depth], caseBack:[inside*2,sideH,rearT],
  drawerBottom:[282,5,530],
  camBolt:[8,30,8], caseCam:[15,12,15], drawerCam:[12,10,12], dowel:[6,27,6],
  knockIn:[7,28,7], retainer:[8,19,8], deskScrew:[9,25,9], pad:[15,floor,15], key:[24,5,54]
};
export const families = {}, parts = new Map();
function family(key,name,group,page,number=null,role='kit') {
  families[key]=Object.freeze({name,number,group,page,role});
}
function part(id,key,shape,unpacked) {
  parts.set(id,Object.freeze({id,family:key,shape,unpacked:Object.freeze(unpacked),packet:families[key].group}));
}
const caseSides=['cabinet-left','cabinet-right'], caps=['cabinet-bottom','cabinet-top'], back='cabinet-back';
const cabinetGroup='Cabinet panels', fittingsGroup='Fittings · p. 3', deskGroup='Desk-only fittings';
family('caseSide','Side panel with five fitted runners',cabinetGroup,5);
family('caseTop','Plain cabinet top',cabinetGroup,8);
family('caseBase','Cabinet bottom with mounting holes',cabinetGroup,8);
family('caseBack','Full cabinet back',cabinetGroup,5);
caseSides.forEach((id,i)=>part(id,'caseSide','caseSide',pose((i*2-1)*415,180,-270)));
part(caps[0],'caseBase','caseBase',pose(-445,25,-190));
part(caps[1],'caseTop','caseTop',pose(445,25,-190));
part(back,'caseBack','caseBack',pose(0,8,-310,X,-Q));
for(const d of [shallow,deep]) {
  const suffix=d.shape, group=`${d.title} drawers`, page=d===shallow ? 17 : 13;
  const sideH=d.sideH-(f.panelBase-f.sideStart)-4;
  for(const [key,name,shape] of [
    ['front','front with recessed pull',[319,d.frontH,board]], ['side','grooved side and runner',[f.sideWidth,d.sideH,f.sideDepth]],
    ['back','rear board',[276,sideH,f.panelT]], ['bottom','bottom',shapes.drawerBottom]
  ]) {
    const label=key+suffix;
    shapes[label]=shape;
    family(label,`${d.title} drawer ${name}`,group,page);
  }
}
for(const [i,d] of drawers.entries()) {
  const row=i<2 ? -940 : 450, x=i<2 ? (i*2-1)*210 : (i-3)*365;
  const s=d.shape;
  for(const [key,id,unpacked] of [
    ['front',d.front,pose(x,9,row+340,X,Q)], ['side',d.left,pose(x-119,16,row,Z,Q)],
    ['side',d.right,pose(x+119,16,row,Z,-Q)], ['back',d.back,pose(x,18,row+260,X,Q)], ['bottom',d.bottom,pose(x,2.5,row)]
  ]) part(id,key+s,key+s,unpacked);
}
for(const [row,[key,name,shape,qty,role]] of [
  ['118331','Cam bolt','camBolt',34], ['119251','Slotted cabinet cam','caseCam',18], ['101345','Wood dowel','dowel',16],
  ['10061614','Peel-and-stick floor pad','pad',4], ['103114','Cross-head drawer cam','drawerCam',16],
  ['110519','Round-head knock-in fastener','knockIn',20], ['105021','Short runner retaining screw','retainer',10],
  ['110907','Hex-drive desk-support screw','deskScrew',4], ['100001','Hex key','key',1,'tool']
].entries()) {
  family(key,name,row>=7 ? deskGroup : fittingsGroup,3,key,role);
  for(let i=0;i<qty;i++) part(`${key}-${i+1}`,key,shape,pose(-310+(i%17)*38,25,-590-row*42-Math.floor(i/17)*25));
}

const {endY,backCamY,backDowelY,capZ,endDowelZ}=cabinet;
export const steps=[];
const locations=new Map(), allocated=new Map();
let operations;
function step(number,title,action,body,warning) {
  operations=[];
  body();
  steps.push({number,page:pages[number],title,action,operations,warning});
}
function op(kind,ids,prerequisites,poses,axes,caption,view,captive) {
  const axis=axes[0], target=poses[0].at(-1).slice(0,3), receivers=[...new Set(prerequisites)];
  const bits={kind,ids,prerequisites:receivers,poses,axes,captive,
    joint:{target,axis,outward:opposite(axis),receivers,caption:caption ?? families[parts.get(ids[0]).family].name,view}};
  operations.push(bits);
  ids.forEach((id,i) => locations.set(id,poses[i].at(-1)));
  return bits;
}
function place(ids,ends,axis,receivers=[],clearance=65,caption,view) {
  const axes=Array.isArray(axis[0]) ? axis : ids.map(()=>axis);
  return op('place',ids,receivers,ends.map((p,i)=>[shift(p,axes[i],-clearance),p]),axes,caption,view);
}
function fast(key,points,axis,receivers,frame=pose(0,0,0),clearance=38) {
  const count=allocated.get(key) ?? 0, ids=points.map((_,i)=>`${key}-${count+i+1}`);
  allocated.set(key,count+ids.length);
  const axes=Array.isArray(axis[0]) ? axis : points.map(()=>axis);
  place(ids,points.map((p,i)=>compose(frame,fitting(p,axes[i]))),axes.map(a=>rotate(a,frame)),receivers,clearance);
  return ids;
}
function lock(ids,receivers,axis) {
  const ends=ids.map(id=>locations.get(id));
  const axes=Array.isArray(axis[0]) ? axis : ids.map(()=>axis);
  op('adjust',ids,receivers,ends.map(p=>[p,p]),axes,'Turn the cams to lock the joints',undefined,{from:0,to:1});
}
function move(ids,waypoints,axis,receivers=[],caption,view) {
  const anchor=ids[0], start=locations.get(anchor), from=inverse(start);
  const offsets=ids.map((id,i)=>i ? compose(from,locations.get(id)) : pose(0,0,0)), frames=[start,...waypoints];
  const paths=ids.map((id,i)=>i ? [locations.get(id),...waypoints.map(frame=>compose(frame,offsets[i]))] : frames);
  const event=op('move',ids,receivers,paths,ids.map(()=>axis),caption,view);
  event.rigid={anchor,frames,offsets};
}
const wide={direction:[-.5,.63,.78],span:750};
const sideAt=i=>pose(signs[i]*sideX,sideY,0);
const endAt=i=>pose(0,endY[i]+signs[i]*board/2,0);
const backAt=pose(0,sideY,rearZ);
const caseFrame=(angle,centerZ)=>compose(pose(0,0,centerZ,X,angle),pose(0,-floor,depth/2));
const onBack=caseFrame(-Q,sideH/2+board), flatBack=p=>compose(onBack,p);
const sidePrep=signs.map(s=>pose(s*555,board/2,0,Z,-s*Q));
const capPrep=[pose(-550,board/2,15),pose(550,board/2,15,X,Math.PI)];
const sideMembers=caseSides.map(id=>[id]), capMembers=caps.map(id=>[id]), backMembers=[back], caseCams=[];
const cabinetMembers=()=>[...sideMembers.flat(),...capMembers.flat(),...backMembers,...caseCams];

step(1,'Prepare the cabinet sides','Lay both side panels runner-side up on protection. Seat three 118331 cam bolts along the rear joint edge of each panel; do not overdrive the collars.',()=>{
  place(caseSides,sidePrep,DOWN,[],50,'Side panels, runners up',wide);
  signs.forEach((s,i)=>sideMembers[i].push(...fast('118331',backCamY.map(y=>[-s*board/2,y-sideY,rearZ]),across(s,X),[caseSides[i]],sidePrep[i])));
});
step(2,'Fit the cabinet dowels','Press two 101345 dowels into each side-panel end and two into each long edge of the back, 12 in total.',()=>{
  place([back],[flatBack(backAt)],DOWN);
  signs.forEach((s,i)=>{
    const points=signs.flatMap((_,j)=>endDowelZ.map(z=>[0,endY[j]-sideY,z]));
    const axes=signs.flatMap(t=>endDowelZ.map(()=>across(-t,Y)));
    sideMembers[i].push(...fast('101345',points,axes,[caseSides[i]],sidePrep[i],28));
  });
  backMembers.push(...fast('101345',signs.flatMap(s=>backDowelY.map(y=>[s*inside,y-sideY,0])),[X,X,LEFT,LEFT],[back],flatBack(backAt),28));
});
step(3,'Join the sides to the back','Turn the side panels inwards. Bring each rear joint straight onto the back-panel dowels with the runners facing into the cabinet.',()=>{
  signs.forEach((s,i)=>{
    const end=flatBack(sideAt(i)), approach=shift(end,X,s*81);
    move(sideMembers[i],[shift(approach,Y,80),approach,end],across(-s,X),backMembers,'Lower and engage the rear joint',wide);
  });
});
step(4,'Lock the rear joints','Use six slotted 119251 cabinet cams in the back. Turn them after insertion to lock the rear joints; do not use the cross-head drawer cams.',()=>{
  const ids=fast('119251',signs.flatMap(s=>backCamY.map(y=>[s*(inside-16),y,rearZ+rearT/2])),REAR,[back,...caseSides],onBack);
  lock(ids,[back,...caseSides],DOWN); caseCams.push(...ids);
});
step(5,'Prepare the top and bottom','Drive six 118331 cam bolts into the inside face of each end board. Set the drilled board aside for the cabinet bottom.',()=>{
  place(caps,capPrep,DOWN,[],64,'Plain top and drilled bottom',wide);
  caps.forEach((id,i)=>{
    const dir=across(signs[i],Y);
    capMembers[i].push(...fast('118331',signs.flatMap(s=>capZ.map(z=>[s*sideX,-signs[i]*board/2,z])),dir,[id],capPrep[i]));
  });
});
step(6,'Fit the standalone end boards','Follow the left-hand figure. Keep the plain board at the top and the mounting holes on the outside of the lower board. Slide the boards onto the four end-dowel pairs.',()=>{
  caps.forEach((_,i)=>{
    const end=flatBack(endAt(i)), out=across(-signs[i],Z), approach=shift(end,out,100);
    move(capMembers[i],[shift(approach,Y,90),approach,end],opposite(out),caseSides,'Engage the dowels with the mounting holes down at the base',wide);
  });
});
step(7,'Lock the top and bottom','Seat the 12 remaining 119251 cabinet cams from inside the cabinet, then turn them to lock the two end boards.',()=>{
  signs.forEach((s,i)=>{
    const dir=across(s,X);
    const ids=fast('119251',signs.flatMap((t,j)=>capZ.map(z=>[s*inside,endY[j]-t*16,z])),dir,[caseSides[i],...caps],onBack);
    lock(ids,[caseSides[i],...caps],dir); caseCams.push(...ids);
  });
});
step(8,'Apply the four pads and stand the cabinet','Peel and stick the four pads at the corners of the bottom exterior. Then turn the entire cabinet upright onto its pads. The placement guide on p. 23 uses these same four pads.',()=>{
  const pads=fast('10061614',cabinet.padPoints,Y,[caps[0]],onBack,38);
  const turns=[-Q*2/3,-Q/3,0].map(angle=>{
    const f=caseFrame(angle,-depth/2*Math.cos(angle)+(sideH/2+board)*-Math.sin(angle));
    f[1]+=floor*Math.cos(angle);
    return compose(f,sideAt(0));
  });
  move([...cabinetMembers(),...pads],turns,Y,[],'Turn the cabinet onto the four pads',wide);
});

const sideIds=d=>[d.left,d.right];
const drawerFrame=(d,angle)=>pose(d.x,depth/2*Math.sin(angle),d.z,X,angle);
const bench=d=>drawerFrame(d,Q);
const frontAt=d=>pose(0,d.frontH/2,f.faceZ);
const drawerSide=(d,i)=>pose(signs[i]*f.sideX,f.sideStart+d.sideH/2,f.sideZ);
const looseSide=(d,i)=>pose(d.x+signs[i]*92,f.sideWidth/2,d.z+420,Z,-signs[i]*Q);
const drawerBack=d=>pose(0,(d.sideH+f.sideStart-4+f.panelBase)/2,f.panelZ);
const drawerBottom=pose(0,f.bottomY,11.5);
const body=new Map(drawers.map(d=>[d.front,[]]));
const sidePeg=new Map();
const deepDrawers=drawers.slice(2), shallowDrawers=drawers.slice(0,2);
const viewBench={direction:[-.52,.65,.78],span:470};
function fronts(list) {
  for(const d of list) {
    const frame=bench(d);
    place([d.front],[compose(frame,frontAt(d))],DOWN);
    body.get(d.front).push(...fast('118331',signs.flatMap(s=>d.boltY.map(y=>[s*f.sideX,y,depth/2-board])),Z,[d.front],frame));
  }
}
function sides(list) {
  for(const d of list) {
    const ids=sideIds(d), frame=bench(d);
    const ends=signs.map((_,i)=>compose(frame,drawerSide(d,i)));
    if(!d.pegY.length) {
      place(ids,ends,DOWN,[d.front,...body.get(d.front)],95,undefined,viewBench);
    } else ids.forEach((id,i)=>move([id,sidePeg.get(id)],[shift(ends[i],Y,100),ends[i]],DOWN,[d.front,...body.get(d.front)],'Seat the side and its dowel',viewBench));
  }
}
function drawerCams(list) {
  for(const d of list) {
    const axes=signs.flatMap(s=>d.boltY.map(()=>across(-s,X)));
    const points=signs.flatMap(s=>d.boltY.map(y=>[s*(f.sideX+f.sideWidth/2),y,f.camZ]));
    const ids=fast('103114',points,axes,[...sideIds(d),d.front],bench(d),31);
    lock(ids,sideIds(d),axes); body.get(d.front).push(...ids);
  }
}
function bottoms(list) {
  for(const d of list) place([d.bottom],[compose(bench(d),drawerBottom)],DOWN,[...sideIds(d),d.front],535,'Feed the bottom through both grooves',viewBench);
}
function backs(list) {
  for(const d of list) place([d.back],[compose(bench(d),drawerBack(d))],DOWN,[...sideIds(d),d.bottom],90,'Seat the back at the profiled side ends',viewBench);
}
function finishBoxes(list) {
  for(const d of list) {
    const ids=fast('110519',signs.flatMap(s=>f.rearPinYs.map(y=>[s*(f.sideX+f.sideWidth/2),y,f.panelZ])),[X,X,LEFT,LEFT],[...sideIds(d),d.back],bench(d));
    const attached=body.get(d.front);
    attached.push(...ids,...sideIds(d).flatMap(id=>sidePeg.has(id)?[sidePeg.get(id)]:[]));
    const turns=[Q*2/3,Q/3,0].map(a=>compose(drawerFrame(d,a),frontAt(d)));
    move([d.front,...sideIds(d),d.bottom,d.back,...attached],turns,Y,[],'Turn the complete drawer upright',viewBench);
  }
}

step(9,'Prepare the three deep fronts','Lay the three deep fronts face down. Fit four 118331 bolts per front.',()=>fronts(deepDrawers));
step(10,'Drop the deep sides onto the fronts','Lower each handed side pair onto its front bolts, keeping the bottom grooves opposed.',()=>sides(deepDrawers));
step(11,'Lock the deep front joints','Fit and turn two 103114 drawer cams on each side: four per drawer, 12 total.',()=>drawerCams(deepDrawers));
step(12,'Slide in the deep bottoms','Feed each bottom down both side grooves until it seats in the groove in the front.',()=>bottoms(deepDrawers));
step(13,'Fit the deep drawer backs','Seat each rear board across the profiled ends above the drawer bottom. Align both sides before fixing.',()=>backs(deepDrawers));
step(14,'Pin and turn the deep drawers','Use a hammer to drive two 110519 knock-in fasteners through each side into the back. Turn all three drawers upright.',()=>finishBoxes(deepDrawers));
step(15,'Dowel the shallow sides','Push one 101345 dowel into the front end of each shallow side, four in total.',()=>{
  shallowDrawers.forEach(d=>{
    const ids=sideIds(d), prep=signs.map((_,i)=>looseSide(d,i));
    place(ids,prep,DOWN);
    ids.forEach((id,i)=>{
      const [peg]=fast('101345',[[0,d.pegY[0]-f.sideStart-d.sideH/2,f.sideDepth/2]],REAR,[id],prep[i],30);
      sidePeg.set(id,peg);
    });
  });
});
step(16,'Prepare the two shallow fronts','Lay both shallow fronts face down and fit one 118331 bolt at each end.',()=>fronts(shallowDrawers));
step(17,'Drop the shallow sides onto the fronts','Lower each side and its fitted dowel onto the matching front with the grooves facing each other.',()=>sides(shallowDrawers));
step(18,'Lock the shallow front joints','Fit and turn one 103114 cam per side: two per drawer, four across both shallow drawers.',()=>drawerCams(shallowDrawers));
step(19,'Slide in the shallow bottoms','Feed both bottoms down the matching side grooves until seated at the fronts.',()=>bottoms(shallowDrawers));
step(20,'Fit the shallow drawer backs','Seat each rear board into the profiled side ends and onto the bottom, as in the inset.',()=>backs(shallowDrawers));
step(21,'Pin and turn the shallow drawers','Hammer two 110519 fasteners at each side of the two shallow backs. Turn the drawers upright. For this standalone unit, skip desk-only figure 22.',()=>finishBoxes(shallowDrawers));
step(23,'Engage and secure all five drawers','Put both shallow drawers in the top two bays and the deep drawers in the lower three. Engage both runners squarely, push in and pull partway back out. Use two short 105021 screws per drawer, one per side, then close each drawer.',()=>{
  for(const d of drawers) {
    const ids=[d.front,...sideIds(d),d.back,d.bottom,...body.get(d.front)];
    const trial=(y,z,x=0)=>compose(pose(x,y,z),frontAt(d));
    const lift=d.bayY+205, parked=590;
    move(ids,[trial(lift,d.z,d.x),trial(lift,parked,d.x),trial(lift,parked),trial(d.bayY,parked)],DOWN,[],'Align this drawer with its two runner channels',wide);
    move(ids,[trial(d.bayY,220),trial(d.bayY,0),trial(d.bayY,f.extension)],REAR,caseSides,'Engage the runners; draw the drawer partway out');
    const screws=fast('105021',signs.map(s=>[s*(f.sideX-f.sideWidth/2),d.bayY+f.railY,f.railZ+f.extension]),[LEFT,X],sideIds(d),pose(0,0,0),25);
    move([...ids,...screws],[trial(d.bayY,0)],REAR,caseSides,'Close the secured drawer');
  }
},{text:stackingWarning,page:4});
