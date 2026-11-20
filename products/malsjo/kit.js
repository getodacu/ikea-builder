import authorDoors from './doors.js';
import authorDrawers from './drawers.js';
import { pages } from './manual.js';
export const wallWarning = 'The sideboard can tip and cause serious or fatal injury. Attach it to the wall using both supplied brackets before use. Wall screws and plugs are not supplied; choose fixings suitable for your wall. If unsure, seek professional advice.';
export const setupWarning = 'Build with two people on a protected surface. Bring a slotted screwdriver, a cross-head screwdriver and a hammer.';

const X = [1,0,0], Y = [0,1,0], Z = [0,0,1], left = [-1,0,0], down = [0,-1,0], rear = [0,0,-1];
const { PI } = Math;
export function pose(x,y,z,axis = Y, angle = 0) {
  const s = Math.sin(angle / 2) / Math.hypot(...axis);
  return [x,y,z,axis[0]*s,axis[1]*s,axis[2]*s,Math.cos(angle / 2)];
}
function rotate([x,y,z], [, , , a,b,c,d]) {
  const u = 2*(b*z-c*y), v = 2*(c*x-a*z), w = 2*(a*y-b*x);
  return [x+d*u+b*w-c*v, y+d*v+c*u-a*w, z+d*w+a*v-b*u];
}
function compose(p, q) {
  const [x,y,z] = rotate(q,p);
  const [, , , a,b,c,d] = p, [, , , e,f,g,h] = q;
  return [x+p[0],y+p[1],z+p[2], d*e+a*h+b*g-c*f,d*f-a*g+b*h+c*e,d*g+a*f-b*e+c*h,d*h-a*e-b*f-c*g];
}
function inverse(p) {
  const q = [0,0,0,-p[3],-p[4],-p[5],p[6]];
  q.splice(0,3,...rotate([-p[0],-p[1],-p[2]],q));
  return q;
}
function axisPose([x,y,z], [u,v,w]) {
  const n = Math.hypot(u,v,w), angle = Math.acos(-v/n);
  return pose(x,y,z,u || w ? [-w,0,u] : X, angle);
}

// [width, height, depth] in each part's own right-handed datum, in millimeters.
export const shapes = {
  plinthLong: [1402,43,25], plinthSide: [25,43,405], base: [1400,26,445], side: [26,820,434],
  rail: [1354,56,27], doorRail: [1354,56,86], lowerDivider: [22,606,410], upperDivider: [22,190,417],
  back: [1368,812,6], top: [1450,34,480], shelf: [650,21,367], door: [686,580,22],
  drawerFront: [650,166,24], drawerSide: [16,115,370], drawerBack: [615,115,16],
  drawerBottom: [609,8,370], drawerPartition: [15,105,340], drawerTray: [352,42,238],
  bolt: [12,33,12], elbow: [16,41,25], crossCam: [18,13,18], cam: [16,13,16], dowel: [8,30,8],
  skinnyDowel: [6,24,6], hexScrew: [9,37,9], screw: [7,16,7], shortScrew: [8,11,8],
  longScrew: [7,27,7], flatScrew: [8,14,8], machineScrew: [9,17,9], angle: [15,16,15],
  backSocket: [13,10,13], backPin: [12,12,12], key: [40,7,32], foot: [34,9,17],
  pin: [8,12,8], sleeve: [11,9,11], bumper: [17,14,17], cover: [26,10,26], washer: [28,4,28],
  pull: [15,69,11], anchor: [32,23,16], spacer: [29,23,29], strike: [33,7,22],
  nail: [9,27,9], knob: [27,20,27], trayFoot: [18,8,18], cap: [9,5,9],
  drawerCatchL: [51,27,39], drawerCatchR: [51,27,39], roller: [36,29,14], lock: [32,39,13],
  damper: [189,11,15], runnerL: [23,43,372], runnerR: [23,43,372], cable: [15,10,370]
};
export const families = {};
export const parts = new Map();
function family(key, name, number, group, page, role = 'kit') {
  families[key] = Object.freeze({ name, number, group, page, role });
}
function instance(id, key, shape, unpacked, packet = families[key].group) {
  if (parts.has(id)) throw new Error(`Duplicate physical instance ${id}`);
  parts.set(id, Object.freeze({ id, family: key, shape, unpacked: Object.freeze(unpacked), packet }));
}
function hardware(key, name, shape, quantity, packet, page, layout, role) {
  if (!families[key]) family(key,name,key === '118331' ? '118331 / 112956' : key,packet,page,role);
  const start = [...parts.values()].filter(p => p.family === key).length;
  for (let i=0; i<quantity; i++) instance(`${key}-${start+i+1}`,key,shape,layout(i,shape),packet);
}
const packet1 = [
  ['118331','Cam bolt','bolt',18], ['123026','Angled connector','elbow',4], ['113434','Cross cam','crossCam',10],
  ['118137','Slotted cam','cam',16], ['101350','Case dowel','dowel',22], ['100214','Hex-drive screw','hexScrew',4],
  ['109562','Back screw','longScrew',2], ['100362','Pan-head screw','shortScrew',20], ['102553','Angle bracket','angle',10],
  ['130616','Back socket','backSocket',12], ['130617','Back locking pin','backPin',12], ['100001','Assembly key','key',1,'tool'], ['107971','Glide foot','foot',6]
];
const packet2 = [
  ['120639','Outer runner screw','longScrew',4], ['109560','Bumper / catch screw','screw',1], ['100365','Countersunk runner screw','flatScrew',4],
  ['100404','Handle / knob screw','machineScrew',2], ['100362','Pan-head screw','shortScrew',24], ['139343','Support pin','pin',8],
  ['145571','Support sleeve','sleeve',8], ['123805','Door stop','bumper',1], ['133304','Wall fastener cover','cover',2], ['126916','Wall washer','washer',2],
  ['146190','Recessed door pull','pull',2], ['141413','Wall attachment bracket','anchor',2], ['141414','Skirting spacer','spacer',2], ['144641','Damper striker plate','strike',4]
];
const packet3 = [
  ['118331','Cam bolt','bolt',8], ['131361','Drawer cam','cam',8], ['109504','Partition screw','longScrew',4], ['109560','Bumper / catch screw','screw',8],
  ['101345','Drawer dowel','skinnyDowel',10], ['110519','Drive fastener','nail',10], ['141144','Drawer knob','knob',4], ['122353','Tray foot','trayFoot',4],
  ['100404','Handle / knob screw','machineScrew',4], ['150980','Hole cap','cap',2], ['139343','Support pin','pin',2], ['145571','Support sleeve','sleeve',2]
];
for (const [j, list] of [packet1,packet2,packet3].entries()) {
  let slot = 0;
  for (const [key,name,shape,n,role] of list) hardware(key,name,shape,n,`Packet ${j+1}`,j+7,(i,k) => {
    const cell = slot++;
    const x=-1345+j*535;
    const q = k === 'pull' ? pose(x+i*53,6,1120,X,PI/2) : null;
    return q ?? pose(x+(cell%12)*40,shapes[k][1]/2,812+Math.floor(cell/12)*42);
  },role);
}
const loose = [
  ['144290','Drawer catch 144290','drawerCatchR',2,9,-2080,820,75,0], ['144291','Drawer catch 144291','drawerCatchL',2,9,-2080,880,75,0],
  ['144637','Lower door roller','roller',4,10,-1910,820,58,0], ['144638','Upper door lock','lock',4,10,-1910,880,54,0],
  ['128258','Door damper','damper',2,10,-1988,939,0,52], ['151128','Handed runner 151128','runnerL',2,10,-1770,1098,45,0],
  ['151127','Handed runner 151127','runnerR',2,10,-1665,1098,45,0], ['147901','Cable cover','cable',1,10,-1578,1098,0,0,'optional']
];
for (const [key,name,k,n,p,x,z,dx,dz,role] of loose) hardware(key,name,k,n,'Loose fittings',p,i => pose(x+i*dx,shapes[k][1]/2,z+i*dz),role);

function panel(key,name,k,group,page,items) {
  family(key,name,null,group,page);
  for (const [id,x,z,flat=false] of items) {
    const [w,h,d] = shapes[k];
    const p = flat === 'edge' ? pose(x,w/2,z,Z,PI/2)
      : flat === 'turn' ? compose(pose(x,w/2,z,Y,PI/2),pose(0,0,0,Z,PI/2))
      : pose(x,flat ? d/2 : h/2,z,X,flat ? PI/2 : 0);
    instance(id,key,k,p);
  }
}
panel('plinthFront','Front plinth trim','plinthLong','Case panels',11,[['pf',-1500,80]]);
panel('plinthRear','Rear plinth rail','plinthLong','Case panels',11,[['pb',-1500,131]]);
panel('plinthSide','Plinth end rail','plinthSide','Case panels',11,[['pl',-13,63],['pr',71,63]]);
panel('base','Base panel','base','Case panels',16,[['base',-1500,-175]]);
panel('side','Framed case side','side','Case panels',17,[['sideL',-512,-905,'turn'],['sideR',-46,-905,'turn']]);
panel('upperBack','Rear cross rail','rail','Case panels',17,[['upperBack',-1500,182]]);
panel('upperFront','Upper door-track rail','doorRail','Case panels',17,[['upperFront',-1500,255]]);
panel('dividerLow','Lower divider','lowerDivider','Case panels',20,[['dividerLow',-465,-153,'turn']]);
panel('dividerTop','Upper divider','upperDivider','Case panels',21,[['dividerTop',-21,-376,'turn']]);
panel('back','Folding back panel','back','Case panels',25,[['back',-1500,-421,true]]);
panel('top','Top panel','top','Case panels',26,[['top',-1500,-1130]]);
panel('shelf','Shelf','shelf','Case panels',35,[['shelfL',-1861,512],['shelfR',-1166,512]]);
panel('door','Framed glass door','door','Glass doors',36,[['doorL',689,-925,true],['doorR',1434,-925,true]]);
panel('dFront','Drawer front','drawerFront','Drawer pieces',43,[['dLFront',689,-468,true],['dRFront',1434,-468,true]]);
panel('dSide','Drawer side','drawerSide','Drawer pieces',42,[['dLSideL',524,-172,'edge'],['dLSideR',664,-172,'edge'],['dRSideL',1262,-172,'edge'],['dRSideR',1402,-172,'edge']]);
panel('dBack','Drawer back','drawerBack','Drawer pieces',44,[['dLBack',689,134,true],['dRBack',1434,134,true]]);
panel('dBottom','Drawer bottom','drawerBottom','Drawer pieces',44,[['dLBottom',689,405],['dRBottom',1434,405]]);
panel('dDivider','Drawer partition','drawerPartition','Drawer pieces',44,[['dRDivider',1544,-172,'edge'],['dRDividerA',1684,-172,'edge'],['dRDividerB',1824,-172,'edge']]);
panel('dTray','Removable organizer tray','drawerTray','Drawer pieces',47,[['dRTray',1937,405]]);

function author(doorStop, skirting = true) {
  const records = [], locations = new Map(), allocated = new Map();
  let operations;
  const ids = key => allocated.get(key) ?? [];
  const unit = v => { const n = Math.hypot(...v); return v.map(x => x/n); };
  function step(title, action, run, warning = null) {
    const number = records.length+1, page = pages[number-1];
    operations = []; run();
    records.push({ number,page,title,action,warning:number === 73 ? {text:wallWarning,page:2} : warning,operations });
  }
  function add(kind, members, receivers, frames, axis, target, label, captive = null) {
    if (!members.length || new Set(members).size !== members.length) throw new Error(`Invalid operation in step ${records.length+1}: ${members}`);
    const primary = parts.get(members[0]);
    const first = frames[0].at(-1);
    const caption = label ?? families[primary.family].name;
    const axes = (Array.isArray(axis[0]) ? axis : members.map(() => axis)).map(unit);
    const outward = kind === 'adjust' && ['cam','crossCam','spacer'].includes(primary.shape) ? rotate(Y, first) : axes[0].map(v => -v);
    const previewBores = kind==='place' && /bolt|screw/i.test(primary.shape);
    const staged = (primary.shape==='back' && kind!=='move') || (primary.shape==='shelf' && kind==='place');
    const view = staged ? {direction:[-.45,.31,.88],span:Math.max(360,Math.max(...shapes[primary.shape])*.66)} : undefined;
    operations.push({ kind, ids: members.slice(), prerequisites: [...new Set(receivers)], poses: frames, axes, previewBores,
      joint: { target: target ?? first.slice(0,3), axis:axes[0], outward, receivers: [...new Set(receivers)], caption, view }, captive });
    for (let i=0; i<members.length; i++) locations.set(members[i],frames[i].at(-1));
  }
  function place(members, receivers, ends, axis, clearance=60, target=null, label=null) {
    const byPart = Array.isArray(axis[0]);
    const frames = ends.map((end,i) => {
      const d = unit(byPart ? axis[i] : axis);
      return [end.map((v,j) => j<3 ? v-clearance*d[j] : v),end];
    });
    add('place',members,receivers,frames,axis,target,label);
  }
  function placeAlong(id, receivers, path, axis, target, label) {
    add('place',[id],receivers,[path],axis,target,label);
  }
  function fast(key,receivers,points,axis,clearance=45,target=null) {
    const prior = ids(key), next = points.map((_,i) => `${key}-${prior.length+i+1}`);
    allocated.set(key,[...prior,...next]);
    place(next,receivers,points.map((p,i) => p.length===7 ? p : axisPose(p,Array.isArray(axis[0]) ? axis[i] : axis)),axis,clearance,target);
    return next;
  }
  function move(members, anchor, waypoints, receivers, axis, target=null, label=null) {
    const start = locations.get(anchor), origin = inverse(start);
    const initial = members.map(id => locations.get(id));
    const deltas = waypoints.map(p => compose(p,origin));
    add('move',members,receivers,initial.map(p => [p,...deltas.map(d => compose(d,p))]),axis,target,label);
    operations.at(-1).rigid = { anchor, frames:[start,...waypoints], offsets:initial.map(p => compose(origin,p)) };
  }
  function adjust(members, receivers, ends, axis, target=null, captive=null) {
    add('adjust',members,receivers,members.map((id,i) => [locations.get(id),ends?.[i] ?? locations.get(id)]),axis,target,null,captive);
  }
  function shot(target, direction, span) {
    const { joint } = operations.at(-1);
    if (target !== null) joint.target = target;
    joint.view = { direction, span };
  }
  const ctx = {step,place,placeAlong,fast,move,adjust,shot,pose,compose,ids,shapes};
  authorCase(ctx,locations,skirting);
  authorDoors(ctx,doorStop);
  authorDrawers(ctx);
  if (records.length !== pages.length) throw new Error('Incomplete numbered figure sequence');
  for (const p of parts.values()) {
    if (families[p.family].role !== 'kit') continue;
    if (!locations.has(p.id)) throw new Error(`No authored placement: ${p.id}`);
  }
  return records;
}

function authorCase({step,place,fast,move,adjust,shot,ids}, at, skirting) {
  const plinth = ['pf','pb','pl','pr'];
  const side = ['sideL','sideR'];
  const rails = ['upperBack','upperFront'];
  const trim = [pose(0,25,216),pose(0,25,-216),pose(-688,25,0),pose(688,25,0)];
  const looseTrim = [pose(0,22,-340,X,PI/2),pose(0,22,340,X,-PI/2),pose(-810,22,0,Z,PI/2),pose(810,22,0,Z,-PI/2)];
  const members = [];
  const add = list => { members.push(...list); return list; };
  const benchZ = 1160, basePrepZ = 970;
  const onBench = p => p.map((v,i)=>i===2?v+benchZ:v);
  const benchFast = (key,receivers,points,axis,clearance) => fast(key,receivers,points.map(onBench),axis,clearance);
  const pflip = pose(0,101,benchZ,X,PI);
  const under = p => compose(pflip,p);
  const plinthMembers = [], groups = Object.fromEntries(plinth.map(id => [id,[id]]));
  const brackets = [[-530,-196],[-177,-196],[177,-196],[530,-196],[-345,196],[345,196],[-668,139],[-668,-132],[668,139],[668,-132]];
  const bracketOwners = [0,0,0,0,1,1,2,2,3,3];
  const pair = (x,z,y) => z.map(v => [x,y,v]);
  const frame = angle => pose(0,angle ? 257 : 0,angle===0 ? 0 : angle<0 ? 465 : -465,X,angle);
  let carcass = frame(-PI/2);
  const inCase = p => compose(carcass,p);
  const fixed = (pts,axis) => Array.isArray(axis[0])
    ? [pts.map((p,i)=>inCase(axisPose(p,axis[i]))),axis.map(v=>rotate(v,carcass))]
    : [pts.map(p=>inCase(axisPose(p,axis))),rotate(axis,carcass)];
  const caseFast = (key,receivers,pts,axis,clearance=45) => add(fast(key,receivers,...fixed(pts,axis),clearance));
  const bodies = [pose(-690,474,0),pose(690,474,0),pose(0,676,-186),pose(0,676,180)];
  const stageSides = [pose(-1190,14,130,Z,PI/2),pose(1190,14,130,Z,-PI/2)];
  const stageRails = [pose(0,15,-352,X,PI/2),pose(0,44,-602,X,PI/2)];
  const boltStations = [-179,209], jointY = 676;
  const sideModule = i => [side[i],...bolts.slice(i*2,i*2+2)];
  let bolts, dowels, cams, endBolts, topBolts, baseModule, trimsFasteners;

  step('Fit the plinth brackets','Fit four 102553 brackets to the beveled front rail, two to the straight rear rail and two to each end rail. Secure each with one 100362 screw.',() => {
    place(plinth,[],looseTrim.map(onBench),down,42); plinthMembers.push(...plinth);
    const yaw = [0,PI,PI/2,-PI/2];
    const bracketPoses = brackets.map(([x,z],i) => {
      const owner = bracketOwners[i];
      const toBench = compose(onBench(looseTrim[owner]),inverse(under(trim[owner])));
      return compose(toBench,compose(onBench(pose(x,56,z,Y,yaw[owner])),pose(0,0,0,X,PI/2)));
    });
    const earlier = fast('102553',plinth,bracketPoses,down,42);
    const screws = fast('100362',earlier,bracketPoses.map(p => compose(p,pose(0,-8,0))),down,28);
    earlier.forEach((id,i) => groups[plinth[bracketOwners[i]]].push(id,screws[i]));
    plinthMembers.push(...earlier,...screws);
  });
  step('Add two end-rail bolts','Drive one cam bolt into each plinth end rail at the indicated outer hole.',() => {
    endBolts = benchFast('118331',['pl','pr'],[[-794,36,-155],[794,36,-155]],down);
    endBolts.forEach((id,i)=>groups[plinth[i+2]].push(id)); plinthMembers.push(...endBolts);
  });
  step('Add the plinth dowels','Press a case dowel into each end of the straight long plinth rail.',() => {
    const fitted = benchFast('101350',['pb'],[[-698,22,340],[698,22,340]],[X,left]);
    groups.pb.push(...fitted); plinthMembers.push(...fitted);
  });
  step('Join three plinth rails','Turn up the straight rail and two ends into a U, then seat and turn the two cross cams; do not use slotted cams.',() => {
    for (const i of [1,2,3]) move(groups[plinth[i]],plinth[i],[pose(trim[i][0],108,under(trim[i])[2]),under(trim[i])],[],down);
    const fitted = benchFast('113434',['pb','pl','pr'],[[-677,75,203],[677,75,203]],down,28);
    adjust(fitted,['pb'],null,Y,null,{from:0,to:1}); plinthMembers.push(...fitted);
  });
  step('Load the shaped rail cams','Place two cross cams at each end of the shaped long rail, keeping their openings toward the end bores.',() => {
    const fitted = benchFast('113434',['pf'],[-681,-653,653,681].map(x=>[x,28,-340]),down,28);
    groups.pf.push(...fitted); plinthMembers.push(...fitted);
  });
  step('Set the angled connectors','Insert the four angled connectors into the ends of the shaped rail and turn their cams only to the illustrated stop mark.',() => {
    const fitted = benchFast('123026',['pf'],[-712,-712,712,712].map((x,i)=>[x,19+i%2*14,-340]),[X,X,left,left]);
    groups.pf.push(...fitted); plinthMembers.push(...fitted);
    adjust(ids('113434').slice(2),fitted,null,Y,null,{from:0,to:0.5});
  });
  step('Close the plinth frame','Rotate the shaped rail into line and slide its four angled connectors into the two end rails.',() => {
    move(groups.pf,'pf',[onBench(pose(0,76,-315,X,PI)),under(trim[0])],['pl','pr'],Z);
    shot(onBench([-688,76,-205]),[.38,.84,-.42],220);
  });
  step('Fit four corner cams','Press each corner flush, fit the four 113434 cross cams (not slotted cams) and turn them as shown. Tighten all eight in step 9.',() => {
    const fitted = benchFast('113434',['pf','pl','pr'],[-682,-682,682,682].map((x,i)=>[x,69+i%2*12,-192]),[X,X,left,left],22);
    adjust(fitted,['pf'],null,X,null,{from:0,to:0.25}); plinthMembers.push(...fitted);
  });
  step('Lock the plinth corners','Turn the eight cross cams at the shaped-rail joints in the directions shown while holding the corners together.',() => {
    adjust(ids('113434').slice(2),plinth,null,X,onBench([-680,76,-205]),{from:0.25,to:1});
  });
  step('Screw the base to the frame','Align the base panel to the plinth profile and drive ten pan-head screws through the existing brackets into the panel.',() => {
    place(['base'],plinth,[under(pose(0,53,0))],Y,30,onBench([0,60,-180]));
    shot([-530,59,954],[-.43,.50,-.75],280);
    plinthMembers.push('base');
    const baseBrackets = ids('102553');
    trimsFasteners = fast('100362',[...baseBrackets,'base'],baseBrackets.map(id => { const [x,,z] = at.get(id); return [x,60,z]; }),down,40);
    plinthMembers.push(...trimsFasteners);
  });
  step('Press in the glide feet','Fit all six glide feet into the paired underside holes around the plinth.',() => {
    const feet = [[-688,-144],[-688,144],[0,-216],[0,216],[688,-144],[688,144]];
    plinthMembers.push(...benchFast('107971',plinth,feet.map(([x,z])=>pose(x,97.5,z,Y,x ? PI/2 : 0)),down));
  });
  step('Prepare the framed sides','Lay out the framed sides and the two cross rails, then drive four cam bolts into the designated inside holes of the side frames.',() => {
    add(side); place(side,[],stageSides,down,45);
    bolts = [];
    for (const [i,id] of side.entries()) {
      const stations = boltStations.map(z=>compose(stageSides[i],pose(i ? -15 : 15,jointY-bodies[i][1],z)).slice(0,3));
      bolts.push(...add(fast('118331',[id],stations,down)));
    }
  });
  step('Dowel both cross rails','Press two dowels into each end of the plain rear rail and the grooved front rail.',() => {
    place(rails,[],stageRails,down,45); add(rails);
    dowels = add(fast('101350',rails,stageRails.flatMap(([,y,z])=>[-684,684].flatMap(x=>[[x,y,z-12],[x,y,z+12]])),[X,X,left,left,X,X,left,left]));
  });
  step('Join the side frames','Stand the side frames with the stepped corners as shown. Place the plain and grooved rails between them, tracks toward the front, then bring the sides onto the rail ends.',() => {
    for (const [i,id] of side.entries()) {
      const open = inCase(bodies[i].map((v,j)=>j===0 ? v+(i ? 40 : -40) : v));
      move(sideModule(i),id,[pose(stageSides[i][0],275,stageSides[i][2]),open],[],i ? left : X);
    }
    for (let i=0;i<2;i++) {
      const p = inCase(bodies[i+2]);
      move([rails[i],...dowels.slice(i*4,i*4+4)],rails[i],[p.map((v,j)=>j===1?v+145:v),p],[],down);
      shot([-677,p[1],p[2]+12],[.86,.45,.28],240);
    }
    for (const [i,id] of side.entries()) {
      const endX = i ? 677 : -677;
      move(sideModule(i),id,[inCase(bodies[i])],rails,i ? left : X);
      shot(inCase(pose(endX,jointY,216)).slice(0,3),[i ? -.86 : .86,.45,.28],240);
    }
  });
  step('Lock the cross rails','Fit and tighten four slotted cams at the ends of the two cross rails.',() => {
    cams = caseFast('118137',rails,[-657,657].flatMap(x=>[[x,jointY,boltStations[0]],[x,jointY,216]]),rear);
    shot(null,[.55,.80,.22],160);
    adjust(cams,side,null,Z,null,{from:0,to:1});
    shot(null,[.55,.80,.22],160);
  });
  step('Fit the lower divider','With two people, orient the lower divider as shown and secure it through the two cross rails with the supplied key and two hex-drive screws.',() => {
    const target = inCase(pose(0,365,-1));
    place(add(['dividerLow']),rails,[target],rotate(rear,carcass),140);
    shot(inCase(pose(0,677,-193)).slice(0,3),[.58,.54,.60],260);
    caseFast('100214',['dividerLow',...rails],[[0,690,-193],[0,690,212]],down);
  },{text:'Handle and position the case with two people.',page:20});
  step('Add upper-divider bolts','Drive one cam bolt into the center of each cross rail at the two marked holes for the upper divider.',() => {
    caseFast('118331',rails,[[0,700,-182],[0,700,176]],down);
  });
  step('Slide in the upper divider','Seat the short divider on both center bolts, with the small hole oriented as shown.',() => {
    place(add(['dividerTop']),rails,[inCase(pose(0,789,0))],rotate(down,carcass),140);
    shot(inCase(pose(0,704,176)).slice(0,3),[.90,.22,-.45],240);
  });
  step('Lock the upper divider','Insert the two slotted cams in the upper divider and tighten them onto the cross-rail bolts.',() => {
    const fitted = caseFast('118137',['dividerTop'],[[10,708,-179],[10,708,173]],left);
    adjust(fitted,['dividerTop'],null,X,null,{from:0,to:1});
  });
  step('Turn the case and fit base dowels','Turn the case over and insert six case dowels into the exposed bottom edges of the two side frames and lower divider.',() => {
    carcass = frame(PI/2);
    move(members,'sideL',[compose(pose(0,545,0),bodies[0]),inCase(bodies[0])],[],X,[0,250,0],'Case frame');
    shot(null,[-.45,.31,.88],1200);
    caseFast('101350',[...side,'dividerLow'],[-690,0,690].flatMap(x=>pair(x,[-166,171],62)),Y);
  });
  step('Prepare the plinth base','Turn the assembled base over and drive four cam bolts into the two end pairs of holes.',() => {
    move(plinthMembers,'base',[pose(0,280,basePrepZ,X,PI/2),pose(0,53,basePrepZ)],[],X);
    baseModule = plinthMembers.slice();
    baseModule.push(...fast('118331',['base'],[-690,690].flatMap(x=>pair(x,[basePrepZ-174,basePrepZ+174],67)),down));
  });
  step('Join the base to the case','Lift the plinth base onto the exposed case edges, with its tracks aligned to the front, and fasten the divider with two hex-drive screws.',() => {
    const p = inCase(pose(0,53,0));
    // Carry the plinth over the sideways case before approaching its exposed bottom edge.
    move(baseModule,'base',[pose(0,780,basePrepZ),pose(0,780,-670,X,PI/2),pose(0,p[1],-670,X,PI/2),p],[...side,'dividerLow'],Z);
    shot(inCase(pose(-690,64,171)).slice(0,3),[-.47,.84,-.25],440);
    add(baseModule);
    caseFast('100214',['base','dividerLow'],[[0,47,-145],[0,47,150]],Y);
  });
  step('Lock the base and stand the case','Insert and tighten all four slotted cams, then turn the case upright onto its feet.',() => {
    const fitted = caseFast('118137',['base',...side],[-676,676].flatMap(x=>pair(x,[-168,174],81)),[left,left,X,X]);
    adjust(fitted,['base'],null,X,null,{from:0,to:1});
    carcass = frame(0);
    move(members,'sideL',[compose(pose(0,205,-170,X,PI/4),bodies[0]),bodies[0]],[],X,[0,66,0],'Case and plinth');
    shot(null,[-.45,.31,.88],1200);
  });
  step('Unfold and slide in the back','Open the hinged back panel as one piece, align its face with the inset, and slide it down into both rear channels.',() => {
    place(add(['back']),side,[pose(0,1400,-213)],Z,140);
    adjust(['back'],side,null,X,[0,1400,-213],{from:0,to:1});
    move(['back'],'back',[pose(0,1040,-213),pose(0,474,-213)],side,down,[0,832,-213]);
    shot([-684,832,-213],[.58,.44,-.78],300);
  });
  step('Load the top panel bolts','With the top panel underside up, drive six cam bolts into the three pairs of marked holes.',() => {
    place(['top'],[],[pose(0,27,690,X,PI)],down,55);
    topBolts = fast('118331',['top'],[-690,0,690].flatMap(x=>pair(x,[558,837],48)),down);
    add(['top',...topBolts]);
  });
  step('Lower the top onto six dowels','Insert six case dowels into the exposed upper edges, then turn the prepared top over and lower it onto the three opposing pairs of holes.',() => {
    const dowelIds = caseFast('101350',[...side,'dividerTop'],[-690,0,690].flatMap(x=>pair(x,[-169,154],887)),down,62);
    shot([-690,884,-169],[.62,.78,.16],150);
    move(['top',...topBolts],'top',[pose(0,1150,540,X,PI),pose(0,1214,313,X,PI/2),pose(0,1050,0),pose(0,903,0)],[...dowelIds,...side,'dividerTop'],down,[0,892,154]);
    shot(null,[.90,-.15,.58],240);
  });
  step('Lock the top and turn the case','Fit and tighten the six slotted cams under the top, then turn the cabinet to expose the back.',() => {
    const fitted = caseFast('118137',['top',...side,'dividerTop'],[-677,11,677].flatMap(x=>pair(x,[-147,132],868)),[left,left,left,left,X,X]);
    adjust(fitted,['top'],null,X,null,{from:0,to:1});
    move(members,'sideL',[compose(pose(0,0,0,Y,PI/2),bodies[0]),compose(pose(0,0,0,Y,PI),bodies[0])],[],Y,[0,465,0],'Turn the cabinet');
    shot(null,[-.45,.31,.88],1200);
  });
  const backFacing = pose(0,0,0,Y,PI);
  const onBack = p => compose(backFacing,p);
  const backPoints = (pts,axis) => pts.map(p => onBack(axisPose(p,axis)));
  const rearLocks = [[-686,180,-216],[-686,765,-216],[686,180,-216],[686,765,-216],...[-475,-160,160,475].flatMap(x=>[[x,73,-216],[x,881,-216]])];
  step('Click in the back panel locks','Fit twelve back sockets around the rear perimeter, then press in the matching locking pins until they click.',() => {
    const sockets = add(fast('130616',['back'],backPoints(rearLocks,Z),rear,38));
    add(fast('130617',sockets,backPoints(rearLocks.map(([x,y,z])=>[x,y,z-5]),Z),rear,26));
  });
  step('Secure the center of the back','Drive two back screws through the marked holes in the back panel.',() => {
    add(fast('109562',['back'],backPoints([[-332,679,-220],[332,679,-220]],Z),rear));
  });
  const wall = {text:wallWarning,page:2};
  const anchor = [[-663,674,-227],[663,674,-227]];
  const faceWall = spacers => {
    move([...members,...spacers],'sideL',[compose(pose(0,0,0,Y,PI/2),bodies[0]),bodies[0]],[],Y,[0,465,0],'Turn to the front of the cabinet');
    shot(null,[-.46,.31,.83],1500);
  };
  step('Fit the wall attachment brackets','Seat one supplied wall attachment bracket sideways into each rear side-frame stile at the marked holes.',() => {
    const fittings = backPoints(anchor,Z);
    fittings[0] = compose(fittings[0],pose(0,0,0,Y,PI));
    for (const [i,p] of fittings.entries()) {
      add(fast('141413',[side[i]],[p],i ? left : X,50));
      shot(p.slice(0,3),[i ? .62 : -.62,.32,.71],180);
    }
  },wall);
  step('Fit the skirting spacers','Thread one spacer into each attachment bracket, keeping the spacer engaged as shown.',() => {
    fast('141414',ids('141413'),backPoints(anchor.map(([x,y,z])=>[x,y,z-10]),Z),rear,60);
  },wall);
  step('Adjust both spacers to the wall','With the plinth against the skirting, turn both spacers until they reach the wall.',() => {
    const spacers = ids('141414');
    const points = anchor.map(([x,y,z])=>[x,y,z-25]);
    if (skirting) {
      faceWall(spacers);
      adjust(spacers,ids('141413'),points.map(p=>axisPose(p,Z)),rear,[663,674,-252],{from:0,to:0.75});
      shot(null,[.94,.15,-.30],270);
    } else {
      adjust(spacers,ids('141413'),backPoints(points,Z),Z,[663,674,252],{from:0,to:0.75});
    }
  },wall);
  step('Anchor the cabinet','From inside the cabinet, pass a suitable wall screw through each supplied 126916 washer as shown on PDF page 32. Fasten both sides to the wall, then click on both 133304 covers.',() => {
    if (!skirting) faceWall([]);
    const washers = fast('126916',ids('141413'),anchor.map(([x,y])=>[x,y,-204]),rear,52);
    fast('133304',washers,anchor.map(([x,y])=>[x,y,-199]),rear,40);
  },wall);
}

export const steps = author('right');
const variants = { right: [author('right',false),steps], left: [author('left',false),author('left')] };
export function stepsForRoute({doorStop,skirting}) { return variants[doorStop][Number(skirting)]; }
