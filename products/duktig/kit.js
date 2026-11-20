import { pages } from './manual.js';

// Millimetres from the floor under the worktop center; +x right, +y up, +z front.
export const shapes = {
  lowerEnd:[34,500,374], bottom:[638,16,356], rail:[638,46,34], lowerDivider:[16,444,334], shelf:[302,14,326], lowerBack:[644,444,4],
  ovenDoor:[318,394,16], cupboardDoor:[318,394,16], counter:[721,18,400], upperEnd:[16,503,164],
  upperShelf:[646,16,164], upperDivider:[16,149,158], upperBack:[646,149,4], cap:[678,18,164], microwaveDoor:[312,144,16],
  longScrew:[10,48,10], shortScrew:[10,35,10], handleScrew:[9,22,9], tapScrew:[8,18,8], strapScrew:[7,12,7],
  fixingScrew:[8,15,8], catch:[27,28,13], dowel:[8,28,8], strike:[14,26,3], support:[12,18,13], washer:[15,2,15],
  connector:[30,26,34], hook:[8,47,21], rod:[658,10,10], pull:[30,116,31], strap:[19,3,51],
  pivot:[14,54,15], key:[25,78,4], sleeve:[39,70,42], faucet:[47,151,94], sink:[255,70,220], cooktop:[252,41,253], wallFix:[10,26,10]
};
export const join = {
  stove:[-170,22,236,237], sink:[171,27,239,203],
  dividers:[-119,0,117], tap:[161,181], tapZ:-110,
  hutchX:[-331,331], hutchZ:[-159,-67], sideZ:[-169,169],
  shelfPinZ:[-136,124], upperPinZ:[-165,-55], rodY:891, rodZ:-53,
  microwaveX:-150, microwaveZ:-40, doorX:312, doorZ:158
};
export const wallWarning={page:2,text:'Tip-over can cause serious or fatal crushing injuries. Always use the supplied wall attachment. Wall screws and plugs are not included: use fixings suited to your wall and seek professional advice if unsure.'};

const {PI}=Math;
const up=[0,1,0], down=[0,-1,0], right=[1,0,0], left=[-1,0,0], front=[0,0,1], back=[0,0,-1];
const xyz=p=>p.slice(0,3), rotation=p=>p.slice(3);
const plus=(a,b)=>a.map((v,i)=>v+b[i]), scale=(a,k)=>a.map(v=>v*k);
const cross=([x,y,z],[a,b,c])=>[y*c-z*b,z*a-x*c,x*b-y*a];
const unit=a=>scale(a,1/Math.hypot(...a));
const identity=[0,0,0,1];
const pose=(x,y,z,q=identity)=>[x,y,z,...q];
const spin=(axis,a)=>[...scale(axis,Math.sin(a/2)),Math.cos(a/2)];
const X=a=>spin(right,a), Y=a=>spin(up,a), Z=a=>spin(front,a);
function rotate(v,[x,y,z,w]) {
  const a=[x,y,z], t=scale(cross(a,v),2);
  return plus(v,plus(scale(t,w),cross(a,t)));
}
function mult(a,b) {
  return [...plus(plus(scale(xyz(a),b[3]),scale(xyz(b),a[3])),cross(a,b)),a[3]*b[3]-a[0]*b[0]-a[1]*b[1]-a[2]*b[2]];
}
const transform=(a,b)=>pose(...plus(xyz(a),rotate(xyz(b),rotation(a))),mult(rotation(a),rotation(b)));
function relative(a,b) {
  const inv=[...scale(xyz(rotation(a)),-1),a[6]];
  return pose(...rotate(plus(xyz(b),scale(xyz(a),-1)),inv),mult(inv,rotation(b)));
}
const shifted=(p,d)=>pose(...plus(xyz(p),d),rotation(p));
const facing=axis=>axis[1]>.999 ? X(PI) : unit([...cross(up,scale(axis,-1)),1-axis[1]]);

export const families = {};
export const parts = new Map();
function family(key,name,shape,count,group,page,number=null,role='kit') {
  families[key]={name,number,group,page,role};
  const widths = shapes[shape];
  for(let i=0;i<count;i++) {
    const id=number ? `${key}-${i+1}` : key;
    const index=parts.size, panel=group==='Lower cabinet'||group==='Upper cabinet'||shape==='counter';
    const q=panel&&widths[1]>50 ? widths[0]<50 ? Z(PI/2) : X(PI/2) : identity;
    const h=q!==identity ? (widths[0]<50 ? widths[0] : widths[2])/2 : widths[1]/2;
    const unpacked=shape==='sink' ? pose(1132,70,1040) : shape==='faucet' ? pose(1132,0,1375) : shape==='cooktop' ? pose(725,39,1390)
      : index<20 ? pose((index%4-1.5)*755,h,(Math.floor(index/4)-2)*520,q)
      : pose((index%15-7)*80+(role==='external'?1150:0),h,1390+Math.floor((index-20)/15)*92,q);
    parts.set(id,{id,family:key,shape,packet:group,unpacked});
  }
}
const lower='Lower cabinet', upper='Upper cabinet', top='Worktop and inserts', packet='Catch and screw packet', loose='Loose fittings';
for(const [key,name,shape,page] of [
  ['lowerL','Left lower side and legs','lowerEnd',9],['lowerR','Right lower side and legs','lowerEnd',10],['bottom','Lower bottom panel','bottom',9],
  ['rail','Lower front rail','rail',9],['divider','Lower center divider','lowerDivider',11],['shelfL','Left storage shelf','shelf',13],
  ['shelfR','Right storage shelf','shelf',13],['lowerBack','Notched lower back','lowerBack',13],['oven','Windowed oven door','ovenDoor',26],
  ['cupboard','Solid cupboard door','cupboardDoor',26]
]) family(key,name,shape,1,lower,page);
for(const [key,name,shape,page] of [
  ['upperL','Left upper side','upperEnd',17],['upperR','Right upper side','upperEnd',15],['upperShelf','Upper shelf','upperShelf',15],
  ['dividerL','Plain upper divider','upperDivider',17],['dividerR','Upper catch divider','upperDivider',17],['upperBack','Clipped upper back','upperBack',19],
  ['cap','Upper cap','cap',19],['microwave','Windowed upper door','microwaveDoor',20]
]) family(key,name,shape,1,upper,page);
family('counter','Two-aperture worktop','counter',1,top,14);
family('sink','Removable sink','sink',1,top,30);
family('152849','Play faucet','faucet',1,top,7,'152849');
family('150916','Housed cooktop','cooktop',1,top,7,'150916');
for(const [number,name,shape,count] of [['128814','Cross-head fixing screw','fixingScrew',25],['128815','Door catch','catch',3]]) family(number,name,shape,count,packet,8,number);
for(const [number,name,shape,count,role] of [
  ['100224','Long hex-key screw','longScrew',10],['100295','Short hex-key screw','shortScrew',14],['100226','Handle screw','handleScrew',6],
  ['109597','Faucet screw','tapScrew',2],['109041','Strap screw','strapScrew',1],['101344','Fluted dowel','dowel',17],
  ['108768','Catch strike','strike',3],['118562','Twist-in shelf support','support',8],['100823','Washer','washer',5],
  ['148819','Cross-bore worktop connector','connector',4],['118678','Clip-on hook','hook',5],['118679','Hook rail','rod',1],
  ['120104','Door pull','pull',3],['107967','Wall attachment strap','strap',1],['118650','Door pivot bracket','pivot',6],
  ['100006','Hex key','key',1,'tool'],['147536','Adjustable leg sleeve','sleeve',4]
]) family(number,name,shape,count,loose,8,number,role);
family('wallFix','Wall-specific fixing (illustrative)','wallFix',1,'Required, not supplied',25,null,'external');

const at=new Map(), counts={}, all=[];
let operations;
function step(title,action,build,warning) {
  operations=[]; build();
  all.push({number:all.length+1,page:pages[all.length],title,action,operations,warning});
}
function op(kind,ids,prerequisites,poses,axes,caption,extra={}) {
  const [axis]=axes;
  operations.push({kind,ids,prerequisites,poses,axes,
    joint:{axis,target:xyz(poses[0].at(-1)),outward:scale(axis,-1),caption,receivers:prerequisites},...extra});
  ids.forEach((id,i)=>at.set(id,poses[i].at(-1)));
  return ids;
}
const label=id=>families[parts.get(id).family].name;
function place(id,end,req=[],axis=down,travel=90,waypoints=[]) {
  return op('place',[id],req,[[shifted(end,scale(axis,-travel)),...waypoints,end]],[axis],label(id))[0];
}
const next=key=>`${key}-${counts[key]=(counts[key]??0)+1}`;
function fittings(key,points,req,axis=down,previewBores=false) {
  const axes=Array.isArray(axis[0])?axis:points.map(()=>axis);
  const ids=points.map(()=>next(key));
  return op('place',ids,req,points.map((p,i)=>{
    const q=facing(axes[i]);
    return [pose(...plus(p,scale(axes[i],-38)),q),pose(...p,q)];
  }),axes,families[key].name,{previewBores});
}
function move(ids,frames,req,axis,caption) {
  const anchor=ids[0], start=at.get(anchor);
  const offsets=ids.map(id=>relative(start,at.get(id)));
  const paths=ids.map((id,i)=>[at.get(id),...frames.map(p=>transform(p,offsets[i]))]);
  return op('move',[...ids],req,paths,ids.map(()=>axis),caption,{rigid:{anchor,frames:[start,...frames],offsets}});
}
function adjust(id,end,req,axis,caption) {
  op('adjust',[id],req,[[at.get(id),end]],[axis],caption,{captive:{from:0,to:1}});
}
const after=before=>[...at.keys()].filter(id=>!before.has(id));
const map=(frame,p)=>transform(frame,p);
const on=(id,closed,p)=>map(at.get(id),relative(closed,p));
const lowStage=pose(-440,228,338,X(PI/2)), low=([x,y,z])=>xyz(map(lowStage,pose(x,y,z)));
const lowAxis=axis=>rotate(axis,rotation(lowStage));
const legs=(y,x=336)=>[-1,1].flatMap(s=>join.sideZ.map(z=>[s*x,y,z]));
const lowerEnd=s=>pose(s*336,300,0);
const divider=pose(0,328,-4);
let lowerDowel, lowerCatches;
step('Start the lower cabinet','Join the bottom to the first side with two long 100224 screws. Use the supplied hex key, not the shorter screws.',()=>{
  place('lowerL',map(lowStage,lowerEnd(-1)));
  place('bottom',map(lowStage,pose(0,98,-3)),['lowerL'],left);
  fittings('100224',join.sideZ.map(z=>low([-353,98,z])),['lowerL','bottom'],right);
});
step('Dowel the front rail','Push one 101344 dowel into each end of the front rail. Keep its single face bore toward the divider.',()=>{
  place('rail',map(lowStage,pose(20,527,169)));
  lowerDowel=fittings('101344',[low([-299,527,169]),low([339,527,169])],['rail'],[right,left]);
});
step('Secure the first rail end','Seat the front rail at the first side and secure it with one long 100224 screw and the hex key.',()=>{
  move(['rail',...lowerDowel],[map(lowStage,pose(0,527,169))],['lowerL'],left,'Seat the rail end');
  fittings('100224',[low([-353,519,169])],['lowerL','rail'],right);
});
step('Add the second lower side','Slide the second side onto the bottom and the open rail end.',()=>{
  place('lowerR',map(lowStage,lowerEnd(1)),['bottom','rail',lowerDowel[1]],left);
});
step('Fasten the second side','Fit three long 100224 screws with the hex key: two through the bottom joint and one at the rail.',()=>{
  fittings('100224',[...join.sideZ.map(z=>low([353,98,z])),low([353,519,169])],['lowerR','bottom','rail'],left);
});
step('Fit the divider catches','Use two 128814 screws for each 128815 catch. Turn the divider over to fit the catch on the opposite face.',()=>{
  const bench=pose(-1080,44,-272,Z(PI/2));
  place('divider',bench);
  lowerCatches=[];
  for(const s of [1,-1]) {
    if(s<0) move(['divider',...lowerCatches],[pose(-1080,262,-272),pose(-1080,44,-272,Z(-PI/2))],[],up,'Turn the divider over');
    const into=rotate([-s,0,0],rotation(at.get('divider')));
    const c=on('divider',divider,pose(s*12,489,146,Y(s*PI/2)));
    const id=place(next('128815'),c,['divider'],into);
    lowerCatches.push(id,...fittings('128814',[477,501].map(y=>xyz(on('divider',divider,pose(s*15,y,146)))),[id,'divider'],into));
  }
});
step('Install the lower divider','Seat the divider between the base and front rail. Keep its finished edge forward and use two short 100295 screws from underneath.',()=>{
  move(['divider',...lowerCatches],[shifted(map(lowStage,divider),[0,0,85]),map(lowStage,divider)],['bottom','rail'],lowAxis(down),'Seat the prepared divider');
  fittings('100295',[-140,124].map(z=>low([0,90,z])),['bottom','divider'],lowAxis(up));
});
step('Seat four foot sleeves','Fit a sleeve to each leg. The inset shows three height settings: bare legs and the two orientations of the same sleeve.',()=>{
  for(const p of legs(35)) place(next('147536'),map(lowStage,pose(...p)),['lowerL','lowerR'],lowAxis(up));
});
step('Turn the base and fit supports','Stand the whole lower cabinet upright. Insert and turn the eight shelf supports in matching holes.',()=>{
  move([...at.keys()],[pose(-205,425,225,X(PI/4)),lowerEnd(-1)],[],up,'Stand the lower cabinet upright');
  for(const [x,axis,req] of [[-319,left,'lowerL'],[-8,right,'divider'],[8,left,'divider'],[319,right,'lowerR']]) {
    for(const z of join.shelfPinZ) {
      const q=Y(axis[0]>0?-PI/2:PI/2);
      const id=place(next('118562'),pose(x,294,z,mult(q,Z(PI/2))),[req],axis,47);
      adjust(id,pose(x,294,z,q),[req],axis,'Turn the support to its seat');
    }
  }
});
step('Slide in the two shelves','Point each finished edge toward the front and slide the shelves onto their four supports.',()=>{
  place('shelfL',pose(-163,303,-6),['118562-1','118562-2','118562-3','118562-4'],back,205);
  place('shelfR',pose(163,303,-6),['118562-5','118562-6','118562-7','118562-8'],back,205);
});
step('Slide in the lower back','Lower the back into both rear grooves, with its notch at the top.',()=>{
  place('lowerBack',pose(0,328,-174),['lowerL','lowerR','bottom'],down,308);
});

const beforeTop=new Set(at.keys());
const counter=pose(0,559,0), counterBench=pose(-950,52,0,X(PI));
const topOn=p=>on('counter',counter,p), topAxis=axis=>rotate(axis,rotation(at.get('counter')));
const connectorYs=550, strapAt=[0,547,-183];
step('Key the worktop connectors','With the worktop upside down, tap four 148819 connectors into the large bores with a hammer. Point their cross-bores out toward the side edges.',()=>{
  place('counter',counterBench);
  for(const [x,y,z] of legs(connectorYs)) place(next('148819'),topOn(pose(x,y,z,Y(x<0?PI:0))),['counter'],topAxis(up),66);
});
step('Secure the worktop connectors','Use one 128814 screw beside each connector peg and tighten it with a hand screwdriver.',()=>{
  fittings('128814',legs(544,318).map(p=>xyz(topOn(pose(...p)))),['counter','148819-1','148819-2','148819-3','148819-4'],topAxis(up));
});
step('Attach the wall strap to the worktop','Sandwich the strap between two 100823 washers. Use the smallest screw, 109041, rather than 100226 or 109597.',()=>{
  fittings('100823',[xyz(topOn(pose(0,549,-183)))],['counter'],topAxis(up));
  const strap=place(next('107967'),topOn(pose(...strapAt)),['counter','100823-1'],topAxis(up),52);
  fittings('100823',[xyz(topOn(pose(0,545,-183)))],[strap],topAxis(up));
  fittings('109041',[xyz(topOn(pose(0,543,-183)))],['counter',strap,'100823-2'],topAxis(up));
});
const worktopIds=after(beforeTop), beforeHutch=new Set(at.keys());
const hutchOrigin=pose(0,568,0), hutchBench=pose(535,225,537,X(-PI/2));
const onH=p=>map(hutchBench,relative(hutchOrigin,p)), hAxis=axis=>rotate(axis,rotation(hutchBench));
const upperEnd=s=>pose(s*331,819.5,-114), upperShelf=pose(0,914,-114);
const upperDivider=s=>pose(s*165,996.5,-114);
let shelfDowels, rodSet, upperDowelL, upperDowelR, upperCatch;
step('Dowel the upper shelf','Fit two dowels at each end of the upper shelf. Identify the rear groove, ringed pivot bore and separate round rod socket.',()=>{
  place('upperShelf',onH(upperShelf));
  place('upperR',shifted(onH(upperEnd(1)),[80,0,0]));
  shelfDowels=fittings('101344',[-1,1].flatMap(s=>join.upperPinZ.map(z=>xyz(onH(pose(s*323,914,z))))),['upperShelf'],[right,right,left,left]);
});
step('Fasten the first upper side','Seat the grooved shelf in the right upper side and secure it with two short 100295 screws and the hex key.',()=>{
  move(['upperR'],[onH(upperEnd(1))],['upperShelf',...shelfDowels.slice(2)],left,'Join right upper side to shelf');
  fittings('100295',[-143,-82].map(z=>xyz(onH(pose(339,914,z)))),['upperR','upperShelf'],left);
});
step('Clip five hooks onto the rail','Use the open collars to snap all five hooks onto the loose rod; leave the rod ends clear.',()=>{
  place('118679-1',shifted(onH(pose(0,join.rodY,join.rodZ)),[-100,0,115]));
  rodSet=['118679-1'];
  for(const x of [-82,-55,-28,-1,26]) rodSet.push(place(next('118678'),map(at.get('118679-1'),pose(x,0,0)),['118679-1'],hAxis(up),58));
});
step('Seat the hook rail at the right','Feed the same rod into the round right socket, carrying the five hooks with it.',()=>{
  const end=onH(pose(0,join.rodY,join.rodZ));
  move(rodSet,[shifted(end,[-110,0,0]),end],['upperR'],right,'Guide the loaded rail into its socket');
});
step('Add the left upper side','Capture the open rail end and fit the shelf dowels into the left side, then secure the shelf with two short 100295 screws.',()=>{
  place('upperL',onH(upperEnd(-1)),['upperShelf','118679-1',...shelfDowels.slice(0,2)],right);
  fittings('100295',[-143,-82].map(z=>xyz(onH(pose(-339,914,z)))),['upperL','upperShelf'],right);
});
const dividerBench=s=>pose(930+s*177,16,-320,Z(-s*PI/2));
step('Fit the upper divider catch','Use two 128814 screws to fit the last 128815 catch to the inward face of the right upper divider. Leave the other divider plain.',()=>{
  place('dividerL',dividerBench(-1));
  place('dividerR',dividerBench(1));
  const id=place(next('128815'),on('dividerR',upperDivider(1),pose(153,991,-44,Y(-PI/2))),['dividerR'],down);
  upperCatch=[id,...fittings('128814',[979,1003].map(y=>xyz(on('dividerR',upperDivider(1),pose(151,y,-44)))),['dividerR',id],down)];
});
step('Dowel both divider bottoms','Fit two dowels into the bottom edge of each upper divider.',()=>{
  upperDowelL=fittings('101344',join.upperPinZ.map(z=>xyz(on('dividerL',upperDivider(-1),pose(-165,922,z)))),['dividerL'],left);
  upperDowelR=fittings('101344',join.upperPinZ.map(z=>xyz(on('dividerR',upperDivider(1),pose(165,922,z)))),['dividerR'],right);
});
const hutchLift=[610,41,-470], free=p=>shifted(p,hutchLift);
step('Stand the hutch and seat its dividers','Stand the frame upright. Lower the dividers onto their dowels with the rounded fronts forward and the right-hand catch facing inward.',()=>{
  move(after(beforeHutch).filter(id=>!['dividerL','dividerR',...upperDowelL,...upperDowelR,...upperCatch].includes(id)),
    [shifted(onH(upperShelf),[105,140,-220]),free(upperShelf)],[],up,'Stand up the hutch frame');
  for(const [s,ids] of [[-1,['dividerL',...upperDowelL]],[1,['dividerR',...upperCatch,...upperDowelR]]]) {
    const end=free(upperDivider(s));
    move(ids,[shifted(end,[0,111,0]),end],['upperShelf'],down,'Lower divider into the shelf');
  }
});
step('Fit the upper back','Slide the upper back down into its rear grooves, with the clipped corners uppermost.',()=>{
  place('upperBack',free(pose(0,996.5,-194)),['upperL','upperR','upperShelf'],down,156);
});
step('Dowel the dividers and locate the cap','Place four dowels into the divider tops, then lower the cap. Keep its ringed pivot receiver by the upper door opening.',()=>{
  const ids=fittings('101344',[-165,165].flatMap(x=>join.upperPinZ.map(z=>xyz(free(pose(x,1071,z))))),['dividerL','dividerR'],down);
  place('cap',free(pose(0,1080,-114)),['upperL','upperR',...ids],down,95);
});
step('Fasten the cap','Fit four short 100295 screws down through the cap into the two side-panel ends with the hex key.',()=>{
  fittings('100295',join.hutchX.flatMap(x=>[-143,-83].map(z=>xyz(free(pose(x,1089,z))))),['cap','upperL','upperR'],down);
});

const doors={
  microwave:{closed:pose(0,996,-24),x:join.microwaveX,z:join.microwaveZ,upper:1068,lower:922,side:-1},
  oven:{closed:pose(-164,304,174),x:-join.doorX,z:join.doorZ,upper:501,lower:106,side:-1},
  cupboard:{closed:pose(164,304,174),x:join.doorX,z:join.doorZ,upper:501,lower:106,side:1}
};
const onDoor=(id,p)=>on(id,doors[id].closed,p);
const doorSet={microwave:['microwave'],oven:['oven'],cupboard:['cupboard']};
const doorOffset=id=>id==='microwave'?hutchLift:[0,0,0];
const hingeOf=id=>[doors[id].x,doors[id].upper,doors[id].z];
const doorOpen=(id,angle,tilt=0)=>{
  const d=doors[id], pin=hingeOf(id), q=mult(Y(d.side*angle),X(tilt));
  return pose(...plus(plus(pin,doorOffset(id)),rotate(plus(xyz(d.closed),scale(pin,-1)),q)),q);
};
function topPivot(id) {
  const d=doors[id], point=hingeOf(id), q=mult(Y(-PI/2),Z(PI));
  const axis=rotate(front,rotation(at.get(id)));
  const bracket=place(next('118650'),onDoor(id,pose(...point,q)),[id],axis,48);
  doorSet[id].push(bracket,...fittings('128814',[14,35].map(dy=>xyz(onDoor(id,pose(d.x,d.upper-dy,d.z+8)))),[id,bracket],axis));
}
function strike(id) {
  const d=doors[id], x=id==='microwave'?141:d.side*13, y=id==='microwave'?991:489, z=d.closed[2]-11;
  const axis=rotate(front,rotation(at.get(id)));
  const plate=place(next('108768'),onDoor(id,pose(x,y,z)),[id],axis,47);
  doorSet[id].push(plate,...fittings('128814',[xyz(onDoor(id,pose(x,y,z-2)))],[id,plate],axis));
}
function lowerPivot(id,receiver) {
  const d=doors[id], base=shifted(pose(d.x,d.lower,d.z,Y(d.side>0?PI:0)),doorOffset(id));
  d.bracket=place(next('118650'),base,[receiver],down,58);
}
function engageTop(id,receiver) {
  const end=doorOpen(id,1.17,-.19);
  move(doorSet[id],[shifted(end,[0,-40,115]),end],[receiver],up,'Engage the top pivot');
}
function engageBottom(id,receiver) {
  const d=doors[id];
  move(doorSet[id],[doorOpen(id,1.32)],[d.bracket,receiver],d.side>0?left:right,'Swing the lower edge onto its pivot');
  const centers=[14,35].map(y=>plus([d.x+d.side*7,d.lower+y,d.z],doorOffset(id)));
  fittings('128814',centers,[d.bracket,receiver],[d.side,0,0]);
}
function pull(id) {
  const d=doors[id], upper=id==='microwave', x=upper?138:d.closed[0], y=upper?d.closed[1]:467, z=d.closed[2]+8;
  const axis=rotate(front,rotation(at.get(id)));
  const handle=place(next('120104'),onDoor(id,pose(x,y,z,upper?identity:Z(PI/2))),[id],scale(axis,-1),50);
  doorSet[id].push(handle,...fittings('100226',[-44,44].map(o=>xyz(onDoor(id,pose(upper?x:x+o,upper?y+o:y,z-16)))),[id,handle],axis));
}
step('Fit the upper-door strike','Lay the upper window door on a protected surface. Fit the strike at the free edge with one 128814 screw.',()=>{
  place('microwave',pose(890,30,-76,X(PI/2)));
  strike('microwave');
});
step('Fit the upper-door top pivot','Fix the bracket with two 128814 screws. Its pin points up when the door is upright.',()=>topPivot('microwave'));
step('Drop in the lower upper-door pivot','Set the loose pivot pin down into the shelf beside the left divider. Leave the plate unscrewed for now.',()=>lowerPivot('microwave','upperShelf'));
step('Engage the upper-door top pin','Lift the same door to engage its top pin in the cap receiver.',()=>engageTop('microwave','cap'));
step('Secure the lower upper-door pivot','Swing the door onto the lower bracket and use two 128814 screws to secure that bracket to the divider.',()=>engageBottom('microwave','dividerL'));
step('Fit the vertical upper pull','Fit the pull with two 100226 screws from the inside. Do not use the shorter 109597 faucet screws.',()=>pull('microwave'));
step('Fit the faucet by hand','Fit the faucet above the sink opening. From the underside, use two 100823 washers and two 109597 screws, not 100226.',()=>{
  const faucet=place('152849-1',topOn(pose(171,568,join.tapZ)),['counter'],topAxis(down),95);
  worktopIds.push(faucet,...fittings('100823',join.tap.map(x=>xyz(topOn(pose(x,549,join.tapZ)))),['counter',faucet],topAxis(up)),
    ...fittings('109597',join.tap.map(x=>xyz(topOn(pose(x,547,join.tapZ)))),['counter',faucet],topAxis(up)));
},{page:23,text:'Use a hand cross-head screwdriver at the faucet. Do not use a powered driver.'});
let hutch;
step('Join the hutch to the worktop','Turn the upper frame down to reach the underside. Use four short 100295 screws up through the worktop into the hutch side-panel ends.',()=>{
  move(doorSet.microwave,[doorOpen('microwave',0)],['cap','upperShelf'],back,'Close the upper door before turning the module');
  hutch=after(beforeHutch).filter(id=>!worktopIds.includes(id));
  move(hutch,[shifted(free(upperShelf),[0,90,0]),onH(upperShelf)],[],down,'Lay the hutch down as a unit');
  const end=onH(counter);
  move(worktopIds,[shifted(end,[0,0,125]),end],['upperL','upperR'],hAxis(up),'Seat the worktop against the hutch ends');
  hutch.push(...worktopIds,...fittings('100295',join.hutchX.flatMap(x=>join.hutchZ.map(z=>xyz(onH(pose(x,550,z))))),
    ['counter','upperL','upperR'],hAxis(up),true));
});
step('Lower the upper module onto the base','Insert three dowels along the lower divider’s top edge. With two people, turn the joined module upright and lower it onto all three dowels.',()=>{
  const pins=fittings('101344',join.dividers.map(z=>[0,550,z]),['divider'],down,true);
  move(hutch,[shifted(upperShelf,[335,274,-182]),shifted(upperShelf,[0,155,0]),upperShelf],['divider',...pins,'lowerL','lowerR'],down,'Lower the complete module onto three dowels');
});
step('Lock the worktop to the base','With the hex key, fit four long 100224 screws horizontally through the lower sides and into the connector cross-bores.',()=>{
  fittings('100224',legs(534,353),['lowerL','lowerR','148819-1','148819-2','148819-3','148819-4'],[right,right,left,left],true);
});
step('Secure the kitchen to the wall','Use the supplied strap and remaining 100823 washer to secure the kitchen to the wall. The model shows only a generic wall-fixing location.',()=>{
  adjust('107967-1',pose(...strapAt,X(.66)),['counter','109041-1'],back,'Bring the free end of the strap to the wall');
  const p=[0,573,-217];
  fittings('100823',[p],['107967-1'],back);
  place('wallFix',pose(...plus(p,[0,0,2]),facing(back)),['107967-1','100823-5'],back,55);
},wallWarning);
step('Prepare both lower top pivots','Place both doors inner-face up. Use two 128814 screws per bracket at the handed upper pivot corners.',()=>{
  place('oven',pose(-610,30,-500,X(PI/2)));
  place('cupboard',pose(-995,30,-500,X(PI/2)));
  topPivot('oven'); topPivot('cupboard');
});
step('Fit both lower door strikes','On each door, fit one strike at the free edge with one 128814 screw.',()=>{
  strike('oven'); strike('cupboard');
});
step('Drop in both lower pivots','Set the two brackets pin-down into the outside front corners of the bottom panel; do not screw them in yet.',()=>{
  lowerPivot('oven','bottom'); lowerPivot('cupboard','bottom');
});
step('Lift the right door into place','Lift the solid door and engage its top pivot in the right front-rail bore.',()=>engageTop('cupboard','rail'));
step('Secure the right lower pivot','Swing the solid door onto the lower pivot and secure the bracket with two 128814 screws from inside.',()=>engageBottom('cupboard','lowerR'));
step('Lift the left door into place','Lift the windowed door and engage its top pivot in the left front-rail bore.',()=>engageTop('oven','rail'));
step('Secure the left lower pivot','Swing the windowed door onto the lower pivot and secure the bracket with two 128814 screws from inside.',()=>engageBottom('oven','lowerL'));
step('Add the two lower pulls','Fit the horizontal pulls with two 100226 screws per door, working from the inner face.',()=>{
  pull('oven'); pull('cupboard');
});
step('Seat the sink','Close the doors as pictured and lower the removable sink into the right worktop opening below the faucet.',()=>{
  for(const id of ['oven','cupboard']) move(doorSet[id],[doorOpen(id,0)],['rail','bottom'],back,'Close the door on its vertical pivots');
  place('sink',pose(join.sink[0],568,join.sink[1]),['counter'],down,114);
});
step('Clip in the cooktop','Tilt the housed cooktop into the left opening, engage the first edge and press down on the opposite edge. The release inset is for the same module; see p. 31 for batteries.',()=>{
  const [x,z]=join.stove, end=pose(x,568,z);
  place('150916-1',end,['counter'],down,128,[pose(x,600,z+40,X(-.31)),pose(x,586,z,X(-.18))]);
});
export const steps=all;
