import {
  X,Y,Z,neg,p,rotate,shift,at,on,dir,board,parts,shapes,step,place,mount,take,bore,fast,move,join,lock
} from './records.js';

const Q=Math.PI/2, down=neg(Y), rear=neg(Z);
const panel=18, bottomThickness=4, inside={width:800,depth:540,height:159};
const frontY=169, frontZ=491, frontSize=[870,240,panel];
const frontInner=frontZ-panel/2, rearInner=frontInner-inside.depth, rearOuter=rearInner-panel;
const bottomY=108, bottomTop=bottomY+bottomThickness/2, sideTop=bottomTop+inside.height;
const sideBottom=79, sideY=(sideTop+sideBottom)/2, sideZ=(rearOuter+frontInner)/2;
const sideX=(inside.width+panel)/2, sideSize=[panel,sideTop-sideBottom,frontInner-rearOuter];
const backY=(sideTop+bottomTop)/2, backZ=(rearOuter+rearInner)/2;
const backSize=[inside.width+4,inside.height,panel];
const bottomFront=frontInner+4, bottomRear=rearOuter+2, bottomZ=(bottomFront+bottomRear)/2;
const bottomSize=[inside.width+8,bottomThickness,bottomFront-bottomRear];
const rail={y:87,z:207,webX:419,pilots:[-225,0,225],wheelY:96,wheelZ:-252};
const opening={xCenters:[-452,452],width:876,bottom:45,top:293,frontZ:500};
const sideKey=s=>s<0?'drawer-side-left':'drawer-side-right';
const out=s=>[s,0,0];

const grooveHeight=4.6, grooveDepth=5, rebateDepth=3;
const sideCuts=s=>[
  {center:[-s*(panel-grooveDepth)/2,bottomY-sideY,0],size:[grooveDepth,grooveHeight,sideSize[2]]},
  {center:[-s*(panel-rebateDepth)/2,backY-sideY,rearOuter-sideZ+(panel+.5)/2],size:[rebateDepth,backSize[1],panel+.5]},
];
const braceY=106.5, braceRear=rearOuter-2, braceZ=(frontInner+braceRear)/2;
const brace={
  size:[22,29,frontInner-braceRear],
  beam:{center:[0,99-braceY,0],size:[16,14,frontInner-braceRear-4]},
  frontTab:{center:[0,98-braceY,frontInner-braceZ-1],size:[22,12,2],slot:[0,100-braceY,frontInner-braceZ-1],slotWidth:5,slotOpens:Y},
  backTab:{center:[0,107-braceY,braceRear-braceZ+1],size:[22,28,2],hole:[0,116-braceY,braceRear-braceZ],holeRadius:2.75},
  headGap:3, headHeight:2.5,
};
export const drawerDatums={
  inside,opening,runner:rail,brace,bottomSize,
  underside:{sideBottom,bottom:bottomY-bottomThickness/2,bottomTop,frontInner,rearOuter},
  grooves:{
    'drawer-front':[{center:[0,bottomY-frontY,-(panel-grooveDepth)/2],size:[inside.width+10,grooveHeight,grooveDepth]}],
    [sideKey(-1)]:sideCuts(-1),[sideKey(1)]:sideCuts(1),
  },
};

const frontPinY=[151,221], studY=[130,242], backPinY=[130,247], camZ=frontInner-21;
const point=(x,y,z)=>[x,y-frontY,z-frontZ];
const frontAt=(x,y,z,angle=0)=>p(x,y,z,X,angle);
const sideAt=s=>p(...point(s*sideX,sideY,sideZ));
const backAt=p(...point(0,backY,backZ));
const bottomAt=p(...point(0,bottomY,bottomZ));
const braceAt=p(...point(0,braceY,braceZ));
const braceFrontY=braceY+brace.frontTab.slot[1], braceBackY=braceY+brace.backTab.hole[1];
const handleY=254, handleX=[-66,66], handleDepth=21;
const group='Drawer panels';

function registerDrawer(x,i) {
  const benchX=i===0?-540:540, benchZ=1380, id=`drawer-${i+1}`;
  const bench=frontAt(benchX,panel/2,benchZ,Q);
  const front=board(`${id}-front`,'drawer-front','Drawer front',frontSize,group,30,bench);
  const sides=[-1,1].map(s=>{
    const hand=s<0?'left':'right', prep=p(benchX+s*163,panel/2,1970,Z,-s*Q);
    return {s,prep,id:board(`${id}-${hand}`,sideKey(s),`${s<0?'Left':'Right'} drawer side`,sideSize,group,30,prep)};
  });
  const bottom=board(`${id}-bottom`,'drawer-bottom','Drawer bottom',bottomSize,group,32,p(benchX,bottomThickness/2,2580));
  const back=board(`${id}-back`,'drawer-back','Drawer back',backSize,group,32,frontAt(benchX,panel/2,2980,Q));
  return {front,sides,bottom,back,bench,benchX,benchZ,x,tracks:i===0?['CL-2','CR-1']:['CL-1','CR-2']};
}

function turnDrawer(d,upsideDown) {
  const {front,benchX:x,benchZ:z}=d;
  const angle=upsideDown?Math.PI:0;
  const over=(height,a)=>frontAt(x,height,z,a);
  const from=upsideDown?Q:Math.PI;
  move(front,[over(132,from),over(132,(from+angle)/2),over(132,angle),over(frontSize[1]/2,angle)],Y,[],
    upsideDown?'Turn the assembled box bottom-up':'Return the drawer upright');
}

function insertDrawer(d) {
  // Pitch about the rear roller pair while they pass the cabinet rollers.
  const approach=(wheelY,wheelZ,angle)=>{
    const r=rotate(point(0,rail.wheelY,rail.z+rail.wheelZ),frontAt(0,0,0,angle));
    return frontAt(d.x,wheelY-r[1],wheelZ-r[2],angle);
  };
  const pitch=-Math.PI/36;
  const tilted=approach(109,540,pitch), level=approach(rail.wheelY,425,0);
  const receivers=[...d.tracks,'pull-front'];
  move(d.front,[frontAt(d.benchX,240,d.benchZ),frontAt(d.x,240,1180),tilted],rear,receivers,
    'Lift the front and line up both rear rollers');
  move(d.front,[approach(108,471,pitch),level],rear,receivers,'Engage both tracks and level the drawer');
  move(d.front,[frontAt(d.x,frontY,frontZ)],rear,receivers,'Slide the drawer shut');
}

export function drawers() {
  const boxes=opening.xCenters.map(registerDrawer);
  shapes['118301']=brace.size;

  step(40,'Dowel the drawer sides','Lay out both fronts and all four sides. Press two 101345 dowels into the front edge of each side.');
  for(const d of boxes) {
    place(d.front,d.bench,down,[],65,'Lay the front face-down on protection');
    for(const {id,prep} of d.sides) place(id,prep,down,[],55,'Lay the side with its groove up');
  }
  for(const {front,sides} of boxes) for(const {id,s} of sides) for(const y of frontPinY) {
    const pin=[0,y-sideY,sideSize[2]/2];
    bore(id,pin,Z,4.1,15);
    bore(front,point(s*sideX,y,frontInner),rear,4.1,15);
    fast('101345',id,pin,rear);
  }

  step(41,'Fit the front studs','Drive four 118331 studs into the inside of each drawer front.');
  for(const {front,sides} of boxes) for(const side of sides) {
    side.studs=studY.map(y=>{
      bore(front,point(side.s*sideX,y,frontInner),rear,2.8,10);
      bore(side.id,[0,y-sideY,sideSize[2]/2],Z,4.6,26);
      return fast('118331',front,point(side.s*sideX,y,frontInner-7),Z);
    });
  }

  step(42,'Stand the sides on the fronts','Lower each handed pair onto its studs and dowels, with the grooves facing one another.');
  for(const {front,sides} of boxes) for(const {id,s,studs} of sides) {
    const seat=on(front,sideAt(s)), raised=shift(at(id),Y,398);
    move(id,[raised,[...raised.slice(0,3),...seat.slice(3)],shift(seat,Y,90),seat],dir(front,Z),[front,...studs],
      'Lower the side onto its two studs and dowels');
    join(id,front);
  }

  step(43,'Lock the drawer corners','Insert two 119030 cams from the outside of each side and turn them onto the studs.');
  for(const {sides} of boxes) for(const {id,s,studs} of sides) for(const [i,y] of studY.entries()) {
    const outward=out(s), axis=neg(outward);
    bore(id,[s*panel/2,y-sideY,camZ-sideZ],outward,7.6,12);
    const cam=fast('119030',id,[s*(panel/2-6),y-sideY,camZ-sideZ],axis,[studs[i]]);
    lock(cam,[id,studs[i]],dir(id,axis));
  }

  step(44,'Start the front brace screws','Start one 100359 in each front. Leave each head proud for the brace tab.');
  for(const d of boxes) {
    bore(d.front,point(0,braceFrontY,frontInner),rear,2.4,12);
    d.screw=fast('100359',d.front,point(0,braceFrontY,frontInner-brace.headGap-brace.headHeight+7.5),Z,[],32,'Leave a gap under the screw head');
  }

  step(45,'Hook the braces under the heads','Slide each open brace tab sideways across its front, under the proud screw head.');
  for(const d of boxes) {
    d.brace=take('118301');
    parts.get(d.brace).unpacked[1]=brace.size[1]/2+2;
    bore(d.brace,brace.backTab.hole,rear,brace.backTab.holeRadius,2);
    // The +Y opening admits the shank without taking the head through the slot.
    mount(d.brace,d.front,braceAt,Y,[d.screw],16,'Slip the open slot under the existing head');
  }

  step(46,'Slide in both bottoms','Feed each bottom through the side grooves, above the brace, into the front groove.');
  for(const {front,sides,bottom,brace:id} of boxes) {
    mount(bottom,front,bottomAt,Z,[...sides.map(s=>s.id),id],bottomSize[2]+14,'Feed the bottom into both grooves');
  }

  step(47,'Seat the drawer backs','Angle each back into the profiled ends of the sides and seat it on the bottom.');
  for(const {front,sides,bottom,back,brace:id} of boxes) {
    const receivers=[...sides.map(s=>s.id),bottom,id];
    mount(back,front,frontAt(...point(0,backY+18,backZ-50),-Q/6),Z,receivers,55,'Bring the back to the open rear');
    // Pass over the rear brace tab before seating the back onto the bottom.
    const lifted=shift(backAt,Y,15);
    move(back,[on(front,shift(lifted,rear,40)),on(front,lifted),on(front,backAt)],dir(front,Z),receivers,
      'Seat the back in the side profiles and onto the bottom');
  }

  step(48,'Pin the drawer backs','Hammer two 110519 fasteners through each side into its back, four per drawer.');
  for(const {sides,back} of boxes) for(const {id,s} of sides) for(const y of backPinY) {
    const outward=out(s), z=backZ-sideZ;
    bore(id,[s*panel/2,y-sideY,z],outward,3.25,panel);
    bore(back,[s*backSize[0]/2,y-backY,0],outward,3.25,14);
    fast('110519',id,[s*(panel/2-14),y-sideY,z],neg(outward),[back]);
  }

  step(49,'Fix the brace at the back','Drive the second 100359 through each brace’s round rear tab into its back.');
  for(const {back,brace:id} of boxes) {
    bore(back,[0,braceBackY-backY,-panel/2],rear,2.4,11);
    const [x,y,z]=brace.backTab.hole;
    fast('100359',id,[x,y,z-brace.headHeight+7.5],Z,[back]);
  }

  step(50,'Fit the DL and DR runners','Turn each drawer bottom-up. Use three 100365 screws per runner and keep the rollers at the back.');
  for(const d of boxes) {
    turnDrawer(d,true);
    for(const {id,s} of d.sides) {
      const outward=out(s), axis=neg(outward), track=take(s<0?'DL':'DR');
      mount(track,id,p(s*(rail.webX-sideX),rail.y-sideY,rail.z-sideZ),axis,[],48,'Place the runner with its wheel at the back');
      for(const z of rail.pilots) {
        bore(track,[s,0,z],outward,2.8,2);
        bore(id,[s*panel/2,rail.y-sideY,rail.z+z-sideZ],outward,2.55,8);
        fast('100365',track,[s*(-1.5),0,z],axis,[id]);
      }
    }
  }

  step(51,'Fit the handles','Turn both drawers upright. Drive two 109567 screws through each front into its handle.');
  for(const d of boxes) {
    turnDrawer(d,false);
    const handle=take('124328');
    mount(handle,d.front,p(...point(0,handleY,opening.frontZ+handleDepth/2)),rear,[],45,'Align the handle on the outside');
    for(const x of handleX) {
      bore(d.front,point(x,handleY,frontInner),rear,2.75,panel);
      bore(handle,[x,0,-handleDepth/2],rear,2.4,8);
      fast('109567',d.front,point(x,handleY,frontZ),Z,[handle]);
    }
  }

  step(52,'Engage and close both drawers','Lift each front, engage the rear rollers on their matching tracks, then level and close the drawer.',
    {text:'Never step into an open drawer.',page:36});
  boxes.forEach(insertDrawer);
}
