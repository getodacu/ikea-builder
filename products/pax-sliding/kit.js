import { pages } from './manual.js';

export const datum = {width:2000,height:2010,depth:580};
export const shapes = {
  upperTrack:[2000,40,68], lowerTrack:[2000,46,68], stile:[24,1940,28], head:[972,26,28], foot:[972,26,28],
  divider:[982,12,18], panel:[976,474,3.2], shortRoller:[40,58,49], longRoller:[40,76,100],
  shortCatch:[40,42,50], longCatch:[40,70,100], railScrew:[9,38,9], joinScrew:[11,42,11], flangeScrew:[9,16,9],
  machineScrew:[8,10,8], pin:[7,14,7], pad:[32,39,2], key:[25,76,5], trim:[31,1972,13],
  edging:[11,1968,12], dustCover:[912,12,63], brush:[12,1918,18]
};

const front=[0,0,1], back=[0,0,-1], up=[0,1,0], down=[0,-1,0], left=[-1,0,0], right=[1,0,0];
const flat=Math.PI/2;
const pose=(x,y,z,a=0)=>[x,y,z,Math.sin(a/2),0,0,Math.cos(a/2)];
const angle=p=>2*Math.atan2(p[3],p[6]);
const point=p=>p.slice(0,3);
const offset=(p,[x,y,z],a)=>pose(p[0]+x,p[1]+y,p[2]+z,a??angle(p));
const along=(a,d)=>a.map(v=>v*d);
function rotate([x,y,z],a) { const c=Math.cos(a), s=Math.sin(a); return [x,y*c-z*s,y*s+z*c]; }
const world=(frame,local)=>offset(frame,rotate(point(local),angle(frame)),angle(frame)+angle(local));
function local(frame,p) {
  return pose(...rotate(point(p).map((v,i)=>v-frame[i]),-angle(frame)),angle(p)-angle(frame));
}

export const families = {};
export const parts = new Map();
const profileGroup='Tracks and frame profiles', hardwareGroup='Hardware and tool', finishGroup='Finishing pieces', externalGroup='Required, not supplied';
const onFloor=(x,z,y=10,a=0)=>pose(x,y,z,a);
function stock(name,label,shape,number,group,page,entries,role='kit') {
  families[name]={name:label,number,group,page,role};
  for(const [id,unpacked] of entries) parts.set(id,{id,family:name,shape,packet:group,unpacked});
}
const ids=(key,n)=>Array.from({length:n},(_,i)=>`${key}-${i+1}`);
const pair=(key)=>[`${key}-left`,`${key}-right`];
const tracks=['upper-track','lower-track'];
stock('upperTrack','Upper twin running track','upperTrack',null,profileGroup,8,[[tracks[0],onFloor(-430,-260,33)]]);
stock('lowerTrack','Lower twin catch track','lowerTrack',null,profileGroup,9,[[tracks[1],onFloor(-430,-165,33)]]);
const door = key => ({key,stiles:pair(`${key}-stile`),head:`${key}-head`,foot:`${key}-foot`,dividers:ids(`${key}-divider`,3),panels:ids(`${key}-panel`,4), members:[], pose:null});
const inner=door('inner'), outer=door('outer');
const doors=[inner,outer];
stock('stile','Door stile with captive cover','stile',null,profileGroup,11,doors.flatMap(({stiles},j)=>stiles.map((id,i)=>[id,pose(-1350+72*(j*2+i),14,1010,flat)])));
stock('head','Door top bar with captive cover','head',null,profileGroup,11,doors.map(({head},j)=>[head,onFloor(-365,20+j*105,15)]));
stock('foot','Door bottom channel','foot',null,profileGroup,11,doors.map(({foot},j)=>[foot,onFloor(-365,230+j*105,15)]));
stock('divider','Panel divider','divider',null,profileGroup,19,doors.flatMap(({dividers},j)=>dividers.map((id,i)=>[id,onFloor(-365,470+(j*3+i)*72)])));
const trim=pair('side-trim'), edging=pair('edge-strip');
for(const [j,[name,label,shape,number,count,role]] of [
  ['key','Hex key','key','10095216',1,'tool'],
  ['railScrew','Long rail end screw','railScrew','109590',4],
  ['joinScrew','Bay-joining screw','joinScrew','114667',2],
  ['flangeScrew','Short rail / side trim screw','flangeScrew','110438',16],
  ['pin','Divider pin','pin','10055702 / 10059666 / 10059649',12],
  ['machineScrew','Bracket machine screw','machineScrew','10067213',16],
  ['shortRoller','Short inner roller unit','shortRoller','10055207',2],
  ['shortCatch','Short inner lower catch','shortCatch','10055037',2],
  ['longRoller','Long outer roller unit','longRoller','10054922',2],
  ['longCatch','Long outer lower catch','longCatch','10055041',2]
].entries()) {
  const h=shapes[shape][1], y=shape.endsWith('Screw')||shape==='pin'?h-2:h/2;
  stock(name,label,shape,number,hardwareGroup,3,ids(name,count).map((id,i)=>[id,onFloor(-840+i%8*103,1070+j*91+Math.floor(i/8)*37,y)]),role);
}
stock('trim','Rigid cabinet-side trim','trim',null,finishGroup,31,trim.map((id,i)=>[id,pose(225+i*74,7,1035,flat)]));
stock('edging','Peel-backed edge strip','edging','10109642 / 10109643 / 10109733 / 10109734 / 10109742 / 10109743',finishGroup,4,
  edging.map((id,i)=>[id,pose(366+i*56,6,1035,flat)]));
stock('dustCover','Outer door dust cap','dustCover','10055716 / 10055763',finishGroup,4,[['dust-cover',onFloor(-365,-60)]]);
stock('brush','Vertical brush seal','brush','10111126 / 10111137 / 10111140 / 10111141',finishGroup,4,[['brush',pose(475,10,1035,flat)]]);
stock('pad','Adhesive corner pad','pad','10100795 / 10100772 / 10100796',finishGroup,4,
  ids('pad',8).map((id,i)=>[id,pose(-1040+i%4*44,1,1950+Math.floor(i/4)*52,flat)]));
stock('panel','MEHAMN infill panel (004.211.85)','panel',null,externalGroup,18,
  doors.flatMap(({panels},j)=>panels.map((id,i)=>[id,pose(1090+j*1040,1.6,40+i*497,flat)])),'external');

const at=new Map();
const used={};
const all=[];
let operations;
const take=(key)=>`${key}-${used[key]=(used[key]??0)+1}`;
function step(title,action,build,warning) {
  operations=[]; build?.();
  all.push({number:all.length+1,page:pages[all.length],title,action,warning,operations});
}
function op(kind,ids,paths,axis,prerequisites,caption,{target=point(paths[0].at(-1)),view,captive,rigid,previewBores}={}) {
  operations.push({kind,ids,prerequisites,poses:paths,axes:ids.map(()=>axis),
    joint:{target,axis,outward:along(axis,-1),receivers:prerequisites,caption,view},captive,rigid,previewBores});
  ids.forEach((id,i)=>at.set(id,paths[i].at(-1)));
}
function place(id,end,axis,prerequisites,caption,options={}) {
  const {distance=100,approach=[],start=offset(end,along(axis,-distance)),...focus}=options;
  op('place',[id],[[start,...approach,end]],axis,prerequisites,caption,focus);
}
const screwAngle=(axis)=>axis===up?Math.PI:axis===front?-flat:axis===back?flat:0;
function fasten(key,ends,axis,receivers,caption,previewBores=false) {
  const ids=ends.map(()=>take(key));
  const paths=ends.map(point=>{
    const end=axis===right?[...point,0,0,Math.SQRT1_2,Math.SQRT1_2]:pose(...point,screwAngle(axis));
    return [[...point.map((v,i)=>v-axis[i]*58),...end.slice(3)],end];
  });
  op('place',ids,paths,axis,receivers,caption,{previewBores});
  return ids;
}
function adjust(ids,from,to,axis,receivers,caption,target=point(at.get(ids[0])),span=190) {
  op('adjust',ids,ids.map(id=>[at.get(id),at.get(id)]),axis,receivers,caption,
    {captive:{from,to},target,view:{direction:[-.42,.3,.85],span}});
}
function rigidMove(ids,frames,axis,receivers,caption,target,span) {
  const offsets=ids.map(id=>local(frames[0],at.get(id)));
  const paths=offsets.map((p,i)=>[at.get(ids[i]),...frames.slice(1).map(f=>world(f,p))]);
  op('move',[...ids],paths,axis,receivers,caption,
    {rigid:{anchor:ids[0],frames,offsets},target,view:{direction:[-.36,.26,.9],span}});
}

const upper=pose(0,1988,0), lower=pose(0,39,0);
const railScrewX=[-982,982];
const flangeX=[-530,-65,65,530];
const stop=493, panelPark=385;
const frameTop=958, carrierX=465;
const workbench=pose(0,36,1300,flat);
const sideloc=[-493,493], bars=[frameTop,-frameTop];
const innerSeat=pose(panelPark,1010,43), outerSeat=pose(320,1014,66);
const channelY=[-476,0,476];
const long=d=>d===outer;
const trackY=d=>long(d)?29:45;
const trackZ=d=>long(d)?19:27;
const trackName=d=>long(d)?'outer lower lane':'inner lower lane';
const dp=(d,x=0,y=0,z=0)=>world(d.pose,pose(x,y,z));
function fit(d,id,p,axis,receivers,caption,options) {
  place(id,world(d.pose,p),axis,receivers,caption,options);
  d.members.push(id);
}
function frame(d) {
  d.pose=workbench;
  for(const [i,id] of d.stiles.entries()) fit(d,id,pose(sideloc[i],0,0),down,[],'Set the stile with its corner trays upward',
    {target:point(dp(d,sideloc[i],frameTop,0)),view:{direction:[.46,.79,.45],span:560}});
  for(const [i,id] of [d.head,d.foot].entries()) {
    const end=dp(d,0,bars[i],0);
    fit(d,id,pose(0,bars[i],0),down,d.stiles,'Hook the end bar into the corner receivers',
      {approach:[offset(end,[50,22,0]),offset(end,[0,13,0])],target:point(dp(d,sideloc[1],bars[i],0)),view:{direction:[.44,.8,.52],span:260}});
  }
  adjust(d.stiles,0,1,down,[d.head,d.foot],'Lock all four captive corner cams with the key',point(dp(d,sideloc[1],frameTop,-8)),190);
}
function brackets(d,key,isTop) {
  const y=isTop?frameTop:-frameTop;
  const bar=isTop?d.head:d.foot;
  const fittings=[];
  for(const [i,x] of [-carrierX,carrierX].entries()) {
    const id=take(key);
    const end=dp(d,x,y,0), approach=isTop?[offset(end,[i===0?-16:16,12,0])]:[];
    const start=isTop&&long(d)?offset(end,[0,95,0],angle(end)-.6):undefined;
    const caption=isTop?'Seat and slide the roller unit into its corner':'Align the catch bracket with its mounting-slot centerline';
    fit(d,id,pose(x,y,0),down,[d.stiles[i],bar],caption,{start,approach,target:point(end),view:{direction:[.32,.84,.41],span:160}});
    const seats=[-9,9].map(dx=>point(dp(d,x+dx,y,-9)));
    d.members.push(...fasten('machineScrew',seats,down,[id,d.stiles[i]],'Fasten through the two bracket apertures',true));
    fittings.push(id);
  }
  return fittings;
}
const liftWarning={text:'Use two people to lift and hang the complete empty frame.',page:2};
function hang(d,end) {
  const a=-.14;
  const standoff=Math.sin(a)*frameTop;
  const angled=pose(end[0],end[1]+105,end[2]-standoff,a);
  const engaged=pose(end[0],end[1]+18,end[2]-standoff,a);
  rigidMove(d.members,[d.pose,pose(end[0],end[1]+260,490,a),angled,engaged,end],down,[tracks[0]],
    long(d)?'Hook the long roller over the taller, inboard lip':'Hook the short roller over the lower, front lip',
    [end[0]-carrierX,long(d)?1992:1980,trackZ(d)],760);
  d.pose=end;
}
function slide(d,x,caption,receiver=tracks[0],span=1570) {
  const end=offset(d.pose,[x-d.pose[0],0,0]);
  const axis=x>d.pose[0]?right:left;
  const target=receiver===tracks[1]?[x+Math.sign(axis[0])*carrierX,trackY(d),trackZ(d)]:[x,1020,d.pose[2]];
  rigidMove(d.members,[d.pose,end],axis,[receiver],caption,target,span);
  d.pose=end;
}
function click(d,x,i) {
  slide(d,x,`Slide ${x<0?'left':'right'} on the upper track to the ${trackName(d)}`,tracks[1],635);
  const id=d.catches[i];
  adjust([id],0,1,back,[tracks[1]],`Click the catch into the ${trackName(d)}`,[x+(i===0?-carrierX:carrierX),trackY(d),trackZ(d)],142);
}
function tab(d) { adjust([d.head],0,1,front,[],'Turn back the marked top-bar tape',point(dp(d,0,frameTop,4)),150); }
function headCover(d,open) {
  adjust([d.head],open?1:2,open?2:1,open?front:back,d.stiles,`${open?'Open':'Close'} the attached top cover`,point(dp(d,0,frameTop,11)),440);
}
function stileCovers(d,open) {
  adjust(d.stiles,open?1:2,open?2:1,open?front:back,[d.head],`${open?'Swing both stile covers open':'Snap both stile covers shut'}`,point(dp(d,0,102,9)),1320);
}
function pads(d) {
  for(const y of [-frameTop,frameTop]) for(const [i,x] of [-464,464].entries()) {
    fit(d,take('pad'),pose(x,y-Math.sign(y)*11,6),back,[d.stiles[i],y<0?d.foot:d.head],'Apply the adhesive corner pad');
  }
}
function panel(d,i) {
  const seat=-714+i*476;
  const end=dp(d,0,seat,0);
  fit(d,d.panels[i],pose(0,seat,0),down,[i===0?d.foot:d.dividers[i-1],...d.stiles],
    'Center the separately sold panel, then lower both edges into the keyed mouth',
    {start:offset(end,[0,164,150]),approach:[offset(end,[0,120,0])],target:point(dp(d,-471,seat-237,1)),
      view:{direction:[-.31,.42,.86],span:540}});
}
function fill(d) {
  for(const [i,y] of channelY.entries()) {
    const end=dp(d,0,y,0);
    fit(d,d.dividers[i],pose(0,y,0),down,[d.panels[i],...d.stiles],
      'Slip the divider into the stile receivers and drop it over the panel',
      {start:offset(end,[24,100,90]),approach:[offset(end,[0,68,0])],target:point(dp(d,-468,y,0)),view:{direction:[-.27,.52,.83],span:355}});
    const seats=[-463,463].map(x=>point(dp(d,x,y+7,-4)));
    d.members.push(...fasten('pin',seats,down,[d.dividers[i]],'Seat the two divider pins',true));
    panel(d,i+1);
  }
}

const tip={text:'Tip-over hazard: before fitting this kit, both assembled PAX bays must already be secured to the wall. Follow the wardrobe instructions for wall attachment.',page:7};
step('Check the two wardrobe bays','Use a spirit level across both tops and along the side; the adjoining top fronts must be level and flush. Page 6 shows the alternative leveling adjusters.',null,tip);
step('Join the adjoining sides','Clamp the adjoining sides and fasten through the two holes shown as 1, not the neighboring 2 positions.',()=>{
  fasten('joinScrew',[[-24,1848,-62],[-24,203,-62]],right,[],'Join the adjoining side panels');
},tip);
step('Align the upper track','Slide the upper track across the front tops, with the two ends aligned to the bays.',()=>{
  place(tracks[0],upper,left,[],'Align both ends of the upper running track',{distance:215,view:{direction:[-.38,.34,.86],span:1160}});
});
step('Fasten the upper track ends','Fit two long rail screws through the front-facing end seats.',()=>{
  fasten('railScrew',railScrewX.map(x=>[x,1987,33]),back,[tracks[0]],'Fasten the two upper end seats',true);
});
step('Screw up through the upper flange','Fit four short screws upward through the flange beneath the upper track.',()=>{
  fasten('flangeScrew',flangeX.map(x=>[x,1981,-10]),up,[tracks[0]],'Fasten up through the upper flange',true);
});
step('Align the lower track','Slide the lower track into line with the cabinet fronts. Align both witness marks with the adjoining bay sides.',()=>{
  place(tracks[1],lower,left,[],'Align both lower-track witness marks at the seam',{distance:215,view:{direction:[-.27,.34,.9],span:1160}});
});
step('Fasten the lower track ends','Fit two more long rail screws through the front-facing seats of the lower track.',()=>{
  fasten('railScrew',railScrewX.map(x=>[x,37,33]),back,[tracks[1]],'Fasten the two lower end seats',true);
});
step('Screw down through the lower flange','Use four short screws through the top face of the lower track flange.',()=>{
  fasten('flangeScrew',flangeX.map(x=>[x,50,-10]),down,[tracks[1]],'Fasten down through the lower flange',true);
});
step('Join the inner door frame','On a protected surface, hook the top and bottom into the stiles and turn all four captive corner cams with the supplied key. Keep the marked end bar at the top.',()=>frame(inner));
step('Fit the short rollers','At the marked end, check the section, fit the two short roller units and slide them into their seats before fastening.',()=>brackets(inner,'shortRoller',true));
step('Fit the short lower catches','At the opposite end, align both short brackets as shown in the slot inset and fasten each with two machine screws.',()=>{
  inner.catches=brackets(inner,'shortCatch',false);
});
step('Turn back the inner top-bar tape','Turn back the tape at the marked top bar before lifting the frame.',()=>tab(inner));
step('Hang the inner frame','Lift with a second person, tilt the frame, lower both short rollers into the inner running channel and bring the frame upright.',()=>hang(inner,innerSeat),liftWarning);
step('Engage the inner left catch','Slide the empty inner frame to the left until the short lower catch clicks in its channel.',()=>click(inner,-stop,0));
step('Engage the inner right catch','Slide the same frame right to click the second short catch into its channel.',()=>click(inner,stop,1));
step('Open the inner frame covers','Swing open the top cover and both side covers without removing them.',()=>{
  slide(inner,panelPark,'Park the inner door for access to the panel channels');
  headCover(inner,true); stileCovers(inner,true);
});
step('Apply four inner corner pads','Apply one pad at each of the four exposed corners of the inner door frame.',()=>pads(inner));
step('Seat the first inner panel','Check that the cover profile is not folded into the channel. Lower one separately sold panel into the bottom seat with the same margin at both ends.',()=>panel(inner,0));
step('Fill the inner frame from the bottom up','Slide a divider into both sides, drop it onto the panel and fit two pins. Repeat for each of the three remaining panels.',()=>fill(inner));
step('Close the inner top cover','Turn the attached top cover back over the four panels.',()=>headCover(inner,false));
step('Close both inner side covers','Snap both original stile covers shut along their length.',()=>stileCovers(inner,false));
step('Join the outer door frame','On the protected surface, engage the second set of end bars in the second set of stiles and turn the four captive corner cams.',()=>frame(outer));
step('Fit the long rollers','Turn the long roller units as drawn, fit them to the marked end, align their arms and fasten with two screws per unit.',()=>brackets(outer,'longRoller',true));
step('Fit the long catches and turn back the tape','First align and fasten the two long lower brackets at the opposite end. Then turn back the tape on the marked top bar in the second drawing numbered 24.',()=>{
  outer.catches=brackets(outer,'longCatch',false);
  tab(outer);
});
step('Hang the outer frame','With two people, tilt the frame in front of the inner door and lower the long carriers onto their separate running lip. Page 35 shows how to align a tilted door.',()=>hang(outer,outerSeat),liftWarning);
step('Engage the outer right catch','Move the empty outer frame to the right until the long lower catch clicks. The filled inner door remains behind it on the inner track.',()=>click(outer,stop,1),
  {text:'Stop if the lower catch misses its channel; use the supplied hex key to align the bracket height as shown. Do not force it.',page:25});
step('Engage the outer left catch','Slide the same empty outer frame left to click the opposite lower catch into the outer lane.',()=>click(outer,-stop,0));
step('Open the outer frame covers','Swing open its attached top cover and both attached stile covers.',()=>{
  headCover(outer,true); stileCovers(outer,true);
});
step('Apply four outer corner pads','Apply one pad at each of the four outer frame corners.',()=>pads(outer));
step('Seat the first outer panel','Check the cover is clear of the keyed profile before lowering one separately sold panel into the bottom seat. Keep the margins even.',()=>panel(outer,0));
step('Fill the outer frame from the bottom up','Slide the next divider into both sides, lower it onto the panel and insert two pins. Repeat with the remaining three separately sold panels.',()=>fill(outer));
step('Close the outer top cover','Close the attached top cover over the four panels.',()=>headCover(outer,false));
step('Close both outer side covers','Snap both outer stile covers shut along their full length.',()=>stileCovers(outer,false));

const trimBench=[pose(-485,24,1270,flat),pose(485,24,1270,flat)];
const trimInstalled=[pose(-984,1013,51),pose(984,1013,28)];
step('Prepare the two side trims','Peel each edge strip and join it to its rigid side profile. The folded edges must lie flush, not lifted.',()=>{
  for(const [i,end] of trimBench.entries()) {
    place(trim[i],end,down,[],'Lay down the rigid trim profile',{view:{direction:[-.42,.82,.36],span:500}});
    place(edging[i],world(end,pose(i===0?-12:12,0,7)),down,[trim[i]],'Peel and seat the edging flush on its carrier',
      {target:point(world(end,pose(0,680,0))),view:{direction:[-.42,.82,.36],span:195}});
  }
});
step('Fasten the side trims','Use the pictured arrangement with the outer door closing on the left. Keep the two side trim offsets, mark the eight points with the pointed tool, and install the eight short screws.',()=>{
  slide(outer,75,'Slide the outer door aside for the trim fixings');
  for(const [i,end] of trimInstalled.entries()) {
    rigidMove([trim[i],edging[i]],[trimBench[i],offset(end,[0,120,160]),end],back,[],'Seat the two assembled trims at different depths',point(end),650);
    const ends=[-906,-305,305,906].map(y=>point(world(end,pose(0,y,8))));
    fasten('flangeScrew',ends,back,[trim[i]],'Fasten the four marked points in the side trim',true);
  }
});
step('Fit the outer door dust cap','Peel its backing and lower the cap over the outer door, between the roller arms. Check the end inset before pressing it into place.',()=>{
  slide(outer,-stop,'Return the loaded outer door to the left side');
  fit(outer,'dust-cover',pose(0,frameTop+15,-20),down,[outer.head],'Seat the dust cap on the outer door, not the cabinet track',
    {target:point(dp(outer,-426,frameTop+15,-20)),view:{direction:[-.28,.64,.78],span:430}});
});
step('Fit the vertical brush seal','Slide the loaded doors for access as shown. Remove the brush backing and press the brush onto the exposed meeting edge of the outer door in the pictured left-closing arrangement.',()=>{
  slide(outer,-295,'Open the loaded outer door slightly for access');
  slide(inner,-stop,'Slide the entire loaded inner door left on its own track');
  slide(outer,-445,'Bring the loaded outer door left to expose its brush receiver');
  fit(outer,'brush',pose(498,0,-6),left,[outer.stiles[1]],'Seat the vertical brush against the outer meeting stile',
    {target:point(dp(outer,498,-frameTop,-6)),view:{direction:[.46,.3,.82],span:410}});
});

export const steps=all;

export function completeFrame(frame) {
  const poses={...frame.poses};
  for(const d of [outer,inner]) {
    const dx=(d===outer?-stop:stop)-frame.poses[d.head][0];
    for(const id of d.members) {
      const p=frame.poses[id].slice();
      p[0]+=dx;
      poses[id]=p;
    }
  }
  return {...frame,poses};
}
