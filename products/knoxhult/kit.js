import { beforeLayout, layoutPages, afterLayout } from './manual.js';

// Finished datum in mm: floor at y=0, +x right, +z front.
export const shapes={
  end:[18,876,590], base:[1793,18,572], upright:[18,762,72], crosspiece:[18,86,456],
  topRail:[1793,18,65], plinth:[1793,88,18], back:[1805,543,4], counter:[1839,26,610], shelf:[579,18,527],
  tallDoor:[604,772,18], shortDoor:[604,641,18], drawerFront:[604,126,18], drawerSide:[15,76,541], drawerBack:[527,76,15],
  drawerBottom:[537,4,535], brace:[18,19,540], caseRunnerL:[12,29,531], caseRunnerR:[12,29,531],
  drawerRunnerL:[12,29,531], drawerRunnerR:[12,29,531], anchor:[46,57,22], keyhole:[36,41,4], angle:[23,25,24],
  hinge:[56,63,63], plate:[13,51,41], socket:[20,15,20], foot:[23,28,23], hexKey:[52,90,5],
  frameScrew:[12,60,12], topScrew:[8,43,8], pilotScrew:[7,22,7], panScrew:[9,18,9], euroScrew:[10,14,10],
  railScrew:[9,12,9], camStud:[9,37,9], cam:[16,12,16], drawerCam:[14,11,14], dowel:[8,32,8],
  fineDowel:[6,29,6], drivePin:[9,24,9], shelfPin:[7,18,7], bumper:[10,3,10], nail:[4,19,4], wallScrew:[11,32,11]
};
export const families={};
export const parts=new Map();
const {PI}=Math, half=PI/2;
const flat=[0,0,0,1], down=[0,-1,0], up=[0,1,0], front=[0,0,1], rear=[0,0,-1];
const alongX=(sign=1)=>[sign,0,0];
const xyz=p=>p.slice(0,3), quat=p=>p.slice(3), pose=(p,q=flat)=>[...p,...q];
const mul=(p,k)=>p.map(v=>v*k), add=(a,b)=>a.map((v,i)=>v+b[i]), sub=(a,b)=>add(a,mul(b,-1));
const cross=([x,y,z],[a,b,c])=>[y*c-z*b,z*a-x*c,x*b-y*a];
const dot=(a,b)=>a.reduce((n,v,i)=>n+v*b[i],0);
const turn=(axis,r)=>[...mul(axis,Math.sin(r/2)),Math.cos(r/2)];
const rx=r=>turn(alongX(),r), ry=r=>turn(up,r), rz=r=>turn(front,r);
const inverse=([x,y,z,w])=>[-x,-y,-z,w];
function rotate(v,q) {
  const t=mul(cross(q,v),2);
  return add(v,add(mul(t,q[3]),cross(q,t)));
}
function compose(a,b) {
  const u=xyz(a), v=xyz(b);
  return [...add(add(mul(v,a[3]),mul(u,b[3])),cross(u,v)),a[3]*b[3]-dot(u,v)];
}
const transform=(a,b)=>pose(add(xyz(a),rotate(xyz(b),quat(a))),compose(quat(a),quat(b)));
const relative=(a,b)=>{
  const q=inverse(quat(a));
  return pose(rotate(sub(xyz(b),xyz(a)),q),compose(q,quat(b)));
};
function facing(axis) {
  const normal=mul(axis,-1);
  const q=[...cross(up,normal),1+normal[1]], length=Math.hypot(...q);
  return length<1e-8 ? rx(PI) : mul(q,1/length);
}
function stock(key,name,number,group,page,role,entries) {
  families[key]={name,number,group,page,role};
  for(const [id,shape,x,z,q=flat,y=shapes[shape][1]/2] of entries) {
    parts.set(id,{id,shape,family:key,packet:group,unpacked:pose([x,y,z],q)});
  }
}
const boards='Cabinet and shelves', doorsGroup='Doors and drawer';
const board=(key,name,page,entries,group=boards)=>stock(key,name,null,group,page,'kit',entries);
board('ends','Handed end panel',6,[['endL','end',-1490,-210,rz(half),9],['endR','end',1490,-210,rz(-half),9]]);
board('base','Cabinet base',8,[['base','base',0,-370]]);
board('uprights','Divider upright',9,[['uprightLF','upright',-570,470,rz(half),9],['uprightRF','upright',570,470,rz(half),9],
  ['uprightLB','upright',-570,565,rz(half),9],['uprightRB','upright',570,565,rz(half),9]]);
board('crosspieces','Divider depth crosspiece',10,[['crossL','crosspiece',-337,160,rz(half),9],['crossR','crosspiece',337,160,rz(half),9]]);
board('topRails','Upper lengthwise rail',13,[['upperFront','topRail',0,660],['upperBack','topRail',0,755]]);
board('plinth','Front plinth',14,[['plinth','plinth',0,860,rx(half),9]]);
board('back','Partial cabinet back',17,[['back','back',0,-1010,rx(half),2]]);
board('counter','Oak-effect worktop',29,[['counter','counter',0,-1650]]);
board('shelves','Adjustable shelf',33,[['shelf1','shelf',-1500,410],['shelf2','shelf',0,1200],['shelf3','shelf',1500,410]]);
board('tallDoors','Tall door',34,[['tall1','tallDoor',-1430,-990,rx(half),9],['tall2','tallDoor',1430,-990,rx(half),9]],doorsGroup);
board('shortDoor','Short door below drawer',34,[['shortDoor','shortDoor',1430,-1710,rx(half),9]],doorsGroup);
board('drawerFront','Drawer front',36,[['drawerFront','drawerFront',-1450,770,rx(half),9]],doorsGroup);
board('drawerSides','Drawer side',36,[['drawerL','drawerSide',-1660,1170,rz(half),7.5],['drawerR','drawerSide',-1530,1170,rz(-half),7.5]],doorsGroup);
board('drawerBack','Drawer back',39,[['drawerBack','drawerBack',-1450,1580,rx(half),7.5]],doorsGroup);
board('drawerBottom','Drawer bottom',38,[['drawerBottom','drawerBottom',1480,1080]],doorsGroup);
const hardware=[
  ['100214','Hex-drive cabinet screw','frameScrew',12],['109029','Worktop screw','topScrew',10],
  ['148510','Front runner screw','pilotScrew',2],['105344','Small angle and brace screw','panScrew',3],
  ['100344','Bracket and hinge screw','euroScrew',21],['100365','Short runner screw','railScrew',12],
  ['118331','Cam stud','camStud',6,'118331 / 112996'],['103430','Cabinet cam lock','cam',4],['119030','Drawer cam lock','drawerCam',2],
  ['101350','Large fluted dowel','dowel',28],['101345','Small drawer dowel','fineDowel',2],['110519','Drive-in drawer fastener','drivePin',2],
  ['101449','Threaded foot socket','socket',5],['103095','Adjustable foot','foot',5],['100001','Hex key','hexKey',1],
  ['101532','Shelf pin','shelfPin',12],['107091','Peel-off bumper','bumper',4],['115753','Wall attachment bracket','anchor',4],
  ['103693','Slotted wall retaining plate','keyhole',4],['103717','Plinth angle','angle',1],['101221','Back nail (one bag)','nail',23],
  ['117877','Cup hinge','hinge',6],['118692','Hinge plate with captive screws','plate',6],['118301','Drawer-bottom brace','brace',1]
];
for(const [i,[key,name,shape,count,number=key]] of hardware.entries()) {
  const page=i<17?4:5;
  stock(key,name,number,`Hardware p. ${page}`,page,key==='100001'?'tool':'kit',Array.from({length:count},(_,j)=>[
    `${key}-${j+1}`,shape,-1130+(i%6)*400+j%7*41,1720+Math.floor(i/6)*170+Math.floor(j/7)*36
  ]));
}
stock('139505','Handed runners (one four-piece set)','139505','Hardware p. 5',5,'kit',[
  ['runnerL','caseRunnerL',-490,1580,ry(half)],['runnerR','caseRunnerR',130,1580,ry(-half)],
  ['drawerRunnerL','drawerRunnerL',-490,1640,ry(half)],['drawerRunnerR','drawerRunnerR',130,1640,ry(-half)]
]);
stock('wall','Wall screw (schematic)',null,'Required, not supplied',32,'external',
  Array.from({length:4},(_,i)=>[`wall-${i+1}`,'wallScrew',700+i*58,1610]));

const e=905.5, div=300, bayX=[-602,0,602];
const base=[0,105,0], plinth=[0,52,250], yRail=809, zRail=5, anchorY=837, anchorZ=-286;
const wallZ=-294, endCenter=445, doorZ=303, hingeZ=257, shortTop=749;
const sideData=[['endL',-e,1],['endR',e,-1]];
const bays=[
  [['endL',-896.5],['uprightLF',-309]],
  [['uprightLF',-291],['uprightRF',291]],
  [['uprightRF',309],['endR',896.5]]
];
const frontStep=[245,1,-244];
const raw=pose([0,307,478],rx(half));
const reversed=pose([0,307,478],compose(ry(PI),rx(half)));
const upright=pose([0,0,0]);
const bench=pose([0,29,1100],rx(half));
const drawerFlip=pose([0,66,1100],rx(PI));
const row=(n,fn)=>Array.from({length:n},(_,i)=>fn(i));
const sites=(points,axis,receivers)=>points.map(p=>({p,axis,receivers}));
export const wallWarning='Tip-over can cause serious or fatal crushing injuries. Secure the cabinet with all supplied wall attachment devices. Wall screws and plugs are not included: use fixings suitable for your wall and seek professional advice if unsure.';
const warning={text:wallWarning,page:2};
export const setupWarning={text:'Use two people and a protected assembly surface. Bring the tools shown in the official setup figure.',page:3};

export function build(drawerBay) {
  const layout=['left','center','right'].indexOf(drawerBay);
  const pages=[...beforeLayout,...layoutPages[drawerBay],...afterLayout];
  const all=[], at=new Map(), used={};
  let ops, cabinet=raw;
  function step(title,action,buildStep,alert) {
    ops=[]; buildStep();
    all.push({number:all.length+1,page:pages[all.length],title,action,warning:alert,operations:ops});
  }
  function operation(kind,ids,prerequisites,paths,axes,caption,extra={}) {
    const axis=axes[0];
    ops.push({kind,ids,prerequisites:[...new Set(prerequisites)],poses:paths,axes,
      joint:{target:xyz(paths[0].at(-1)),axis,outward:mul(axis,-1),receivers:prerequisites,caption},...extra});
    ids.forEach((id,i)=>at.set(id,paths[i].at(-1)));
  }
  function place(id,target,receivers=[],axis=down,distance=70,via=[]) {
    const start=pose(sub(xyz(target),mul(axis,distance)),quat(target));
    operation('place',[id],receivers,[[start,...via,target]],[axis],families[parts.get(id).family].name);
  }
  function fit(key,entries,caption=families[key].name,previewBores=true) {
    const ids=entries.map(()=>`${key}-${used[key]=(used[key]??0)+1}`);
    const paths=entries.map(({p,axis})=>{
      const q=facing(axis);
      return [pose(sub(p,mul(axis,34)),q),pose(p,q)];
    });
    operation('place',ids,entries.flatMap(s=>s.receivers),paths,entries.map(s=>s.axis),caption,{previewBores});
    return ids;
  }
  function move(ids,frames,axis,caption,receivers=[]) {
    const anchor=ids[0], first=at.get(anchor);
    const offsets=ids.map(id=>relative(first,at.get(id)));
    operation('move',[...ids],receivers,ids.map((id,i)=>[at.get(id),...frames.map(f=>transform(f,offsets[i]))]),
      ids.map(()=>axis),caption,{rigid:{anchor,frames:[first,...frames],offsets}});
  }
  function adjust(ids,receivers,axis,caption,r=half,travel=0) {
    const paths=ids.map(id=>{
      const p=at.get(id);
      return [p,pose(add(xyz(p),mul(axis,travel)),compose(turn(axis,r),quat(p)))];
    });
    operation('adjust',ids,receivers,paths,ids.map(()=>axis),caption,{captive:{from:0,to:1}});
  }
  const from=(frame,p,q=flat)=>transform(frame,pose(p,q));
  const inCase=(p,q)=>from(cabinet,p,q);
  const caseAxis=a=>rotate(a,quat(cabinet));
  const caseSites=(points,axis,receivers)=>sites(points.map(p=>xyz(inCase(p))),caseAxis(axis),receivers);
  const face=(id,p,axis)=>sites([xyz(from(at.get(id),p))],rotate(axis,quat(at.get(id))),[id]);
  const edgeDowels=(id,deltas)=>fit('101350',deltas.flatMap(([p,a])=>face(id,p,a)));
  const camLock=(id,points)=>{
    const cams=fit('103430',caseSites(points,up,[id,'base']));
    adjust(cams,['base'],caseAxis(up),'Lock the cabinet cams');
  };
  const anchorMount=(id,[x,y,z],s)=>{
    place(`115753-${used['115753']=(used['115753']??0)+1}`,from(at.get(id),[x,y,z],s===1?flat:rz(PI)),[id],rotate(alongX(-s),quat(at.get(id))));
    const bracket=`115753-${used['115753']}`;
    fit('100344',[-15,15].flatMap(d=>face(id,[x-s*18,y+d,z+12],alongX(-s)).map(site=>({...site,receivers:[id,bracket]}))));
  };
  function turnCase(ids,frame,axis,caption) {
    const old=cabinet;
    cabinet=frame;
    move(ids,[transform(frame,relative(old,at.get(ids[0])))],axis,caption);
  }
  const sideUnits=[[],[]], uprightUnits=[[],[]], crossUnits=[], railUnits=[], plinthUnit=['plinth'];
  const uprights=['uprightLF','uprightRF','uprightLB','uprightRB'];
  const topRails=['upperFront','upperBack'];
  let baseUnit, feet, anchors, caseUnit, screws, locks, run;

  step('Fit the four end-panel feet','Lay the two handed ends inside-face up. Match the edge details; seat their sockets and thread in the four feet.',()=>{
    sideData.forEach(([id,,s],i)=>{
      const target=pose([(i?1:-1)*1320,18,128],rz(s*half));
      place(id,target); sideUnits[i].push(id);
      const positions=[-231,254].map(z=>[0,-438,z]);
      const sock=fit('101449',positions.flatMap(p=>face(id,p,up)));
      const feetIds=fit('103095',positions.flatMap(([x,y,z],j)=>face(id,[x,y-9,z],up).map(s=>({...s,receivers:[id,sock[j]]}))));
      sideUnits[i].push(...sock,...feetIds);
    });
  });
  step('Set the end-panel cam studs','Drive four cam studs into the indicated inside bores on the two end panels.',()=>{
    sideData.forEach(([id,,s],i)=>sideUnits[i].push(...fit('118331',[-209,214].flatMap(z=>face(id,[s*11,105-endCenter,z],alongX(-s))))));
  });
  step('Mount the end wall brackets','Fit one wall attachment bracket to the inside of each rear upper corner. Use two 100344 screws on each; not 100365.',()=>{
    sideData.forEach(([id,,s],i)=>{
      anchorMount(id,[s*32,anchorY-endCenter,anchorZ],s);
      sideUnits[i].push(`115753-${i+1}`,`100344-${2*i+1}`,`100344-${2*i+2}`);
    });
  });
  step('Dowel the cabinet base','Use four large 101350 dowels, two in each end. Do not use the narrower drawer dowels.',()=>{
    place('base',pose([0,28,-350]));
    baseUnit=['base',...edgeDowels('base',[-1,1].flatMap(s=>[-181,188].map(z=>[[s*897,0,z],alongX(-s)])))];
  });
  step('Join the base to the first end','Keep the edges shown in the inset aligned; slot the prepared base into the first end.',()=>{
    move(sideUnits[1],[inCase([e,endCenter,0])],down,'Orient the first prepared end');
    move(baseUnit,[inCase(base)],caseAxis(alongX()),'Seat both base dowels',['endR']);
  });
  step('Lock the first base joint','Fit two 103430 cabinet cams (not 119030) and turn them to lock the joint.',()=>camLock('endR',[[869,113,-209],[869,113,214]]));
  step('Fit the front divider uprights','Use four large dowels on the divider uprights; keep the exposed edges oriented as drawn.',()=>{
    uprights.slice(0,2).forEach((id,i)=>{
      const x=i?div:-div;
      place(id,pose([x,22,1040],rz(half)));
      const ids=[id,...edgeDowels(id,[-1,1].map(s=>[[0,s*381,0],mul(up,-s)]))];
      move(ids,[inCase([x,495,250])],caseAxis(down),'Fit upright at the front of the base',['base']);
    });
  });
  step('Secure the front uprights','Use the supplied hex key to drive two 100214 screws through the base.',()=>fit('100214',caseSites([-div,div].map(x=>[x,116,250]),up,['base',...uprights.slice(0,2)])));
  step('Key the divider crosspieces','Match the exposed edges and the pictured large-dowel pairs at the crosspiece ends; seat each on its upright.',()=>{
    ['crossL','crossR'].forEach((id,i)=>{
      const x=i?div:-div;
      place(id,pose([x,22,1030],rz(half)));
      const ids=[id,...edgeDowels(id,[-1,1].flatMap(s=>[-23,23].map(y=>[[0,y,s*228],mul(front,-s)])))];
      crossUnits.push(ids);
      move(ids,[inCase([x,832,0])],caseAxis(front),'Seat the crosspiece on its front upright',[uprights[i]]);
    });
  });
  step('Mount the divider wall brackets','Fix one attachment bracket to each loose rear upright, using two 100344 screws per bracket.',()=>{
    for(const [i,id] of uprights.slice(2).entries()) {
      const s=i? -1:1;
      place(id,pose([(i?1:-1)*432,18,1040],rz(s*half)));
      anchorMount(id,[s*26,anchorY-495,-36],s);
      uprightUnits[i].push(id,`115753-${i+3}`,`100344-${2*i+5}`,`100344-${2*i+6}`);
    }
  });
  step('Dowel the rear uprights','Insert four large dowels into the ends of the two rear uprights.',()=>{
    uprights.slice(2).forEach((id,i)=>uprightUnits[i].push(...edgeDowels(id,[-1,1].map(s=>[[0,s*381,0],mul(up,-s)]))));
  });
  step('Seat the rear uprights','Turn the bracketed units as shown and seat them at the rear dowel joints.',()=>{
    uprightUnits.forEach((ids,i)=>move(ids,[inCase([i?div:-div,495,-250])],caseAxis(front),'Seat the rear upright with its bracket',['base',crossUnits[i][0]]));
  });
  step('Secure the rear uprights','Use the supplied hex key to add two 100214 screws through the base.',()=>fit('100214',caseSites([-div,div].map(x=>[x,116,-250]),up,['base',...uprights.slice(2)])));
  step('Dowel the upper rails','Fit one large dowel into either end of both long rails.',()=>{
    topRails.forEach((id,i)=>{
      place(id,pose([0,26,1145+i*135]));
      railUnits.push([id,...edgeDowels(id,[-1,1].map(s=>[[s*897,0,0],alongX(-s)]))]);
    });
  });
  step('Fit the upper rails','Use the finished-edge and exposed-core insets to orient the rails; seat one at the front and one at the back.',()=>{
    railUnits.forEach((ids,i)=>move(ids,[inCase([0,874,i?-254:254])],caseAxis(down),'Set upper rail onto divider ends',['endR',...uprights]));
  });
  step('Secure the upper frame','Drive six 100214 screws at the marked rail and end joints.',()=>{
    fit('100214',caseSites([-254,254].flatMap(z=>[-div,div].map(x=>[x,863,z])),down,topRails));
    fit('100214',caseSites([-254,254].map(z=>[e-8,874,z]),alongX(-1),['endR',...topRails]));
  });
  step('Fit the plinth foot','Tap in the fifth socket and thread in the fifth adjustable foot.',()=>{
    place('plinth',pose([0,22,1210],rx(half)));
    plinthUnit.push(...fit('101449',face('plinth',[0,-44,0],up)),...fit('103095',face('plinth',[0,-53,0],up)));
  });
  step('Fit the plinth angle','Attach the small center angle to the plinth with one 105344 screw.',()=>{
    place('103717-1',from(at.get('plinth'),[0,32,-17],rx(-half)),['plinth']);
    plinthUnit.push('103717-1',...fit('105344',face('plinth',[0,33,-8],front)));
  });
  step('Dowel the plinth ends','Use four large 101350 dowels at the two plinth ends.',()=>{
    plinthUnit.push(...edgeDowels('plinth',[-1,1].flatMap(s=>[-25,23].map(y=>[[s*897,y,0],alongX(-s)]))));
  });
  step('Turn the carcass and fit the plinth','With a helper, turn the case as pictured. Slide the prepared plinth into the first end, keeping the edge indicated in the inset aligned.',()=>{
    const staged=new Set([...plinthUnit,...sideUnits[0]]);
    turnCase(['base',...[...at.keys()].filter(id=>id!=='base'&&!staged.has(id))],reversed,rear,'Turn the entire partial carcass');
    move(plinthUnit,[inCase(plinth)],caseAxis(alongX()),'Seat the plinth into the first end',['endR','base']);
  },setupWarning);
  step('Tie the plinth to the base','Drive the second 105344 screw through the angle into the base.',()=>fit('105344',caseSites([[0,97,234]],up,['103717-1','base'])));
  step('Close the second end','Seat the remaining prepared end into the base, plinth and upper rails, then drive two 100214 screws.',()=>{
    move(sideUnits[0],[inCase([-e,endCenter,0])],caseAxis(alongX()),'Join the remaining prepared end',['base','plinth',...topRails]);
    fit('100214',caseSites([-254,254].map(z=>[-e+8,874,z]),alongX(),['endL',...topRails]));
  });
  step('Lock the second base joint','Fit two 103430 cabinet cams and turn them to lock the remaining joint.',()=>camLock('endL',[[-869,113,-209],[-869,113,214]]));
  step('Set out the partial back','Lay the back on the rear edges and pencil-mark the support locations shown. The top of the rear stays open.',()=>{
    place('back',inCase([0,381,-290]),['base','endL','endR','uprightLB','uprightRB'],caseAxis(front),95);
  });
  const nail=(points,receivers)=>fit('101221',caseSites(points.map(([x,y])=>[x,y,-287]),front,['back',...receivers]));
  step('Pin the first back corner','Square up the indicated edges and drive one nail at the first corner.',()=>nail([[892,638]],['endR']));
  step('Pin the opposite corner','Align the opposite edge as pictured and drive one nail.',()=>nail([[-892,119]],['endL']));
  step('Pin the third corner','Hold the indicated edge in alignment while driving the third nail.',()=>nail([[892,119]],['endR']));
  step('Nail the back to its supports','Follow the marked edges and supports and add the remaining twenty nails.',()=>{
    nail([-892,-div,div,892].flatMap(x=>[208,311,414,517,622].map(y=>[x,y])),['endL','endR','uprightLB','uprightRB']);
  });

  const [left,right]=bays[layout];
  const frontPosts=['uprightLF','uprightRF'];
  const runnerReceivers=layout===0 ? [['endL'],['uprightLF','crossL','uprightLB']] : layout===1 ?
    [['uprightLF','crossL','uprightLB'],['uprightRF','crossR','uprightRB']] : [['uprightRF','crossR','uprightRB'],['endR']];
  const runSites=(positions)=>run.flatMap(([id,x,s],i)=>positions.map(([y,z])=>({p:[x+s*1.5,yRail+y,zRail+z],
    axis:alongX(-s),receivers:[id,...runnerReceivers[i]]})));
  const divDoor=layout===0 ? {side:frontPosts[0],x:-291,inward:1} : {side:frontPosts[1],x:291,inward:-1};
  const hand=[{side:'endL',x:-896.5,inward:1},divDoor,{side:'endR',x:896.5,inward:-1}];
  const tall=['tall1','tall2'];
  const doorPlan=hand.map((h,i)=>({...h,i,id:i===layout?'shortDoor':tall.shift(),h:i===layout?shapes.shortDoor[1]:shapes.tallDoor[1],
    top:i===layout?shortTop:880,plates:[],unit:[]}));
  const hingeYs=d=>[d.top-55,d.top-d.h+55];
  function plates(plan) {
    for(const d of plan) {
      for(const y of hingeYs(d)) {
        const id=`118692-${used['118692']=(used['118692']??0)+1}`;
        place(id,pose([d.x+3*d.inward,y,hingeZ],d.inward===1?flat:rz(PI)),[d.side],alongX(-d.inward),42);
        d.plates.push(id);
      }
      adjust(d.plates,[d.side],alongX(-d.inward),'Tighten both captive plate screws',0);
    }
  }
  step('Fit the cabinet runners',`Stand the cabinet upright with a helper. Fit both cabinet runners in the ${drawerBay} bay with their rollers toward the opening. Use three 100365 screws per runner, not 100344.`,()=>{
    turnCase(['base',...[...at.keys()].filter(id=>id!=='base')],upright,up,'Stand the cabinet on its feet');
    run=[['runnerL',left[1]+1.3,1],['runnerR',right[1]-1.3,-1]];
    run.forEach(([id,x,s],i)=>place(id,pose([x,yRail,zRail]),runnerReceivers[i],alongX(-s)));
    fit('100365',runSites(frontStep.map(z=>[-1,z])));
  },setupWarning);
  step('Secure the front runner holes',`Start the remaining holes by the front rollers in the ${drawerBay} bay, then fit two 148510 screws. Do not use 105344.`,()=>fit('148510',runSites([[9,250]])));
  step('Fit the first mounting plates',layout===0?'Fit two hinge plates on the inside of the right end.':`Fit four hinge plates on the right end and the left face of the right front divider. ${layout===1?'Use the lower top row on the divider below the drawer.':'Use the lower top row on the right end below the drawer.'}`,()=>plates(layout===0?[doorPlan[2]]:[doorPlan[2],doorPlan[1]]));
  step('Fit the remaining mounting plates',layout===0?'Fit four plates on the left end and the right face of the left front divider. Use the lower top row at the left below the drawer. Continue on page 29.':'Fit two plates on the left end. Continue on page 29.',()=>plates(layout===0?[doorPlan[0],doorPlan[1]]:[doorPlan[0]]));
  step('Clamp and secure the worktop','Use the standalone 5 mm offset at both ends, or read the 10 mm outer-end inset for adjoining cabinets. Clamp the worktop as shown and screw up from both rails.',()=>{
    place('counter',pose([0,901,0]),topRails);
    fit('109029',[-254,254].flatMap(z=>[-736,-369,0,369,736].map(x=>({p:[x,881,z],axis:up,receivers:[z>0?'upperFront':'upperBack','counter']}))));
  });
  step('Level at all five feet','Use a level on the worktop and adjust the four end feet and the center plinth foot.',()=>{
    feet=row(5,i=>`103095-${i+1}`);
    adjust(feet,['endL','endR','plinth'],down,'Level using the five feet',half,2);
  });
  const anchorXs=[-e+32,e-32,-div+26,div-26];
  step('Mark four wall fixing positions','Place the leveled cabinet against the wall. Mark through all four provided brackets, then move the cabinet clear for wall work.',()=>{
    anchors=row(4,i=>`115753-${i+1}`);
    caseUnit=['base',...[...at.keys()].filter(id=>id!=='base')];
    turnCase(caseUnit,pose([0,0,147]),front,'Clear the cabinet after marking all brackets');
  },warning);
  step('Fit suitable wall fixings','Use fixings suitable for your wall at the four marks. The inset shows a projecting round head, not a countersunk head. The fixings shown here are schematic.',()=>{
    screws=fit('wall',sites(anchorXs.map(x=>[x,anchorY,wallZ]),rear,[]),'Four wall fixings, not supplied',false);
  },warning);
  step('Engage all four wall retainers','Return the level cabinet to the wall. Engage the four keyhole retainers as shown; adjust alignment before final tightening.',()=>{
    turnCase(caseUnit,upright,rear,'Return the cabinet to the marked wall positions');
    locks=anchorXs.map((x,i)=>{
      const id=`103693-${i+1}`;
      place(id,pose([x,anchorY-12,anchorZ+3]),[anchors[i],screws[i]],rear,46);
      return id;
    });
    adjust(locks,[...anchors,...screws],up,'Locate the keyhole slots on the screw heads',0,12);
  },warning);
  step('Tighten the wall attachments','Tighten all four wall fixings through the retainers. Do not proceed with a cabinet that is not secured.',()=>adjust(screws,locks,rear,'Tighten all four wall fixings',half,2),warning);
  step('Fit shelf pins and shelves','Install four pins per bay and lower each of the three shelves onto them.',()=>{
    const bounds=[-896.5,-309,-291,291,309,896.5];
    const faces=[['endL','endL'],['uprightLF','uprightLB'],['uprightLF','uprightLB'],['uprightRF','uprightRB'],['uprightRF','uprightRB'],['endR','endR']];
    bayX.forEach((x,i)=>{
      const y=i===layout?477:499;
      const pins=fit('101532',bounds.slice(i*2,i*2+2).flatMap((px,j)=>[246,-246].map((z,k)=>({p:[px+(j?-5:5),y,z],axis:alongX(j?1:-1),receivers:[faces[i*2+j][k]]}))));
      place(`shelf${i+1}`,pose([x,y+11,0]),pins,rear,625,[pose([x,y+55,625]),pose([x,y+55,0])]);
    });
  });
  step('Fit the cup hinges to the doors',`Use two hinges per door with 100344 screws, not 100365. The shorter door goes under the ${drawerBay} drawer.`,()=>{
    doorPlan.forEach(d=>{
      const benchDoor=pose([bayX[d.i],39,1160],rx(half));
      place(d.id,benchDoor);
      const cupX=d.inward===1?-276:276, faceRotation=d.inward===1?rz(PI):flat;
      if(d.inward===1) {
        move([d.id],[transform(benchDoor,pose([0,0,0],faceRotation))],down,'Orient the door for a left-side hinge');
      }
      d.unit.push(d.id);
      for(const y of [d.h/2-55,-d.h/2+55]) {
        const id=`117877-${used['117877']=(used['117877']??0)+1}`;
        const q=compose(quat(benchDoor),faceRotation);
        place(id,pose(xyz(from(benchDoor,[cupX,y,-13])),q),[d.id],down,55);
        d.unit.push(id,...fit('100344',sites([-22,22].map(dy=>xyz(from(benchDoor,[cupX,y+dy,-12]))),down,[id,d.id])));
      }
    });
  });
  step('Hang the three doors',`Engage the hinges on their matching plates, then tighten at each one. Hang the short door below the ${drawerBay} drawer bay.`,()=>{
    doorPlan.forEach(d=>{
      const x=bayX[d.i], y=d.top-d.h/2, cupX=-276*d.inward;
      const q=ry(-d.inward*half);
      const pivot=[x+cupX,y,doorZ-12];
      const opened=add(pivot,rotate([-cupX,0,12],q));
      const orient=d.inward===1?rz(PI):flat;
      const target=pose(opened,compose(q,orient));
      move(d.unit,[pose(add(opened,[0,0,145]),quat(target)),target],rear,'Mate both hinge arms with the mounted plates',d.plates);
      adjust(d.unit.filter(id=>id.startsWith('117877')),d.plates,rear,'Tighten the hinge-to-plate connections',0);
    });
  });

  const drawer=['drawerFront'];
  const drawAt=(p,q)=>from(bench,p,q);
  const drawFit=(key,points,axis,receivers)=>fit(key,sites(points.map(p=>xyz(drawAt(p))),rotate(axis,quat(bench)),receivers));
  const drawP=(id,p,receivers,axis)=>place(id,drawAt(p),receivers,rotate(axis,quat(bench)));
  const stow=(id,p,axis)=>drawer.push(...drawFit(id,p,axis,['drawerFront']));
  const sides=['drawerL','drawerR'];
  const prepared=[];
  let faceScrew, drawerCams;
  step('Set drawer-front cam studs','Place the drawer front face down and fit its two cam studs.',()=>{
    place('drawerFront',drawAt([0,0,0]));
    stow('118331',[[-264,-5,-12],[264,-5,-12]],front);
  });
  step('Leave the brace screw proud','Drive one 100344 into the middle of the drawer front but leave the head proud as pictured.',()=>{
    faceScrew=drawFit('100344',[[0,-25,-15]],front,['drawerFront']);
    drawer.push(...faceScrew);
  });
  step('Dowel the drawer sides','Fit one small 101345 dowel in the front end of each drawer side.',()=>{
    sides.forEach((id,i)=>{
      place(id,pose([i?698:-698,15,1080],rz(i?-half:half)));
      prepared.push([id,...fit('101345',face(id,[0,12,272],rear))]);
    });
  });
  step('Join drawer sides to the front','Seat each prepared side on the corresponding stud and dowel bores.',()=>{
    prepared.forEach((ids,i)=>{
      move(ids,[drawAt([i?271:-271,-4,-278])],down,'Seat the drawer side',['drawerFront']);
      drawer.push(...ids);
    });
  });
  step('Lock the drawer sides','Insert the two smaller 119030 cams and turn them to lock the sides.',()=>{
    drawerCams=[-1,1].flatMap((s,i)=>drawFit('119030',[[s*277,-5,-35]],alongX(-s),[sides[i],'drawerFront']));
    drawer.push(...drawerCams);
    drawerCams.forEach((id,i)=>adjust([id],[sides[i]],alongX(i?-1:1),'Lock the drawer cam'));
  });
  step('Hook the center brace','Hook the fork of the brace under the screw head left proud on the drawer front.',()=>{
    drawP('118301-1',[0,-37,-278],['drawerFront',...faceScrew],front);
    drawer.push('118301-1');
  });
  step('Slide in the drawer bottom','Slide the bottom down the two grooves, above the brace in the finished orientation.',()=>{
    drawP('drawerBottom',[0,-28,-278],[...sides,'118301-1'],front);
    drawer.push('drawerBottom');
  });
  step('Fit the drawer back','Seat the back over the bottom and drive one 110519 fastener from each side.',()=>{
    drawP('drawerBack',[0,-4,-542],[...sides,'drawerBottom'],front);
    drawer.push('drawerBack',...[-1,1].flatMap((s,i)=>drawFit('110519',[[s*273,-4,-542]],alongX(-s),['drawerBack',sides[i]])));
  });
  step('Secure the rear end of the brace','Fit one 105344 through the brace tab into the drawer back.',()=>{
    drawer.push(...drawFit('105344',[[0,-29,-543]],up,['118301-1','drawerBack']));
  });
  step('Fit the drawer runners','Turn the drawer to expose its underside. Attach the two remaining handed runners with three 100365 screws each; their rollers face the rear.',()=>{
    move(drawer,[drawerFlip],up,'Turn the drawer as one unit');
    ['drawerRunnerL','drawerRunnerR'].forEach((id,i)=>{
      const s=i?1:-1, x=s*280;
      const p=[x,-12,-279];
      place(id,from(drawerFlip,p),[sides[i]],alongX(-s));
      drawer.push(id,...fit('100365',sites([245,1,-244].map(z=>xyz(from(drawerFlip,[x+s*1.5,p[1]-1,p[2]+z]))),alongX(-s),[id,sides[i]])));
    });
  });
  step('Engage the complete drawer',`Raise the front, engage both runners in the ${drawerBay} bay, then settle the drawer onto the runners.`,()=>{
    const x=bayX[layout];
    move(drawer,[pose([x,899,845],rx(-0.17)),pose([x,850,545],rx(-0.12)),pose([x,819,389])],rear,
      'Tilt and seat the same drawer on both cabinet runners',['runnerL','runnerR']);
  });
  step('Fit the two bumper dots',`Working at the ${drawerBay} drawer opening, peel and apply the two bumper dots as pictured.`,()=>{
    fit('107091',sites([[left[1]+1,821,287],[right[1]-1,821,287]],rear,[left[0],right[0],'drawerFront']),'Fit the two peel-off bumper dots',false);
  });
  return all;
}

export const steps=build('left');
