import { pages } from './manual.js';

export const shapes={
  side:[70,348,1920], cap:[70,20,1920], endBoard:[1500,368,40], headboard:[1500,620,40],
  corner:[57,282,57], outerRail:[30,28,1832], centerRail:[24,28,1832], endRail:[1330,28,28],
  brace:[1300,32,35], retainer:[680,75,25], slat:[632,18,38], floorEdge:[1352,10,625], floorCenter:[1352,10,625],
  liftL:[58,330,620], liftR:[58,330,620], strut:[28,455,28], mattress:[1349,190,1889],
  stud:[9,42,9], headStud:[9,63,9], trimStud:[8,27,8], bigDowel:[10,43,10], dowel:[8,30,8],
  cam:[15,12,15], endCam:[38,14,38], nutClip:[25,12,25], nut:[17,9,17],
  longBolt:[12,65,12], shortBolt:[12,43,12], liftBoss:[21,23,21], sleeve:[22,22,22], woodScrew:[8,22,8],
  tinyScrew:[7,12,7], glide:[43,17,43], bushing:[17,14,17], carriageBolt:[12,55,12], shoulderBolt:[12,30,12],
  catchScrew:[9,29,9], retainerScrew:[9,18,9], keeperPin:[12,16,12], keeper:[57,11,25], pad:[28,7,28],
  rest:[42,45,48], strike:[62,61,52], latch:[55,21,92], slatCap:[25,16,41],
  key:[42,88,8], offsetKey:[40,90,8], wrench:[23,140,5]
};

const PI=Math.PI, up=[0,1,0], down=[0,-1,0];
const xs=s=>[s,0,0], zs=s=>[0,0,s];
const ends=[-1,1], longRows=[-630,-210,210,630];
const plus=(a,b)=>a.map((v,i)=>v+b[i]);
const scale=(a,k)=>a.map(v=>v*k);
const cross=([x,y,z],[a,b,c])=>[y*c-z*b,z*a-x*c,x*b-y*a];
const unit=a=>scale(a,1/Math.hypot(...a));
const pose=(x,y,z,q=[0,0,0,1])=>[x,y,z,...q];
const xyz=p=>p.slice(0,3), quat=p=>p.slice(3);
const rx=a=>[Math.sin(a/2),0,0,Math.cos(a/2)], ry=a=>[0,Math.sin(a/2),0,Math.cos(a/2)];
const rz=a=>[0,0,Math.sin(a/2),Math.cos(a/2)];
const inverse=([x,y,z,w])=>[-x,-y,-z,w];
function rotate(v,q) {
  const t=scale(cross(q,v),2);
  return plus(v,plus(scale(t,q[3]),cross(q,t)));
}
function multiply(a,b) {
  return [...plus(plus(scale(xyz(a),b[3]),scale(xyz(b),a[3])),cross(a,b)),a[3]*b[3]-a[0]*b[0]-a[1]*b[1]-a[2]*b[2]];
}
const transform=(a,b)=>pose(...plus(xyz(a),rotate(xyz(b),quat(a))),multiply(quat(a),quat(b)));
const relative=(a,b)=>{
  const q=inverse(quat(a));
  return pose(...rotate(plus(xyz(b),scale(xyz(a),-1)),q),multiply(q,quat(b)));
};
const facing=axis=>axis[1]>.999 ? rx(PI) : unit([...cross(up,scale(axis,-1)),1-axis[1]]);

// Finished coordinate system: x right, y up, z towards the foot. Lift angles are schematic.
export const lift={x:650,y:370,z:-905,angle:35.5*PI/180,mounts:[-800,-650,-460],upper:[0,-22,275],
  lower:[0,-179,475],springTop:[0,-38,356],loose:[0,-131,449]};
export const slatRows=Array.from({length:16},(_,i)=>-850+i*1700/15);
export const capPins=[-10,10];
const liftFrame=(open,s=0)=>pose(s*lift.x,lift.y,lift.z,rx(open?-lift.angle:0));
const freeEye=(frame)=>plus(xyz(frame),lift.loose);
const bench=(y,rotation)=>pose(2200,y,0,rotation);
const sideIds=['sideR','sideL'], capIds=['capR','capL'], boardIds=['headBase','foot'];
const linkageIds=['linkR','linkL'], springs=['124432-1','124432-2'];
const railIds=['outerR','centerR','centerL','outerL'], railXs=[-650,-12,12,650];
const endIds=['deckHead','deckFoot'];
const floorIds=['floorHead','floorCenter','floorFoot'];
const slatIds=Array.from({length:32},(_,i)=>`slat-${i+1}`);

export const families={};
export const parts=new Map();
function stock(key,name,shape,number,group,page,entries,role='kit') {
  families[key]={name,number,group,page,role};
  for (const [id,unpacked,shapeOverride] of entries) parts.set(id,{id,family:key,shape:shapeOverride??shape,packet:group,unpacked});
}
const bed='Bed pieces', lifts='Handed lift modules';
stock('side','Bedside board','side',null,bed,7,sideIds.map((id,i)=>[id,pose(ends[i]*1160,36,0,rz(-ends[i]*PI/2))]));
stock('cap','Bedside cap','cap',null,bed,9,capIds.map((id,i)=>[id,pose(ends[i]*1410,10,0)]));
stock('endBoard','Low head crossboard / footboard','endBoard',null,bed,7,boardIds.map((id,i)=>[id,pose(0,20,ends[i]*1180,rx(ends[i]*PI/2))]));
stock('headboard','Upper headboard','headboard',null,bed,14,[['headboard',pose(0,20,-1610,rx(-PI/2))]]);
stock('128895','Corner upright','corner','128895',bed,16,Array.from({length:4},(_,i)=>[`128895-${i+1}`,pose(-675+i*120,141,1480)]));
stock('outerRail','Outer carriage tube','outerRail',null,bed,21,[[railIds[0],pose(1580,14,-60)],[railIds[3],pose(2260,14,-60)]]);
stock('centerRail','Center carriage tube','centerRail',null,bed,21,[[railIds[1],pose(1840,14,-60)],[railIds[2],pose(1960,14,-60)]]);
stock('endRail','Carriage end tube','endRail',null,bed,22,endIds.map((id,i)=>[id,pose(2320,14,ends[i]*1100)]));
stock('brace','Transverse carriage brace','brace',null,bed,23,[['brace',pose(2320,16,1250)]]);
stock('192367','Mattress retainer','retainer','192367',bed,24,[['retainerHead',pose(2020,40,1360)],['retainerFoot',pose(2020,40,1460)]]);
stock('slat','Sprung slat','slat',null,bed,31,slatIds.map((id,i)=>[id,pose(2940+Math.floor(i/16)*655,8,-865+i%16*51)]));
stock('floor','Storage floor insert','floorEdge',null,bed,35,floorIds.map((id,i)=>[id,pose(3320,5,230+i*650,i===2?ry(PI):undefined),i===1?'floorCenter':'floorEdge']));
stock('123830','L lift linkage (printed stamp L)','liftL','123830',lifts,6,[['linkL',pose(-1970,179,240,rx(-lift.angle))]]);
stock('123829','R lift linkage (printed stamp R)','liftR','123829',lifts,6,[['linkR',pose(-1970,179,-410,rx(-lift.angle))]]);
stock('124432','Full/Double lift strut, upper-pinned','strut','124432',lifts,6,springs.map((id,i)=>[id,pose(-1970,179,[-410,240][i],rx(-lift.angle))]));
stock('mattress','Full/Double mattress (sold separately)','mattress',null,'Required, not supplied',33,[['mattress',pose(-2990,95,0)]],'external');

const packet1=[['114334','Headboard stud','headStud',4],['123491','End cam stud','stud',4],['130618','Cap cam stud','trimStud',8],
  ['101367','Long headboard dowel','bigDowel',5],['101359','Short end dowel','dowel',16],['115311','Small cap cam','cam',8],
  ['114670','Large end cam','endCam',4],['122998','Nut locking clip','nutClip',4],['114254','Headboard nut','nut',4],
  ['100049','Large hex key','key',1,'tool'],['113453','Open / ring wrench','wrench',1,'tool']];
const packet2=[['123851','Long linkage bolt','longBolt',4],['123852','Short lower-eye bolt','shortBolt',2],
  ['123849','Side receiver boss','liftBoss',2],['123850','Linkage mounting sleeve','sleeve',4],['109021','Cross-head wood screw','woodScrew',46],
  ['190018','Glide screw','tinyScrew',4],['124252','Corner glide','glide',4],['123848','Lower strut-eye bushing','bushing',2]];
const packet3=[['124584','Carriage-to-lift bolt','carriageBolt',6],['158998','Carriage shoulder bolt','shoulderBolt',12],
  ['105107','Long strap-latch screw','catchScrew',2],['115461','Short retainer screw','retainerScrew',4],['110440','Keeper pivot screw','keeperPin',2],
  ['124573','Strap keeper','keeper',1],['157409','Adhesive floor pad','pad',24],['108490','Carriage hex key','key',1,'tool'],
  ['100001','Offset hex key','offsetKey',1,'tool']];
const loose=[['124249','Carriage rest ledge','rest',4],['124389','Footboard striker','strike',1],['124390','Pull strap and latch','latch',1],
  ['124663','Two-pin slat cap','slatCap',64]];
for(const [j,packet] of [packet1,packet2,packet3,loose].entries()) {
  for(const [i,[key,name,shape,count,role]] of packet.entries()) {
    stock(key,name,shape,key,j===3?'Loose fittings':`Packet ${j+1}`,j===0?3:j===3?5:4,
      Array.from({length:count},(_,k)=>[`${key}-${k+1}`,pose(-1580+j*885+k%12*54,shapes[shape][1]/2,1610+i*108+Math.floor(k/12)*35)]),role);
  }
}

const at=new Map(), used={};
export const steps=[];
let operations;
function step(title,action,build,warning) {
  operations=[]; build();
  steps.push({number:steps.length+1,page:pages[steps.length],title,action,warning,operations});
}
function op(kind,ids,prerequisites,paths,axes,{caption=families[parts.get(ids[0]).family].name,target=xyz(paths[0].at(-1)),
  view,rigid,captive,previewBores=false}={}) {
  const axis=axes[0];
  operations.push({kind,ids,prerequisites,poses:paths,axes,rigid,captive,previewBores,
    joint:{target,axis,outward:scale(axis,-1),receivers:prerequisites,caption,view}});
  ids.forEach((id,i)=>at.set(id,paths[i].at(-1)));
  return ids;
}
function place(id,end,prerequisites=[],axis=down,travel=120,extra={}) {
  return op('place',[id],prerequisites,[[pose(...plus(xyz(end),scale(axis,-travel)),quat(end)),end]],[axis],extra);
}
function fittings(key,points,prerequisites,axis=down,previewBores=false) {
  const ids=points.map(()=>`${key}-${used[key]=(used[key]??0)+1}`);
  const axes=Array.isArray(axis[0])?axis:ids.map(()=>axis);
  const paths=points.map((p,i)=>{
    const a=axes[i], q=facing(a);
    return [pose(...plus(p,scale(a,-48)),q),pose(...p,q)];
  });
  return op('place',ids,prerequisites,paths,axes,{previewBores});
}
function rigid(ids,frames,prerequisites,axis,caption,extra={}) {
  const offsets=ids.map(id=>relative(frames[0],at.get(id)));
  const paths=ids.map((id,i)=>[at.get(id),...frames.slice(1).map(frame=>transform(frame,offsets[i]))]);
  return op('move',[...ids],prerequisites,paths,ids.map(()=>axis),{...extra,caption,rigid:{anchor:ids[0],frames,offsets}});
}
function move(ids,targets,prerequisites,axis,caption,extra) {
  return rigid(ids,[at.get(ids[0]),...targets],prerequisites,axis,caption,extra);
}
function adjust(ids,prerequisites,axes,caption,travel=0,captive={from:0,to:1},turn=PI/2) {
  const paths=ids.map((id,i)=>{
    const p=at.get(id);
    return [p,pose(...plus(xyz(p),scale(axes[i],travel)),multiply(quat(p),ry(turn)))];
  });
  op('adjust',ids,prerequisites,paths,axes,{caption,captive});
}
const local=(id,p)=>xyz(transform(at.get(id),pose(...p)));
const warned=(page,text)=>({page,text});
const wide={direction:[-.65,.48,.78],span:1930};
const sideSets=sideIds.map(id=>[id]), capSets=capIds.map(id=>[id]), boardSets=boardIds.map(id=>[id]);
const tallHead=['headboard'], corners=[], deck=[...railIds];
const slatSets=slatIds.map(id=>[id]), floorSets=floorIds.map(id=>[id]);

step('Lay out the shell boards','On protection, lay out both bedsides and both low end boards with the drilled faces up. Match the parts in cartons 1 and 2; open packet 1.',()=>{
  for(const id of [...boardIds,...sideIds]) place(id,parts.get(id).unpacked,[],down,130,{view:wide});
});
step('Fit four end cam studs','Use the open end of wrench 113453 to fit two 123491 studs in each end board, to the illustrated shoulder.',()=>{
  boardIds.forEach((id,i)=>{
    boardSets[i].push(...fittings('123491',ends.map(s=>local(id,[s*715,0,-ends[i]*25])),[id]));
  });
});
step('Fit the short end dowels','Use only the sixteen short 101359 dowels: two in each end of both bedside boards and both caps.',()=>{
  capIds.forEach((id,i)=>place(id,pose(ends[i]*1440,33,0,rx(PI))));
  const sideBores=[[0,-115],[0,126]], capBores=[[-14,0],[14,0]];
  for(const [keys,sets,bores] of [[sideIds,sideSets,sideBores],[capIds,capSets,capBores]]) {
    keys.forEach((id,i)=>{
      for(const s of ends) sets[i].push(...fittings('101359',bores.map(([x,y])=>local(id,[x,y,s*956])),[id],rotate(zs(-s),quat(at.get(id)))));
    });
  }
},warned(9,'Do not substitute the longer 101367 dowels here.'));
step('Load the cap studs','Fit four 130618 cam studs in each long cap with a cross-head screwdriver.',()=>{
  capIds.forEach((id,i)=>capSets[i].push(...fittings('130618',longRows.map(z=>local(id,[0,-10,z])),[id])));
});
step('Join caps to bedsides','Bring each cap and its fittings to the adjoining bedside. Align the paired ends flush as shown in the inset.',()=>{
  capIds.forEach((id,i)=>{
    const s=ends[i];
    move(capSets[i],[pose(s*1420,120,0,rz(-s*PI/2)),pose(s*1344,36,0,rz(-s*PI/2))],[sideIds[i]],xs(-s),'Seat the cap flush with its bedside');
  });
});
step('Lock the cap connections','Insert and turn eight 115311 cams, four on the inside face of each bedside.',()=>{
  sideIds.forEach((id,i)=>{
    const cams=fittings('115311',longRows.map(z=>local(id,[-ends[i]*35,153,z])),[id,capIds[i]]);
    adjust(cams,[id,capIds[i]],cams.map(()=>down),'Turn the eight small cams');
    sideSets[i].push(...cams,...capSets[i]);
  });
});
function standEnd(i) {
  const s=ends[i];
  const endPose=pose(0,196,s*980);
  const cams=sideIds.map((id,j)=>fittings('114670',[[ends[j]*680,196,s*912]],[id],xs(ends[j]))[0]);
  move(boardSets[i],[pose(0,330,s*1180),pose(0,196,s*1110),endPose],sideIds,zs(-s),'Join the long sides to the end board',{view:wide});
  for(const [j,id] of sideIds.entries()) {
    adjust([cams[j]],[id,boardIds[i]],[xs(ends[j])],'Lock this end connection with key 100049');
  }
}
step('Stand and join the head end','Stand the bedside sets and the low head crossboard. Orient the large cams to receive the head-end studs, then join and turn them with key 100049.',()=>{
  sideIds.forEach((id,i)=>{
    const s=ends[i];
    move(sideSets[i],[pose(s*1050,300,0),pose(s*715,186,0)],[boardIds[0]],xs(-s),'Stand the complete bedside',{view:wide});
  });
  standEnd(0);
});
step('Close the foot end','Orient both large cams toward the foot-end studs, bring the footboard in level and lock both corners with key 100049.',()=>standEnd(1));
step('Set the five headboard dowels','Put five long 101367 dowels in the upper edge of the low head crossboard.',()=>{
  fittings('101367',[-650,-325,0,325,650].map(x=>[x,382,-980]),['headBase']);
},warned(14,'Use the longer 101367 dowels, not the short 101359 ones.'));
const headStudXs=[-530,-175,175,530];
step('Prepare the upper headboard','Take the upper headboard from carton 3. Use wrench 113453 to seat the four 114334 studs to their shoulders along its lower edge.',()=>{
  place('headboard',pose(0,62,-1690,rx(-PI/2)),[],down,140,{view:wide});
  tallHead.push(...fittings('114334',headStudXs.map(x=>local('headboard',[x,-311,0])),['headboard'],zs(-1)));
});
step('Lower and fasten the headboard','Lower the upper board over all five dowels. Fit the four 114254 nuts, add the 122998 clips, then finish with the closed end of wrench 113453 as shown.',()=>{
  move(tallHead,[pose(0,865,-1300),pose(0,865,-980),pose(0,690,-980)],['headBase'],down,'Lower onto the keyed headboard dowels',{view:wide});
  const nuts=fittings('114254',headStudXs.map(x=>[x,335,-980]),['headBase','headboard'],up);
  const clips=fittings('122998',headStudXs.map(x=>[x,333,-976]),['headBase','headboard'],zs(-1));
  adjust(nuts,['headBase',...clips],nuts.map(()=>up),'Finish tightening inside the sockets');
});
step('Fit the corner glides','Open packet 2 and take four uprights from carton 4. Screw one 124252 glide onto each upright with a 190018 screw.',()=>{
  for(const [i,s] of [-540,-180,180,540].entries()) {
    const id=`128895-${i+1}`;
    place(id,pose(s,161,1340));
    const glides=fittings('124252',[[s,11,1340]],[id],up);
    corners.push([id,...glides,...fittings('190018',[[s,25,1340]],glides)]);
  }
});
step('Secure all four corners','Protect the floor under the shell corners as shown. Set one complete upright at each corner and use four 109021 screws per upright.',()=>{
  corners.forEach((ids,i)=>{
    const s=ends[i%2], z=ends[Math.floor(i/2)], side=sideIds[i%2], end=boardIds[Math.floor(i/2)];
    const yaw=z===-1 ? (s===-1?0:-PI/2) : (s===-1?PI/2:PI);
    move(ids,[pose(s*647,313,z*926,ry(yaw)),pose(s*647,161,z*926,ry(yaw))],[side,end],down,'Seat the upright and glide together');
    fittings('109021',[82,262].map(y=>[s*674,y,z*913]),[ids[0],side],xs(s));
    fittings('109021',[82,262].map(y=>[s*633,y,z*951]),[ids[0],end],zs(z));
  });
});
step('Install the four carriage rests','Fit one 124249 ledge to the inside of each shell face, with the ledge projecting inward. Use four 109021 screws per ledge.',()=>{
  const rests=[['headBase',0,-953,0,zs(-1)],['foot',0,953,PI,zs(1)],
    ['sideR',-674,100,PI/2,xs(-1)],['sideL',674,100,-PI/2,xs(1)]];
  for(const [i,[board,x,z,yaw,axis]] of rests.entries()) {
    const id=`124249-${i+1}`;
    place(id,pose(x,337,z,ry(yaw)),[board],axis,110);
    fittings('109021',[[-13,-13],[-13,8],[13,-13],[13,8]].map(([a,b])=>local(id,[a,b,-5])),[id,board],axis);
  }
});
step('Fit the foot-end striker','Screw formed striker 124389 to the inner footboard with four 109021 screws. Its folded surface faces the storage cavity.',()=>{
  const id='124389-1';
  place(id,pose(0,320,946,ry(PI)),['foot'],zs(1));
  fittings('109021',[[-21,-19],[-21,19],[21,-19],[21,19]].map(([x,y])=>[x,320+y,953]),[id,'foot'],zs(1));
});
step('Fit the lift receiver bosses','Fit one 123849 boss into the indicated hole on the inside of each bedside.',()=>{
  sideIds.forEach((id,i)=>fittings('123849',[[ends[i]*673,224,-406]],[id],xs(ends[i])));
},warned(18,'Never operate a bare lift linkage by hand. The illustration shows normal operation only with the mechanism fitted and the mattress in place.'));
const mountBolts=[], lowerBolts=[], eyeBushings=[];
step('Stage the stamped L and R linkages','Match the L / R stamps to the picture. Put each guarded unit in with its Full/Double strut still upper-pinned. Insert the first two sleeves and long 123851 bolts, leaving the heads proud.',()=>{
  linkageIds.forEach((id,i)=>{
    const s=ends[i], frame=liftFrame(true,s), side=sideIds[i];
    op('place',[id,springs[i]],[side],Array.from({length:2},()=>[
      pose(...plus(xyz(frame),[-s*212,115,0]),quat(frame)),frame]),[xs(s),xs(s)],
    {caption:'Install the stamped linkage with its upper-pinned strut',captive:{from:1,to:1}});
    const sleeves=fittings('123850',[[s*673,202,-426]],[id,side],xs(s));
    mountBolts.push(...fittings('123851',[[s*622,202,-426]],[id,...sleeves],xs(s)));
  });
},warned(19,'Use the long 123851 bolts, not 123852. Leave their heads proud for now.'));
step('Add the second loose linkage bolts','Insert the second sleeve and long 123851 bolt on each side. Keep both new heads proud for final tightening at step 27.',()=>{
  linkageIds.forEach((id,i)=>{
    const s=ends[i];
    const sleeves=fittings('123850',[[s*673,202,-805]],[id,sideIds[i]],xs(s));
    mountBolts.push(...fittings('123851',[[s*622,202,-805]],[id,...sleeves],xs(s)));
  });
},warned(20,'Do not substitute the shorter 123852 or tighten the long bolts flush yet.'));
step('Fix both linkage bases','Fasten each base at the five smaller holes with 109021 cross-head screws; do not move the large bolts yet.',()=>{
  linkageIds.forEach((id,i)=>fittings('109021',[-835,-765,-672,-555,-465].map((z,j)=>[ends[i]*667,j%2?234:250,z]),[id,sideIds[i]],xs(ends[i])));
});

const inverted=bench(72,rz(PI)), benchDeck=bench(72);
step('Line up the four directional tubes','Lay out all four long carriage tubes with their biased side-hole patterns pointing the same way. Match the uncrossed inset.',()=>{
  railIds.forEach((id,i)=>place(id,transform(inverted,pose(railXs[i],0,0)),[],down,130,{view:{direction:[-.5,.72,.8],span:1640}}));
},warned(21,'Do not reverse two tubes; align the offset hole patterns at the same end.'));
step('Build the steel perimeter and center','Fit both end tubes, using the aligned set for the center pair rather than the offset holes. Use eight 158998 shoulder bolts and key 108490.',()=>{
  endIds.forEach((id,i)=>{
    const s=ends[i];
    place(id,transform(inverted,pose(0,0,s*930)),railIds,zs(-s));
    deck.push(id,...fittings('158998',railXs.map(x=>xyz(transform(inverted,pose(x,0,s*945)))),[id,...railIds],zs(-s),true));
  });
});
step('Brace the underside and turn it over','Fit the transverse brace with four more 158998 bolts: one at each edge and two at the center. Turn the whole carriage over as shown.',()=>{
  place('brace',transform(inverted,pose(0,-30,110)),railIds);
  deck.push('brace',...fittings('158998',railXs.map(x=>xyz(transform(inverted,pose(x,-48,110)))),['brace',...railIds]));
  rigid(deck,[inverted,bench(775,rz(PI/2)),benchDeck],[],down,'Turn the assembled carriage over together',{view:{direction:[-.54,.47,.78],span:1570}});
});
step('Fit both mattress retainers','Mount both hoop retainers with four short 115461 screws and key 100001. Match the pair of identifying holes at the foot end.',()=>{
  for(const [i,id] of ['retainerHead','retainerFoot'].entries()) {
    const s=ends[i];
    place(id,transform(benchDeck,pose(0,40,s*930,i===0?ry(PI):undefined)),[endIds[i]],down,130);
    deck.push(id,...fittings('115461',ends.map(x=>[2200+x*326,72,s*947]),[id,endIds[i]],zs(-s)));
  }
},warned(24,'Use the short 115461 retainer screws, not the 105107 screws reserved for the latch.'));
const lowerFor=s=>plus(xyz(liftFrame(false,s)),lift.lower);
function swing(ids,wasOpen,open,caption,from,to,receivers=linkageIds) {
  rigid(ids,[liftFrame(wasOpen),liftFrame(open)],receivers,open?up:down,caption,
    {view:wide,target:[0,lift.y+100,340],captive:{from,to}});
}
const linkParticipants=[...linkageIds,...springs];
let anchored;
step('Lower the carriage onto both lift receivers','With two people, carry the complete steel carriage to the shell and lower it onto both lift receivers. Align the foot end, then use key 108490 and the six 124584 bolts, three per side.',()=>{
  swing(linkParticipants,true,false,'Bring the paired upper receivers into alignment',1,0,sideIds);
  rigid(deck,[benchDeck,bench(565),pose(0,565,0),pose(0,370,0)],linkageIds,down,'Lower the same carriage onto both receivers',
    {view:wide,target:[0,390,-580]});
  linkageIds.forEach((id,i)=>deck.push(...fittings('124584',lift.mounts.map(z=>[ends[i]*lift.x,386,z]),[railIds[i?3:0],id],down,true)));
  anchored=[...deck,...linkParticipants];
},warned(25,'Two people must carry and lower the carriage. The model does not show a safe way to sustain the frame or any load.'));
step('Insert the two lower-eye bushings','Raise and hold the carriage in the illustrated assembly position. Fit one 123848 bushing in each lower strut eye.',()=>{
  swing(anchored,false,true,'Raise the carriage to expose the two lower eyes',0,1,sideIds);
  springs.forEach((id,i)=>{
    const s=ends[i];
    eyeBushings.push(...fittings('123848',[freeEye(liftFrame(true,s))],[id],xs(s)));
  });
},warned(26,'Keep the carriage held as shown while working on the strut eyes. This is an assembly operation, not normal unloaded lifting.'));
step('Connect both lower strut eyes','Guide each bushed lower eye into its receiver. Fit one short 123852 on each side, still leaving its head proud.',()=>{
  adjust(linkParticipants,sideIds,linkParticipants.map(()=>up),'Seat both upper-pinned strut eyes in the lower receivers',0,{from:1,to:2},0);
  springs.forEach((id,i)=>{
    const s=ends[i], point=lowerFor(s), axis=xs(s);
    move([eyeBushings[i]],[pose(...point,quat(at.get(eyeBushings[i])))],[linkageIds[i],id],down,'Seat the existing bushing at the lower eye');
    lowerBolts.push(...fittings('123852',[[point[0]-24*s,point[1],point[2]]],[linkageIds[i],eyeBushings[i]],axis));
  });
},warned(27,'Keep the carriage held while connecting both struts. Leave the short bolts proud until tightening.'));
step('Tighten all six linkage bolts','Use key 100049 on the four existing long bolts and the two short lower-eye bolts. Tighten them in place; do not add bolts.',()=>{
  const ids=[...mountBolts,...lowerBolts];
  adjust(ids,linkageIds,ids.map((_,i)=>xs(ends[i%2])), 'Seat the six already installed bolt heads',10);
});
const deckPoint=(x,y,z)=>transform(liftFrame(true),pose(x,y,z-lift.z));
step('Fit the strap and latch keeper','Use 110440 pins on keeper 124573 above the foot tube. Fit 124390 underneath with the two longer 105107 screws. Feed the strap through the upper keeper as shown.',()=>{
  const end='deckFoot', keep='124573-1', handle='124390-1', q=quat(liftFrame(true));
  const toward=rotate(down,q), away=rotate(up,q);
  place(keep,deckPoint(0,20,930),[end],toward);
  const pins=fittings('110440',ends.map(s=>xyz(deckPoint(s*19,24,930))),[keep,end],toward);
  place(handle,deckPoint(0,-26,930),[end],away);
  const bolts=fittings('105107',ends.map(s=>xyz(deckPoint(s*19,-37,930))),[handle,end],away);
  adjust([handle],[keep,end],[toward],'Thread the attached strap through its keeper',0,{from:0,to:2},0);
  anchored.push(keep,...pins,handle,...bolts);
});
step('Lower the carriage with two people','Control the complete carriage as it comes down into the shell. Work with a second person as shown.',()=>{
  swing(anchored,true,false,'Lower the same carriage to the shell',2,3,sideIds);
},warned(30,'The booklet shows two people controlling the carriage. Keep clear of the mechanism while it lowers.'));
step('Check the foot-end latch','With the carriage lowered, check the existing latch and folded striker align at the foot end as in the inset.',()=>{
  adjust(['124390-1'],['124389-1','124573-1'],[zs(-1)],'Check the latch against the striker',0,{from:3,to:4},0);
});

step('Cap the 32 sprung slats','Put a two-pin 124663 cap on each end of all 32 Full/Double slats. The 34-slat stock is for another size.',()=>{
  for(let start=0;start<slatIds.length;start+=8) {
    const ids=slatIds.slice(start,start+8), caps=[], paths=[], axes=[];
    const centers=ids.map((_,i)=>[2200+ends[i%2]*334,100,slatRows[(start+i)>>1]]);
    op('place',ids,[],centers.map(([x,y,z])=>[pose(x,y+80,z),pose(x,y,z)]),ids.map(()=>down),
      {view:{direction:[-.5,.67,.76],span:1150}});
    centers.forEach(([x,y,z],i)=>{
      for(const [j,k] of ends.entries()) {
        const id=`124663-${(start+i)*2+j+1}`, q=k===1?ry(PI):undefined;
        slatSets[start+i].push(id);
        caps.push(id); axes.push(xs(-k));
        paths.push([pose(x+k*374,y-1,z,q),pose(x+k*319,y-1,z,q)]);
      }
    });
    op('place',caps,ids,paths,axes,{view:{direction:[-.45,.68,.65],span:1060}});
  }
},warned(31,'Move the bed with two people only when the carriage is lowered. Never carry the bed with the base raised.'));
step('Seat the capped slats on their rails','Keep each slat bowed upward. Press both pins of each cap into the matching holes, between an outside and a center tube.',()=>{
  for(const [i,s] of ends.entries()) {
    const ids=slatSets.filter((_,j)=>j%2===i).flat(), z=slatRows[0];
    move(ids,[pose(s*331,520,z),pose(s*331,391,z)],[railIds[i?3:0],railIds[i?2:1]],down,
      'Press both pins of each cap straight into paired holes',{target:[s*650,385,z],view:{direction:[s*.43,.7,.56],span:390}});
    anchored.push(...ids);
  }
},warned(32,'Do not raise the assembled slatted base without its mattress.'));
step('Place the Full/Double mattress','Lower one separately sold Full/Double mattress onto the slats between the retainers before operating the lift.',()=>{
  place('mattress',pose(0,507,0),[railIds[0],railIds[3],'retainerHead','retainerFoot'],down,340,{view:wide});
  anchored.push('mattress');
},warned(33,'Full/Double mattress maximum: 40 kg (88 lb). A heavier mattress can cause the slatted base to fall suddenly and injure someone.'));
step('Release and raise the loaded base','Pull the strap to disengage the foot-end latch, then lift the base with the mattress in place. The platform, slats and mattress move together.',()=>{
  adjust(['124390-1'],['124389-1','124573-1'],[zs(1)],'Release the latch with the pull strap',0,{from:4,to:3},0);
  swing(anchored,false,true,'Raise the carriage and the installed mattress together',3,2,sideIds);
},warned(34,'Do not enter the cavity or lower the base while anyone is underneath. Do not climb on either the raised slats or the raised mattress.'));
const floorZ=[-625,0,625];
step('Pad the undersides of the three floor panels','Peel and apply 24 adhesive pads in the shown 3–2–3 pattern, eight per panel. Turn all three so the pads face down.',()=>{
  floorIds.forEach((id,i)=>{
    const x=2170,z=floorZ[i], q=i===2?ry(PI):undefined;
    place(id,pose(x,37,z,q));
    const dots=[-218,0,218].flatMap((dz,j)=>(j===1?[-326,326]:[-589,0,589]).map(dx=>[x+dx,45,z+dz]));
    floorSets[i].push(...fittings('157409',dots,[id]));
    move(floorSets[i],[pose(x,385,z,multiply(rz(PI/2),quat(at.get(id)))),pose(x,22,z,multiply(rz(PI),quat(at.get(id))))],[],down,
      'Turn the floor insert with its pads attached');
  });
});
step('Seat the three storage floor inserts','Working from outside, lower the three inserts with the pads down. Put the clipped corners at the four outer corners of the bed.',()=>{
  floorSets.forEach((ids,i)=>{
    const z=floorZ[i], q=quat(at.get(ids[0]));
    move(ids,[pose(1610,511,1050,q),pose(0,449,1050,q),pose(0,129,510,multiply(rx(-PI/9),q)),pose(0,12,z,q)],
      ['headBase','foot'],down,'Lower the padded insert into the storage floor',{view:wide,target:[0,100,z]});
  });
},warned(36,'Do not enter the storage cavity, even during assembly. Install the panels while standing or kneeling outside the bed.'));
