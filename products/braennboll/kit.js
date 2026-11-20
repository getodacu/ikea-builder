import { directWallPage, leftShelfPages, pages } from './manual.js';

const {PI}=Math, half=PI/2;
const up=[0,1,0], down=[0,-1,0], front=[0,0,1], rear=[0,0,-1], right=[1,0,0];
const sides=[-1,1], letters=['L','R'];
const pose=(x,y,z,q=[0,0,0,1])=>[x,y,z,...q];
const xyz=p=>p.slice(0,3);
const q=p=>p.slice(3);
const rx=a=>[Math.sin(a/2),0,0,Math.cos(a/2)];
const ry=a=>[0,Math.sin(a/2),0,Math.cos(a/2)];
const rz=a=>[0,0,Math.sin(a/2),Math.cos(a/2)];
const inverse=([x,y,z,w])=>[-x,-y,-z,w];
const plus=(a,b)=>a.map((v,i)=>v+b[i]);
const scale=(a,k)=>a.map(v=>v*k);
const cross=([a,b,c],[x,y,z])=>[b*z-c*y,c*x-a*z,a*y-b*x];
const unit=a=>scale(a,1/Math.hypot(...a));
function rotate(v,r) {
  const t=scale(cross(r,v),2);
  return plus(v,plus(scale(t,r[3]),cross(r,t)));
}
function mult(a,b) {
  return [...plus(plus(scale(xyz(a),b[3]),scale(xyz(b),a[3])),cross(a,b)),a[3]*b[3]-a[0]*b[0]-a[1]*b[1]-a[2]*b[2]];
}
const apply=(a,b)=>pose(...plus(xyz(a),rotate(xyz(b),q(a))),mult(q(a),q(b)));
function facing(axis) {
  const outward=scale(axis,-1);
  return outward[1]<-.999 ? rx(PI) : unit([...cross(up,outward),1+outward[1]]);
}

// +x right, +y up, +z front; millimetres. Interior points are diagram estimates.
export const frame = {
  x:484, z:336, top:1784, desk:755, bottom:105, camZ:[-214,0,214],
  shelfY:[1100,1585], wallDirect:-350, wallSpaced:-384,
  anchorY:1718, spacerY:1750
};
const {x,z,top,desk,bottom,camZ,shelfY,anchorY,spacerY}=frame;
export const shapes = {
  side:[24,1764,696], notchRail:[952,24,24], plainRail:[952,24,24], rearRail:[952,24,24],
  hingedRail:[952,28,30], lowRail:[952,26,24], roof:[1000,12,704], smallAngle:[36,40,25],
  footShelf:[380,18,648], meshUpper:[944,499,12], meshLower:[944,500,12], largeAngle:[61,62,42],
  trough:[442,26,111], hook:[20,124,38], desktop:[944,22,655], lowerFelt:[6,900,650],
  shelfBracket:[26,75,235], shelfBoard:[927,17,246], shelfEdge:[900,19,18],
  hinge:[38,25,41], door:[494,1736,26], pull:[42,91,24], sticker:[17,1,17], wallFixing:[12,81,12],
  hexBolt:[12,14,12], longBolt:[10,58,10], crossBolt:[11,29,11], flatBolt:[10,18,10],
  shortFlat:[9,13,9], machine:[11,12,11], trayBolt:[8,8,8], pullBolt:[10,13,10],
  camStud:[8,34,8], cam:[17,12,17], leveler:[29,24,29], pushClip:[11,14,11],
  dowel:[8,29,8], sleeve:[12,11,12], smallPin:[9,14,9], upperPin:[10,32,10], lowerPin:[11,25,11],
  woodScrew:[8,18,8], edgeScrew:[8,23,8], bushing:[27,6,27], hexKey:[23,82,7],
  spacer:[34,43,24], knob:[23,17,23], wallCap:[30,10,30], wallWasher:[25,4,25]
};
export const families={};
export const parts=new Map();
const steel='Steel frame', surfaces='Work surfaces', soft='Felt and door pieces';
function stock(family,name,shape,group,page,entries,number=null,role='kit') {
  families[family]={name,number,group,page,role};
  for(const [id,a,h,b,r] of entries) parts.set(id,{id,family,shape,packet:group,unpacked:pose(a,h,b,r)});
}
stock('side','Steel side frame with upper felt','side',steel,8,[['sideR',-1190,12,-985,rz(half)],['sideL',-1190,12,-205,rz(-half)]]);
stock('notchRail','Notched desk crossrail','notchRail',steel,8,[['notchRail',-280,12,280]]);
stock('plainRail','Plain desk crossrail','plainRail',steel,9,[['plainRail',-280,12,340]]);
stock('rearRail','Perforated rear crossrail','rearRail',steel,10,[['rearRail',-280,12,400]]);
stock('hingedRail','Crossrail with two hinge tabs','hingedRail',steel,11,[['hingedRail',-280,16,460]]);
stock('lowRail','Low captive crossrail','lowRail',steel,14,[['lowRail',-280,13,520]]);
stock('roof','Steel top panel','roof',steel,12,[['roof',-15,6,-1210]]);
stock('smallAngle','Small corner angle','smallAngle',steel,13,sides.flatMap((s,i)=>sides.map((_,j)=>[`smallAngle${i*2+j+1}`,-705+j*68,21,100+i*60])).concat([['smallAngle5',-568,21,100]]));
stock('largeAngle','Large perforated corner angle','largeAngle',steel,24,[['largeAngleL',-490,31,100],['largeAngleR',-420,31,100]]);
stock('meshUpper','Upper open back mesh','meshUpper',steel,23,[['meshUpper',145,8,-490,rx(-half)]]);
stock('meshLower','Lower open back mesh','meshLower',steel,23,[['meshLower',145,8,35,rx(-half)]]);
stock('trough','Cable trough','trough',steel,25,[['trough',-90,13,625]]);
stock('hook','Cable trough hook','hook',steel,25,[['hookL',188,62,600],['hookR',246,62,600]]);
stock('footShelf','Reversible foot shelf','footShelf',surfaces,16,[['footShelf',520,9,385]]);
stock('desktop','Fixed desktop and prehinged leaf','desktop',surfaces,26,[['desktop',690,11,-1210]]);
stock('shelfBoard','Internal shelf board','shelfBoard',surfaces,30,[['shelfHigh',881,9,-715],['shelfLow',881,9,-433]]);
stock('shelfEdge','Internal shelf edge rail','shelfEdge',surfaces,30,[['edgeHigh',880,9,-248],['edgeLow',880,9,-193]]);
stock('shelfBracket','Hook-in shelf bracket','shelfBracket',surfaces,30,sides.flatMap((_,i)=>sides.map((s,j)=>[`shelfBracket${i+1}${letters[j]}`,761+(i*2+j)*72,37,119])));
stock('lowerFelt','Notched lower felt side insert','lowerFelt',soft,28,[['feltL',1120,7,-1498,rz(-half)],['feltR',1120,7,-802,rz(half)]]);
stock('hinge','Lower hinge plate','hinge',soft,32,[['hingeL',775,12,300],['hingeR',846,12,300]]);
stock('door','Steel and felt door with castor','door',soft,32,[['doorL',1930,14,-1417,rz(-half)],['doorR',1930,14,-880,rz(-half)]]);
stock('pull','Half-moon door pull','pull',soft,33,[['pullL',950,45,279],['pullR',1010,45,279]]);
const p6=[['100214','Long hex shelf screw','longBolt',2],['101350','Desktop dowel','dowel',2],
  ['157421','Desktop machine screw','crossBolt',6],['101083','Long countersunk screw','flatBolt',2],
  ['117784','Hex frame bolt','hexBolt',8],['100404','Door pull bolt','pullBolt',4],
  ['107622','Round-head frame screw','machine',22],['10098369','Short countersunk screw','shortFlat',10],
  ['100498','Foot shelf cam stud','camStud',3],['102533','Foot shelf cam lock','cam',3],
  ['130884','Shelf expansion sleeve','sleeve',8],['130886','Shelf push pin','smallPin',8],
  ['195362','Top hinge pin','upperPin',2],['151059','Bottom hinge pivot pin','lowerPin',2],
  ['10046004','Threaded leveling foot','leveler',4],['10106860','Push clip','pushClip',35],
  ['101065','Hinge ring screw','woodScrew',2],['109535','Shelf edge screw','edgeScrew',8],
  ['190226','Short cable trough screw','trayBolt',2],['10002420','Door hinge ring','bushing',2]];
const p7=[['100092','Hex key','hexKey',1,'tool'],['141413','Spacer bracket with captive studs','spacer',2],
  ['141414','Threaded spacer knob','knob',2],['133303','Wall fixing cover','wallCap',2],['126916','Dished wall washer','wallWasher',2]];
for(const [j,inventory] of [p6,p7].entries()) {
  let slot=0;
  for(const [number,name,shape,count,role] of inventory) {
    stock(number,name,shape,`Fittings · p. ${j+6}`,j+6,Array.from({length:count},(_,i)=>{
      const n=slot++;
      return [`${number}-${i+1}`,-1328+(n%20)*53,shapes[shape][1]/2,755+j*340+Math.floor(n/20)*57];
    }),number,role);
  }
}
stock('camCover','Adhesive cam cover','sticker','Cam covers',20,Array.from({length:6},(_,i)=>[`camCover-${i+1}`,-720+i*40,1,1104]));
stock('wallFixing','Wall fixing position (illustrative)','wallFixing','Required, not supplied',2,
  sides.map((_,i)=>[`wallFixing-${i+1}`,115+i*80,8,1104,rx(half)]),null,'external');

const titles=[
  'Key the notched crossrail','Fit the plain crossrail','Join the second side frame','Fit the perforated rear rail','Fit the rail with hinge tabs',
  'Seat the steel top','Fasten the steel top','Brace the inner corners','Engage the low rail','Fit the leveling feet',
  'Set the foot shelf studs','Seat the foot shelf','Lock the foot shelf cams','Brace the open corner and stand the frame','Tighten the captive rail screws',
  'Secure the foot shelf through the rail','Mount the upper back mesh','Join the lower back mesh','Brace the upper rear corners','Fasten both mesh panels',
  'Build the cable tray','Hang the cable tray','Set the desktop dowels','Seat the desktop','Fasten the desktop through the frame',
  'Secure the desktop at the angles','Align the lower felt inserts','Fold the felt inserts into place','Clip the remaining felt edges',
  'Hook in the shelf brackets','Fit the shelf edge rails','Lower both shelves into position','Seat the shelf sleeves and pins',
  'Fit the lower hinge plates','Prepare the tops of both doors','Fit both door pulls','Set the lower pivot pins',
  'Hang the left door','Pin the left top hinge','Hang the right door','Pin the right top hinge','Level the cabinet',
  'Start the wall attachment','Adjust the wall spacers','Finish the wall attachment'
];
export const steps=titles.map((title,i)=>({number:i+1,title}));
export const wallWarning='Tip-over can cause serious or fatal crushing injuries. Secure the cabinet with the supplied wall attachment devices before use. Wall screws and plugs are not included: use fixings suitable for your wall and seek professional advice if uncertain.';
const secure={text:wallWarning,page:2};
const twoPeople={text:'Use two people and protect the work surface.',page:5};
const laid=a=>pose(0,-348*Math.sin(a),-z+z*Math.cos(a),rx(a));

export function orderedSteps({footShelfSide,skirting}) {
  const s=footShelfSide==='left'?-1:1, side=s===1?'sideR':'sideL', other=s===1?'sideL':'sideR';
  const at=new Map(), used={}, records=[];
  let operations, datum=laid(-half);
  const a=p=>apply(datum,p), vec=v=>rotate(v,q(datum));
  const p=(xx,yy,zz,r)=>a(pose(xx,yy,zz,r));
  const mountX=(sign,inward=true)=>[sign*(inward?-1:1),0,0];
  const doorX=sign=>sign*484;
  const doorPivot=sign=>pose(doorX(sign),104,350);
  const meshPose=s===1?ry(0):ry(PI);
  const doorBundle=[];
  function add(action,build,warning) {
    operations=[];
    build();
    const {number,title}=steps[records.length];
    const page=number===43&&!skirting?directWallPage:s===-1&&number>=11&&number<=16?leftShelfPages[number-11]:pages[number-1];
    records.push({number,title,page,action,operations,warning});
  }
  function op(kind,ids,prerequisites,poses,axes,{caption,previewBores,captive,rigid,view}={}) {
    const axis=axes[0], target=xyz(poses[0].at(-1));
    operations.push({kind,ids,prerequisites,poses,axes,captive,rigid,previewBores,
      joint:{target,axis,outward:scale(axis,-1),receivers:prerequisites,caption:caption??families[parts.get(ids[0]).family].name,view}});
    ids.forEach((id,i)=>at.set(id,poses[i].at(-1)));
    return ids;
  }
  function place(id,end,prerequisites=[],axis=down,distance=95,waypoints=[],options) {
    const start=pose(...plus(xyz(end),scale(axis,-distance)),q(end));
    return op('place',[id],prerequisites,[[start,...waypoints,end]],[axis],options);
  }
  const seat=(id,loc,prerequisites=[],axis=down,distance)=>place(id,a(loc),prerequisites,vec(axis),distance);
  function fittings(key,points,prerequisites,axis=down,{caseDatum=true,previewBores=false}={}) {
    const ids=points.map(()=>`${key}-${used[key]=(used[key]??0)+1}`);
    const axes=points.map((_,i)=>Array.isArray(axis[0])?axis[i]:axis);
    const ends=points.map((pt,i)=>{
      const f=pose(...pt,facing(axes[i]));
      return caseDatum?a(f):f;
    });
    const worldAxes=caseDatum?axes.map(vec):axes;
    return op('place',ids,prerequisites,ends.map((e,i)=>[pose(...plus(xyz(e),scale(worldAxes[i],-47)),q(e)),e]),worldAxes,{previewBores});
  }
  function move(ids,frames,prerequisites,axis,caption,view) {
    const anchor=ids[0], initial=at.get(anchor), inv=q(initial);
    const local=pose(...rotate(scale(xyz(initial),-1),inverse(inv)),inverse(inv));
    const offsets=ids.map(id=>apply(local,at.get(id)));
    const paths=offsets.map((offset,i)=>[at.get(ids[i]),...frames.map(f=>apply(f,offset))]);
    return op('move',ids,prerequisites,paths,ids.map(()=>axis),{rigid:{anchor,frames:[initial,...frames],offsets},caption,view});
  }
  function twist(ids,receivers,axes,angle,travel,caption,from=0,to=1) {
    const paths=ids.map((id,i)=>{
      const start=at.get(id);
      return [start,pose(...plus(xyz(start),scale(axes[i],travel[i]??0)),mult(q(start),ry(angle)))];
    });
    return op('adjust',ids,receivers,paths,axes,{captive:{from,to},caption});
  }
  function fold(ids,receivers,axis,caption,from=0,to=1) {
    return op('adjust',ids,receivers,ids.map(id=>[at.get(id),at.get(id)]),ids.map(()=>axis),{captive:{from,to},caption});
  }
  const levelFeet=[];
  const deskFront=-40, deskRear=-302;
  function frameBolts(signs,y,depth,rail) {
    const locations=signs.map(sign=>[sign*485,y,depth]);
    const receivers=signs.map(sign=>sign===1?'sideR':'sideL');
    fittings('117784',locations,[rail,...receivers],signs.map(sign=>mountX(sign)),{previewBores:true});
  }
  function corner(id,xx,yy,zz,angle,receiver,rail) {
    seat(id,pose(xx,yy,zz,ry(angle)),[receiver,rail],front,75);
    fittings('107622',[[xx,yy-10,zz+12],[xx+Math.sign(xx)*12,yy+7,zz]],[id,receiver,rail],
      [down,mountX(Math.sign(xx),false)]);
  }

  add('On a protected surface, key the notched crossrail into the first side frame. Match its small face hole and two edge notches. Fit one 117784 with the supplied hex key.',()=>{
    seat('sideR',pose(x,906,0));
    seat('notchRail',pose(0,desk,deskFront),['sideR'],right,130);
    frameBolts([1],desk,deskFront,'notchRail');
  },twoPeople);
  add('Key the plain crossrail into the other socket. The forbidden rail has an extra small hole. Secure it with 117784 and the hex key.',()=>{
    seat('plainRail',pose(0,desk,deskRear),['sideR'],right,130);
    frameBolts([1],desk,deskRear,'plainRail');
  });
  add('Bring the second side frame over both square rail ends; secure each with 117784.',()=>{
    seat('sideL',pose(-x,906,0),['notchRail','plainRail'],right,210);
    frameBolts([-1],desk,deskFront,'notchRail');
    frameBolts([-1],desk,deskRear,'plainRail');
  });
  add('Slot in the rail with the row of holes at the upper rear, facing as shown. Secure both ends with the hex key.',()=>{
    seat('rearRail',pose(0,top,-z),['sideL','sideR'],up,118);
    frameBolts(sides,top,-z,'rearRail');
  });
  add('Install the upper front crossrail with the two projecting hinge tabs. Secure its ends with 117784.',()=>{
    seat('hingedRail',pose(0,top,z),['sideL','sideR'],rear,118);
    frameBolts(sides,top,z,'hingedRail');
  });
  add('Catch the steel top under both front tabs, then swing its free edge down. Check the two frame corners are flush.',()=>{
    const roof=a(pose(0,1794,0));
    const tilt=b=>a(apply(pose(0,1794,z,rx(b)),pose(0,0,-z)));
    place('roof',roof,['hingedRail','rearRail','sideL','sideR'],vec(down),90,[tilt(.36),tilt(.17)]);
  });
  add('Fasten the top in four pairs with eight short 10098369 screws. Do not use the longer 101083 here.',()=>{
    fittings('10098369',sides.flatMap(sign=>sides.flatMap(depth=>[sign*477,sign*455].map(xx=>[xx,1797,depth*321]))),['roof','sideL','sideR'],down,{previewBores:true});
  });
  add('Fasten four small angles with two 107622 each. Follow the illustrated flange direction and leave the larger perforated angles for the rear.',()=>{
    for(const [i,sign] of sides.entries()) for(const [j,depth] of [deskRear,deskFront].entries()) {
      corner(`smallAngle${i*2+j+1}`,sign*445,desk+(j?16:-16),depth,sign===1?0:PI,`side${letters[i]}`,j?'notchRail':'plainRail');
    }
  });
  let railScrews;
  add('Start two 107622 at the low rear corners and leave their heads proud. Tip the low crossrail onto them as shown.',()=>{
    railScrews=fittings('107622',sides.map(sign=>[sign*454,bottom,-315]),['sideL','sideR'],rear);
    place('lowRail',p(0,bottom,-z),railScrews,vec(rear),100,[p(0,bottom+12,-z+25,rx(-.55))]);
  });
  add('Thread a leveling foot into each of the four leg ends.',()=>{
    levelFeet.push(...fittings('10046004',sides.flatMap(sign=>sides.map(depth=>[sign*x,16,depth*z])),['sideL','sideR'],up));
  });
  const shelfAxis=mountX(s,false);
  let camStuds;
  add(`From the front, select the ${footShelfSide} bay. Install three 100498 studs into that side’s lower crossmember from inside.`,()=>{
    camStuds=fittings('100498',camZ.map(zz=>[s*459,bottom,zz]),[side],shelfAxis,{previewBores:true});
  });
  add(`Slide the foot shelf onto the three studs on the ${footShelfSide}. The rounded edge points into the open bay.`,()=>{
    seat('footShelf',pose(s*283,bottom,0,meshPose),camStuds,shelfAxis,135);
  });
  add(`Insert and turn the three cam locks around the stud heads.${s===-1?' Peel and apply three covers over the locked cams as shown.':''}`,()=>{
    const loc=camZ.map(zz=>[s*443,100,zz]);
    const cams=fittings('102533',loc,['footShelf',...camStuds],up,{previewBores:true});
    twist(cams,['footShelf'],cams.map(()=>vec(up)),half,[],'Turn each cam onto its stud');
    if(s===-1) fittings('camCover',loc.map(([xx,,zz])=>[xx,95,zz]),cams,up);
  });
  add(`Fasten the fifth small angle at the opposite, ${s===1?'left':'right'} corner. With two people, turn the assembled frame upright.`,()=>{
    corner('smallAngle5',-s*451,bottom+23,-310,s===1?PI:0,other,'lowRail');
    const sideAt=pose(x,906,0);
    const members=['sideR',...[...at.keys()].filter(id=>id!=='sideR')];
    move(members,[-PI/3,-PI/6,0].map(angle=>apply(laid(angle),sideAt)),[],up,'Turn the frame and attached stock upright',
      {direction:[.58,.48,1],span:2280});
    datum=pose(0,0,0);
  },twoPeople);
  add('Now tighten the same two low-rail screws flush. Do not add another pair.',()=>{
    twist(railScrews,['lowRail','sideL','sideR'],[rear,rear],PI,[5,5],'Seat the two proud screw heads');
  });
  add(`From the rear, use the hex key to fasten the ${footShelfSide} foot shelf through the low crossrail with two long 100214 screws. Both routes resume at page 23.`,()=>{
    fittings('100214',[s*204,s*400].map(xx=>[xx,bottom,-336]),['lowRail','footShelf'],front,{previewBores:true});
  });
  const upperY=1522, lowerY=1022;
  const meshX=xs=>xs.map(xx=>s*xx);
  add('Seat the upper back mesh. Use three 10106860 push clips at the top edge, not the screw shown crossed out. Turn four side tabs with a slotted screwdriver.',()=>{
    seat('meshUpper',pose(0,upperY,-z,meshPose),['rearRail','sideL','sideR'],front,148);
    fittings('10106860',meshX([-285,0,285]).map(xx=>[xx,1773,-333]),['meshUpper','rearRail'],up,{previewBores:true});
    fold(['meshUpper'],['sideL','sideR'],front,'Turn four captive side tabs',0,s);
  });
  add('Bring in the lower back mesh. Turn its four side tabs, then fold the three joining tabs at the seam.',()=>{
    seat('meshLower',pose(0,lowerY,-z,meshPose),['meshUpper','sideL','sideR'],front,148);
    fold(['meshLower'],['sideL','sideR'],front,'Turn four captive side tabs',0,s);
    fold(['meshLower'],['meshUpper'],up,'Turn three captive seam tabs',s,s*2);
  });
  add('Fasten the two large perforated corner angles at the top rear with two 107622 each.',()=>{
    sides.forEach((sign,i)=>corner(`largeAngle${letters[i]}`,sign*451,1747,-317,sign===1?0:PI,`side${letters[i]}`,'rearRail'));
  });
  add('Fit six 107622 at the remaining mesh edge locations.',()=>{
    fittings('107622',meshX([-459,459]).flatMap(xx=>[790,1249,1289].map(yy=>[xx,yy,-344])),
      ['meshUpper','meshLower','sideL','sideR'],front,{previewBores:true});
  });
  const trayStage=pose(-215,26,670), traySet=pose(0,647,-257);
  let trayScrews;
  add('Place the two hooks under the loose cable trough and join the parts with two short 190226 screws.',()=>{
    place('trough',trayStage);
    for(const [i,sign] of sides.entries()) place(`hook${letters[i]}`,pose(-215+sign*150,74,624),['trough'],up);
    trayScrews=fittings('190226',sides.map(sign=>[-215+sign*150,26,647]),['trough','hookL','hookR'],down,{caseDatum:false});
  });
  add('Lower the same trough and both hooks over the rear desk crossrail.',()=>{
    move(['trough','hookL','hookR',...trayScrews],[pose(0,844,-120),pose(0,780,-257),traySet],['plainRail','meshLower'],down,'Hang both cable tray hooks on the rail');
  });
  const desktopStage=pose(100,18,1150,rx(PI));
  let dowels;
  add('Lay the single hinged desktop assembly on protection, underside up. Insert two dowels in the indicated holes.',()=>{
    place('desktop',desktopStage);
    dowels=fittings('101350',sides.map(sign=>[100+sign*367,34,1150+deskRear]),['desktop'],down,{caseDatum:false,previewBores:true});
  });
  add('Turn the top over and lower it with the leaf level. Seat the same two dowels in their rail receivers.',()=>{
    move(['desktop',...dowels],[pose(100,382,939,rx(PI*.56)),pose(0,943,0),pose(0,778,0)],['plainRail','notchRail'],down,'Lower the dowelled desktop');
  });
  add('Secure the top from underneath with all six 157421 screws through the frame.',()=>{
    fittings('157421',sides.flatMap(sign=>[deskRear,-180,deskFront].map(zz=>[sign*451,755,zz])),['desktop','sideL','sideR','plainRail','notchRail'],up,{previewBores:true});
  });
  add('Secure the final two points from below through the small angles. Use 101083, not short 10098369.',()=>{
    fittings('101083',sides.map(sign=>[sign*445,763,17]),['desktop','smallAngle2','smallAngle4'],up,{previewBores:true});
  });
  const fabricOpen=sign=>apply(pose(sign*485,555,-z+8,ry(sign*.72)),pose(0,0,z-8));
  const fabricSet=sign=>pose(sign*485,555,0);
  const feltClips=[];
  add('Bring in both lower felt inserts. Align each notched edge with the desktop rail, and start five push clips at each rear edge.',()=>{
    for(const [i,sign] of sides.entries()) {
      const id=`felt${letters[i]}`;
      place(id,fabricOpen(sign),[`side${letters[i]}`,'desktop'],mountX(sign),125);
      feltClips.push(fittings('10106860',[148,335,550,716,962].map(yy=>[sign*481,yy,-z+8]),[id,`side${letters[i]}`],mountX(sign),{previewBores:true}));
    }
  });
  add('Swing the two inserts into the side frames and fold the captive flanges around the rail and upright edges at the six indicated positions.',()=>{
    for(const [i,sign] of sides.entries()) {
      const id=`felt${letters[i]}`;
      move([id,...feltClips[i]],[fabricSet(sign)],[`side${letters[i]}`],mountX(sign),'Swing the attached felt insert onto the side frame');
      fold([id],[`side${letters[i]}`],mountX(sign),'Fold the captive insert edge flanges');
    }
  });
  add('Press the remaining 22 clips into both lower side insert edges, 11 on each side.',()=>{
    for(const [i,sign] of sides.entries()) {
      const loc=[-232,-62,112].flatMap(zz=>[[sign*485,113,zz],[sign*485,994,zz]])
        .concat([150,341,552,712,952].map(yy=>[sign*485,yy,z-12]));
      fittings('10106860',loc,[`felt${letters[i]}`,`side${letters[i]}`],loc.map((_,j)=>j<6?(j%2?up:down):mountX(sign)),{previewBores:true});
    }
  });
  add('Insert both hooks of each of the four shelf brackets into the upright slots, then lower the brackets onto their stops.',()=>{
    for(const [i,yy] of shelfY.entries()) for(const [j,sign] of sides.entries()) {
      const xx=sign*466, id=`shelfBracket${i+1}${letters[j]}`;
      place(id,pose(xx,yy,-219),[`side${letters[j]}`,'meshUpper','meshLower'],rear,104,
        [pose(xx,yy+12,-197),pose(xx,yy+12,-219)]);
    }
  });
  const shelfStage=[pose(284,19,710,rx(PI)),pose(284,19,1031,rx(PI))];
  const shelfBundles=[];
  add('Join each loose shelf and its edge rail with four 109535 screws. Do not substitute 101065.',()=>{
    for(const [i,label] of ['Low','High'].entries()) {
      const [xx,yy,zz]=shelfStage[i];
      const board=`shelf${label}`, edge=`edge${label}`;
      place(board,shelfStage[i]);
      place(edge,pose(xx,yy+11,zz+105,rx(PI)),[board]);
      shelfBundles.push([board,edge,...fittings('109535',[-373,-121,121,373].map(bx=>[xx+bx,38,zz+106]),[edge,board],down,{caseDatum:false,previewBores:true})]);
    }
  });
  add('Lower both shelf and edge-rail assemblies onto the four brackets together with their screws, aligning the middle locators.',()=>{
    shelfBundles.forEach((ids,i)=>move(ids,[pose(210,320,651,rx(half)),pose(0,shelfY[i]+205,-214),pose(0,shelfY[i]+17,-214)],
      [`shelfBracket${i+1}L`,`shelfBracket${i+1}R`],down,'Lower the shelf onto both brackets'));
  });
  add('Insert an expansion sleeve and then its pin at each of the eight shelf holes. Push each pin fully flush.',()=>{
    for(const [i,yy] of shelfY.entries()) {
      const label=i?'High':'Low';
      const loc=sides.flatMap(sign=>[-294,-133].map(zz=>[sign*451,yy+8,zz]));
      const sleeves=fittings('130884',loc,[`shelf${label}`,`shelfBracket${i+1}L`,`shelfBracket${i+1}R`],up,{previewBores:true});
      fittings('130886',loc.map(([xx,py,zz])=>[xx,py-4,zz]),sleeves,up);
    }
  });
  add('Hook both lower hinge plates into the front upright slots and swing them down. Secure each with a short 10098369.',()=>{
    for(const [i,sign] of sides.entries()) {
      const xx=doorX(sign), id=`hinge${letters[i]}`;
      place(id,pose(xx,102,350),[`side${letters[i]}`],rear,75,[pose(xx,106,362,rx(-half)),pose(xx,105,351,rx(-.45))]);
      fittings('10098369',[[xx,115,347]],[id,`side${letters[i]}`],rear,{previewBores:true});
    }
  });
  const doorStage=[pose(-260,27,1980,rx(half)),pose(278,27,1980,rx(half))];
  const doorRelative=pose(0,802,0);
  const doorFrame=(sign,angle)=>apply(pose(...xyz(doorPivot(sign)),ry(sign*angle)),doorRelative);
  add('On the two loose door assemblies, fit one ring and 101065 screw per top hinge corner. The lower castors are already on the door units.',()=>{
    for(const [i,sign] of sides.entries()) {
      const id=`door${letters[i]}`, stage=doorStage[i];
      place(id,stage);
      const hole=apply(stage,pose(0,858,-12));
      const rings=fittings('10002420',[xyz(hole)],[id],down,{caseDatum:false});
      const screws=fittings('101065',[xyz(hole)],[id,...rings],down,{caseDatum:false});
      doorBundle.push([id,...rings,...screws]);
    }
  });
  add('Fasten both pull sleeves to the inner door stiles with two 100404 each.',()=>{
    for(const [i,sign] of sides.entries()) {
      const id=`pull${letters[i]}`, stage=doorStage[i], off=-sign*475;
      place(id,apply(stage,pose(off,0,9)),[doorBundle[i][0]],down,65);
      const screws=fittings('100404',[-29,29].map(yy=>xyz(apply(stage,pose(off,yy,-16)))),[id,doorBundle[i][0]],down,{caseDatum:false});
      doorBundle[i].push(id,...screws);
    }
  });
  add('Seat the two lower pivot pins in the hinge plate openings.',()=>{
    fittings('151059',sides.map(sign=>[doorX(sign),109,350]),['hingeL','hingeR'],down,{previewBores:true});
  });
  const hang=(i,sign)=>{
    const base=doorPivot(sign);
    const pivot=(y,angle,lean)=>apply(pose(base[0],base[1]+y,base[2],mult(ry(sign*angle),rz(sign*lean))),doorRelative);
    return move(doorBundle[i],[pivot(208,1.05,.12),pivot(44,.95,.075),pivot(0,.95,.075),doorFrame(sign,.95)],
      [`hinge${letters[i]}`,`151059-${i+1}`],down,`Lower the ${i?'right':'left'} door onto its bottom pivot`);
  };
  const turnDoor=(i,sign,angles,caption,requiresPin=true)=>move(doorBundle[i],angles.map(angle=>doorFrame(sign,angle)),
    [requiresPin?`195362-${i+1}`:`151059-${i+1}`],front,caption);
  const pin=(i,sign)=>{
    const id=`door${letters[i]}`;
    fittings('195362',[[doorX(sign),1770,350]],['hingedRail',id],down,{previewBores:true});
  };
  add('Tilt the left door and lower it onto the first pivot. Keep its attached ring, pull and castor with the door.',()=>hang(0,-1));
  add('Seat the first 195362 in the upper hinge, checking the underside seating shown. Swing the pinned left door closed.',()=>{
    pin(0,-1);
    turnDoor(0,-1,[.48,0],'Swing the pinned left door closed');
  });
  add('Tilt and seat the right door onto its own bottom pivot, without disturbing the left door.',()=>hang(1,1));
  add('Seat and check the second 195362 in the upper hinge. Keep the right door open as illustrated.',()=>pin(1,1));
  add('Close the doors. Use a spirit level on the top and turn the installed feet as needed until level and the upper door edges are flush. Then select whether the wall has a baseboard.',()=>{
    turnDoor(1,1,[.48,0],'Close the right door to check alignment');
    twist(levelFeet,['sideL','sideR'],levelFeet.map(()=>down),PI,[4,2,1,4],'Turn the four captive leveling feet');
  },secure);

  function anchor() {
    turnDoor(1,1,[.48,.95],'Open the right door to access the two wall points');
    const receivers=['sideL','sideR'];
    const loc=sides.map(sign=>[sign*x,anchorY,-320]);
    const washers=fittings('126916',loc,receivers,rear,{previewBores:true});
    fittings('wallFixing',loc.map(([xx,yy])=>[xx,yy,-355]),[...receivers,...washers],rear);
    fittings('133303',loc.map(([xx,yy])=>[xx,yy,-312]),washers,rear);
  }
  const fixText='Open for access. At both upper rear points, face each supplied 126916 washer as pictured, secure through it with suitable wall fixings, then click a cover into place.';
  if(!skirting) {
    add(`Without a baseboard, attach directly to the wall; do not install spacers. ${fixText}`,anchor,secure);
    return records;
  }
  let plugs, knobs;
  add('With a baseboard, first seat both spacer brackets on the upper rear uprights using their integral studs. Thread on the two knobs. Do not perform direct attachment on page 38.',()=>{
    const loc=sides.map(sign=>[sign*x,spacerY,-349]);
    plugs=fittings('141413',loc,['sideL','sideR'],front,{previewBores:true});
    knobs=fittings('141414',loc.map(([xx,yy])=>[xx,yy,-363]),plugs,front);
  },secure);
  add('Let the baseboard set the lower offset, then turn both spacer knobs out to meet the wall above it. The model is not an installation measurement.',()=>{
    twist(knobs,plugs,[rear,rear],PI,[12.5,12.5],'Adjust both captive knobs to the wall plane');
  },secure);
  add(fixText,anchor,secure);
  return records;
}
