import { pages } from './manual.js';

const {PI,sin,cos}=Math, X=[1,0,0], Y=[0,1,0];
const pose=([x,y,z],axis=Y,angle=0)=>[x,y,z,...axis.map(a=>a*sin(angle/2)),cos(angle/2)];
const rotate=([x,y,z],[,,,a,b,c,d])=>{
  const u=2*(b*z-c*y), v=2*(c*x-a*z), w=2*(a*y-b*x);
  return [x+d*u+b*w-c*v,y+d*v+c*u-a*w,z+d*w+a*v-b*u];
};
function compose(p,q) {
  const [x,y,z]=rotate(q,p), [,,,a,b,c,d]=p, [,,,e,f,g,h]=q;
  return [x+p[0],y+p[1],z+p[2],d*e+a*h+b*g-c*f,d*f-a*g+b*h+c*e,d*g+a*f-b*e+c*h,d*h-a*e-b*f-c*g];
}
function inverse(p) {
  const q=[0,0,0,-p[3],-p[4],-p[5],p[6]];
  return [...rotate([-p[0],-p[1],-p[2]],q),...q.slice(3)];
}
const shift=(p,axis,d)=>p.map((v,i)=>i<3 ? v+axis[i]*d : v);
const seat=(at,[x,y,z])=>pose(at,x||z?[z,0,-x]:X,Math.acos(y));
const neg=v=>v.map(x=>-x);

// Upright datums shared with the mesh: wood length 1914 mm, total length 1930 mm including wheels.
export const fit=Object.freeze({head:-949,foot:965,deckY:272,top:298,halfWood:302,
  rearX:-921,frontX:943,legY:135,legZ:280,legW:44,legTop:270,studY:246,
  wheelY:44,wheelR:44,footDowelY:53,footBoltY:35,braceEnd:258,braceBarrel:239});
const {deckY,top,rearX,frontX,legY,legZ,legW,legTop,studY,wheelY,footDowelY,footBoltY,braceBarrel}=fit;
const identity=pose([0,0,0]), work=pose([0,top,0],X,PI), upright=inverse(work);
const deck=pose([0,deckY,0]);
const inWork=p=>compose(work,p);
const workAxis=v=>rotate(v,work);
const signs=[1,-1];
export const legStations=[true,false].flatMap((wheel,i)=>signs.map((side,j)=>({
  id:`${wheel?'wheel':'foot'}Leg${side===1?'Near':'Far'}`, n:i*2+j+1, wheel, side,
  x:wheel?rearX:frontX, into:wheel?1:-1, z:side*legZ
})));
export const wheelStack=[['10089529',279.5],['117217',330],['117215',322.5],['wheel',320],
  ['117217',315],['112074',310],['117217',305]];
const wheelMembers=i=>wheelStack.map(([key],j)=>key==='wheel'?`wheel-${i+1}`:`${key}-${key==='117217'?3*i+[1,4,6].indexOf(j)+1:i+1}`);

export const families={}, parts=new Map(), shapes={};
const deckGroup='Deck and wheel assemblies', legGroup='Legs and braces', fittingGroup='Fittings · p. 3', toolGroup='Supplied tools';
function family(key,name,group,page,number=null,role='kit') { families[key]=Object.freeze({name,number,group,page,role}); }
function part(id,key,shape,dimensions,unpacked) {
  shapes[shape]??=dimensions;
  parts.set(id,Object.freeze({id,family:key,shape,unpacked:Object.freeze(unpacked),packet:families[key].group}));
}
family('deck','Preassembled slatted deck and backrest',deckGroup,5);
part('deck','deck','deck',[1930,85,604],inWork(pose([-450,deckY,305])));
family('wheel','Wheel with tread',deckGroup,7);
for(let i=1;i<=2;i++) part(`wheel-${i}`,'wheel','wheel',[88,31,88],seat([-1060+(i-1)*112,44,145],[0,0,1]));
for(const station of legStations) {
  const {id,n,wheel,side}=station, key=wheel?'wheelLeg':'footLeg';
  if(side===1) family(key,wheel?'Wheel-end bored leg':'Foot-end leg with pad',legGroup,wheel?5:10);
  part(id,key,id,[legW,270,legW],pose([-810+(n-1)*345,legW/2,285],[0,0,1],PI/2));
}
family('wheelBrace','Wheel-end brace with end tongues',legGroup,6);
family('footBrace','Foot-end brace with dowel holes',legGroup,11);
part('wheelBrace','wheelBrace','wheelBrace',[36,42,534],pose([-1080,21,450],Y,PI/2));
part('footBrace','footBrace','footBrace',[34,44,516],pose([-495,22,450],Y,PI/2));
for(const [row,[key,name,quantity,dimensions]] of [
  ['10089529','Hex-head axle bolt',2,[17,107,17]],['113134','Hex-socket foot-end bolt',2,[17,74,17]],
  ['114729','Slotted leg stud',4,[8,61,8]],['128832','Fluted dowel',2,[8,25,8]],
  ['117215','Long wheel sleeve',2,[14,13,14]],['112074','Short wheel sleeve',2,[14,8,14]],
  ['116562','Leg barrel nut',4,[14,25,14]],['10089533','Wheel-brace barrel nut',2,[16,23,16]],
  ['113153','Foot-brace barrel nut',2,[11,20,11]],['114577','Hex nut',4,[16,7,16]],
  ['117217','Flat washer',6,[19,2,19]],['106675','Split lock washer',4,[15,2.5,15]],
  ['128632','Combination wrench',1,[175,5,27]],['100001','Bent hex key',1,[57,5,29]]
].entries()) {
  const tool=row>=12;
  family(key,name,tool?toolGroup:fittingGroup,3,key,tool?'tool':'kit');
  for(let i=0;i<quantity;i++) {
    const long=row<4;
    part(`${key}-${i+1}`,key,key,dimensions,
      long?seat([640+i*88,dimensions[0]/2,-510+78*row],[0,0,1]):
        pose([640+i*69,dimensions[1]/2,-510+78*row]));
  }
}

export const setup='Build with two people on a protected surface. Bring a slotted screwdriver; the combination wrench and hex key are supplied.';
const pinch={text:'Pinch hazard: keep fingers clear of the moving backrest and the frame while handling the deck.',page:5};
const turnWarning={text:'After tightening, have two people turn the chaise upright. Keep fingers clear of the backrest and frame.',page:15};

function author() {
  const records=[], locations=new Map();
  let operations;
  function step(title,action,run,warning) {
    const number=records.length+1;
    operations=[];
    run();
    records.push({number,page:pages[number-1],title,action,warning,operations});
  }
  function add(kind,ids,prerequisites,poses,axis,caption,view,captive,rigid) {
    const target=poses[0].at(-1).slice(0,3);
    operations.push({kind,ids,prerequisites,poses,axes:ids.map(()=>axis),captive,rigid,
      previewBores:/^113134-/.test(ids[0]) || kind==='move' && /^10089529-/.test(ids[0]),
      joint:{target,axis,outward:neg(axis),receivers:prerequisites,caption,view}});
    ids.forEach((id,i)=>locations.set(id,poses[i].at(-1)));
  }
  function place(id,end,axis,dist,prerequisites=[],caption=families[parts.get(id).family].name,view) {
    add('place',[id],prerequisites,[[shift(end,axis,-dist),end]],axis,caption,view);
  }
  function carry(ids,frames,axis,prerequisites,caption,view) {
    const anchor=ids[0], initial=ids.map(id=>locations.get(id)), start=initial[0], inv=inverse(start);
    const transforms=frames.map(p=>compose(p,inv));
    add('move',ids,prerequisites,initial.map(p=>[p,...transforms.map(t=>compose(t,p))]),axis,caption,view,
      undefined,{anchor,frames:[start,...frames],offsets:initial.map(p=>compose(inv,p))});
  }
  const laidLeg=s=>pose([-450+(s.n-1)*300,legY,468]);
  const legPose=s=>pose([s.x,legY,s.z]);
  const legMembers=s=>[s.id,`116562-${s.n}`,`114729-${s.n}`];
  const closeup={direction:[-.5,.48,.8],span:460};
  function mountLeg(s) {
    const end=inWork(legPose(s)), axis=[s.into,0,0], start=shift(end,axis,-110);
    const lift=shift(locations.get(s.id),Y,152);
    carry(legMembers(s),[lift,shift(start,Y,66),start,end],axis,['deck'],
      'Seat the same prepared leg and stud',closeup);
  }
  function splay(s,open,brace) {
    const turn=pose([0,0,0],X,-s.side*.075), pivot=pose([s.x,studY,s.z]);
    const spread=compose(compose(compose(pivot,turn),inverse(pivot)),legPose(s));
    carry(legMembers(s),[inWork(open?spread:legPose(s))],[0,0,open?-s.side:s.side],
      ['deck',...(open?[]:[brace])],open?'Leave the leg joint loose for the brace':'Seat the leg around the brace end',closeup);
  }
  function braceNut(key,i,wheel) {
    const [id,x,y]=wheel?['wheelBrace',rearX,wheelY]:['footBrace',frontX,footBoltY];
    const outward=[0,-1,0], side=signs[i];
    const location=inWork(seat([x,y,side*braceBarrel],outward));
    place(`${key}-${i+1}`,location,workAxis(neg(outward)),44,[id],'Align the barrel’s cross-hole with the side bore');
  }
  function clampLeg(s) {
    const out=[s.into,0,0], axis=neg(out);
    const point=d=>[s.x+s.into*d,studY,s.z];
    const post=`114729-${s.n}`, washer=`106675-${s.n}`, nut=`114577-${s.n}`;
    place(washer,inWork(seat(point(28.25),out)),axis,52,['deck',s.id,post]);
    const location=inWork(seat(point(33),out));
    place(nut,location,axis,43,[post,washer]);
    const turn=pose([0,0,0],Y,PI/3);
    add('adjust',[nut],[post,washer],[[location,compose(location,turn),compose(location,pose([0,0,0],Y,2*PI/3))]],axis,'Tighten the same nut with the combination wrench');
  }
  const wheelLegs=legStations.slice(0,2), footLegs=legStations.slice(2);
  step('Prepare all four legs','Use the four 116562 barrel nuts, not either brace nut. Align their side threads and turn in the four 114729 studs with the slotted screwdriver.',()=>{
    add('place',legStations.map(s=>s.id),[],legStations.map(s=>[shift(laidLeg(s),Y,55),laidLeg(s)]),[0,-1,0],
      'Lay out the four legs', {direction:[-.2,.48,.86],span:1250});
    for(const s of legStations) {
      const {n,into}=s, x=laidLeg(s)[0], z=laidLeg(s)[2], outward=[into,0,0];
      place(`116562-${n}`,pose([x,studY,z],Y,PI/2),[0,-1,0],50,[s.id]);
      place(`114729-${n}`,seat([x+into*20,studY,z],outward),neg(outward),46,[s.id,`116562-${n}`]);
    }
  });
  step('Fit the two wheel-end legs','Rest the deck face down on protection. Use the two legs with the large axle openings and match the paired drillings at the corner brackets.',()=>{
    place('deck',inWork(deck),[0,-1,0],54,[],'Preassembled deck, upside down',{direction:[-.48,.43,.75],span:1580});
    for(const s of wheelLegs) mountLeg(s);
  },pinch);
  step('Fit the wheel-end brace','Engage both integral end tongues in the wheel-end legs. Leave the brace’s barrel-nut pockets accessible from above.',()=>{
    wheelLegs.forEach(s=>splay(s,true,'wheelBrace'));
    place('wheelBrace',inWork(pose([rearX,wheelY,0])),[0,-1,0],85,wheelLegs.map(s=>s.id),'Engage both brace tongues',
      {direction:[-.65,.52,.58],span:735});
    wheelLegs.forEach(s=>splay(s,false,'wheelBrace'));
  });
  step('Insert the larger brace barrels','Put the two 10089533 barrels in the wheel-end brace. Do not use the smaller 113153 barrels.',()=>{
    signs.forEach((_,i)=>braceNut('10089533',i,true));
  });
  step('Build two separate wheel stacks','Build one stack per wheel. From the axle head, follow the flat washer, long sleeve, wheel, flat washer, short sleeve and last flat washer shown in the inset.',()=>{
    signs.forEach((side,i)=>{
      const outward=[0,0,side], axis=workAxis(outward), ids=wheelMembers(i);
      wheelStack.forEach(([,depth],j)=>{
        const p=inWork(seat([rearX,wheelY,side*(depth+145)],outward));
        const receivers=j===0?[]:[ids[0],...(j===1?[]:[ids[j-1]])];
        place(ids[j],p,j===0?[0,-1,0]:axis,j===0?55:44,receivers);
      });
    });
  });
  step('Thread the wheels into the brace','From the two outside faces, push each separate axle through its wheel-end leg and thread it into its own barrel. Hold the barrel with the slotted screwdriver and turn the hex head with the wrench.',()=>{
    wheelLegs.forEach((s,i)=>{
      const ids=wheelMembers(i), outward=[0,0,s.side];
      const end=inWork(seat([rearX,wheelY,s.side*wheelStack[0][1]],outward));
      carry(ids,[end],workAxis(neg(outward)),[s.id,'wheelBrace',`10089533-${i+1}`],
        'Slide the separate axle stack through its leg');
      add('adjust',[ids[0]],[s.id,`10089533-${i+1}`],[[end,compose(end,pose([0,0,0],Y,PI/2)),
        compose(end,pose([0,0,0],Y,PI))]],workAxis(neg(outward)),'Turn the axle head with the wrench');
    });
  });
  step('Lock the wheel-end leg studs','Add a split washer and hex nut to each existing leg stud at the corner bracket. Tighten with the ring end of the supplied wrench.',()=>wheelLegs.forEach(clampLeg));
  step('Fit the two padded foot-end legs','Use the remaining prepared legs and keep the paired small holes at their padded ends facing one another.',()=>footLegs.forEach(mountLeg));
  const stagedBrace=inWork(pose([frontX-170,footBoltY-55,0]));
  step('Put dowels in the foot-end brace','Fit one 128832 dowel in each of the two designated brace-end holes. Keep the two barrel pockets facing up in the work pose.',()=>{
    place('footBrace',stagedBrace,[0,-1,0],64,[],'Prepare the loose brace',{direction:[.53,.48,.7],span:740});
    signs.forEach((side,i)=>{
      const outward=[0,0,side];
      place(`128832-${i+1}`,compose(stagedBrace,seat([0,footDowelY-footBoltY,side*258],outward)),
        workAxis(neg(outward)),44,['footBrace']);
    });
  });
  step('Seat the dowelled foot-end brace','Bring the brace between the legs and line up both dowels with their matching small holes. The barrel pockets still face up.',()=>{
    footLegs.forEach(s=>splay(s,true,'footBrace'));
    const p=inWork(pose([frontX,footBoltY,0]));
    carry(['footBrace','128832-1','128832-2'],[shift(p,Y,50),p],[0,-1,0],footLegs.map(s=>s.id),
      'Carry the brace and both dowels together',{direction:[.63,.56,.53],span:745});
    footLegs.forEach(s=>splay(s,false,'footBrace'));
  });
  step('Insert the smaller brace barrels','Put the two 113153 barrels in the foot-end brace, aligning their side threads with the bolt holes.',()=>{
    signs.forEach((_,i)=>braceNut('113153',i,false));
  });
  step('Bolt the foot-end brace','Pass a 113134 bolt through each outer leg face into its brace barrel. Use the supplied hex key on the bolt and the slotted screwdriver on the barrel.',()=>{
    footLegs.forEach((s,i)=>{
      const outward=[0,0,s.side];
      place(`113134-${i+1}`,inWork(seat([frontX,footBoltY,s.side*266],outward)),workAxis(neg(outward)),64,
        [s.id,'footBrace',`113153-${i+1}`],'Pass the hex-socket bolt through the leg');
    });
  });
  step('Lock the foot-end leg studs','Fit the remaining split washers and hex nuts to the two foot-end corner studs and tighten with the wrench. Then follow the two-person turn on page 15.',()=>footLegs.forEach(clampLeg),turnWarning);

  const ids=[...locations.keys()], poses=ids.map(id=>locations.get(id));
  const turnFrames=[identity,pose([0,250,0]),pose([0,399,149],X,-PI/2),shift(upright,Y,250),upright];
  const raisedDeck=compose(upright,locations.get('deck'));
  const prep={number:14,page:15,operations:[{kind:'move',ids,prerequisites:['deck'],poses:poses.map(p=>turnFrames.map(t=>compose(t,p))),
    axes:ids.map(()=>Y),joint:{target:raisedDeck.slice(0,3),axis:Y,outward:Y,receivers:['deck'],caption:'Turn the whole chaise upright'},
    rigid:{anchor:'deck',frames:turnFrames,offsets:poses}}]};
  const use={number:15,page:15,operations:[[0,.42,'Lift the backrest'],[.42,.8,'Swing the support'],[.8,1,'Seat the support']].map(([from,to,caption])=>({
    kind:'adjust',ids:['deck'],prerequisites:[],poses:[[raisedDeck,raisedDeck]],axes:[Y],
    captive:{from,to},joint:{target:[-650,450,0],axis:Y,outward:Y,receivers:[],caption}
  }))};
  return {steps:records,demo:[...records,prep,use]};
}

const authored=author();
export const {steps,demo}=authored;
export function completeFrame(frame) {
  return {...frame,poses:Object.fromEntries(frame.installed.map(id=>[id,compose(upright,frame.poses[id])]))};
}
