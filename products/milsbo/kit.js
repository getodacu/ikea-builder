import { pages } from './manual.js';

const {PI}=Math;
const pose=(x,y,z,q=[0,0,0,1])=>[x,y,z,...q];
const xyz=p=>p.slice(0,3), quat=p=>p.slice(3);
const axisX=s=>[s,0,0], axisZ=s=>[0,0,s], up=[0,1,0], down=[0,-1,0];
const scale=(a,k)=>a.map(v=>v*k), plus=(a,b)=>a.map((v,i)=>v+b[i]);
const cross=([x,y,z],[a,b,c])=>[y*c-z*b,z*a-x*c,x*b-y*a];
const unit=a=>scale(a,1/Math.hypot(...a));
const pitch=a=>[Math.sin(a/2),0,0,Math.cos(a/2)];
const yaw=a=>[0,Math.sin(a/2),0,Math.cos(a/2)];
const roll=a=>[0,0,Math.sin(a/2),Math.cos(a/2)];
function rotate(v,q) {
  const t=scale(cross(q,v),2);
  return plus(v,plus(scale(t,q[3]),cross(q,t)));
}
function mult(a,b) {
  return [...plus(plus(scale(xyz(a),b[3]),scale(xyz(b),a[3])),cross(a,b)),a[3]*b[3]-xyz(a).reduce((n,v,i)=>n+v*b[i],0)];
}
const transform=(a,b)=>pose(...plus(xyz(a),rotate(xyz(b),quat(a))),mult(quat(a),quat(b)));
const offset=(p,v)=>pose(...plus(xyz(p),v),quat(p));
const local=(p,v)=>transform(p,pose(...v));
const screwQ=axis=>axis[1]===1 ? [1,0,0,0] : unit([...cross(up,scale(axis,-1)),1-axis[1]]);

export const dimensions={width:730,depth:420,height:1750,postX:347,postZ:194,deckY:192,roofY:1740,
  pivotY:195,pivotZ:203,doorH:1542,doorW:360,glassH:1536,restX:336,restZ:178,restY:[552,936,1320]};
const {width,depth,postX,postZ,deckY,roofY,pivotY,pivotZ,doorH,doorW,glassH,restX,restZ,restY}=dimensions;
const trayY=174, postBase=178, postH=1550, pinY=pivotY+doorH+4;
const corners=[['LF',-1,1],['RF',1,1],['LB',-1,-1],['RB',1,-1]];
const posts=corners.map(([c])=>`post${c}`);
const sides=[['L',-1],['R',1]];

export const shapes={leg:[66,175,66],longRail:[670,18,15],endRail:[15,18,364],tray:[width,20,depth],
  floor:[708,14,406],post:[26,postH+23,26],mullion:[30,glassH+12,16],roof:[width,26,depth],
  rearPane:[342,glassH,5],sidePane:[5,glassH,376],door:[doorW,doorH,24],shelf:[684,6,374],
  glide:[20,21,20],shortHex:[12,15,12],longHex:[12,31,12],shortCross:[8,11,8],longCross:[8,23,8],
  clip:[34,21,14],rest:[22,20,25],slideBolt:[14,67,14],pivotStud:[15,24,15],pivotPin:[10,29,10],
  pull:[18,75,21],key:[25,5,44],angle:[26,48,80],wallPoint:[13,28,13],hexKey:[104,25,5]};
export const families={};
export const parts=new Map();
function stock(family,name,shape,entries,group,page,number=null,role='kit') {
  families[family]={name,number,group,page,role};
  for(const [id,unpacked] of entries) parts.set(id,{id,family,shape,packet:group,unpacked});
}
const frame='Frame and legs', glazing='Glass and doors', hardware='Hardware', anchors='Wall brackets';
const flat=pitch(PI/2);
const laid=p=>shapes[p][1]/2;
const doorBench={L:pose(-1570,29,-1000,flat),R:pose(-760,29,-1000,flat)};
stock('leg','Handed leg casting','leg',corners.map(([c],i)=>[`leg${c}`,pose(1440+i*105,30,-475,flat)]),frame,9);
stock('longRail','Long underframe rail','longRail',[['railB',pose(1330,9,-210)],['railF',pose(1330,9,-157)]],frame,9);
stock('endRail','End underframe rail','endRail',[['railL',pose(1740,9,-205)],['railR',pose(1810,9,-205)]],frame,9);
stock('tray','Lower mounting tray','tray',[['tray',pose(1410,15,214)]],frame,10);
stock('floor','Slotted inner floor','floor',[['floor',pose(1410,12,680)]],frame,12);
stock('post','Keyed corner post','post',corners.map(([c],i)=>[`post${c}`,pose(2050+i*57,25,-52,flat)]),frame,12);
stock('mullion','Rear centre mullion','mullion',[['mullion',pose(2295,16,-52,flat)]],frame,13);
stock('roof','Metal roof','roof',[['roof',pose(1410,22,-805)]],frame,13);
stock('rearPane','Rear tempered-glass pane','rearPane',sides.map(([c],i)=>[`rear${c}`,pose(-490+i*390,3,-230,flat)]),glazing,16);
stock('sidePane','Side tempered-glass pane','sidePane',sides.map(([c],i)=>[`side${c}`,pose(368+i*425,3,-230,[.5,.5,.5,.5])]),glazing,18);
stock('door','Handed glazed door','door',sides.map(([c])=>[`door${c}`,doorBench[c]]),glazing,25);
stock('shelf','Adjustable tempered-glass shelf','shelf',restY.map((_,i)=>[`shelf-${i+1}`,pose(-800+i*730,laid('shelf'),854)]),glazing,33);
const lots=[
  ['195313','Threaded leveler','glide','195313 / 195312',4],
  ['115461','Short hex screw','shortHex','115461 / 190473',18],
  ['105103','Long hex screw','longHex','105103',4],
  ['100404','Short cross-head screw','shortCross','100404 / 105057',23],
  ['100408','Long cross-head screw','longCross','100408 / 108031',4],
  ['10003221','Rear mullion clip','clip','10003221 / 10003222',3],
  ['10003241','Corner shelf rest','rest','10003241 / 10003245',12],
  ['195311','Slide bolt','slideBolt','195311 / 195795',2],
  ['151059','Lower pivot stud','pivotStud','151059',2],
  ['195362','Upper pivot pin','pivotPin','195362 / 195363',2],
  ['10002580','Folded door pull','pull','10002580 / 10002566',2],
  ['10002394','Lock key','key','10002394',2],
  ['106989','Wall bracket','angle','106989',2,anchors],
  ['130445','Hex key','hexKey','130445',1,hardware,8,'tool'],
  ['wallPoint','Wall fixing position (not supplied)','wallPoint',null,2,'Required, not supplied',32,'external']
];
for(const [i,[family,name,shape,number,count,group=hardware,page=7,role]] of lots.entries()) {
  stock(family,name,shape,Array.from({length:count},(_,k)=>[
    `${family}-${k+1}`,pose(-1750+(i%3)*310+(k%6)*45,laid(shape),1080+Math.floor(i/3)*142+Math.floor(k/6)*36)
  ]),group,page,number,role);
}

const tipWarning={text:'Tip-over can cause serious or fatal crushing injuries. Secure both supplied brackets to the wall with suitable screws and plugs (not included); seek professional advice if unsure.',page:2};
export const setupWarning={text:`Two people required; use a protected work surface and protect glass edges from hard knocks. ${tipWarning.text}`,page:2};
const glassWarning={text:'Handle tempered glass with a helper on a protected surface. The edge goes behind the retainer; do not force or bow the pane.',page:16};

const at=new Map(), used={}, all=[];
let operations, rearFacing=true;
const reverse=pose(0,0,0,[0,1,0,0]);
const screen=p=>rearFacing ? transform(reverse,p) : p;
const screenDir=v=>rearFacing ? rotate(v,quat(reverse)) : v;
function step(title,action,build,warning) {
  operations=[]; build();
  all.push({number:all.length+1,page:pages[all.length],title,action,warning,operations});
}
function op(kind,ids,prerequisites,paths,axis,{caption=families[parts.get(ids[0]).family].name,target=xyz(paths[0].at(-1)),view,rigid,captive,previewBores}={}) {
  const a=screenDir(axis);
  operations.push({kind,ids:[...ids],prerequisites,poses:paths.map(path=>path.map(screen)),axes:ids.map(()=>a),
    joint:{target:xyz(screen(pose(...target))),axis:a,outward:scale(a,-1),receivers:prerequisites,caption,
      view:view && {direction:screenDir(view.direction),span:view.span}},rigid,captive,previewBores});
  ids.forEach((id,i)=>at.set(id,paths[i].at(-1)));
}
function place(id,end,requires=[],axis=down,options={}) {
  const {distance=84,path=[offset(end,scale(axis,-distance)),end],...extra}=options;
  op('place',[id],requires,[path],axis,extra);
  return id;
}
function fit(family,p,requires,axis=down,options={}) {
  const id=`${family}-${used[family]=(used[family]??0)+1}`;
  return place(id,pose(...p,options.q??screwQ(axis)),requires,axis,{distance:45,...options});
}
function move(ids,frames,requires,axis,options={}) {
  const anchor=ids[0], initial=at.get(anchor);
  const [x,y,z,w]=quat(initial), inverse=[-x,-y,-z,w];
  const offsets=ids.map(id=>{
    const p=at.get(id);
    return pose(...rotate(plus(xyz(p),scale(xyz(initial),-1)),inverse),mult(inverse,quat(p)));
  });
  const paths=ids.map((id,i)=>[at.get(id),...frames.map(p=>transform(p,offsets[i]))]);
  op('move',ids,requires,paths,axis,{...options,rigid:{anchor,frames:[initial,...frames].map(screen),offsets}});
}
function adjust(id,end,requires,axis,caption) {
  op('adjust',[id],requires,[[at.get(id),end]],axis,{captive:{from:0,to:1},caption});
}
function snug(id,by,requires,axis,caption) {
  const p=offset(at.get(id),by);
  adjust(id,pose(...xyz(p),mult(quat(p),yaw(PI))),requires,axis,caption);
}
const face={direction:[-.43,.17,.89],span:740};
const legs=corners.map(([c])=>`leg${c}`), feet=[];
const rails=['railB','railF','railL','railR'];
let roofScrews, centreScrew;

step('Start the levelers','On a protected surface, thread one adjustable leveler into the end of each leg.',()=>{
  for(const [i,id] of legs.entries()) {
    const end=pose(-670+i*394,32,-112,flat);
    place(id,end,[],down,{distance:62});
    feet.push(fit('195313',xyz(local(end,[0,-91,0])),[id],axisZ(1)));
  }
});
step('Join the long underframe rails','Stand the four corner legs with their pictured handed tabs facing inward. Fit the two long rails with their small holes toward the inside.',()=>{
  for(const [i,[c,s,d]] of corners.entries()) {
    move([`leg${c}`,feet[i]],[pose(s*postX,92,d*postZ)],[],down,{caption:'Stand the leg and its leveler together'});
  }
  for(const [id,d,ls] of [['railB',-1,['legLB','legRB']],['railF',1,['legLF','legRF']]]) {
    place(id,pose(0,161,d*postZ,d===-1?yaw(PI):undefined),ls,axisZ(d));
  }
});
step('Fit the two end rails','Fit the short rails between the remaining tabs, with the small screw holes again facing inside the base.',()=>{
  for(const [hand,s] of sides) place(`rail${hand}`,pose(s*postX,161,0,s<0?yaw(PI):undefined),[`leg${hand}F`,`leg${hand}B`],axisX(s));
});
step('Fasten the underframe','Drive eight short 115461 / 190473 hex screws from inside, one into each rail-to-leg joint. Save the long 105103 screws for the posts.',()=>{
  for(const [c,s,d] of corners) {
    fit('115461',[s*(postX-24),161,d*(postZ-8)],[`leg${c}`,d>0?'railF':'railB'],axisZ(d),{previewBores:true});
    fit('115461',[s*(postX-8),161,d*(postZ-24)],[`leg${c}`,s<0?'railL':'railR'],axisX(s),{previewBores:true});
  }
});
step('Fit the lower mounting tray','Set the tray on the legs with its centre hole at the rear. Use two short hex screws on each rear corner plate.',()=>{
  place('tray',pose(0,trayY,0),rails);
  for(const [hand,s] of sides) for(const dx of [19,0]) fit('115461',[s*(postX-dx),trayY+5,-postZ+12],['tray',`leg${hand}B`]);
});
step('Secure the two front plates','Add one short hex screw to each remaining corner plate, following the two different plate outlines.',()=>{
  for(const [hand,s] of sides) fit('115461',[s*(postX-12),trayY+5,postZ-15],['tray',`leg${hand}F`]);
});
step('Install the four corner posts','Point the raised tongues up and the shelf-rest bores inward. Use one long 105103 hex screw at the base of each post.',()=>{
  for(const [c,s,d] of corners) {
    const id=`post${c}`;
    place(id,pose(s*postX,postBase+postH/2,d*postZ),['tray'],down,{target:[s*postX,postBase,d*postZ]});
    fit('105103',[s*postX,postBase+5,d*postZ],['tray',id],down,{previewBores:true});
  }
});
step('Lower the slotted floor','Lower the inner floor over the mounting tray. The shaped centre opening goes next to the small screw hole on the rear face.',()=>{
  place('floor',pose(0,deckY,0),['tray',...posts]);
});
step('Key in the rear centre mullion','Engage the mullion tongue in the floor opening, then fit one short 100404 / 105057 cross-head screw through the rear face.',()=>{
  place('mullion',pose(0,deckY+glassH/2,-postZ),['floor'],down,{target:[0,deckY,-postZ],previewBores:true});
  fit('100404',[0,183,-210],['floor','mullion'],axisZ(1));
});
step('Set the roof on the posts','Face the small centre hole toward the rear mullion and lower the roof onto all four post tongues.',()=>{
  place('roof',pose(0,roofY,0),['mullion',...posts]);
});
step('Start the four roof screws loosely','Start four short hex screws at the roof corners, leaving the heads raised so the roof can move for the glass.',()=>{
  roofScrews=corners.map(([c,s,d])=>fit('115461',[s*postX,roofY+15,d*postZ],['roof',`post${c}`],down,{previewBores:true}));
});
step('Start the rear roof screw loosely','Start the short cross-head screw in the rear slotted connection. Leave it loose and save the longer cross-head screws for the door bolts.',()=>{
  centreScrew=fit('100404',[0,roofY,-215],['roof','mullion'],axisZ(1));
});

function seatPane(id,end,side) {
  const isSide=Math.abs(side[0])===1, sign=isSide?side[0]:side[2];
  const upper=plus(xyz(end),[0,glassH/2,0]);
  const q=isSide?roll(-sign*.10):pitch(sign*.10);
  const tilted=pose(...plus(upper,rotate([0,-glassH/2,0],q)),q);
  const captured=offset(tilted,[0,5,0]);
  const straight=offset(end,[0,5,0]);
  place(id,end,['roof','floor'],down,{path:[offset(captured,plus([0,-55,0],scale(side,-34))),captured,straight,end],
    target:upper,view:{direction:isSide?[sign*.47,.19,.86]:[.48,.23,.84],span:760},caption:'Top edge behind retainer; bottom edge behind stops'});
}
step('Turn the frame and seat both rear panes','With a helper, turn the frame to its front. Lift the loose roof enough to insert the top edges behind the retainers; swing the lower edges in behind the floor stops.',()=>{
  // This is a turn of the same assembly, not a different view or second set of stock.
  const ids=['tray',...[...at.keys()].filter(id=>id!=='tray')];
  rearFacing=false;
  const frames=[reverse,pose(0,0,0)];
  const offsets=ids.map(id=>at.get(id));
  const paths=offsets.map(p=>frames.map(f=>transform(f,p)));
  operations.push({kind:'move',ids,prerequisites:[],poses:paths,axes:ids.map(()=>axisZ(1)),
    rigid:{anchor:'tray',frames,offsets},joint:{target:[0,870,0],axis:axisZ(1),outward:axisZ(-1),receivers:[],caption:'Turn the whole cabinet',view:{direction:[-.55,.25,.8],span:1530}}});
  move(['roof'],[offset(at.get('roof'),[0,4,0])],['mullion'],up,{caption:'Lift the loose roof slightly'});
  for(const [hand,s] of sides) seatPane(`rear${hand}`,pose(s*174,deckY+glassH/2,-postZ),axisZ(-1));
},glassWarning);
step('Clip the rear glass at the mullion','Hold the glass flat while fitting the three smaller clips and their short cross-head screws. Do not use the corner shelf rests here.',()=>{
  for(const y of restY) {
    const clip=fit('10003221',[0,y-9,-postZ+2],['mullion','rearL','rearR'],axisZ(-1),{q:[0,0,0,1]});
    fit('100404',[0,y-9,-postZ+6],[clip,'mullion'],axisZ(-1));
  }
},glassWarning);
function sidePane(hand,s) { seatPane(`side${hand}`,pose(s*postX,deckY+glassH/2,0),axisX(s)); }
const rests=new Map();
function addRest([c,s,d],level) {
  const y=restY[level]-9, x=s*restX, z=d*restZ, post=`post${c}`;
  const id=fit('10003241',[x,y,z],[post,`side${c[0]}`],axisX(s),{q:yaw(-s*PI/2)});
  fit('100404',[x-s*8,y,z],[id,post],axisX(s));
  rests.set(`${c}/${level}`,id);
}
step('Seat the right side pane','Lead with the right pane’s top edge behind the roof retainer, then swing the lower edge into the floor stops.',()=>sidePane('R',1),glassWarning);
step('Fit the upper and lower right rests','One person holds the glass; the other fits the four corner rests and short screws on the upper and lower right post holes.',()=>{
  for(const corner of corners.filter(([,s])=>s>0)) for(const level of [0,2]) addRest(corner,level);
},glassWarning);
step('Seat the left side pane','Repeat on the left side: enter behind the top retainer, then swing the bottom edge behind the floor stops.',()=>sidePane('L',-1),glassWarning);
step('Fit the upper and lower left rests','Hold the glass while fitting four corner rests and short screws to the upper and lower holes in the left posts.',()=>{
  for(const corner of corners.filter(([,s])=>s<0)) for(const level of [0,2]) addRest(corner,level);
},glassWarning);
step('Fit the four middle rests','Fit the last four corner rests and short screws across the cabinet at one common middle height.',()=>{
  for(const corner of corners) addRest(corner,1);
},glassWarning);
step('Check the glass and tighten the roof','Check that the upper glass edges are behind the retainers, not caught on them. Tighten the four existing corner screws with the hex key.',()=>{
  move(['roof'],[pose(0,roofY,0)],['rearL','rearR','sideL','sideR'],down,{caption:'Seat the roof over the correctly seated glass'});
  for(const [i,id] of roofScrews.entries()) snug(id,[0,-5,0],['roof',posts[i]],down,'Tighten the existing roof screw');
},glassWarning);
step('Tighten the rear roof screw','Tighten the same cross-head screw at the back, where the roof meets the centre mullion.',()=>{
  snug(centreScrew,[0,0,5],['roof','mullion'],axisZ(1),'Tighten the existing centre screw');
});

const doorMembers={L:['doorL'],R:['doorR']};
const doorPos=(s,angle,tilt=0)=>pose(s*postX,pivotY,pivotZ,mult(yaw(s*angle),pitch(tilt)));
const open=100*PI/180;
const meeting=doorW-28;
step('Fit both slide bolts to the left door','Lay the glazed doors inside-face up on protection. Put one slide bolt at each end of the left meeting stile with its tab pointing toward that end; use the four long cross-head screws.',()=>{
  for(const [hand] of sides) place(`door${hand}`,doorBench[hand],[],down,{target:[doorBench[hand][0],28,-240],view:{direction:[-.26,.84,.47],span:1170}});
  const p=at.get('doorL');
  for(const end of [-1,1]) {
    const y=end<0?35:doorH-35, bolt=local(p,[meeting,y,-14]);
    const id=fit('195311',xyz(bolt),['doorL'],down,{q:mult(quat(p),end<0?[0,0,1,0]:[0,0,0,1])});
    doorMembers.L.push(id);
    for(const dy of [-16,16]) doorMembers.L.push(fit('100408',xyz(local(p,[meeting,y+dy,-22])),[id,'doorL']));
  }
});
const lowerPivots={};
step('Install the lower door pivots','Seat a shouldered stud in each front corner receiver, with the small upper end exposed to receive the door.',()=>{
  for(const [hand,s] of sides) lowerPivots[hand]=fit('151059',[s*postX,pivotY,pivotZ],['floor',`post${hand}F`],down,{q:[0,0,0,1],previewBores:true});
});
step('Lower each door onto its own pivot','Check the top-frame detail, then set each handed door onto its lower pivot. Keep the two slide bolts and their screws on the left door.',()=>{
  for(const [hand,s] of sides) {
    const end=doorPos(s,open,-s*.075);
    move(doorMembers[hand],[offset(end,[0,145,94]),end],[lowerPivots[hand]],down,
      {target:xyz(end),caption:`Lower ${hand==='L'?'left':'right'} door onto its own stud`,view:{direction:[s*.42,.52,.75],span:1060}});
  }
});
step('Secure the upper door hinges','Align each door top with its front cabinet tab and insert one long smooth pivot pin from above.',()=>{
  for(const [hand,s] of sides) {
    move(doorMembers[hand],[doorPos(s,open)],['roof',lowerPivots[hand]],up,{target:[s*postX,pinY,pivotZ],caption:'Bring the upper bore under the roof tab'});
    fit('195362',[s*postX,pinY,pivotZ],['roof',`door${hand}`],down,{previewBores:true});
  }
});
step('Fit one pull to each door','Seat one folded pull outside each meeting stile. Use two short cross-head screws per pull, driven from the inside.',()=>{
  for(const [hand,s] of sides) {
    const door=`door${hand}`, p=at.get(door), x=-s*meeting, y=doorH*.52;
    const out=rotate(axisZ(1),quat(p));
    const pull=fit('10002580',xyz(local(p,[x,y,15])),[door],scale(out,-1),{q:quat(p),previewBores:true});
    doorMembers[hand].push(pull);
    for(const dy of [-22,22]) {
      doorMembers[hand].push(fit('100404',xyz(local(p,[x,y+dy,-9])),[pull,door],out,{previewBores:true}));
    }
  }
});
step('Insert the lock key','Insert one key in the built-in lock of the right door. Keep the second key as a spare.',()=>{
  const p=at.get('doorR');
  doorMembers.R.push(fit('10002394',xyz(local(p,[meeting*-1,doorH*.52-56,24])),['doorR'],rotate(axisZ(-1),quat(p)),{q:quat(p)}));
});
step('Level and check the door edges','With a helper holding the cabinet, check it with a spirit level and turn the four levelers as needed. Check the closed door tops line up.',()=>{
  for(const [i,id] of feet.entries()) snug(id,[0,[0,-2,-1,0][i],0],[legs[i]],up,'Turn the attached leveler as needed');
  for(const [hand,s] of sides) move(doorMembers[hand],[doorPos(s,0)],['roof',lowerPivots[hand]],axisZ(-1),{target:[0,1737,204],caption:'Check the two closed top edges line up',view:face});
  for(const [hand,s] of sides) move(doorMembers[hand],[doorPos(s,open)],['roof',lowerPivots[hand]],axisZ(1),{caption:'Reopen the aligned door',view:face});
},{text:'Use two people. The shown leveler travel is illustrative; use the spirit level and check actual door alignment.',page:31});
const wallMounts=[];
step('Anchor both rear brackets to the wall','Start the two cabinet screws loose. Slide the brackets back to the wall, attach both using suitable wall fixings, then tighten the cabinet screws.',()=>{
  const mounts=sides.map(([,s])=>{
    const x=s*314, angle=fit('106989',[x,1750,-169],['roof'],down,{q:[0,0,0,1]});
    return {x,angle,screw:fit('100404',[x,1757,-176],['roof',angle])};
  });
  for(const {x,angle,screw} of mounts) {
    adjust(angle,pose(x,1750,-181),['roof',screw],axisZ(-1),'Slide the captive bracket toward the wall');
  }
  for(const {x,angle} of mounts) {
    wallMounts.push(fit('wallPoint',[x,1773,-217],[angle],axisZ(-1),{caption:'Wall fixing position only — choose fixings for your wall'}));
  }
  for(const [i,{angle,screw}] of mounts.entries()) {
    snug(screw,[0,-3,0],[angle,wallMounts[i]],down,'Tighten the cabinet screw after anchoring');
  }
},tipWarning);
step('Lower the three glass shelves onto their rests','Only after anchoring, bring each transparent glass shelf in through the open doors and lower it flat onto all four aligned corner rests.',()=>{
  for(const [i,y] of restY.entries()) {
    const id=`shelf-${i+1}`, end=pose(0,y+3,0), angle=pitch(.23);
    place(id,end,[...corners.map(([c])=>rests.get(`${c}/${i}`)),...wallMounts],down,
      {path:[pose(0,y+115,425,angle),pose(0,y+52,0,angle),pose(0,y+28,0),end],view:{direction:[-.45,.52,.73],span:720}});
  }
},{text:'Do not fit or load shelves until the two wall attachments are secure. Protect the glass edges while bringing shelves through the doors.',page:32});

export const steps=Object.freeze(all);
