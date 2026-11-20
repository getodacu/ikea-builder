import { pages } from './manual.js';

export const shapes = {
  frontStile:[34,1248,36], side:[18,1164,233], trim:[15,28,233], rearStile:[26,1164,23],
  frontCross:[794,34,22], rearCross:[802,105,18], top:[890,22,300],
  liner:[760,320,242], cheek:[32,426,252], partition:[760,302,17], binFront:[790,448,19],
  drawerFront:[790,107,19], drawerSide:[14,84,249], drawerBase:[747,5,236], drawerRear:[738,79,14],
  runner:[18,24,248], topScrew:[13,55,13], nail:[9,34,9], stud:[8,32,8], dowel:[8,30,8],
  sideScrew:[9,35,9], knobScrew:[9,30,9], binScrew:[9,16,9], mountScrew:[8,13,8],
  stop:[15,42,34], glide:[23,20,23], smallCam:[13,10,13], largeCam:[16,11,16], pivot:[51,12,25],
  knob:[27,24,27], smallKey:[39,6,84], largeKey:[46,8,98], railScrew:[9,11,9], wallSymbol:[17,28,17]
};
export const families = {};
export const parts = new Map();
const I=[0,0,0,1], X=[1,0,0], Y=[0,1,0], Z=[0,0,1];
const {PI}=Math;
const pos=p=>p.slice(0,3), rot=p=>p.slice(3), pose=(p,q=I)=>[...p,...q];
const add=(a,b)=>a.map((v,i)=>v+b[i]), scale=(a,s)=>a.map(v=>v*s);
const cross=([x,y,z],[a,b,c])=>[y*c-z*b,z*a-x*c,x*b-y*a];
const turn=(axis,a)=>[...scale(axis,Math.sin(a/2)),Math.cos(a/2)];
function rotate(v,q) {
  const t=scale(cross(q,v),2);
  return add(v,add(scale(t,q[3]),cross(q,t)));
}
function mul(a,b) {
  return [...add(add(scale(pos(a),b[3]),scale(pos(b),a[3])),cross(a,b)),a[3]*b[3]-a[0]*b[0]-a[1]*b[1]-a[2]*b[2]];
}
const transform=(a,b)=>pose(add(pos(a),rotate(pos(b),rot(a))),mul(rot(a),rot(b)));
function inverse(p) {
  const q=[...scale(rot(p).slice(0,3),-1),p[6]];
  return pose(rotate(scale(pos(p),-1),q),q);
}
const unit=a=>scale(a,1/Math.hypot(...a));
const translate=(f,v)=>pose(add(pos(f),v),rot(f));
function facing(into) {
  const out=scale(into,-1);
  return out[1]<-0.999 ? turn(X,PI) : unit([...cross(Y,out),1+out[1]]);
}
const down=[0,-1,0], inward=[0,0,-1], upright=pose([0,0,0]);
const sideSigns=[-1,1], bays=['lower','upper'];
const suffix=i=>i===0?'L':'R';
export const pivotZ=112, pivotYs=[147,635], stopOffset=[0,245,-55];
export const tipAngle=32*PI/180;
export const safety={text:'Serious or fatal crushing injuries can occur from furniture tip-over. Use the provided wall attachment. Wall screws and plugs are not supplied; use ones suitable for your wall. If uncertain, seek professional advice. Read and follow every step of the official instructions.',page:2};
const caseGroup='Cabinet pieces', binGroup='Tilt-out pieces', drawerGroup='Drawer pieces', hardware='Cabinet fittings', runners='Runner packet', external='Required, not supplied';
function stock(key,name,shape,group,page,entries,number=null,role='kit') {
  families[key]={name,number,group,page,role};
  for(const [id,x,z,q=I] of entries) {
    const normal=rotate(Y,[...scale(pos(q),-1),q[3]]);
    const y=shapes[shape].reduce((h,size,i)=>h+size*Math.abs(normal[i])/2,0);
    parts.set(id,{id,family:key,shape,packet:group,unpacked:pose([x,y,z],q)});
  }
}
const flat=turn(X,PI/2), postFlat=turn(Z,PI/2);
stock('frontStile','Front stile and foot','frontStile',caseGroup,7,[['frontStileL',-1250,-820,postFlat],['frontStileR',-1250,-776,postFlat]]);
stock('side','Side panel','side',caseGroup,7,[['sideL',-1250,-500,postFlat],['sideR',-1250,-242,postFlat]]);
stock('trim','Short side trim','trim',caseGroup,8,['trimLowL','trimHighL','trimLowR','trimHighR'].map((id,i)=>[id,-1800+i*65,25]));
stock('rearStile','Rear side stile','rearStile',caseGroup,8,[['rearStileL',-1250,-714,postFlat],['rearStileR',-1250,-678,postFlat]]);
stock('frontCross','Slender front cross rail','frontCross',caseGroup,11,['railTop','railLow','railMid','railDrawer'].map((id,i)=>[id,-140,-820+47*i]));
stock('rearCross','Wide rear stretcher','rearCross',caseGroup,12,[['wallBrace',-140,-555,flat],['lowerBrace',-140,-435,flat]]);
stock('top','Cabinet top','top',caseGroup,14,[['top',-140,-202]]);
stock('liner','Perforated L-shaped liner','liner',binGroup,18,bays.map((b,i)=>[`${b}Liner`,775,735+i*275]));
stock('cheek','Handed bin cheek with captive pivot','cheek',binGroup,18,bays.flatMap((b,i)=>sideSigns.map((_,j)=>[`${b}Cheek${suffix(j)}`,1465+470*i,95+301*j,postFlat])));
stock('partition','Perforated clip-in divider','partition',binGroup,19,bays.map((b,i)=>[`${b}Partition`,775,109+i*324,flat]));
stock('binFront','Wide compartment front','binFront',binGroup,20,bays.map((b,i)=>[`${b}Front`,775,-773+i*466,flat]));
stock('drawerFront','Top drawer front','drawerFront',drawerGroup,22,[['drawerFront',1660,-790,flat]]);
stock('drawerSide','Grooved drawer side','drawerSide',drawerGroup,22,[['drawerSideL',1430,-195,postFlat],['drawerSideR',1605,-195,postFlat]]);
stock('drawerBase','Thin drawer base','drawerBase',drawerGroup,22,[['drawerBase',1660,-477]]);
stock('drawerRear','Drawer back','drawerRear',drawerGroup,23,[['drawerRear',1660,-657,flat]]);
stock('115917','Handed roller guide member','runner',runners,6,
  ['caseRunnerL','caseRunnerR','drawerRunnerL','drawerRunnerR'].map((id,i)=>[id,1460+i*63,820]),'115917');
for(const [i,[number,name,shape,count,role='kit',group=hardware]] of [
  ['100223','Top fixing screw','topScrew',2],['110519','Hammer-in drawer fastener','nail',4],['118331','Cam stud','stud',22],
  ['101350','Wood dowel','dowel',24],['100295','Side frame screw','sideScrew',14],['100414','Knob machine screw','knobScrew',6],
  ['151930','Bin front screw','binScrew',12],['100347','Pivot and stop screw','mountScrew',12],['116713','Upper bin stop pin','stop',4],
  ['107271','Front foot glide','glide',2],['106720','Small cam lock','smallCam',8],['102533','Large cam lock','largeCam',14],
  ['110364','Lower bin pivot receiver','pivot',4],['117615','Knob','knob',6],['100006','Small hex key','smallKey',1,'tool'],
  ['100092','Large hex key','largeKey',1,'tool'],['108462','Short roller guide screw','railScrew',8,'kit',runners],
  ['wall','Wall attachment point (fixing not supplied)','wallSymbol',2,'external',external]
].entries()) {
  const entries=Array.from({length:count},(_,j)=>{
    const id=`${number}-${j+1}`;
    if(role==='external') return [id,1940+j*55,835];
    if(group===runners) return [id,1450+j*40,1000];
    return [id,-1730+(i%4)*405+(j%8)*44,375+Math.floor(i/4)*185+Math.floor(j/8)*40];
  });
  stock(number,name,shape,group,role==='external'?17:6,entries,role==='external'?null:number,role);
}

const at=new Map(), used={}, all=[];
let operations;
function step(title,action,make,warning) {
  operations=[]; make();
  all.push({number:all.length+1,page:pages[all.length],title,action,warning,operations});
}
function op(kind,ids,prerequisites,paths,axes,options={}) {
  const {target=pos(paths[0].at(-1)),caption=families[parts.get(ids[0]).family].name,view,...extra}=options;
  const axis=axes[0];
  operations.push({kind,ids,prerequisites,poses:paths,axes,joint:{target,axis,outward:scale(axis,-1),receivers:prerequisites,caption,view},...extra});
  ids.forEach((id,i)=>at.set(id,paths[i].at(-1)));
  return ids;
}
function place(id,f,p,axis=down,needs=[],distance=80) {
  const into=rotate(axis,rot(f)), end=transform(f,p);
  return op('place',[id],needs,[[translate(end,scale(into,-distance)),end]],[into]);
}
function fit(key,f,points,axis,needs=[],distance=42,options={}) {
  const ids=points.map(()=>`${key}-${used[key]=(used[key]??0)+1}`), into=rotate(axis,rot(f));
  const paths=points.map(p=>{
    const end=transform(f,pose(p,facing(axis)));
    return [translate(end,scale(into,-distance)),end];
  });
  return op('place',ids,needs,paths,ids.map(()=>into),options);
}
function cams(key,f,points,axis,needs) {
  const ids=fit(key,f,points,axis,needs);
  const paths=ids.map(id=>{
    const p=at.get(id);
    return [p,pose(pos(p),mul(rot(p),turn(Y,PI/2)))];
  });
  return op('adjust',ids,needs,paths,ids.map(()=>rotate(axis,rot(f))),{captive:{from:0,to:1},caption:'Turn the cams to lock'});
}
function reframe(ids,from,to,needs,axis,caption,options={}) {
  const inv=inverse(from), offsets=ids.map(id=>transform(inv,at.get(id)));
  return op('move',[...ids],needs,ids.map((id,i)=>[at.get(id),...to.map(f=>transform(f,offsets[i]))]),ids.map(()=>axis),
    {rigid:{anchor:ids[0],frames:[from,...to],offsets},caption,...options});
}

const sideMembers=[[],[]], crossMembers=[], lidMembers=[];
const atSide=(s,cx,q)=>pose(add([cx,22,0],scale(rotate([s*414,624,0],q),-1)),q);
const inner=sideSigns.map((s,i)=>atSide(s,i*1320,turn(Z,-s*PI/2)));
const outer=sideSigns.map((s,i)=>atSide(s,i*1320,turn(Z,s*PI/2)));
const back=pose([0,151,624],turn(X,-PI/2));
const boxIds=()=>[...sideMembers.flat(),...crossMembers,...lidMembers];
const crossRails=[['railTop',1231,128],['railLow',101,128],['railMid',588,128],['railDrawer',1076,128]];
const braces=[['lowerBrace',521,-137],['wallBrace',1008,-137]];
const crossSpec=[...crossRails,...braces];
const postStudYs=[365,907];
const fasteningFace=(s,x)=>[s*x,0,0];
const sideId=(name,i)=>`${name}${suffix(i)}`;
const sideCamPoint=(s,y,z,x)=>[s*x,y,z];
const legId=i=>sideId('frontStile',i), panelId=i=>sideId('side',i);
const pivotIds=[], stopIds=[], cabinetRunners=[];
step('Prepare the front stiles','Lay out the long front stiles. Fit two 118331 cam studs in the panel edge of each stile.',()=>{
  sideSigns.forEach((s,i)=>{
    const id=legId(i), f=outer[i];
    sideMembers[i].push(...place(id,f,pose([s*414,624,123])),
      ...fit('118331',f,postStudYs.map(y=>[s*414,y,104]),Z,[id]));
  });
});
step('Join the side panels','Add two dowels to each stile and seat the corresponding side panel against it.',()=>{
  sideSigns.forEach((s,i)=>{
    const f=outer[i], id=legId(i), group=sideMembers[i];
    const dowels=fit('101350',f,[218,1130].map(y=>[s*414,y,104]),Z,[id]);
    group.push(...dowels,...place(panelId(i),f,pose([s*411,666,-11.5]),Z,[...group,...dowels]));
  });
});
step('Lock the side panels','Insert and turn four large 102533 cams. Do not use the smaller 106720 cams here.',()=>{
  sideSigns.forEach((s,i)=>sideMembers[i].push(...cams('102533',outer[i],postStudYs.map(y=>sideCamPoint(s,y,83,420)),fasteningFace(s,-1),[panelId(i),legId(i)])));
});
step('Fit the four short side trims','Fit the top and bottom outer trim to both side panels. Use eight 100295 screws and the 100006 hex key, not 100092.',()=>{
  sideSigns.forEach((s,i)=>[102,1230].forEach((y,j)=>{
    const id=sideId(j?'trimHigh':'trimLow',i), f=outer[i], axis=fasteningFace(s,-1);
    sideMembers[i].push(...place(id,f,pose([s*427.5,y,-11.5]),axis,[panelId(i)]),
      ...fit('100295',f,[-86,66].map(z=>[s*401,y,z]),scale(axis,-1),[panelId(i),id]));
  }));
});
step('Fit the rear stiles','Use the same hex key and six more 100295 screws. The rear stiles end above the feet.',()=>{
  sideSigns.forEach((s,i)=>{
    const id=sideId('rearStile',i), f=outer[i];
    sideMembers[i].push(...place(id,f,pose([s*414,666,-136.5]),Z,[panelId(i)]),
      ...fit('100295',f,[170,655,1157].map(y=>[s*401,y,-119]),fasteningFace(s,1),[panelId(i),id]));
  });
});
step('Turn the sides and fit the pivot receivers','Turn both sides inner-face up. Secure four 110364 lower pivot receivers with two 100347 screws each. Do not use the runner packet screws.',()=>{
  sideSigns.forEach((s,i)=>reframe(sideMembers[i],outer[i],[translate(inner[i],[0,195,0]),inner[i]],[],down,'Turn the whole side inner-face up'));
  sideSigns.forEach((s,i)=>pivotYs.forEach(y=>{
    const f=inner[i], axis=fasteningFace(s,1);
    const ids=fit('110364',f,[[s*391,y,pivotZ]],axis,[legId(i)]);
    pivotIds.push(...ids);
    sideMembers[i].push(...ids,...fit('100347',f,[-17,17].map(d=>[s*384.7,y+d,pivotZ]),axis,[...ids,legId(i)]));
  }));
});
step('Fit the upper stop pins','Fit four 116713 upper pins above the pivot receivers. Use four 100347 screws; keep the 108462 runner packet separate.',()=>{
  sideSigns.forEach((s,i)=>pivotYs.forEach(y=>{
    const f=inner[i], axis=fasteningFace(s,1), [,dy,dz]=stopOffset;
    const ids=fit('116713',f,[[s*397,y+dy,pivotZ+dz]],axis,[panelId(i)]);
    stopIds.push(...ids);
    sideMembers[i].push(...ids,...fit('100347',f,[[s*393,y+dy,pivotZ+dz+12]],axis,[...ids,panelId(i)]));
  }));
});
step('Install the cabinet runner pair','At the drawer opening, put the handed cabinet runners on the two sides with their wheels toward the front. Use four 108462 screws.',()=>{
  sideSigns.forEach((s,i)=>{
    const id=sideId('caseRunner',i), f=inner[i], axis=fasteningFace(s,1);
    cabinetRunners.push(id);
    sideMembers[i].push(...place(id,f,pose([s*395,1117,-11]),axis,[panelId(i)]),
      ...fit('108462',f,[-111,94].map(z=>[s*388,1117,z]),axis,[id,panelId(i)]));
  });
});
step('Fit the cross-member studs','Fit six 118331 studs on each side at the shown cross-member joints.',()=>{
  sideSigns.forEach((s,i)=>{
    const f=inner[i];
    crossSpec.forEach(([id,y,z])=>{
      const rear=id.endsWith('Brace'), receiver=rear?sideId('rearStile',i):legId(i);
      sideMembers[i].push(...fit('118331',f,[[s*(rear?401:397),y+(rear?20:0),z]],fasteningFace(s,1),[receiver]));
    });
  });
});
function member([id,y,z],n) {
  const rear=id.endsWith('Brace'), side=rear?401:397;
  const points=rear?[-28,0].map(d=>[-side,y+d,z]):[[-side,y+9,z-4]];
  const receiver=rear?'rearStileL':'frontStileL';
  const dowels=fit('101350',inner[0],points.slice(0,n),[-1,0,0],[receiver]);
  crossMembers.push(...dowels,...place(id,inner[0],pose([0,y,z]),[-1,0,0],[receiver,...dowels],125));
}
step('Start the upper cross rail','Check the end bores in the inset. Add one dowel and seat the upper slender rail on the prepared side.',()=>member(crossRails[0],1));
const railCam=([,y,z],s)=>[s*372,y-17,z];
const braceCam=([,y,z],s)=>[s*374,y+20,z+9];
step('Lock the upper cross rail','Insert and turn one large 102533 cam. Do not substitute the small cam.',()=>{
  crossMembers.push(...cams('102533',inner[0],[railCam(crossRails[0],-1)],Y,['railTop']));
});
step('Fit the remaining cross members','Seat the three slender front rails and both wide rear stretchers with seven dowels. Match the slender rail bore orientation in the uncrossed inset.',()=>{
  crossRails.slice(1).forEach(r=>member(r,1)); braces.forEach(r=>member(r,2));
});
step('Lock the cross members at the first side','Turn three large 102533 cams in the slender rails and two small 106720 cams in the wide stretchers.',()=>{
  for(const r of crossRails.slice(1)) crossMembers.push(...cams('102533',inner[0],[railCam(r,-1)],Y,[r[0]]));
  for(const r of braces) crossMembers.push(...cams('106720',inner[0],[braceCam(r,-1)],inward,[r[0]]));
});
step('Close the opposite side','Add eight dowels to the free ends, then lower the whole prepared side onto all six cross members.',()=>{
  for(const [id,y,z] of crossSpec) {
    const rear=id.endsWith('Brace'), x=rear?401:397;
    const points=rear?[-28,0].map(d=>[x,y+d,z]):[[x,y+9,z-4]];
    crossMembers.push(...fit('101350',inner[0],points,[-1,0,0],[id]));
  }
  reframe(sideMembers[1],inner[1],[translate(inner[0],[300,140,0]),translate(inner[0],[0,140,0]),inner[0]],
    crossSpec.map(r=>r[0]),down,'Lower the complete right side');
});
step('Lock the opposite side','Turn four large 102533 cams in the slender rails and two small 106720 cams in the wider stretchers.',()=>{
  for(const r of crossRails) crossMembers.push(...cams('102533',inner[0],[railCam(r,1)],Y,[r[0]]));
  for(const r of braces) crossMembers.push(...cams('106720',inner[0],[braceCam(r,1)],inward,[r[0]]));
});
const lid=pose([0,1259,0]);
const lidBench=pose([0,11,-930],turn(X,PI));
const lidStage=transform(lidBench,inverse(lid));
step('Lay the frame back and prepare its top','Turn the connected cabinet onto its back. Lay the top upside down and install two 118331 studs on its underside.',()=>{
  reframe(boxIds(),inner[0],[translate(back,[0,345,0]),back],[],down,'Turn the case onto its back');
  lidMembers.push(...place('top',lidStage,lid,Y),...fit('118331',lidStage,sideSigns.map(s=>[s*411,1248,-43]),Y,['top']));
});
step('Seat the top panel','Add four dowels at the top of the case and fit the prepared top panel while keeping both studs attached.',()=>{
  const dowels=fit('101350',back,sideSigns.flatMap(s=>[-137,122].map(z=>[s*414,1248,z])),down,[...['frontStile','rearStile'].flatMap(n=>sideSigns.map((_,i)=>sideId(n,i)))]);
  crossMembers.push(...dowels);
  reframe(lidMembers,lidStage,[translate(back,[0,55,-145]),translate(back,[0,0,-145]),back],dowels,Z,'Seat the original top and both studs');
});
step('Lock the top panel','Turn the two large 102533 cams in the side panels to capture the top studs. Do not substitute 106720.',()=>{
  sideSigns.forEach((s,i)=>sideMembers[i].push(...cams('102533',back,[[s*402,1222,-43]],fasteningFace(s,1),[panelId(i),'top'])));
});
step('Fix the top from below','Install the two long 100223 screws from below. Use 100092, not the smaller 100006 key.',()=>{
  lidMembers.push(...fit('100223',back,[-290,290].map(x=>[x,1214,128]),Y,['railTop','top']));
});
step('Tap in the front glides','Use a hammer to tap a 107271 glide into each front foot. There are no rear glides.',()=>{
  sideSigns.forEach((s,i)=>sideMembers[i].push(...fit('107271',back,[[s*414,2,123]],Y,[legId(i)])));
});
step('Anchor the cabinet to the wall','Stand the cabinet upright against the wall. Secure it at both holes in the upper rear stretcher before fitting the bins. Follow the head-shape inset; the countersunk profile is crossed out.',()=>{
  reframe(boxIds(),back,[translate(back,[0,270,0]),translate(upright,[0,200,0]),upright],[],Y,'Stand upright at the wall');
  fit('wall',upright,[-270,270].map(x=>[x,1008,-127]),inward,['wallBrace'],95,
    {target:[0,1008,-128],caption:'Two required wall attachment points',view:{direction:[-.25,.15,1],span:610}});
},safety);

const binMembers=[[],[]];
const cheek=(b,i)=>`${b}Cheek${suffix(i)}`;
const liner=b=>`${b}Liner`, partition=b=>`${b}Partition`, front=b=>`${b}Front`;
const benchBins=(i,q,y)=>pose([1110,y,270+520*i],q);
const binOnEnd=(i,s)=>benchBins(i,turn(Z,s*PI/2),387);
const binUpright=i=>benchBins(i,I,29);
const binFaceDown=i=>benchBins(i,turn(X,PI/2),30);
const binInstalled=(i,a=0)=>pose([0,pivotYs[i],pivotZ],turn(X,a));
const cheekAt=s=>pose([s*381,191,-113]);
step('Clip the first cheek to each bin liner','Stand each L-shaped liner on end, not the straight divider. Align the end tabs as shown and press the first moulded cheek until it clicks.',()=>{
  bays.forEach((b,i)=>{
    const f=binOnEnd(i,1), axis=[-1,0,0];
    binMembers[i].push(...place(liner(b),f,pose([0,125,-111]),axis),...place(cheek(b,1),f,cheekAt(1),axis,[liner(b)]));
  });
});
step('Turn each bin and clip the second cheek','Turn each L-shaped liner and attached cheek together. Seat its opposite handed cheek.',()=>{
  bays.forEach((b,i)=>{
    const a=binOnEnd(i,1), f=binOnEnd(i,-1), g=binMembers[i];
    reframe(g,a,[translate(benchBins(i,I,465),[0,32,0]),f],[],down,'Turn the liner and attached cheek');
    g.push(...place(cheek(b,0),f,cheekAt(-1),X,[liner(b),cheek(b,1)]));
  });
});
step('Guide in the perforated dividers','Turn each bin upright. Slide one divider into both cheek guides with the smooth cutout face as pictured; do not reverse it.',()=>{
  bays.forEach((b,i)=>{
    const a=binOnEnd(i,-1), f=binUpright(i), g=binMembers[i];
    reframe(g,a,[translate(f,[0,170,0]),f],[],down,'Set the lined bin upright');
    g.push(...place(partition(b),f,pose([0,151,-114]),down,[cheek(b,0),cheek(b,1)],165));
  });
});
step('Click the three lower divider tabs','Support each liner and press the same divider until its three integral tabs click into their sockets.',()=>{
  bays.forEach((b,i)=>{
    const id=partition(b), p=at.get(id);
    op('adjust',[id],[liner(b),cheek(b,0),cheek(b,1)],[[p,translate(p,[0,-8,0])]], [down],
      {captive:{from:0,to:1},target:pos(transform(binUpright(i),pose([0,-12,-114]))),caption:'Snap the three integral tabs in'});
  });
});
step('Seat each liner on a bin front','Lay the two finished door panels face down. Turn each bin liner assembly and lower it onto the back of its door.',()=>{
  bays.forEach((b,i)=>{
    const a=binUpright(i), f=binFaceDown(i), g=binMembers[i];
    const id=front(b), cover=place(id,f,pose([0,197,21]),inward,[],65);
    reframe(g,a,[translate(f,[0,340,0]),translate(f,[0,80,0]),f],cover,down,'Seat the complete lined bin');
    g.push(...cover);
  });
});
step('Fasten the moulded bins to their fronts','Use six 151930 screws per bin in the fixing tabs shown. Turn them by hand with a screwdriver, not a powered driver.',()=>{
  bays.forEach((b,i)=>{
    const needs=[front(b),liner(b),cheek(b,0),cheek(b,1)];
    const points=[...[-299,-100,100,299].map(x=>[x,-12,10]),[-377,383,10],[377,383,10]];
    binMembers[i].push(...fit('151930',binFaceDown(i),points,Z,needs));
  });
});
const binReceivers=i=>[pivotIds[i],pivotIds[i+2],stopIds[i],stopIds[i+2]];
const pivotFocus=(i,caption)=>({target:[-384,pivotYs[i],pivotZ],caption,view:{direction:[.26,.34,1],span:300}});
function tilt(i,from,to,caption) {
  reframe(binMembers[i],binInstalled(i,from),[binInstalled(i,to)],binReceivers(i),X,caption,pivotFocus(i,caption));
}
step('Engage the bin pivots and rotate inward','Fit the lower bin first, then the upper. Offer each bin tilted out, engage both lower pivot receivers and rotate it in so the curved slots capture the upper stops.',()=>{
  bays.forEach((b,i)=>{
    const open=binInstalled(i,tipAngle), ahead=translate(open,[0,78,265]);
    const caption='Engage both lower pivot receivers';
    reframe(binMembers[i],binFaceDown(i),[translate(ahead,[480,70,80]),ahead,open],
      [...binReceivers(i),'wall-1','wall-2'],inward,caption,pivotFocus(i,caption));
    tilt(i,tipAngle,0,'Rotate about the lower pins; the upper stops follow the slots');
  });
});
step('Fit all four bin knobs','Tilt each bin out for access. Place two knobs on its front and add their screws from behind, then close the bin.',()=>{
  bays.forEach((b,i)=>{
    tilt(i,0,tipAngle,'Tilt the bin for access');
    const f=binInstalled(i,tipAngle);
    const knobs=fit('117615',f,[-206,206].map(x=>[x,348,31]),inward,[front(b)]);
    binMembers[i].push(...knobs,...fit('100414',f,[-206,206].map(x=>[x,348,11]),Z,[front(b),...knobs]));
    tilt(i,tipAngle,0,'Close the bin around the same pivots');
  });
});

const drawerMembers=[];
const drawerSides=['drawerSideL','drawerSideR'], drawerRunners=['drawerRunnerL','drawerRunnerR'];
const drawerFrame=q=>transform(pose([1120,125,440],q),pose([0,-1150,0]));
const frontDown=drawerFrame(turn(X,PI/2)), bottomUp=drawerFrame(turn(X,PI)), drawerLevel=drawerFrame(I);
const drawerStudRows=[1128,1183];
step('Prepare the separate drawer front','Lay the front face down. Fit two 118331 studs at each end, four total as shown in the full figure.',()=>{
  drawerMembers.push(...place('drawerFront',frontDown,pose([0,1155,132]),inward),
    ...fit('118331',frontDown,sideSigns.flatMap(s=>drawerStudRows.map(y=>[s*377,y,122.5])),Z,['drawerFront']));
});
step('Seat the top drawer sides','Lower the two handed sides onto the front studs with their base grooves facing one another.',()=>{
  sideSigns.forEach((s,i)=>drawerMembers.push(...place(drawerSides[i],frontDown,pose([s*377,1159,-2]),Z,['drawerFront'])));
});
step('Lock the top drawer sides','Fit and turn two small 106720 cam locks at each end, four in all.',()=>{
  sideSigns.forEach((s,i)=>drawerMembers.push(...cams('106720',frontDown,drawerStudRows.map(y=>[s*384,y,97]),fasteningFace(s,-1),[drawerSides[i],'drawerFront'])));
});
step('Slide in the drawer base','Slide the thin base into both side grooves and the groove on the back of the front.',()=>{
  drawerMembers.push(...place('drawerBase',frontDown,pose([0,1125,5.5]),Z,['drawerFront',...drawerSides],175));
});
step('Fit the back of the drawer','Seat the rear panel. Use a hammer to tap in two 110519 fasteners at each end.',()=>{
  drawerMembers.push(...place('drawerRear',frontDown,pose([0,1160,-119]),Z,['drawerBase',...drawerSides]));
  sideSigns.forEach((s,i)=>drawerMembers.push(...fit('110519',frontDown,[1133,1184].map(y=>[s*386,y,-119]),fasteningFace(s,-1),[drawerSides[i],'drawerRear'])));
});
step('Turn the drawer and fit its runners','Turn the assembled drawer bottom-up. Fit its two handed 115917 guides with the wheels toward the rear, using four packet screws.',()=>{
  reframe(drawerMembers,frontDown,[translate(bottomUp,[0,150,0]),bottomUp],[],down,'Turn the drawer bottom-up');
  sideSigns.forEach((s,i)=>{
    const id=drawerRunners[i];
    drawerMembers.push(...place(id,bottomUp,pose([s*389,1117,-2]),Y,[drawerSides[i]]),
      ...fit('108462',bottomUp,[-102,103].map(z=>[s*390,1117,z]),fasteningFace(s,-1),[id,drawerSides[i]]));
  });
});
step('Fit the two drawer knobs','Turn the same drawer upright. Fit two knobs to its front with their 100414 screws entering from behind.',()=>{
  reframe(drawerMembers,bottomUp,[translate(bottomUp,[0,205,0]),translate(drawerLevel,[0,130,0]),drawerLevel],[],Y,'Return the drawer upright');
  const knobs=fit('117615',drawerLevel,[-206,206].map(x=>[x,1159,142]),inward,['drawerFront']);
  drawerMembers.push(...knobs,...fit('100414',drawerLevel,[-206,206].map(x=>[x,1159,122]),Z,['drawerFront',...knobs]));
});
step('Engage and seat the top drawer','Tip the assembled drawer to engage both roller guides. Level it on the runners and slide it in; neither bin moves.',()=>{
  const rearRoller=pose([0,1117,-106]);
  const dock=pose([0,1126,99],turn(X,-PI/18));
  const tip=transform(dock,inverse(rearRoller));
  reframe(drawerMembers,drawerLevel,[translate(tip,[420,65,85]),tip,translate(upright,[0,0,205]),upright],cabinetRunners,inward,
    'Engage the two rollers and slide the separate drawer', {target:[-391,1117,96],view:{direction:[.33,.41,1],span:380}});
});

export const steps = all;
