import {X,Y,Z,neg,p,compose,shift,fit,board,shapes,at,dir,step,place,mount,take,fast,bore,move,join,lock} from './records.js';

const Q=Math.PI/2, DOWN=neg(Y), REAR=neg(Z);
const xAxis=s=>s<0?neg(X):X, zAxis=s=>s<0?REAR:Z;
const frameGroup='Frame panels', slatGroup='Bed slats';
const back={id:'pull-back',key:'pullBack',size:[1880,307,18],pose:p(0,179.5,-463),inside:1};
const front={id:'pull-front',key:'pullFront',size:back.size,pose:p(0,179.5,491),inside:-1};
const ends=[-1,1].map((s,i)=>({id:`pull-end-${i?'right':'left'}`,key:i?'pullEndR':'pullEndL',size:[18,305,936],
  pose:p(s*912,178.5,14),stage:p(s*1020,9,-1690,Z,-s*Q),camFace:-s,dowelY:[49,211,299],camY:[125,289]}));
const bearers=['left','center','right'].map((hand,i)=>({id:`pull-bearer-${hand}`,key:['pullBearerL','pullBearerC','pullBearerR'][i],
  size:[18,74,936],pose:p((i-1)*894,76,14),stage:p((i-1)*545,37,-1690),camFace:i===2?-1:1,dowelY:[49,102],camY:[60]}));
const slats=Array.from({length:12},(_,i)=>({id:`pull-slat-${i+1}`,pose:p(-825+150*i,343,10),
  stage:p(635+(i%3)*78,9+Math.floor(i/3)*18,-1690),locator:i===0||i===5||i===11}));
const slatSize=[58,18,930], slatJoints=[-444,464];
const slots=[-900,900,-640,-375,-115,115,375,640];
const railDatums={slots,slotLength:12,webZ:-10,flangeY:-13,thickness:2,panelY:320};
const slotFace=railDatums.webZ+railDatums.thickness/2;
const casterZ=[-373,400], trackY=87, trackZ=207, trackHoles=[-225,0,225];
const bearerScrewLength=shapes['109542'][1];

export const rollingDatums={
  back,front,ends,bearers,slats,slatSize,slatJoints,
  frontOpenings:[-452,452].map(x=>({x,left:x-438,right:x+438,bottom:45,top:293})),
  rail:railDatums,
  casterZ,trackY,trackZ,trackHoles,bearerScrewLength
};

const workZ=-700;
const onBack=p(0,472,workZ,X,-Q), upright=p(0,0,workZ);
const onBench=part=>compose(onBack,part.pose);
const camReach=21;
const fromPanel=(panel,x,y,z)=>[x,y-panel.pose[1],z];

function drillBoards() {
  for(const panel of [back,front]) {
    const face=zAxis(panel.inside), surface=9*panel.inside;
    for(const side of [...ends,...bearers]) {
      const x=side.pose[0];
      for(const y of side.camY) bore(panel.id,fromPanel(panel,x,y,surface),face,2.6,12);
      for(const y of side.dowelY) bore(panel.id,fromPanel(panel,x,y,surface),face,3.9,16);
    }
    for(const x of slots) bore(panel.id,fromPanel(panel,x,railDatums.panelY,surface),face,2.1,10);
  }
  for(const side of [...ends,...bearers]) for(const s of [-1,1]) {
    const edge=s*side.size[2]/2;
    for(const y of side.dowelY) bore(side.id,[0,y-side.pose[1],edge],zAxis(s),3.9,16);
    for(const y of side.camY) {
      bore(side.id,[0,y-side.pose[1],edge],zAxis(s),4.4,27);
      bore(side.id,[side.camFace*9,y-side.pose[1],edge-s*camReach],xAxis(side.camFace),7.5,12);
    }
  }
  for(const b of bearers) for(const z of casterZ) for(const d of [-23,23])
    bore(b.id,[0,-37,z-b.pose[2]+d],DOWN,2.2,24);
  for(const slat of slats) for(const z of slatJoints)
    bore(slat.id,[0,-9,z-slat.pose[2]],DOWN,2.8,11);
}

function dowel(side) {
  for(const s of [-1,1]) for(const y of side.dowelY)
    fast('101345',side.id,[0,y-side.pose[1],s*side.size[2]/2],zAxis(-s));
}

function studs(panel) {
  const ids=new Map();
  for(const side of [ends[0],bearers[0],bearers[1],bearers[2],ends[1]]) {
    ids.set(side.id,side.camY.map(y=>fast('118331',panel.id,
      fromPanel(panel,side.pose[0],y,15*panel.inside),zAxis(-panel.inside))));
  }
  return ids;
}

function straightRail(panel) {
  const rear=panel===back, id=take('112976');
  const {webZ,flangeY,thickness,panelY}=railDatums;
  const offset=(panel.size[2]/2-webZ+thickness/2)*panel.inside;
  const localZ=(slatJoints[rear?0:1]-panel.pose[2]-offset)*panel.inside;
  for(const x of slots) bore(id,[x,0,slotFace],Z,2.35,thickness);
  for(let i=0;i<25;i++) {
    const x=-900+i*75, localX=rear?-x:x;
    const locator=slats.some(s=>s.locator&&s.pose[0]===x);
    bore(id,[localX,flangeY+(locator?1:-1)*thickness/2,localZ],locator?Y:DOWN,2.9,thickness);
  }
  mount(id,panel.id,p(0,panelY-panel.pose[1],offset,rear?Z:X,Math.PI),zAxis(-panel.inside),[],55,
    'Bring the slat rail web against the panel');
  return id;
}

function railScrews(panel,rail,xs) {
  for(const x of xs) fast('105307',rail,[x,0,slotFace-5.5],REAR,[panel.id]);
}

function cams(side,edge,studIds,engaged) {
  const axis=xAxis(-side.camFace);
  return side.camY.map((y,i)=>{
    const point=[side.camFace*3,y-side.pose[1],edge*(side.size[2]/2-camReach)];
    const pose=compose(fit(point,axis),p(0,0,0,Y,edge===1?0:Math.PI));
    const receivers=studIds?[studIds[i]]:[];
    const cam=mount(take('119030'),side.id,pose,axis,receivers,35,'Seat the cam with its opening toward the stud',true);
    if(engaged) lock(cam,[side.id,...receivers],dir(side.id,axis));
    return cam;
  });
}

function runner(bearer,hand,face,spaced=false) {
  const id=take(hand), outward=xAxis(face), inward=neg(outward);
  const y=trackY-bearer.pose[1], z=trackZ-bearer.pose[2];
  for(const hole of trackHoles) {
    bore(bearer.id,[face*9,y,z+hole],outward,2.2,spaced?8.5:13);
    bore(id,[face,0,hole],outward,2.8,2);
  }
  const spacers=spaced?trackHoles.map(hole=>{
    const spacer=take('110646');
    bore(spacer,[0,5,0],Y,2.75,10);
    return mount(spacer,bearer.id,fit([face*14,y,z+hole],inward),inward,[],42,'Center the spacer on the pilot',true);
  }):[];
  mount(id,bearer.id,p(face*(spaced?20:10),y,z),inward,spacers,55,`Seat ${hand} with its wheel at the front`,true);
  const key=spaced?'102138':'100372', length=shapes[key][1];
  for(const [i,hole] of trackHoles.entries())
    fast(key,id,[face*(1.6-length/2),0,hole],inward,spaced?[spacers[i],bearer.id]:[bearer.id]);
}

function mountCaster(bearer,z) {
  const caster=take('111401');
  for(const d of [-23,23]) bore(caster,[0,17,d],DOWN,2.8,2);
  mount(caster,bearer.id,p(0,-56,z-bearer.pose[2]),Y,[],45,'Set the caster plate on the narrow edge');
  for(const d of [-23,23]) fast('109567',caster,[0,29.4,d],Y,[bearer.id]);
}

export function rolling() {
  board(back.id,back.key,'Solid pullout board',back.size,frameGroup,6,p(0,9,-2290,X,-Q));
  board(front.id,front.key,'Two-opening pullout front',front.size,frameGroup,14,p(0,9,-1100,X,Q));
  for(const end of ends) board(end.id,end.key,`Pullout end panel · ${end.camFace===1?'left':'right'}`,end.size,frameGroup,6,end.stage);
  for(const [i,b] of bearers.entries()) board(b.id,b.key,`Roller bearer · ${['left','center','right'][i]}`,b.size,frameGroup,10,b.stage);
  for(const slat of slats) board(slat.id,'pullSlat','Short pullout slat',slatSize,slatGroup,18,slat.stage);
  drillBoards();

  step(1,'Dowel the pullout ends','Lay out the solid board and both ends on protection. Press three dowels into each short edge of each end.');
  place(back.id,onBench(back),DOWN);
  for(const end of ends) place(end.id,end.stage,DOWN);
  for(const end of ends) dowel(end);

  step(2,'Stud the solid board','Fit seven small cam studs in its inside face: three near each end and one at the center.');
  const backStuds=studs(back);

  step(3,'Start the rear rail','Bring a straight rail to the deck edge. Use two 105307 screws in its end slots.');
  const backRail=straightRail(back);
  railScrews(back,backRail,slots.slice(0,2));

  step(4,'Secure the rear rail','Drive six more 105307 screws through the remaining mounting slots, not the round slat holes.');
  railScrews(back,backRail,slots.slice(2));

  step(5,'Lower the end panels','Stand both ends on the solid board with the cam bores facing inward.');
  for(const end of ends) {
    const [x,,z]=end.stage, endPose=onBench(end);
    move(end.id,[p(x,550,z,Z,-Math.sign(x)*Q),p(x,550,z,X,-Q),shift(endPose,Y,140),endPose],DOWN,
      [back.id,...backStuds.get(end.id)],'Seat the lower dowels and studs');
    join(end.id,back.id);
  }

  step(6,'Lock the rear end joints','Insert two small cams into each joined end and turn them onto the studs.');
  for(const end of ends) cams(end,-1,backStuds.get(end.id),true);

  step(7,'Load the open end cams','Fit two cams at each free end. Leave all four unlocked for the front.');
  const frontCams=ends.map(end=>cams(end,1));

  step(8,'Fit the center CR runner','Lay out the three bearers. Fit CR on the center bearer with three spacers and three 102138 screws; wheel toward the opening.');
  for(const b of bearers) place(b.id,b.stage,DOWN);
  runner(bearers[1],'CR',-1,true);

  step(9,'Fit the center CL runner','Fit CL opposite CR with three new spacers and three 102138 screws. Both wheels face the same end.');
  runner(bearers[1],'CL',1,true);

  step(10,'Fit the outer CR runner','Seat CR directly on the right bearer with three short 100372 screws. Do not add spacers.');
  runner(bearers[2],'CR',-1);

  step(11,'Fit the outer CL runner','Seat CL directly on the left bearer with three short 100372 screws, wheel toward the opening.');
  runner(bearers[0],'CL',1);

  step(12,'Attach all six casters','Turn the bearer bottoms up. Fix two caster plates per bearer, two 109567 screws per plate, then turn them wheels-down.');
  for(const b of bearers) {
    const [x,,z]=b.stage;
    move(b.id,[p(x,78,z),p(x,78,z,Z,Math.PI),p(x,37,z,Z,Math.PI)],Y,[],'Turn the caster edge up');
  }
  for(const b of bearers) for(const z of casterZ) mountCaster(b,z);
  for(const b of bearers) {
    const [x,,z]=b.stage;
    move(b.id,[p(x,83,z,Z,Math.PI),p(x,83,z),p(x,b.pose[1],z)],DOWN,[],'Set the caster wheels on the floor');
  }

  step(13,'Dowel the bearer ends','Press two dowels into each end of each bearer, then turn the runner wheels uppermost.');
  for(const b of bearers) dowel(b);
  for(const b of bearers) {
    const [x,,z]=b.stage;
    move(b.id,[p(x,535,z),p(x,535,z,X,-Q)],Y,[],'Stand the bearer on its rear end');
  }

  step(14,'Seat the three bearers','Lower all three onto the solid board. Keep the center bearer in the middle and the runner wheels uppermost.');
  for(const b of bearers) {
    const endPose=onBench(b);
    move(b.id,[shift(endPose,Y,105),endPose],DOWN,[back.id,...backStuds.get(b.id)],'Lower onto the matching stud and dowel holes');
    join(b.id,back.id);
  }

  step(15,'Lock the rear bearer joints','Insert and turn one small cam at the solid-board end of each bearer.');
  for(const b of bearers) cams(b,-1,backStuds.get(b.id),true);

  step(16,'Stud the open front','Lay the two-opening front inside face up. Fit seven small cam studs, including one in the center divider.');
  place(front.id,p(0,9,35,X,Q),DOWN);
  const frontStuds=studs(front);

  step(17,'Start the front rail','Position a straight rail along the inside deck edge. Use two 105307 screws in its end slots.');
  const frontRail=straightRail(front);
  railScrews(front,frontRail,slots.slice(0,2));

  step(18,'Secure the front rail','Use six more 105307 screws in the remaining mounting slots.');
  railScrews(front,frontRail,slots.slice(2));

  step(19,'Lower the open front','Turn the prepared front as one piece. Lower it onto the free ends with the rail lip facing the deck span.');
  const frontEnd=onBench(front);
  move(front.id,[p(0,1120,35,X,Q),p(0,1120,35,X,-Q),shift(frontEnd,Y,120),frontEnd],DOWN,
    [...ends,...bearers].map(side=>side.id),'Bring both openings down over the five prepared ends');
  join(front.id,back.id);

  step(20,'Lock the front end joints','Turn the four cams already fitted in the end panels. Add no new cams.');
  for(const [i,end] of ends.entries()) for(const [j,cam] of frontCams[i].entries())
    lock(cam,[end.id,front.id,frontStuds.get(end.id)[j]],dir(end.id,xAxis(-end.camFace)));

  step(21,'Lock the front bearer joints','Insert and turn one small cam at the front of each bearer.');
  for(const b of bearers) cams(b,1,frontStuds.get(b.id),true);

  step(22,'Screw bearers to the ends','From inside the drawer bays, drive three long 109542 screws through each outer bearer into its end panel.');
  for(const [i,b] of [bearers[0],bearers[2]].entries()) {
    const end=ends[i], s=end.camFace, axis=xAxis(-s);
    for(const z of [-337,32,408]) {
      bore(b.id,[s*9,107-b.pose[1],z-b.pose[2]],neg(axis),2.8,18);
      bore(end.id,[s*9,107-end.pose[1],z-end.pose[2]],neg(axis),2.3,16);
      fast('109542',b.id,[s*(9.6-bearerScrewLength/2),107-b.pose[1],z-b.pose[2]],axis,[end.id]);
    }
  }

  const rails=[backRail,frontRail], locators=slats.filter(s=>s.locator), pinned=slats.filter(s=>!s.locator);
  step(23,'Fix three short locating slats','Use the shorter slats. Fit the three locators at 2 / 12 / 2 and secure both ends with 105307 screws.');
  for(const slat of locators) {
    place(slat.id,onBench(slat),dir(back.id,DOWN),rails,75,'Bring both ends to the indicated round holes');
    join(slat.id,back.id);
    for(const [i,z] of slatJoints.entries()) fast('105307',slat.id,[0,-5.5,z-slat.pose[2]],Y,[rails[i]]);
  }

  step(24,'Turn the pullout and pin nine slats','Turn the frame onto its casters. Press one 110525 pin into each end of the other nine short slats.');
  move(back.id,[shift(at(back.id),Y,140),p(0,169,workZ-600,X,-Q/2),p(0,220,workZ-463),compose(upright,back.pose)],DOWN,[],
    'Turn the frame with both rails and all three locating slats attached');
  for(const [i,slat] of pinned.entries()) {
    place(slat.id,p((i-4)*74,9,-1960,Z,Math.PI),DOWN);
    for(const z of slatJoints) fast('110525',slat.id,[0,-9,z-slat.pose[2]],Y);
  }

  step(25,'Drop in the remaining short slats','Turn the pinned ends down and lower them into the paired rail holes. Roll the assembled pullout aside.');
  for(const slat of pinned) {
    const [x,,z]=at(slat.id), end=compose(upright,slat.pose);
    move(slat.id,[p(x,437,z,Z,Math.PI),p(x,437,z),shift(end,Y,94),end],DOWN,rails,'Seat both pins in the vacant paired holes');
    join(slat.id,back.id);
  }
  move(back.id,[back.pose],Z,[],'Park the completed pullout on its casters');
}
