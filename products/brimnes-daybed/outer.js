import {X,Y,Z,neg,p,compose,shift,fit,at,on,dir,step,board,parts,steps,take,bore,place,mount,fast,move,join,lock} from './records.js';

const Q=Math.PI/2, down=neg(Y), rearward=neg(Z), hands=[-1,1];
const back='fixed-back', backY=450, backZ=-511.7, halfBack=956.75;
const endY=292.5, endZ=-11.7, endX=965.75, halfEndH=288.5;
const slatY=343, slatZ=-12;
const slotX=[900,640,375,115].flatMap(x=>[-x,x]);
const slats=Array.from({length:13},(_,i)=>({id:`fixed-slat-${i+1}`,x:-900+150*i,hand:i===0?-1:i===12?1:0}));
const ends=hands.map(s=>({id:s<0?'fixed-left':'fixed-right',s}));
const rearRail=p(0,340,-492,Z,Math.PI), frontRail=p(0,353,465);
const dowelY=[390,514], camY=[543,356], studZ=-2.5, dowelZ=3;

export const fixedDeck={
  back:{id:back,size:[1913.5,262,18],pose:p(0,backY,backZ)},
  end:{size:[18,577,1018],x:endX,y:endY,z:endZ,stile:88,topRail:112,bottomRail:94,grooveDepth:6},
  slats,slatSize:[58,18,978],slatY,slatZ,
  rear:{pose:rearRail,slotX,roundZ:-490,flangeBottom:352},
  front:{pose:frontRail,flangeBottom:352,tabX:955.75,upperY:38,lowerY:12},
  hook:{centerX:30.5,centerY:3,centerZ:467,holeZ:[-14,0,14]},
  feet:{centersZ:[-430,430],prongsZ:[-10,10]}
};

const benchZ=-3660, slatStageZ=-4800, slatPrepZ=-3050;
const backPose=p(0,backY,benchZ), backFloor=p(0,9,benchZ,X,-Q);
const endPrep=s=>p(s*680,9,-2950,Z,-s*Q);
const endPose=({s},gap=0)=>p(s*(endX+gap),endY,benchZ+endZ-backZ);
const across=s=>[s,0,0];
const backLocal=pose=>compose(p(0,-backY,-backZ),pose);
const slatPrep=slat=>p(slat.x,9,slatPrepZ);

function view(direction,span,target) {
  const joint=steps.at(-1).operations.at(-1).joint;
  joint.view={direction,span};
  if(target) joint.target=target.slice(0,3);
}

function workEdge(angle,lift=0) {
  const c=Math.cos(angle), s=Math.sin(angle);
  return p(0,backY*c-9*s+lift,benchZ-9+backY*s+9*c,X,angle);
}

function seatSlat(slat,rails,pinned) {
  const end=on(back,p(slat.x,slatY-backY,slatZ-backZ));
  const axis=dir(back,Y), raised=shift(at(slat.id),Y,520);
  move(slat.id,[raised,p(...raised.slice(0,3),X,-Q),shift(end,axis,-65),end],axis,rails,
    pinned?'Engage the upward pin under the rear rail':'Seat the hooked slat under both rail lips');
  view([-.45,.48,-.75],1020,end);
  join(slat.id,back);
}

export function outer() {
  const {hook,feet,front}=fixedDeck, hookSlats=slats.filter(slat=>slat.hand), plainSlats=slats.filter(slat=>!slat.hand);
  board(back,'fixedBack','Long fixed back board',fixedDeck.back.size,'Frame panels',20,backFloor);
  for(const {id,s} of ends) board(id,s<0?'fixedLeft':'fixedRight',s<0?'Left paneled end':'Right paneled end',fixedDeck.end.size,'Frame panels',20,endPrep(s));
  for(const {id,x,hand} of slats) {
    const key=hand<0?'fixedHookLeft':hand>0?'fixedHookRight':'fixedSlat';
    board(id,key,hand?'Side-drilled long slat':'Plain long slat',fixedDeck.slatSize,'Bed slats',hand?25:27,p(x,9,slatStageZ));
  }

  step(26,'Dowel the fixed back','Lay out the back and both paneled ends on protection. Press two 101359 dowels into each end of the back.');
  place(back,backFloor,down);
  for(const {id,s} of ends) place(id,endPrep(s),down);
  const dowels=hands.map(s=>dowelY.map(y=>{
    bore(back,[s*halfBack,y-backY,dowelZ],across(s),5.1,20);
    return fast('101359',back,[s*(halfBack-2),y-backY,dowelZ],across(-s),[],32);
  }));

  step(27,'Fit the large end studs','Finger-tighten two 114671 studs near the rear of each paneled end.');
  const studs=ends.map(({id,s})=>camY.map(y=>{
    const z=backZ+studZ-endZ;
    bore(id,[-s*9,y-endY,z],across(-s),4.2,12);
    return fast('114671',id,[-s*23,y-endY,z],across(s),[],32);
  }));

  step(28,'Start the fixed rear rail','Seat the straight 112976 on the inside of the back. Use 105307 screws at the two outboard slots.');
  const rear=take('112976');
  for(const x of slotX) {
    bore(back,[x,rearRail[1]-backY,9],Z,2.25,11);
    bore(rear,[x,0,-9],Z,2.8,2);
  }
  for(const {x,hand} of slats) {
    bore(rear,[-x,-14,2],down,hand?2.8:3.1,2);
    if(!hand) bore(rear,[-x,-12,2],Y,5.1,1.3);
  }
  mount(rear,back,backLocal(rearRail),rearward,[],72,'Align the straight rail with its flange over the deck');
  const rearScrew=x=>fast('105307',rear,[x,0,-15],rearward,[back],32);
  slotX.slice(0,2).forEach(rearScrew);

  step(29,'Secure the rear rail','Use six more 105307 screws in the remaining back-board slots, not the round slat holes.');
  slotX.slice(2).forEach(rearScrew);

  step(30,'Turn the back and insert cams','Stand the back with its rail attached. Insert four 114670 cams from the rear, with their openings toward the studs.');
  move(back,[p(0,157,benchZ,X,-Q/2),p(0,131,benchZ)],Y,[],'Raise the back onto its long edge');
  view([-.5,.5,-.8],1960);
  const cams=hands.map(s=>camY.map(y=>{
    const x=s*(halfBack-36);
    bore(back,[x,y-backY,-9],rearward,22.1,12.4);
    bore(back,[s*halfBack,y-backY,studZ],across(s),5.2,39);
    const cam=compose(fit([x,y-backY,-3],Z),p(0,0,0,Y,s<0?Math.PI:0));
    return mount(take('114670'),back,cam,Z,[],58,'Point the cam opening toward this end',true);
  }));

  step(31,'Join and draw in the end panels','Stand the ends on the dowels and studs. With the 100049 key, turn upper, lower, upper, then lower at each end to close the seam.');
  move(back,[backPose],Y,[],'Support the back at the end-panel joints');
  view([-.46,.4,-.8],2000);
  for(const [i,end] of ends.entries()) {
    const {id,s}=end, axis=across(-s), joint=[back,...dowels[i]], [upper,lower]=cams[i];
    for(const y of dowelY) bore(id,[-s*9,y-endY,backZ+dowelZ-endZ],axis,5.15,17);
    move(id,[shift(at(id),Y,305),shift(endPose(end,78),Y,38),endPose(end,78),endPose(end,8)],axis,joint,'Turn the end upright and engage the dowels');
    view([s*.54,.38,-.73],840);
    lock(upper,[back,id,studs[i][0]],Z,.5,'1 · Catch the upper stud');
    lock(lower,[back,id,studs[i][1]],Z,.5,'2 · Catch the lower stud');
    lock(upper,[back,id,studs[i][0]],Z,1,'3 · Draw in the upper joint');
    move(id,[endPose(end,4)],axis,[back,upper],'Narrow the seam');
    lock(lower,[back,id,studs[i][1]],Z,1,'4 · Draw the seam flush');
    move(id,[endPose(end)],axis,[back,lower],'Seat the end panel flush');
    join(id,back);
  }

  step(32,'Clip the bent front rail in place','Use a 130485 clip and a 105307 screw at each upper tab hole. Leave the lower holes free.');
  const bent=take('112978');
  for(const {x} of slats) bore(bent,[x,1,0],Y,2.8,2);
  for(const {id,s} of ends) {
    bore(bent,[s*(front.tabX-1),front.upperY,0],across(-s),2.8,2);
    bore(bent,[s*(front.tabX-1),front.lowerY,0],across(-s),3.2,2);
    bore(id,[-s*9,frontRail[1]+front.upperY-endY,frontRail[2]-endZ],across(-s),2.25,5.5);
    bore(id,[s*9,frontRail[1]+front.lowerY-endY,frontRail[2]-endZ],across(s),4.6,18);
  }
  mount(bent,back,backLocal(frontRail),down,ends.map(end=>end.id),85,'Lower the bent tabs between both end panels');
  view([-.42,.51,.75],1940);
  for(const {id,s} of ends) {
    const clip=take('130485'), axis=across(s);
    bore(clip,[-s*2.5,0,0],neg(axis),2.8,5);
    mount(clip,bent,p(s*(front.tabX-3.5),front.upperY,0),axis,[id],30);
    fast('105307',clip,[s*3.5,0,0],axis,[bent,id],32);
  }

  step(33,'Bolt the lower rail tabs','Insert the sleeves from outside and counterhold with 108490. Drive the 105163 screws from inside into the sleeves.');
  for(const {id,s} of ends) {
    const y=frontRail[1]+front.lowerY-endY, z=frontRail[2]-endZ;
    const sleeve=fast('100602',id,[s,y,z],across(-s),[bent],36,'Seat the sleeve from outside');
    bore(sleeve,[0,-8,0],down,3,12);
    fast('105163',bent,[s*(front.tabX+6.5),front.lowerY,0],across(s),[id,sleeve],38,'Drive the screw into the sleeve from inside');
  }

  step(34,'Fit the two slat hooks','Choose the two side-drilled long slats. Use two 100372 screws in each hook’s outer holes.');
  for(const slat of hookSlats) {
    const {id,hand:s}=slat;
    place(id,slatPrep(slat),down);
    const plate=take('123660'), axis=across(-s);
    parts.get(plate).hand=s;
    for(const z of hook.holeZ) bore(plate,[s*1.5,0,z],neg(axis),z?2.8:3.4,3);
    mount(plate,id,p(s*hook.centerX,hook.centerY,hook.centerZ),axis,[],35,'Keep the hook return at the front');
    for(const z of hook.holeZ.filter(z=>z!==0)) {
      bore(id,[s*29,hook.centerY,hook.centerZ+z],neg(axis),2.15,13);
      fast('100372',plate,[-s*6,0,z],axis,[id],30);
    }
  }

  step(35,'Secure the hooked end slats','Turn the frame onto its back edge. Seat the slats under both lips, hooks facing out, and add one 105307 at each end.');
  move(back,[workEdge(-Q/3,22),workEdge(-2*Q/3,22),workEdge(-Q)],down,[],'Turn the complete outer frame onto its protected edge');
  view([-.55,.6,.7],2180);
  for(const slat of hookSlats) {
    seatSlat(slat,[bent,rear],false);
    bore(slat.id,[0,9,fixedDeck.front.pose[2]-slatZ],Y,2.2,10);
    bore(slat.id,[0,9,fixedDeck.rear.roundZ-slatZ],Y,2.2,10);
    fast('105307',bent,[slat.x,-5,0],down,[slat.id],30);
    fast('105307',rear,[-slat.x,-8,2],Y,[slat.id],30);
  }

  step(36,'Hammer in the four feet','Tap two 130787 feet into the bottom edge of each end panel.');
  for(const {id} of ends) for(const z of feet.centersZ) {
    for(const offset of feet.prongsZ) bore(id,[0,-halfEndH,z+offset],down,2.35,5);
    mount(take('130787'),id,p(0,-halfEndH,z),Y,[],36,'Tap both prongs into the edge');
  }

  step(37,'Pin the eleven plain slats','Press one 110525 pin into the rear tip of each plain long slat.');
  for(const slat of plainSlats) {
    const z=fixedDeck.rear.roundZ-slatZ;
    place(slat.id,slatPrep(slat),down);
    bore(slat.id,[0,9,z],Y,2.65,8);
    fast('110525',slat.id,[0,9,z],down,[],30);
  }

  step(38,'Fit the plain fixed slats','Engage the upward pins in the rear lip. Fix the other ends through the front lip with eleven 105307 screws.',{text:'Do not sit on the incomplete frame.',page:28});
  for(const slat of plainSlats) {
    seatSlat(slat,[rear,bent],true);
    bore(slat.id,[0,9,frontRail[2]-slatZ],Y,2.2,10);
    fast('105307',bent,[slat.x,-5,0],down,[slat.id],30);
  }

  step(39,'Nest the two frames','With two people, lower the fixed frame so the front rail sits over the pullout slats, then slide the frames together.',{text:'Use two people to lift and lower the fixed frame.',page:29});
  move(back,[workEdge(-2*Q/3,40),workEdge(-Q/3,40),shift(backPose,Y,195)],Y,[],'Two people turn and lift the whole fixed frame');
  view([-.52,.51,.76],2220);
  const compact=fixedDeck.back.pose, overlap=shift(compact,Z,-905);
  const rolling=['pull-back','pull-front'];
  move(back,[shift(overlap,Y,195)],Z,rolling,'Carry the fixed frame over the rear of the pullout');
  view([-.39,.65,.79],3780,p(0,370,-1830));
  move(back,[overlap,compact],down,[...rolling,bent],'Lower the rail onto the overlap, then slide the slats together');
  view([-.39,.65,.79],2440,p(0,322,-205));
}
