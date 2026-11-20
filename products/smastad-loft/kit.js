import { pages } from './manual.js';

export const shapes={
  gableNarrow:[26,1813,390],gableWide:[26,1813,708],rearRail:[1908,399,28],frontRail:[1908,88,28],
  sideGuard:[30,399,1058],frontGuard:[1404,399,22],brace:[1382,130,26],slat:[172,20,998],
  angle:[1888,23,30],stileBored:[30,1814,78],stilePlain:[30,1814,78],tread:[473,26,76],
  strip:[429,2,53],gripDeep:[28,168,32],gripShallow:[10,168,32],glide:[24,8,38],
  joinStud:[16,71,16],woodScrew:[12,62,12],mediumBolt:[12,39,12],shortBolt:[12,20,12],
  camStud:[9,40,9],wideCam:[23,13,23],dowel:[8,30,8],sleeve:[13,16,13],railScrew:[8,14,8],
  largeCam:[56,15,56],camCap:[57,5,57],crossBolt:[14,77,14],carrier:[23,19,23],
  smallCam:[18,11,18],longDowel:[9,46,9],nut:[11,6,11],spanner:[113,7,25],
  largeKey:[48,8,136],hexKey:[32,5,106],offsetKey:[54,5,70]
};
export const families={}, parts=new Map();
const {PI}=Math, I=[0,0,0,1];
const X=[1,0,0], Y=[0,1,0], Z=[0,0,1], down=[0,-1,0];
const add=(a,b)=>a.map((v,i)=>v+b[i]), scale=(v,k)=>v.map(x=>k*x), minus=(a,b)=>add(a,scale(b,-1));
const cross=([x,y,z],[a,b,c])=>[y*c-z*b,z*a-x*c,x*b-y*a];
const axisQ=(axis,a)=>[...scale(axis,Math.sin(a/2)),Math.cos(a/2)];
const rx=a=>axisQ(X,a), ry=a=>axisQ(Y,a), rz=a=>axisQ(Z,a);
const mult=(a,b)=>[...add(add(scale(a.slice(0,3),b[3]),scale(b.slice(0,3),a[3])),cross(a,b)),
  a[3]*b[3]-a[0]*b[0]-a[1]*b[1]-a[2]*b[2]];
function rot(v,q) {
  const t=scale(cross(q,v),2);
  return add(v,add(scale(t,q[3]),cross(q,t)));
}
const p=(x,y,z,q=I)=>[x,y,z,...q], xyz=a=>a.slice(0,3), quat=a=>a.slice(3);
const identity=p(0,0,0);
const shift=(a,v)=>p(...add(xyz(a),v),quat(a));
const apply=(a,b)=>p(...add(xyz(a),rot(xyz(b),quat(a))),mult(quat(a),quat(b)));
function local(a,b) {
  const q=[-a[3],-a[4],-a[5],a[6]];
  return p(...rot(minus(xyz(b),xyz(a)),q),mult(q,quat(b)));
}
function rotateAbout(root,point,q,rise=[0,0,0]) {
  return apply(p(...add(minus(point,rot(point,q)),rise),q),root);
}
function face(axis) {
  const out=scale(axis,-1), q=[...cross(Y,out),1+out[1]];
  return out[1]<-.99999 ? rx(PI) : scale(q,1/Math.hypot(...q));
}
function family(key,name,number,group,page,role='kit') {
  families[key]??={name,number,group,page,role};
}
function stock(id,key,shape,packet,unpacked) {
  parts.set(id,{id,family:key,shape,packet,unpacked});
}
const boards='Frame boards', base='Slatted base', ladder='Ladder pieces';
for(const [id,name,group,page,x,z,q] of [
  ['gableNarrow','Narrow gable panel',boards,7,-1280,-920,rz(-PI/2)],
  ['gableWide','Wide gable panel',boards,7,-1280,-310,rz(-PI/2)],
  ['rearRail','Wide rear bed rail',boards,10,688,-1030,rx(-PI/2)],
  ['frontRail','Narrow front support rail',boards,10,688,-763,rx(-PI/2)],
  ['sideGuard','Transverse end guard',boards,18,1680,-360,rz(PI/2)],
  ['frontGuard','Long front guard',boards,26,444,-475,rx(-PI/2)],
  ['brace','Under-frame rear brace',boards,24,444,-190,rx(-PI/2)],
  ['stileBored','Ladder stile with edge bores',ladder,28,-1190,242,rz(-PI/2)],
  ['stilePlain','Other ladder stile',ladder,28,-1190,366,rz(-PI/2)]
]) {
  family(id,name,null,group,page);
  stock(id,id,id,group,p(x,rot([1,0,0],q)[1]?shapes[id][0]/2+3:shapes[id][2]/2+3,z,q));
}
family('slat','Bed slat',null,base,13);
family('tread','Ladder tread',null,ladder,28);
for(let i=1;i<=7;i++) stock(`slat-${i}`,'slat','slat',base,p(170+(i-1)*207,13,475));
for(let i=1;i<=5;i++) stock(`tread-${i}`,'tread','tread',ladder,p(-1260,16,433+i*94));
const packet2=[['123491','Large joining stud','joinStud',2],['100218','Pointed assembly screw','woodScrew',6],
  ['105105','Long connector screw','mediumBolt',3],['105100','Short connector screw','shortBolt',14],
  ['114613','Cam stud','camStud',8],['192800','Large-pattern cam','wideCam',4],['101358','Short fluted dowel','dowel',19],
  ['100600','Threaded sleeve','sleeve',14],['116894','Angle rail screw','railScrew',18],['114670','Gable joining cam','largeCam',2],
  ['150626','Gable cam cover','camCap',2],['113453','Spanner','spanner',1,'tool'],['100049','Large hex key','largeKey',1,'tool'],
  ['100092','Hex key','hexKey',1,'tool'],['100002','Offset hex key','offsetKey',1,'tool']];
const packet3=[['100218','Pointed assembly screw','woodScrew',10],['105237','Long cross-bolt','crossBolt',8],
  ['128437','Cross-bolt carrier','carrier',8],['113434','Small-pattern cam','smallCam',4],['101352','Long locating dowel','longDowel',1],
  ['100710','Hex nut','nut',8],['106043','Two-pin floor glide','glide',6]];
const loose=[['121108','Anti-slip strip','strip',5],['139536','Bed slat angle rail','angle',2],
  ['190729','Deep hand-grip insert','gripDeep',2],['190730','Shallow hand-grip insert','gripShallow',2]];
const counted={};
for(const [j,entries] of [packet2,packet3,loose].entries()) {
  const group=['Packet 2','Packet 3','Loose fittings'][j];
  for(const [i,[key,label,shape,count,role]] of entries.entries()) {
    family(key,label,key,group,j+3,role);
    for(let k=0;k<count;k++) {
      const [w,h,d]=shapes[shape];
      let x=-2050+j*930+(i%5)*150+(k%3)*43, z=1190+Math.floor(i/5)*272+Math.floor(k/3)*35;
      let y=h/2+3, q=I;
      if(shape==='angle') { x=320; z=1640+k*53; }
      if(shape==='strip') { x=1000; z=1120+k*64; }
      if(shape==='gripDeep'||shape==='gripShallow') { x+=k*57; y=d/2+3; q=rx(-PI/2); }
      if(h>40&&h>w&&role!=='tool'&&!shape.startsWith('grip')) { y=d/2+3; q=rx(-PI/2); }
      stock(`${key}-${counted[key]=(counted[key]??0)+1}`,key,shape,group,p(x,y,z,q));
    }
  }
}

// The same world points locate the static storage top and the three moving joints in the two seating insets.
export const deck=1420;
export const rungY=[285,552,820,1088,1356];
export const gripY=1640;
export const stileZ=549;
export const stileX=[466,969];
export const rearStudX=[906,514];
export const rearZ=-530;
export const rearStuds=s=>rearStudX.map(x=>[s*x,deck,rearZ]);
export const endStuds=s=>[-427,438].map(z=>[s*969,deck,z]);
export const locator=s=>[s*906,deck,512];
export const spareBore=s=>[s*940,deck,512];
export const setup={text:'Two people are required. Use a protected surface and bring slotted and cross-head screwdrivers.',page:2};
const title=[
  'Start the tall end gable','Key the gable seam','Bring the panels together','Close the gable seam','Cover the gable cams',
  'Orient the angle rails','Start the rail screws','Secure both angle rails','Join the wide rail to the gable','Turn the frame and fit two slats',
  'Join the narrow rail','Fasten the two slat ends','Fit the locating dowel','Fit the gable glides','Prepare the storage receivers',
  'Seat the transverse guard','Lock the transverse guard','Raise and seat the frame','Lock the raised rail','Secure both upper rail ends',
  'Prepare the brace receivers','Seat the lower rear brace','Fasten the far brace end','Lock the storage brace end','Fit the front guard',
  'Secure the far guard end','Complete the slatted base','Key both ladder stiles','Join the treads and first stile','Fit the ladder studs and turn',
  'Secure the other stile','Fit the ladder glides','Click in both hand grips','Seat the ladder','Lock the ladder studs',
  'Fasten the ladder to storage','Apply all five tread grips'
];
export const steps=title.map((title,i)=>({number:i+1,title}));

export function records(layout) {
  const s=layout.startsWith('right')?1:-1, upper=layout.endsWith('upper');
  const named=upper?'upper drawing (open wide bay)':'lower drawing (closed wide bay face)';
  const hand=s===1?'right':'left', side=scale(X,s), inward=scale(side,-1), yaw=s===1?I:ry(PI);
  const at=new Map(), used={}, all=[];
  let operations=[];
  const currentPage=()=>pages[layout][all.length];
  const warning=text=>({text,page:currentPage()});
  function step(action,build,notice) {
    operations=[]; build();
    all.push({...steps[all.length],page:currentPage(),action,warning:notice,operations});
  }
  function op(kind,ids,prerequisites,poses,axes,{caption,target,view,...extra}={}) {
    const axis=axes[0];
    operations.push({kind,ids,prerequisites,poses,axes,...extra,joint:{target:target??xyz(poses[0].at(-1)),
      axis,outward:scale(axis,-1),receivers:prerequisites,caption:caption??families[parts.get(ids[0]).family].name,view}});
    ids.forEach((id,i)=>at.set(id,poses[i].at(-1)));
    return ids;
  }
  function place(id,end,prerequisites=[],axis=down,distance=115) {
    return op('place',[id],prerequisites,[[shift(end,scale(axis,-distance)),end]],[axis]);
  }
  function fit(key,points,prerequisites,axis=down,root=identity,previewBores=false) {
    const ids=points.map(()=>`${key}-${used[key]=(used[key]??0)+1}`);
    const dir=rot(axis,quat(root));
    const path=points.map(a=>{
      const end=apply(root,p(...a,face(axis)));
      return [shift(end,scale(dir,-48)),end];
    });
    return op('place',ids,prerequisites,path,ids.map(()=>dir),{previewBores});
  }
  function rigid(ids,from,roots,prerequisites,axis,caption,view,target) {
    const anchor=ids[0], first=at.get(anchor), anchorLocal=local(from,first);
    const frames=[first,...roots.map(root=>apply(root,anchorLocal))];
    const offsets=ids.map(id=>local(first,at.get(id)));
    const paths=ids.map((id,i)=>[at.get(id),...frames.slice(1).map(frame=>apply(frame,offsets[i]))]);
    op('move',[...ids],prerequisites,paths,ids.map(()=>axis),{caption,target,view,rigid:{anchor,frames,offsets}});
  }
  function turn(ids,prerequisites,axis,from,to) {
    const q=axisQ(axis,(to-from)*PI/2);
    op('adjust',ids,prerequisites,ids.map(id=>{
      const a=at.get(id);
      return [a,p(...xyz(a),mult(q,quat(a)))];
    }),ids.map(()=>axis),{captive:{from,to},caption:'Turn the captive cams'});
  }
  function crossBolts(sites,receivers,axis,carrierAxis,root) {
    for(const site of sites) {
      const dir=rot(carrierAxis,quat(root)), staged=shift(root,scale(dir,-57));
      const body=add(site,scale(axis,46));
      const carriers=fit('128437',[body],receivers,carrierAxis,staged);
      const nuts=fit('100710',[add(body,scale(carrierAxis,-4))],carriers,carrierAxis,staged);
      rigid([...carriers,...nuts],staged,[root],receivers,dir,'Seat the loaded cross-bolt carrier');
      fit('105237',[add(site,scale(axis,22))],[...receivers,...carriers,...nuts],axis,root);
    }
  }
  const gableX=-s*971, gableN=p(gableX,912.5,-357), gableW=p(gableX,912.5,192);
  const rear=p(0,1619.5,rearZ,yaw), front=p(0,1464,512,yaw);
  const rearAngle=p(0,1469,-507), frontAngle=p(0,1469,489,ry(PI));
  const flat=p(0,1015,0,rz(s*PI/2));
  const seamOpen=shift(flat,[0,0,-18]);
  const narrowBench=apply(p(0,585,-635,rx(-PI/2)),flat);
  const rearBench=p(0,567,1880,rx(-PI/2)), frontBench=p(0,555,-1990,rx(PI/2));
  const inverted=p(0,1822,1450,rx(PI)), bedBench=p(0,565,2435,rx(-PI/2));
  const narrow=['gableNarrow'], gable=['gableWide'], rearAssembly=['rearRail'], frontAssembly=['frontRail'], earlySlats=[];
  const seamY=[430,1230], slatX=[s*810,s*540,-s*810,-s*540,-s*270,0,s*270];
  const slatAt=i=>p(slatX[i-1],1471,-9);
  const slatEnds=(i,rearEnd,root)=>{
    const slat=`slat-${i}`, rail=rearEnd?'139536-1':'139536-2', z=rearEnd?-496:478, x=slatX[i-1];
    const sleeve=fit('100600',[[x,1458,z]],[slat,rail],Y,root,true);
    return [...sleeve,...fit('105100',[[x,1475,z]],[slat,rail,...sleeve],down,root)];
  };
  let joiningCams, storageStuds, shelfCams, ladderStuds;
  const screwGuide='Use a hand screwdriver, not a power driver.';

  step(`Use the ${hand}-ladder route. Lay out the two gable panels on protection and fit the large studs with the spanner.`,()=>{
    place('gableWide',apply(flat,gableW));
    place('gableNarrow',apply(narrowBench,gableN));
    narrow.push(...fit('123491',seamY.map(y=>[gableX,y,-160]),['gableNarrow'],scale(Z,-1),narrowBench));
  },setup);
  step('Use the five short 101358 dowels in the narrow panel edge, not the long 101352.',()=>
    narrow.push(...fit('101358',[187,603,900,1393,1640].map(y=>[gableX,y,-158]),['gableNarrow'],scale(Z,-1),narrowBench)));
  step('Point the two large cam openings at the joining edge, then rotate and bring the narrow panel onto the wide panel.',()=>{
    joiningCams=fit('114670',seamY.map(y=>[gableX+s*7,y,-132]),['gableWide'],inward,flat,true);
    gable.push(...joiningCams);
    rigid(narrow,narrowBench,[shift(seamOpen,[0,110,-28]),seamOpen],['gableWide',...joiningCams],Z,'Bring the keyed panel edges together');
  });
  step('With the large hex key, turn both cams to take up the joint, then turn again to draw the two faces flush.',()=>{
    const axis=rot(inward,quat(flat));
    turn(joiningCams,['gableWide','gableNarrow'],axis,0,.5);
    rigid(narrow,seamOpen,[flat],['gableWide',...joiningCams],Z,'Draw the gable seam closed');
    turn(joiningCams,['gableWide','gableNarrow'],axis,.5,1);
    gable.push(...narrow);
  });
  step('Press the two covers over the flush gable cams.',()=>
    gable.push(...fit('150626',seamY.map(y=>[gableX+s*13,y,-132]),['gableWide',...joiningCams],inward,flat)));
  step('Match the angle rail flanges to the shown faces of the wide and narrow boards; the ledges will face the slats.',()=>{
    place('rearRail',apply(rearBench,rear));
    place('frontRail',apply(frontBench,front));
    rearAssembly.push(...place('139536-1',apply(rearBench,rearAngle),['rearRail']));
    frontAssembly.push(...place('139536-2',apply(frontBench,frontAngle),['frontRail']));
  });
  const mountRail=(rearEnd,xs)=>fit('116894',xs.map(x=>[s*x,1468,rearEnd?-517:499]),
    [rearEnd?'rearRail':'frontRail',rearEnd?'139536-1':'139536-2'],scale(Z,rearEnd?-1:1),rearEnd?rearBench:frontBench,true);
  step('Hand-start one screw in the indicated hole on each angle rail.',()=>{
    rearAssembly.push(...mountRail(true,[0])); frontAssembly.push(...mountRail(false,[0]));
  },warning(screwGuide));
  step('Fit the other eight screws on each rail by hand.',()=>{
    const xs=[-869,-697,-465,-233,233,465,697,869];
    rearAssembly.push(...mountRail(true,xs)); frontAssembly.push(...mountRail(false,xs));
  },warning(screwGuide));
  step('Stand the gable in the illustrated upside-down orientation and bring up the wide rail. Load a nut into each carrier and hold it with a slotted driver while fitting the two cross-bolts.',()=>{
    rigid(gable,flat,[shift(inverted,[0,160,0]),inverted],[],down,'Turn the gable upright for the first rail');
    rigid(rearAssembly,rearBench,[shift(inverted,scale(side,165)),inverted],['gableNarrow'],inward,'Seat the wide rail at the gable');
    const begin=operations.length;
    crossBolts([1492,1747].map(y=>[-s*981,y,rearZ]),['gableNarrow','rearRail'],side,Z,inverted);
    rearAssembly.push(...new Set(operations.slice(begin).flatMap(o=>o.ids)));
  },warning('Use threaded 105237 cross-bolts, not pointed 100218 screws.'));
  step('Turn the gable and wide rail as a unit. Fit the first two slats at the free end, with one connector screw and sleeve through each rear slat end.',()=>{
    rigid([...gable,...rearAssembly],inverted,[shift(bedBench,[0,165,0]),bedBench],[],down,'Turn the first frame assembly');
    for(let i=1;i<=2;i++) {
      earlySlats.push(...place(`slat-${i}`,apply(bedBench,slatAt(i)),['139536-1']));
      earlySlats.push(...slatEnds(i,true,bedBench));
    }
  });
  step('Bring the narrow rail onto the open ends of the slats and the gable. Load two carrier nuts and fit the two 105237 cross-bolts.',()=>{
    rigid(frontAssembly,frontBench,[shift(bedBench,scale(side,165)),bedBench],['gableWide','slat-1','slat-2'],inward,'Seat the narrow support rail');
    const begin=operations.length;
    crossBolts([1445,1484].map(y=>[-s*981,y,512]),['gableWide','frontRail'],side,scale(Z,-1),bedBench);
    frontAssembly.push(...new Set(operations.slice(begin).flatMap(o=>o.ids)));
  },warning('Use threaded 105237 cross-bolts, not pointed 100218 screws.'));
  step('Fit the two remaining screw/sleeve pairs at the ends of the first slats, using the keys from opposite faces.',()=>{
    for(let i=1;i<=2;i++) earlySlats.push(...slatEnds(i,false,bedBench));
  });
  step(`Use the single long 101352 in the indicated lower bore of the narrow rail on the ${hand} side.`,()=>{
    frontAssembly.push(...fit('101352',[add(locator(s),[0,-3,0])],['frontRail'],Y,bedBench,true));
  },warning('Use the long 101352, not a short 101358.'));
  step('Press the four two-pin glides into the paired bores at the gable foot.',()=>{
    gable.push(...fit('106043',[-479,-187,-129,475].map(z=>[gableX,5,z]),['gableWide','gableNarrow'],Y,bedBench));
  });
  step(`Use the assembled storage tower in the ${hand}-ladder ${named}. Fit the four studs into the holes shown on its top.`,()=>{
    storageStuds=fit('114613',[...endStuds(s),...rearStuds(s)].map(a=>add(a,[0,9,0])),[],down,identity,true);
  });
  step(`Lower the end guard onto the two outer studs of the ${named}, leaving the wide-rail stud pair exposed.`,()=>{
    place('sideGuard',p(s*969,1619.5,-19),storageStuds.slice(0,2),down,205);
  });
  step(`Fit and turn two 192800 cams in the end guard for the ${named}.`,()=>{
    shelfCams=fit('192800',endStuds(s).map(([x,y,z])=>[x-s*7,y+22,z]),['sideGuard',...storageStuds.slice(0,2)],side,identity,true);
    turn(shelfCams,['sideGuard'],side,0,1);
  },warning('Use 192800 cams, not 113434.'));
  step(`With two people, rotate and raise the complete frame above the ${hand}-side storage. Align the long dowel and both rail sockets before lowering onto all three receivers.`,()=>{
    const carry=[...gable,...rearAssembly,...frontAssembly,...earlySlats];
    rigid(carry,bedBench,[p(0,970,1650,rx(-PI/3)),p(0,270,0),identity],['sideGuard',...storageStuds],down,
      'Align all three receivers before lowering',{direction:[s*.7,.54,.8],span:1520},[s*820,deck+60,125]);
  },warning('Two people must support the frame. Do not strike or bend the exposed studs with the rail edge; align the sockets before lowering.'));
  step('Insert and turn two 113434 cams at the bottom of the wide rail to capture the two exposed storage studs.',()=>{
    const cams=fit('113434',rearStuds(s).map(([x,y,z])=>[x,y+22,z+6]),['rearRail',...storageStuds.slice(2)],scale(Z,-1),identity,true);
    turn(cams,['rearRail'],scale(Z,-1),0,1);
  },warning('Use 113434 cams, not 192800.'));
  step('Load four nuts into their carriers and secure both rail ends to the raised end guard with the four cross-bolts.',()=>{
    crossBolts([1480,1748].map(y=>[s*968,y,-550]),['sideGuard','rearRail'],Z,inward,identity);
    crossBolts([1444,1484].map(y=>[s*968,y,495]),['sideGuard','frontRail'],scale(Z,-1),inward,identity);
  });
  step('Screw the two brace studs into the indicated inner face of the assembled storage tower.',()=>{
    fit('114613',[538,611].map(y=>[s*430,y,-492]),['sideGuard'],side);
  });
  step('Slide the rear brace onto the prepared storage studs.',()=>
    place('brace',p(-s*261,575,-492,yaw),['114613-5','114613-6'],side,155));
  step('Attach the far end of the brace through the gable using the two pointed screws.',()=>{
    fit('100218',[538,611].map(y=>[-s*966,y,-492]),['brace','gableNarrow'],side);
  });
  step('Fit and turn the two 113434 cams at the tower end of the brace.',()=>{
    const cams=fit('113434',[538,611].map(y=>[s*401,y,-485]),['brace','114613-5','114613-6'],scale(Z,-1));
    turn(cams,['brace'],scale(Z,-1),0,1);
  },warning('Use 113434 cams, not 192800.'));
  step(`Seat the front guard on the narrow rail, leaving the ladder opening on the ${hand}. Fit three longer connector screws from inside.`,()=>{
    place('frontGuard',p(-s*252,1619.5,527,yaw),['frontRail'],scale(Z,-1));
    fit('105105',[-730,-260,201].map(x=>[s*x,1461,517]),['frontRail','frontGuard'],Z,identity,true);
  });
  step('Secure the front guard through the gable with two pointed screws.',()=>{
    fit('100218',[1480,1748].map(y=>[-s*965,y,527]),['gableWide','frontGuard'],side);
  });
  step('Lower the other five slats onto the two ledges. Fit the ten connector screw/sleeve pairs from opposite faces.',()=>{
    for(let i=3;i<=7;i++) {
      place(`slat-${i}`,slatAt(i),['139536-1','139536-2']);
      slatEnds(i,true,identity); slatEnds(i,false,identity);
    }
  });

  const stileIds=['stileBored','stilePlain'], ladderPieces=[];
  const stile=i=>p(s*stileX[i],912,stileZ);
  const ladderBench=p(s*870,1005,1700,rz(-s*PI/2));
  const hinge=[0,290,1700+stileZ], upperCentre=[0,37,1860+stileZ];
  const topBench=rotateAbout(shift(ladderBench,[0,-503,160]),upperCentre,rx(PI));
  const flipped=rotateAbout(ladderBench,hinge,rx(PI));
  const topParts=[], bottomParts=[];
  step('Check the extra top-edge holes distinguish the two stiles, then hand-insert seven short dowels per stile.',()=>{
    for(let i=1;i>=0;i--) {
      const root=i?ladderBench:topBench, ids=i?bottomParts:topParts;
      ids.push(...place(stileIds[i],apply(root,stile(i))));
      const into=i?side:inward;
      const holes=rungY.flatMap((y,j)=>(j%2===0?[0]:[-19,19]).map(z=>[s*(stileX[i]+(i?-15:15)),y,stileZ+z]));
      ids.push(...fit('101358',holes,[stileIds[i]],into,root,true));
    }
    ladderPieces.push(...bottomParts,...topParts);
  },warning('Press the dowels in by hand. Do not use a hammer.'));
  step('Seat the five oriented treads on their dowels. Turn the bored stile onto the treads and secure the first three indicated joints.',()=>{
    const treads=rungY.map((y,i)=>`tread-${i+1}`);
    treads.forEach((id,i)=>place(id,apply(ladderBench,p(s*717.5,rungY[i],stileZ)),['stilePlain']));
    ladderPieces.push(...treads);
    rigid(topParts,topBench,[shift(ladderBench,[0,160,85]),ladderBench],treads,down,'Turn the second stile onto the five treads');
    ladderPieces.push(...fit('100218',[0,2,4].map(i=>[s*460,rungY[i],stileZ-19]),['stileBored',...treads],side,ladderBench));
  });
  step('Add the two studs in the upper edge bores of the bored stile, then turn the entire ladder to expose its other face.',()=>{
    ladderStuds=fit('114613',[1730,1774].map(y=>[s*446,y,524]),['stileBored'],side,ladderBench,true);
    ladderPieces.push(...ladderStuds);
    rigid(ladderPieces,ladderBench,[rotateAbout(ladderBench,hinge,rx(PI/2),[0,124,0]),flipped],[],down,'Flip the assembled ladder');
  });
  step('Secure the three corresponding tread joints from the opposite stile face.',()=>{
    ladderPieces.push(...fit('100218',[0,2,4].map(i=>[s*973,rungY[i],stileZ-19]),['stilePlain','tread-1','tread-3','tread-5'],inward,flipped));
  });
  step('Press one two-pin floor glide into the base of each stile.',()=>{
    for(let i=0;i<2;i++) ladderPieces.push(...fit('106043',[[s*stileX[i],5,stileZ]],[stileIds[i]],Y,flipped));
  });
  step('Fit shallow 190730 and deep 190729 from opposite faces of each oval hole. Squeeze them together through the stile until they click.',()=>{
    for(let i=0;i<2;i++) {
      const dir=i?inward:side, x=s*stileX[i];
      ladderPieces.push(...place(`190730-${i+1}`,apply(flipped,p(x+dir[0]*12,gripY,stileZ,dir[0]<0?ry(PI):I)),
        [stileIds[i]],rot(scale(dir,-1),quat(flipped)),48));
      ladderPieces.push(...place(`190729-${i+1}`,apply(flipped,p(x-dir[0]*4,gripY,stileZ,dir[0]>0?ry(PI):I)),
        [stileIds[i]],rot(dir,quat(flipped)),48));
    }
  },{text:'Do not snap the grip halves together before they are in the ladder opening.',page:5});
  step(`Bring the whole ladder into the ${hand} front opening. Secure the top with two pointed screws.`,()=>{
    rigid(ladderPieces,flipped,[p(0,45,360),p(0,0,195),identity],['frontGuard','sideGuard'],scale(Z,-1),
      'Slide the ladder into the opening',{direction:[s*.45,.2,1],span:1200},[s*720,980,stileZ]);
    fit('100218',[1730,1774].map(y=>[s*969,y,551]),['stilePlain','sideGuard'],scale(Z,-1));
  });
  step('Insert and turn two 192800 cams to capture the ladder studs at the front guard.',()=>{
    const cams=fit('192800',[1730,1774].map(y=>[s*434,y,520]),['frontGuard','stileBored',...ladderStuds],Z);
    turn(cams,['frontGuard','stileBored'],Z,0,1);
  },warning('Use 192800 cams, not 113434.'));
  step('Drive the four remaining pointed screws from the storage side into the ladder, at the two levels shown.',()=>{
    fit('100218',stileX.flatMap(x=>[252,1250].map(y=>[s*x,y,514])),['sideGuard','stilePlain','stileBored'],Z);
  });
  step('Peel the backing from the five strips. Centre one strip on each tread and smooth it into place.',()=>{
    fit('121108',rungY.map(y=>[s*717.5,y+14,stileZ]),rungY.map((_,i)=>`tread-${i+1}`));
  },{text:'Use a 97 × 189 cm mattress and do not let it rise above the marked fill line. The mattress is not supplied.',page:59});
  return all;
}
