import { pages } from './manual.js';

const {PI}=Math, half=PI/2;
const right=[1,0,0], down=[0,-1,0], front=[0,0,1];
const sides=[-1,1], names=['L','R'];
const p=(x,y,z,q=[0,0,0,1])=>[x,y,z,...q];
const xyz=a=>a.slice(0,3), q=a=>a.slice(3);
const rx=a=>[Math.sin(a/2),0,0,Math.cos(a/2)];
const rz=a=>[0,0,Math.sin(a/2),Math.cos(a/2)];
const plus=(a,b)=>a.map((v,i)=>v+b[i]);
const scale=(a,k)=>a.map(v=>v*k);
const cross=([a,b,c],[x,y,z])=>[b*z-c*y,c*x-a*z,a*y-b*x];
const unit=a=>scale(a,1/Math.hypot(...a));
function rotate(v,r) {
  const t=scale(cross(r,v),2);
  return plus(v,plus(scale(t,r[3]),cross(r,t)));
}
function apply(a,b) {
  const r=q(a),s=q(b);
  return p(...plus(xyz(a),rotate(xyz(b),r)),[...plus(plus(scale(xyz(r),s[3]),scale(xyz(s),r[3])),cross(r,s)),
    r[3]*s[3]-r[0]*s[0]-r[1]*s[1]-r[2]*s[2]]);
}
const inverse=a=>{
  const r=[-a[3],-a[4],-a[5],a[6]];
  return p(...rotate(scale(xyz(a),-1),r),r);
};
const facing=axis=>axis[1]>.999 ? rx(PI) : unit([...cross(down,axis),1-axis[1]]);
const alongX=s=>[s,0,0];

// Joinery stations in the upright frame; profile pairs are [Y,Z].
export const frame={
  sideX:284, armX:321.5, armWidth:36, railWidth:20, halfSpan:274,
  backOrigin:[665,-270], seatOrigin:[336,135], armOrigin:[300,60],
  slats:[[462,-162,-.30,36],[600,-233,-.65,34],[752,-344,-.55,36],[916,-397,0,37]],
  splice:[405,-146], armScrew:[562,-205,-.58], frontPin:[345,400],
  ties:[[311,-91],[340,381]],
  tabDepth:17, tabHalfWidth:8, tabHalfHeight:3,
  braceX:303.5, nutX:260, bracePins:13, sideHeadDepth:2,
  braces:[['frontBrace',243,391,0,48],['lowBrace',16,-262,half,43]],
  arm:[[590,-227],[562,-205],[534,-177],[516,-130],[500,65],[495,219],
    [487,307],[461,365],[415,390],[345,393],[243,391],[113,386],[51,373],[24,347],[16,301],[16,45],[16,-280],[16,-285]]
};
const {sideX,armX,armWidth,halfSpan,backOrigin,seatOrigin,armOrigin,slats,splice,armScrew,frontPin,ties,braceX,nutX,braces}=frame;
const [by,bz]=backOrigin, [sy,sz]=seatOrigin, [ay,az]=armOrigin;
export const shapes={
  stile:[20,552,288], slat:[572,46,30], markedSlat:[572,46,32], seat:[588,123,558],
  seatTie:[582,33,22], arm:[36,600,701], frontBrace:[619,48,22], lowBrace:[619,43,22],
  barrel:[12,12,12], spacer:[17,9.5,17], longScrew:[13,88,13], armScrew:[13,66,13], pin:[10,28,10],
  slatScrew:[11,16,11], tieScrew:[12,19,12], key:[41,6,70]
};
export const families={}, parts=new Map();
function stock(family,name,shape,group,page,instances,number=null,role='kit') {
  families[family]={name,number,group,page,role};
  for(const [id,unpacked] of instances) parts.set(id,{id,family,shape,unpacked,packet:group});
}
const back='Back pieces', seat='Seat pieces', base='Side frames and braces';
stock('stile','Bent back stiles','stile',back,5,names.map((n,i)=>[`stile${n}`,p(-950+i*610,10,-712,rz(half))]));
stock('slat','Bowed back slats','slat',back,5,[1,2,4].map((n,i)=>[`slat${n}`,p(-740,23,-465+i*63,rx(half))]));
stock('markedSlat','Bowed slat with cushion strip','markedSlat',back,5,[['slat3',p(-740,18,-276,rx(half))]]);
stock('seat','Fabric seat with bent side rails','seat',seat,7,[['seat',p(488,42,-572)]]);
stock('seatTie','Tabbed, bowed seat crossrails','seatTie',seat,8,[['rearTie',p(488,25,-237)],['frontTie',p(488,25,-196)]]);
for(const [i,n] of names.entries()) stock(`arm${n}`,`${i===0?'Left':'Right'} laminated arm/base frame`,'arm',base,4,
  [[`arm${n}`,p(-705+i*655,18,207,rz(half))]]);
stock('frontBrace','Under-seat front brace with end pins','frontBrace',base,11,[['frontBrace',p(600,11,-31,rx(half))]]);
stock('lowBrace','Low rear brace with end pins','lowBrace',base,11,[['lowBrace',p(600,11,43,rx(half))]]);
let slot=0;
for(const [key,label,shape,number,count,role] of [
  ['100514','Slotted barrel nut','barrel','100514',4],['102319','Black back-joint spacer','spacer','102319',2],
  ['100001','Hex key','key','100001',1,'tool'],['122606','Long brace screw','longScrew','122606 / 122604',4],
  ['146654','Shorter arm-attachment screw','armScrew','146654 / 146655',2],['123786','Collared locating pin','pin','123786',2],
  ['119046','Narrow-shank slat screw','slatScrew','119046 / 123257',8],['120925','Wider-shank seat screw','tieScrew','120925 / 150450',6]
]) stock(key,label,shape,'Fittings · p. 3',3,Array.from({length:count},(_,i)=>{
  const n=slot++, y=['slatScrew','tieScrew','longScrew','armScrew','pin'].includes(shape)?8:shapes[shape][1]/2;
  return [`${key}-${i+1}`,p(-745+(n%12)*72,y,601+Math.floor(n/12)*103, y===8?rx(half):undefined)];
}),number,role);

const mounted=new Map(), used={};
export const steps=[];
const work=(r,y)=>p(0,y,0,rz(r));
const rightUp=work(half,297), leftUp=work(-half,298), seatUp=work(0,-277), otherUp=work(half,340);
const seatTurn=work(-half/2,53), headX=armX+armWidth/2-frame.sideHeadDepth;
let carrier=rightUp, operations;
function step(title,action,run) {
  operations=[];
  run();
  steps.push({number:steps.length+1,page:pages[steps.length],title,action,operations});
}
function op(kind,ids,prerequisites,paths,axes,caption,extra={}) {
  const [axis]=axes;
  operations.push({kind,ids,prerequisites,poses:paths,axes,joint:{target:xyz(paths[0].at(-1)),axis,
    outward:scale(axis,-1),receivers:prerequisites,caption},...extra});
}
function enter(ids,paths,axes,prerequisites,caption,previewBores=false) {
  paths.forEach((path,i)=>mounted.set(ids[i],path.at(-1)));
  op('place',ids,prerequisites,paths.map(path=>path.map(v=>apply(carrier,v))),axes.map(a=>rotate(a,q(carrier))),caption,{previewBores});
}
const approach=(end,axis,travel)=>[p(...plus(xyz(end),scale(axis,-travel)),q(end)),end];
function place(id,end,axis,travel,prerequisites,caption) {
  enter([id],[approach(end,axis,travel)],[axis],prerequisites,caption);
}
function fitting(key,points,axes,prerequisites,caption,travel=48,previewBores=true) {
  const ids=points.map(()=>`${key}-${used[key]=(used[key]??0)+1}`);
  const paths=points.map((point,i)=>approach(p(...point,facing(axes[i])),axes[i],travel));
  enter(ids,paths,axes,prerequisites,caption,previewBores);
  return ids;
}
function turn(frames,caption) {
  const ids=[...mounted.keys()], anchor=ids[0], local=mounted.get(anchor), undo=inverse(local);
  const path=[carrier,...frames];
  op('move',ids,[],ids.map(id=>path.map(f=>apply(f,mounted.get(id)))),ids.map(()=>down),caption,
    {rigid:{anchor,frames:path.map(f=>apply(f,local)),offsets:ids.map(id=>apply(undo,mounted.get(id)))}});
  carrier=frames.at(-1);
}
const slatIds=slats.map((_,i)=>`slat${i+1}`);
const tieIds=['rearTie','frontTie'];
const [spliceY,spliceZ]=splice, [armY,armZ]=armScrew, [pinY,pinZ]=frontPin;
function slatFasteners(s,id) {
  const axes=slats.map(([, ,a])=>rotate(scale(front,-1),rx(a)));
  fitting('119046',slats.map(([y,z],i)=>plus([s*(sideX-4),y,z],scale(axes[i],-10))),axes,[id,...slatIds],
    'Four narrow screws through the stile into the slat tabs',35);
}

step('Key the four bowed slats','Set one bent stile on its side. Seat all four bowed slat ends, matching the inset. The marked slat is second from the top, with its strip toward the seat.',()=>{
  const left=alongX(-1);
  place('stileL',p(-sideX,by,bz),left,75,[],'Lay out the first bent back stile');
  enter(slatIds,slats.map(([y,z,a])=>approach(p(0,y,z,rx(a)),left,94)),slats.map(()=>left),['stileL'],
    'Register all four end tabs in the lower work-side stile',true);
});
step('Seat the other back stile','Lower the other stile over the four free slat tabs. Check that the bends and both lower ends match.',()=>{
  const left=alongX(-1);
  place('stileR',p(sideX,by,bz),left,104,slatIds,'Key the second stile over the free slat tabs');
});
step('Fasten the first back stile','Hold the stile in place. Use the supplied key and four narrow 119046 / 123257 screws, not the wider seat screws.',()=>slatFasteners(1,'stileR'));
step('Turn and fasten the other stile','Turn the back over as shown. Hold the other stile and put the last four narrow 119046 / 123257 screws into its slat ends.',()=>{
  turn([work(0,0),leftUp],'Turn the back and carry its four fitted screws');
  slatFasteners(-1,'stileL');
});
step('Join the fabric seat to the back','Line up both bent seat ends with the bottom of the back stiles. Join them with two wider 120925 / 150450 screws.',()=>{
  const rear=scale(front,-1);
  place('seat',p(0,sy,sz),rear,94,['stileL','stileR'],'Overlap the two seat-to-back tabs');
  fitting('120925',sides.map(s=>[s*sideX,spliceY,spliceZ+12]),sides.map(()=>rear),['seat','stileL','stileR'],
    'Use the wider seat screw through each overlap',35);
});
step('Slide in the bowed seat crossrails','Face the fabric seat upward. Hold both crossrails with their bow down as shown, slide the front and rear tabs into their openings, and seat the free ends.',()=>{
  turn([seatTurn,seatUp],'Set the seat facing up to reach both tab stations');
  for(const [i,[y,z]] of ties.entries()) {
    // Keep the entering tip fixed during the small seating pivot.
    const tilt=.085, tip=halfSpan+frame.tabDepth;
    const seated=p(0,y,z), tipped=p(tip*(1-Math.cos(tilt)),y-tip*Math.sin(tilt),z,rz(tilt));
    enter([tieIds[i]],[[...approach(tipped,right,76),seated]],[right],['seat'],
      `Guide the ${i===0?'rear':'front'} leading tab through its seat opening`,true);
    operations.at(-1).joint.target=xyz(apply(carrier,p(halfSpan,y,z)));
  }
});
step('Secure all four seat tabs','Fit four wider 120925 / 150450 screws from above, one per tab. Turn the subassembly onto its side for the first arm frame.',()=>{
  const points=ties.flatMap(([y,z])=>sides.map(s=>[s*sideX,y+11,z]));
  fitting('120925',points,points.map(()=>down),['seat',...tieIds],'Four screws into the front and rear crossrail tabs',35);
  turn([seatTurn,leftUp],'Turn the joined seat and back onto the first arm work side');
});
function mountArm(s,n) {
  const axis=alongX(-s), insetX=s*(sideX+10+braceX)/2;
  const pin=fitting('123786',[[insetX,pinY,pinZ]],[axis],['seat'],'Locate the front collared pin',48);
  const spacer=fitting('102319',[[insetX,armY,armZ]],[axis],[`stile${n}`],'Space the back joint with its black ring',38);
  place(`arm${n}`,p(s*armX,ay,az),axis,133,['seat',`stile${n}`,...pin,...spacer],
    'Slip the laminated arm frame over the front pin and back spacer');
  fitting('146654',[[s*headX,armY,armZ]],[axis],[`arm${n}`,`stile${n}`,...spacer],
    'Use the shorter side screw at the back/arm joint',91);
}
step('Fit the first laminated arm frame','Set the collared pin at the front and black spacer at the back. Fit the first arm frame and drive the shorter 146654 / 146655 screw at the back, not a long brace screw.',()=>mountArm(-1,'L'));
function secureBraces(s,n) {
  const receive=braces.map(([id])=>id), axis=alongX(-s);
  const nuts=braces.flatMap(([id,y,z,a])=>fitting('100514',[[s*nutX,y,z]],[rotate(front,rx(a))],
    [id,`arm${n}`],'Align the barrel nut slot by hand with the side-screw hole',35,false));
  fitting('122606',braces.map(([,y,z])=>[s*headX,y,z]),braces.map(()=>axis),[...receive,`arm${n}`,...nuts],
    'Two long side screws reach the aligned brace barrel nuts',112);
}
step('Install both transverse braces','Point the pinned brace ends and the drilled faces as in the inset. Align two 100514 barrel nuts using a slotted screwdriver. Drive two long 122606 / 122604 screws from outside the first arm frame.',()=>{
  for(const [id,y,z,a] of braces) place(id,p(0,y,z,rx(a)),alongX(-1),95,['armL'],
    'Fit both integral end pins into the first arm frame');
  secureBraces(-1,'L');
});
step('Turn and fit the other arm frame','Turn the partial chair with the braces attached. Fit the second collared pin, black spacer and arm frame. Use the remaining shorter 146654 / 146655 screw at the back.',()=>{
  turn([work(0,170),work(PI/3,348),otherUp],'Turn the partial chair with both braces and all fitted hardware');
  mountArm(1,'R');
});
step('Fasten the other brace ends','Align the last two 100514 barrel nuts and drive the last two long 122606 / 122604 screws. Stand the frame upright for the separate p. 14 check: hand-tighten all six side screws with the supplied key.',()=>secureBraces(1,'R'));

export function completeFrame(end) {
  const upright=inverse(otherUp);
  return {...end,poses:Object.fromEntries(end.installed.map(id=>[id,apply(upright,end.poses[id])]))};
}
