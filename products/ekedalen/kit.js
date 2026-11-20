import { pages } from './manual.js';

export const shapes = {
  top:[1200,22,800], leaf:[600,22,800], guide:[1120,54,24], batten:[62,18,634], slat:[650,18,44],
  slide:[1100,64,44], apron:[24,64,684], leg:[54,722,54], locator:[26,10,38], angle:[52,44,52],
  longScrew:[10,72,10], camStud:[8,31,8], dowel:[8,30,8], shortStud:[8,20,8], screw:[9,18,9],
  cam:[15,10,15], stop:[8,12,8], longRod:[8,105,8], shortRod:[8,76,8], barrel:[12,38,12],
  washer:[16,3,16], nut:[13,7,13], glide:[23,11,23], wrench:[78,90,15], catch:[38,31,38],
  flushScrew:[8,19,8], catchScrew:[8,13,8], pin:[5,23,5], keeper:[19,12,42]
};

export const families = {};
export const parts = new Map();
const pose=(x,y,z,q=[0,0,0,1])=>[x,y,z,...q];
const yaw=a=>[0,Math.sin(a/2),0,Math.cos(a/2)];
const {PI}=Math;
const up=[0,1,0], down=[0,-1,0], left=[-1,0,0], right=[1,0,0];
const plus=(a,b)=>a.map((v,i)=>v+b[i]);
const scale=(a,k)=>a.map(v=>v*k);
const cross=([x,y,z],[a,b,c])=>[y*c-z*b,z*a-x*c,x*b-y*a];
const unit=a=>scale(a,1/Math.hypot(...a));
const xyz=p=>p.slice(0,3);
const inverse=([x,y,z,w])=>[-x,-y,-z,w];
function rotate(v,q) {
  const t=scale(cross(q,v),2);
  return plus(v,plus(scale(t,q[3]),cross(q,t)));
}
function mult(a,b) {
  return [...plus(plus(scale(xyz(a),b[3]),scale(xyz(b),a[3])),cross(a,b)),a[3]*b[3]-a[0]*b[0]-a[1]*b[1]-a[2]*b[2]];
}
const transform=(a,b)=>pose(...plus(xyz(a),rotate(xyz(b),a.slice(3))),mult(a.slice(3),b.slice(3)));
const fromLocal=(id,point)=>transform(at.get(id),pose(...point)).slice(0,3);
const side=z=>[0,0,Math.sign(z)];
function facing(axis) {
  const outward=scale(axis,-1);
  return outward[1]<-0.999 ? [1,0,0,0] : unit([...cross(up,outward),1+outward[1]]);
}
function stock(key,name,shape,number,group,page,entries,role='kit') {
  families[key]={name,number,group,page,role};
  for(const [id,x,z,q] of entries) parts.set(id,{id,family:key,shape,packet:group,unpacked:pose(x,shapes[shape][1]/2,z,q)});
}
const panels='Table pieces';
stock('top','Tabletop','top',null,panels,5,[['top',-970,-390]]);
stock('leaf','Extension leaf','leaf',null,panels,22,[['leaf',-60,-390]]);
stock('guide','Tabletop guide rail','guide',null,panels,5,[['guideRear',-955,61],['guideFront',-955,135]]);
stock('batten','Carrier end batten','batten',null,panels,7,[['battenR',1460,210],['battenL',1580,210]]);
stock('slat','Carrier crosspiece','slat',null,panels,8,[['slatRear',-1190,231],['slatFront',-1190,313]]);
stock('slide','Slotted carrier side','slide',null,panels,9,[['slideRear',-955,406],['slideFront',-955,495]]);
stock('apron','End apron','apron',null,panels,10,[['apronSlide',340,-390],['apronFixed',437,-390]]);
stock('fixedLeg','Short-stud leg','leg',null,panels,16,[['legRF',260,66],['legRR',260,161]]);
stock('movingLeg','Long-stud leg','leg',null,panels,19,[['legLF',260,263],['legLR',260,358]]);
for(const id of ['legRF','legRR','legLF','legLR']) parts.get(id).unpacked=pose(260,28,parts.get(id).unpacked[2],[0,0,Math.SQRT1_2,Math.SQRT1_2]);
stock('locator','Leaf locating block','locator',null,panels,22,[['locatorRear',400,450],['locatorFront',470,450]]);
const packet1=[['154409','Long screw','longScrew',13],['114613','Long cam stud','camStud',4],['101350','Dowel','dowel',14],
  ['154954','Short cam stud','shortStud',8],['109021','Round-head screw','screw',20],['113434','Cam lock','cam',12],['156685','Stop screw','stop',4]];
const packet2=[['100041','Long threaded rod','longRod',4],['100038','Short threaded rod','shortRod',4],['110912','Two-hole barrel','barrel',4],
  ['100843','Split washer','washer',8],['100712','Hex nut','nut',8],['107271','Foot glide','glide',4],['120202','Hand wrench','wrench',1,'tool']];
const packet3=[['10062668','Lever catch','catch',1],['10082399','Countersunk keeper screw','flushScrew',4],['109067','Catch base screw','catchScrew',2],
  ['10064763','Keeper pin','pin',2],['10082205','Keeper body','keeper',2]];
for(const [j,packet] of [packet1,packet2,packet3,[['122483','Corner angle','angle',4]]].entries()) {
  for(const [i,[key,label,shape,count,role]] of packet.entries()) {
    const group=j===3?'Loose fittings':`Packet ${j+1}`;
    stock(key,label,shape,key,group,j<2?3:4,Array.from({length:count},(_,k)=>[
      `${key}-${k+1}`,-1450+j*880+k%7*52,640+i*145+Math.floor(k/7)*40
    ]),role);
  }
}

const at=new Map(), used={}, all=[];
let operations;
function step(title,action,build,warning) {
  operations=[]; build();
  all.push({number:all.length+1,page:pages[all.length],title,action,warning,operations});
}
function op(kind,ids,prerequisites,poses,axes,extra={},caption=families[parts.get(ids[0]).family].name) {
  const axis=axes[0], target=xyz(poses[0].at(-1));
  operations.push({kind,ids,prerequisites,poses,axes,joint:{target,axis,outward:scale(axis,-1),receivers:prerequisites,caption},...extra});
  ids.forEach((id,i)=>at.set(id,poses[i].at(-1)));
  return ids;
}
function place(id,end,prerequisites=[],axis=down,distance=85) {
  const start=pose(...plus(xyz(end),scale(axis,-distance)),end.slice(3));
  op('place',[id],prerequisites,[[start,end]],[axis]);
}
function fittings(key,positions,prerequisites,axis=down,previewBores=false) {
  const ids=positions.map(()=>`${key}-${used[key]=(used[key]??0)+1}`);
  const axes=Array.isArray(axis[0])?axis:ids.map(()=>axis);
  const paths=positions.map((p,i)=>{
    const q=facing(axes[i]);
    return [pose(...plus(p,scale(axes[i],-42)),q),pose(...p,q)];
  });
  return op('place',ids,prerequisites,paths,axes,{previewBores});
}
function move(ids,frames,prerequisites,axis,caption) {
  const anchor=ids[0], initial=at.get(anchor), q=inverse(initial.slice(3));
  const offsets=ids.map(id=>{
    const p=at.get(id);
    return pose(...rotate(plus(xyz(p),scale(xyz(initial),-1)),q),mult(q,p.slice(3)));
  });
  const paths=ids.map((id,i)=>[at.get(id),...frames.map(p=>transform(p,offsets[i]))]);
  op('move',[...ids],prerequisites,paths,ids.map(()=>axis),{rigid:{anchor,frames:[initial,...frames],offsets}},caption);
}
function translate(ids,by,prerequisites,caption) {
  const p=at.get(ids[0]);
  move(ids,[pose(...plus(xyz(p),by),p.slice(3))],prerequisites,unit(by),caption);
}
function lockCams(ids,receivers,axes) {
  const paths=ids.map(id=>{
    const p=at.get(id);
    return [p,pose(...xyz(p),mult(p.slice(3),yaw(PI/2)))];
  });
  op('adjust',ids,receivers,paths,axes,{captive:{from:0,to:1}},'Turn the cam locks');
}

const zs=[-354,354], ends=[-1,1], studX=[-405,-135,135,405];
const guides=['guideRear','guideFront'], battens=['battenR','battenL'], slats=['slatRear','slatFront'], slides=['slideRear','slideFront'];
const guideDowel=[], battenStuds=[];
const top=pose(0,13,0), leaf=pose(0,13,850), bench=1470;
const carrier=[];
let catchIds, slideAngles;
const handScrew={text:'Use a hand screwdriver, not a powered driver.',page:15};
export const setup={text:'Use a protected assembly surface. Bring a cross-head and a slotted screwdriver.',page:2};

step('Set the tabletop cam studs','Lay the tabletop upside down on protection. Screw four short cam studs into each long edge.',()=>{
  place('top',top);
  fittings('154954',zs.flatMap(z=>studX.map(x=>[x,32,z])),['top'],down,true);
});
step('Key the two guide rails','Insert a dowel in the indicated end hole of the inside face of each guide rail.',()=>{
  guides.forEach((id,i)=>{
    const z=zs[i];
    place(id,pose(0,34,bench+z,i?yaw(PI):undefined));
    const hole=fromLocal(id,[i?-526:526,4,12]);
    guideDowel.push(...fittings('101350',[plus(hole,scale(side(z),-3))],[id],side(z),true));
  });
});
step('Seat the guides on the top','Lower both guides onto their rows of studs with the open channels facing each other.',()=>{
  guides.forEach((id,i)=>{
    const p=at.get(id), q=p.slice(3), z=zs[i];
    move([id,guideDowel[i]],[pose(0,158,bench+z,q),pose(0,158,z,q),pose(0,51,z,q)],['top'],down,'Lower the keyed guide over four studs');
  });
});
step('Lock the tabletop guides','Insert and turn the four inward-facing cam locks on each guide.',()=>{
  guides.forEach((id,i)=>{
    const z=zs[i], axis=side(z);
    const ids=fittings('113434',studX.map(x=>[x,42,z-Math.sign(z)*9]),[id],axis,true);
    lockCams(ids,[id],ids.map(()=>axis));
  });
});
step('Start the carrier battens','Fit two long cam studs to the indicated face of each end batten.',()=>{
  battens.forEach((id,i)=>{
    const x=i===0?310:-360;
    place(id,pose(x,73,bench));
    battenStuds[i]=[...fittings('114613',[-282,282].map(z=>[x,93,bench+z]),[id])];
    carrier.push(id,...battenStuds[i]);
  });
});
step('Set the first stop screws','Place one stop screw on each batten beside the indicated cam stud.',()=>{
  battens.forEach((id,i)=>{
    const members=fittings('156685',[fromLocal(id,[0,12,i===0?-250:250])],[id]);
    battenStuds[i].push(...members); carrier.push(...members);
  });
});
step('Join the leaf carrier','Two dowels go into each crosspiece end. Bring both end battens onto the four joints.',()=>{
  slats.forEach((id,i)=>{
    const z=bench+(i===0?-154:154);
    place(id,pose(-25,73,z));
    const ids=fittings('101350',ends.flatMap(s=>[-12,12].map(dz=>[-25+s*325,73,z+dz])),[id],[right,right,left,left]);
    carrier.push(id,...ids);
  });
  battens.forEach((id,i)=>translate([id,...battenStuds[i]],[i===0?-19:19,0,0],slats,'Bring the end batten over the paired dowels'));
});
step('Key the batten ends','Use the outer bore at each exposed batten end for the remaining four dowels.',()=>{
  battens.forEach(id=>{
    const ids=fittings('101350',ends.map(s=>fromLocal(id,[-18,0,s*317])),[id],[[0,0,1],[0,0,-1]]);
    carrier.push(...ids);
  });
});
step('Close the slotted sides','Fit the sides over the batten ends with the slots outward.',()=>{
  slides.forEach((id,i)=>{
    const s=ends[i];
    place(id,pose(0,73,bench+s*329,i===0?yaw(PI):undefined),battens,[0,0,-s]);
    carrier.push(id);
  });
});
step('Lock the carrier cams','Seat and turn two cam locks per long side, from the open face shown in the figure.',()=>{
  slides.forEach((id,i)=>{
    const ids=fittings('113434',battens.map(b=>[at.get(b)[0],99,bench+ends[i]*329]),[id,...battens]);
    lockCams(ids,[id],ids.map(()=>down)); carrier.push(...ids);
  });
});
step('Fit the lever catch','Use the two short packet-3 screws to fit the lever catch to the moving apron. Check its lever direction.',()=>{
  place('apronSlide',pose(650,29,bench,[0,0,Math.SQRT1_2,Math.SQRT1_2]));
  place('10062668-1',pose(650,56,bench),['apronSlide']);
  catchIds=['apronSlide','10062668-1',...fittings('109067',[-13,13].map(z=>[650,39,bench+z]),['10062668-1','apronSlide'])];
});
function angles(x,benchZ) {
  return ends.map((s,i)=>{
    const number=used['122483']=(used['122483']??0)+1, id=`122483-${number}`;
    const axis=[Math.sign(x),0,0];
    place(id,pose(x,axis[0]>0?73:57,benchZ+s*313,yaw(i===0?0:PI)),[axis[0]>0?'apronSlide':'apronFixed',slides[i]],axis);
    return id;
  });
}
function movingCornerScrews(ids) {
  return ids.flatMap((id,i)=>{
    const [x,y,z]=at.get(id), s=ends[i];
    return [
      ...fittings('109021',[-14,14].map(h=>[x+14,y+h,z-s*9]),[id,'apronSlide'],right),
      ...fittings('109021',[-14,14].map(h=>[x-12,y+h,z+s*11]),[id,slides[i]],[0,0,s])
    ];
  });
}
step('Fit the moving-end angles','Turn the apron with its catch attached. Fit both corner angles, using two screws in each flange.',()=>{
  const turn=yaw(PI);
  move(catchIds,[pose(610,121,bench,[0,0,0,1]),pose(566,73,bench,turn)],slides,left,'Turn and seat the caught apron');
  slideAngles=angles(540,bench);
  carrier.unshift(...catchIds,...slideAngles,...movingCornerScrews(slideAngles));
});
step('Slide the carrier into the guides','Turn over the connected carrier so the correct face is uppermost, and feed both sides into the tabletop channels together.',()=>{
  const turn=[0,0,1,0];
  const q=at.get('apronSlide').slice(3), rotated=mult(turn,q);
  move(carrier,[pose(0,485,1020,mult([0,0,Math.SQRT1_2,Math.SQRT1_2],q)),pose(120,49,0,rotated),pose(-836,49,0,rotated)],
    guides,left,'Turn over and engage both guide channels');
});
step('Add the carrier stops','Install the remaining two stop screws in the visible mounting positions.',()=>{
  carrier.push(...fittings('156685',[-154,154].map(z=>[-309,64,z]),slats));
});
function keeper(number,x,y,z,board) {
  const id=`10082205-${number}`;
  place(id,pose(x,y,z),[board]);
  fittings('10064763',[[x,y+5,z]],[id],[0,0,-1]);
  fittings('10082399',[-15,15].map(dz=>[x,y-4.5,z+dz]),[id,board],down,true);
}
step('Fit the tabletop keeper','Put the pin in the keeper groove and use the two countersunk screws at the tabletop receiver.',()=>{
  keeper(1,-527,30,0,'top');
});
step('Fasten the guide rows','Use the long screws: three in the indicated row at one end of each guide, two in the row at the other.',()=>{
  guides.forEach((id,i)=>fittings('154409',[-340,-315,-290,512,537].map(x=>[x,50,zs[i]]),[id]));
});
step('Seat the fixed apron','Lower the apron at the remaining end with its bored edge uppermost, as shown in the inset.',()=>{
  place('apronFixed',pose(566,57,0),guides);
});
let fixedAngles;
step('Align the fixed-end angles','Align both flanges of the two remaining corner angles with the apron and the guide rails.',()=>{
  fixedAngles=ends.map((s,i)=>{
    const id=`122483-${used['122483']=(used['122483']??0)+1}`;
    place(id,pose(540,57,s*313,yaw(i===0?PI:0)),['apronFixed',guides[i]],right);
    return id;
  });
});
step('Secure the fixed-end angles','Use two round-head screws per flange, four flange sets in total.',()=>{
  fixedAngles.forEach((id,i)=>{
    const s=ends[i];
    fittings('109021',[-14,14].map(h=>[554,57+h,s*313]),[id,'apronFixed'],right);
    fittings('109021',[-14,14].map(h=>[531,57+h,s*333]),[id,guides[i]],[0,0,s]);
  });
});
step('Screw down the fixed apron','Fit the three long screws along the apron with a hand screwdriver.',()=>{
  fittings('154409',[-260,0,260].map(z=>[566,54,z]),['apronFixed']);
},handScrew);
step('Close the sliding frame','Push the assembled sliding end in until its lever catch clicks.',()=>{
  translate(carrier,[270,0,0],guides,'Slide the entire carrier to the closed catch position');
});

const legs=new Map();
function prepareLegs(xSign,key) {
  ends.forEach((s,i)=>{
    const id=`leg${xSign===1?'R':'L'}${s===1?'F':'R'}`;
    const axis=unit([-xSign,0,-s]);
    const x=xSign*830, z=s*260, y=361;
    const q=yaw(Math.atan2(-axis[2],axis[0]));
    place(id,pose(x,y,z,q));
    const ids=[id,...fittings('110912',[[x,34,z]],[id],[0,1,0])];
    const pegs=fittings(key,[y-324,y-292].map(h=>plus([x,h,z],scale(axis,key==='100038'?39:52))),[id],scale(axis,-1));
    legs.set(id,{xSign,s,i,ids:[...ids,...pegs],axis,pegs});
  });
}
function seatLegs(xSign,brackets) {
  for(const [id,{s,i,ids,axis,xSign:which}] of legs) {
    if(which!==xSign) continue;
    const p=at.get(id);
    move(ids,[pose(xSign*565,391,s*353,p.slice(3))],[brackets[i]],axis,'Seat the paired leg studs in their angle');
  }
}
function secureLegs(xSign,brackets) {
  for(const [id,{i,ids,axis,pegs,xSign:which}] of legs) {
    if(which!==xSign) continue;
    const receivers=[brackets[i],id], points=pegs.map(k=>xyz(at.get(k)));
    ids.push(...fittings('100843',points.map(p=>plus(p,scale(axis,22))),receivers,scale(axis,-1)));
    ids.push(...fittings('100712',points.map(p=>plus(p,scale(axis,27))),receivers,scale(axis,-1)));
  }
}
step('Prepare the fixed-end legs','Use the pictured pair and the short threaded rods. Align the two holes in each barrel with its stud holes.',()=>prepareLegs(1,'100038'));
step('Seat the fixed-end legs','Bring the two prepared legs into the fixed-end angles; keep both rods with each leg.',()=>seatLegs(1,fixedAngles));
step('Tighten the fixed-end legs','Press the legs into the corners, make the two reveals equal, then fit and tighten the washers and nuts with the supplied wrench.',()=>secureLegs(1,fixedAngles));
step('Prepare the sliding-end legs','Use the remaining leg pair and the longer rods. Align the two holes in each barrel first.',()=>prepareLegs(-1,'100041'));
step('Seat the sliding-end legs','Guide the long rods on each prepared leg into its corner angle.',()=>seatLegs(-1,slideAngles));
step('Tighten the sliding-end legs','Check the equal corner reveals; fit the split washers and nuts, then tighten using the same wrench.',()=>secureLegs(-1,slideAngles));
step('Insert the four glides','Press one glide into the hole at each leg foot.',()=>{
  for(const [id,{ids}] of legs) ids.push(...fittings('107271',[fromLocal(id,[0,361,0])],[id],down,true));
});
step('Fit the leaf locating blocks','Lay the leaf underside up. Fit the two blocks on its same edge with two round-head 109021 screws each, not the countersunk screws.',()=>{
  place('leaf',leaf);
  ends.forEach((s,i)=>{
    const id=i===0?'locatorRear':'locatorFront', z=leaf[2]+s*325;
    place(id,pose(272,29,z),['leaf']);
    fittings('109021',[-10,10].map(dz=>[272,26,z+dz]),[id,'leaf'],down,true);
  });
});
step('Fit the leaf keeper','Set the pin in the other keeper. Countersink the two keeper screws at the separate pair of holes on the opposite edge of the same leaf.',()=>{
  keeper(2,-272,30,leaf[2],'leaf');
});

export const steps=all;

const movingIds=new Set(carrier);
for(const {xSign,ids} of legs.values()) if(xSign===-1) for(const id of ids) movingIds.add(id);
const leafIds=new Set(all.slice(-2).flatMap(step=>step.operations.flatMap(op=>op.ids)));

export function completeFrame(frame) {
  const width=shapes.leaf[0];
  const upright=pose(width/2,frame.poses['107271-1'][1]+shapes.glide[1]/2,0,[1,0,0,0]);
  const extended=transform(upright,pose(-width,0,0));
  const seatedLeaf=transform(upright,pose(-(shapes.top[0]+width)/2,0,-leaf[2]));
  const poses={};
  for(const id of frame.installed) {
    poses[id]=transform(movingIds.has(id)?extended:leafIds.has(id)?seatedLeaf:upright,frame.poses[id]);
  }
  return {...frame,poses};
}
