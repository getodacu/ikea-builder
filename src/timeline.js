const APPROACH = 450, BEAT = 700, PULLBACK = 800;
const HOLE_PREVIEW = 550;
const EMPTY = Object.freeze([]);
const clamp = x => Math.min(1,Math.max(0,x));
const ease = x => x*x*(3-2*x);
const freeze = Object.freeze;

function state(poses, installed, captive, active=EMPTY, joint=null) {
  return freeze({ poses:freeze(poses), installed, active, joint, captive:freeze(captive) });
}
const empty = state({},EMPTY,{});

function validatePose(p) {
  return p?.length===7 && p.every(Number.isFinite) && Math.abs(Math.hypot(...p.slice(3))-1)<1e-6;
}
function same(a,b) { return a.every((v,i)=>Math.abs(v-b[i])<1e-6); }

export function createCompiler(kit, orderedSteps) {
  const unbox = state(Object.fromEntries([...kit.parts].map(([id,p])=>[id,freeze(p.unpacked)])),EMPTY,{});
  return route => compile(kit, orderedSteps(route), unbox, route);
}

function compile({families,parts,shapes}, records, unbox, route) {
  const order = freeze([0,...records.map(s=>s.number)]), compiled = new Map();
  const hardware = p => families[p.family].number !== null;
  const installed = new Set();
  let boundary = empty;
  for (const step of records) {
    const {number} = step;
    const holds = step.operations.map(op=>op.previewBores ? HOLE_PREVIEW : 0);
    const duration = APPROACH+step.operations.length*BEAT+holds.reduce((sum,ms)=>sum+ms,0)+PULLBACK;
    let beatStart = APPROACH;
    const start = boundary;
    const require = id => {
      const p = parts.get(id);
      if (!p) throw new Error(`Step ${number}: unknown part ${id}`);
      return p;
    };
    const rows = new Map();
    const row = (id, kind) => {
      const key = require(id).family;
      if (!rows.has(key)) rows.set(key,{ ids:new Set(), added:new Set(), used:new Set() });
      const r = rows.get(key);
      r.ids.add(id);
      if (kind==='place') { r.added.add(id); r.used.delete(id); }
      else if (!r.added.has(id)) r.used.add(id);
    };
    const events = step.operations.map((op,i) => {
      const {kind,ids,prerequisites,poses:paths,captive,rigid} = op;
      if (!['place','move','adjust','remove'].includes(kind) || new Set(ids).size!==ids.length || paths.length!==ids.length) {
        throw new Error(`Step ${number}: invalid operation ${i+1}`);
      }
      for (const id of prerequisites) {
        require(id);
        if (!installed.has(id)) throw new Error(`Step ${number}: prerequisite ${id} is not installed`);
      }
      const resolved = ids.map(require);
      for (const [j,id] of ids.entries()) {
        const path = paths[j];
        if (path.length<2 || !path.every(validatePose) || Math.abs(Math.hypot(...op.axes[j])-1)>1e-6) throw new Error(`Step ${number}: invalid path for ${id}`);
        const role = families[resolved[j].family].role;
        if (kind==='place' ? installed.has(id) || (role!=='kit' && role!=='external') : !installed.has(id) || !same(path[0],boundary.poses[id])) {
          throw new Error(`Step ${number}: invalid ${kind} of ${id}`);
        }
        row(id,kind);
      }
      const before = boundary, nextPoses = {...before.poses}, nextCaptive = {...before.captive};
      for (const [j,id] of ids.entries()) {
        if (kind==='remove') { installed.delete(id); delete nextPoses[id]; delete nextCaptive[id]; }
        else {
          if (kind==='place') installed.add(id);
          nextPoses[id] = freeze(paths[j].at(-1));
          if (captive) nextCaptive[id] = captive.to;
        }
      }
      boundary = state(nextPoses,freeze([...installed]),nextCaptive);
      const labelIds = [];
      for (const p of (captive ? resolved : [...resolved,...prerequisites.map(require)])) {
        if (labelIds.every(id=>parts.get(id).family!==p.family)) labelIds.push(p.id);
        if (labelIds.length===3) break;
      }
      if (captive) for (const id of prerequisites) {
        if (labelIds.every(key=>parts.get(key).family!==parts.get(id).family)) labelIds.push(id);
        if (labelIds.length===3) break;
      }
      const {outward,view,...authored} = op.joint;
      const {target,axis} = authored;
      let direction, span;
      if (view) {
        ({direction,span} = view);
      } else {
        const primary = resolved[0], maxShape = Math.max(...shapes[primary.shape]);
        if (!prerequisites.length) {
          direction = [-.45,.31,.88];
          span = hardware(primary) ? Math.max(120,Math.min(420,maxShape*2.2)) : Math.max(360,maxShape*.66);
        } else {
          const [x,y,z] = outward, bx = target[0]<0 ? -.42 : .42;
          const dot = bx*x+.28*y+.45*z;
          direction = [x+bx-x*dot,y+.28-y*dot,z+.45-z*dot];
          span = hardware(primary) ? Math.max(110,Math.min(210,maxShape*2.2)) : Math.max(200,Math.min(300,maxShape*.55));
        }
      }
      const norm = Math.hypot(...direction);
      const joint = freeze({ ...authored, target:freeze(target), axis:freeze(axis), labels:freeze(labelIds),
        direction:freeze(direction.map(v=>v/norm)), span });
      const hold=holds[i], t0=beatStart/duration;
      beatStart+=hold+BEAT;
      return freeze({ t0,t1:beatStart/duration,hold:hold/duration,
        op, kind, ids:freeze(ids), before, after:boundary, paths, joint, captive, rigid,
        stagger:kind==='place' && ids.length>1 && resolved.every(hardware) ? 0.18 : 0 });
    });
    let mountingBeats = 0;
    const mounted = new Set();
    for (const {op,kind,ids,rigid} of events) {
      if (kind==='move' && op.prerequisites.length) mounted.add(rigid.anchor);
      else if (kind==='adjust' || (kind==='place' && op.prerequisites.length)) {
        for (const id of ids) mounted.add(id);
      } else continue;
      mountingBeats++;
    }
    const mountedIds = [...mounted].filter(id=>boundary.poses[id]);
    compiled.set(number,freeze({ ...step,start,end:boundary,events:freeze(events),duration,
      mountedIds:mountedIds.length && (mountingBeats>1 || mountedIds.length>1) ? freeze(mountedIds) : EMPTY,
      parts:freeze([...rows].map(([family,r])=>freeze({family,ids:freeze([...r.ids]),added:r.added.size,reused:r.used.size}))) }));
  }
  return freeze({ order, steps:compiled, unbox, route:freeze({...route}) });
}

function interpolate(a,b,u) {
  const dot = a[3]*b[3]+a[4]*b[4]+a[5]*b[5]+a[6]*b[6];
  const sign = dot<0 ? -1 : 1;
  const theta = Math.acos(Math.min(1,Math.abs(dot)));
  const sin = Math.sin(theta);
  const wa = sin<1e-5 ? 1-u : Math.sin((1-u)*theta)/sin;
  const wb = (sin<1e-5 ? u : Math.sin(u*theta)/sin)*sign;
  const q = [a[3]*wa+b[3]*wb,a[4]*wa+b[4]*wb,a[5]*wa+b[5]*wb,a[6]*wa+b[6]*wb];
  const norm = Math.hypot(...q);
  return [a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u,q[0]/norm,q[1]/norm,q[2]/norm,q[3]/norm];
}
function along(path,u) {
  if (u<=0) return path[0];
  if (u>=1) return path.at(-1);
  const phase = u*(path.length-1), i = Math.floor(phase);
  return interpolate(path[i],path[i+1],ease(phase-i));
}
function apply([px,py,pz,a,b,c,d],[x,y,z,e,f,g,h]) {
  const u=2*(b*z-c*y), v=2*(c*x-a*z), w=2*(a*y-b*x);
  return [px+x+d*u+b*w-c*v,py+y+d*v+c*u-a*w,pz+z+d*w+a*v-b*u,
    d*e+a*h+b*g-c*f,d*f-a*g+b*h+c*e,d*g+a*f-b*e+c*h,d*h-a*e-b*f-c*g];
}

export function sample(timeline, stepNumber, progress) {
  if (stepNumber===0) return timeline.unbox;
  const step = timeline.steps.get(stepNumber);
  if (!step) throw new RangeError(`Step ${stepNumber} is not on this route`);
  const p = clamp(progress);
  const event = step.events.find(e=>p<e.t1);
  if (!event) return step.end;
  const travelStart=event.t0+event.hold;
  const f = clamp((p-travelStart)/(event.t1-travelStart));
  const {before,ids,paths,joint,captive,stagger,rigid} = event;
  const visible = {...before.poses};
  const nextCaptive = captive ? {...before.captive} : before.captive;
  const transform = rigid && f>0 && along(rigid.frames,f);
  for (let i=0;i<ids.length;i++) {
    const id = ids[i];
    const u = clamp((f-stagger*i/Math.max(1,ids.length-1))/(1-stagger));
    visible[id] = freeze(transform ? apply(transform,rigid.offsets[i]) : along(paths[i],u));
    if (captive) {
      const from = before.captive[id] ?? captive.from;
      nextCaptive[id] = from+(captive.to-from)*ease(u);
    }
  }
  return state(visible,before.installed,nextCaptive,ids,joint);
}
