import {pages} from './manual.js';
import {families,parts} from './stock.js';
export {families,parts,shapes,board} from './stock.js';

export const X=[1,0,0], Y=[0,1,0], Z=[0,0,1], neg=v=>v.map(x=>-x);
const cross=([x,y,z],[a,b,c])=>[y*c-z*b,z*a-x*c,x*b-y*a];
export function p(x=0,y=0,z=0,axis=X,angle=0) {
  const s=Math.sin(angle/2); return [x,y,z,...axis.map(v=>v*s),Math.cos(angle/2)];
}
export function rotate(v,q) {
  const u=q.slice(3,6), a=cross(u,v), b=cross(u,a);
  return v.map((x,i)=>x+2*(q[6]*a[i]+b[i]));
}
export function compose(a,b) {
  const pos=rotate(b.slice(0,3),a), u=a.slice(3,6), v=b.slice(3,6), c=cross(u,v);
  return [...pos.map((x,i)=>x+a[i]),...c.map((x,i)=>x+u[i]*b[6]+v[i]*a[6]),a[6]*b[6]-u.reduce((s,x,i)=>s+x*v[i],0)];
}
export function inverse(a) {
  const q=[0,0,0,-a[3],-a[4],-a[5],a[6]];
  return [...rotate(neg(a.slice(0,3)),q),...q.slice(3)];
}
export const shift=(pose,axis,n)=>pose.map((v,i)=>i<3?v+axis[i]*n:v);
export function fit(point,axis) {
  const out=neg(axis), u=cross(Y,out), w=1+out[1], n=Math.hypot(...u,w);
  return n<1e-8?p(...point,X,Math.PI):[...point,...u.map(v=>v/n),w/n];
}

export const steps=[];
const locations=new Map(), children=new Map(), allocated={}, captive=new Map();
export const at=id=>locations.get(id), on=(id,pose)=>compose(at(id),pose), dir=(id,axis)=>rotate(axis,at(id));
export function take(key) {
  const n=allocated[key]=(allocated[key]??0)+1, id=`${key}-${n}`;
  if(!parts.has(id)) throw Error(`Fig. ${steps.at(-1)?.number}: stock exhausted for ${key}`);
  return id;
}
export function step(number,title,action,warning) {
  steps.push({number,page:pages[number],title,action,warning,operations:[]});
}
function record(kind,ids,receivers,poses,axes,caption) {
  const prerequisites=[...new Set(receivers)], axis=axes[0];
  const op={kind,ids,prerequisites,poses,axes,joint:{axis,outward:neg(axis),target:poses[0].at(-1).slice(0,3),receivers:prerequisites,
    caption:caption??families[parts.get(ids[0]).family].name}};
  steps.at(-1).operations.push(op);
  ids.forEach((id,i)=>locations.set(id,poses[i].at(-1)));
  return op;
}
export function bore(id,point,normal,radius,depth) {
  const holes=parts.get(id).holes;
  if(!holes.some(h=>h.normal.every((v,i)=>Math.abs(v-normal[i])<1e-6)&&h.point.every((v,i)=>Math.abs(v-point[i])<1e-5)))
    holes.push({point,normal,radius,depth});
}
export function place(id,end,axis,receivers=[],travel=70,caption,preview=false) {
  const op=record('place',[id],receivers,[[shift(end,axis,-travel),end]],[axis],caption);
  if(preview) op.previewBores=true;
  return id;
}
export function join(child,parent) {
  if(!children.has(parent)) children.set(parent,[]);
  children.get(parent).push(child);
}
export function mount(id,owner,localPose,localAxis,others=[],travel=45,caption,preview=false) {
  place(id,on(owner,localPose),dir(owner,localAxis),[owner,...others],travel,caption,preview);
  join(id,owner); return id;
}
export function fast(key,owner,point,axis,others=[],travel=35,caption) {
  return mount(take(key),owner,fit(point,axis),axis,others,travel,caption,
    [owner,...others].some(id=>parts.get(id).holes.length));
}
function members(root,ids) {
  ids.push(root);
  for(const sub of children.get(root)??[]) members(sub,ids);
  return ids;
}
export function move(root,waypoints,axis,receivers=[],caption) {
  const ids=members(root,[]), start=at(root), from=inverse(start), frames=[start,...waypoints];
  const offsets=ids.map((id,i)=>i?compose(from,at(id)):p());
  const paths=ids.map((id,i)=>i?[at(id),...waypoints.map(f=>compose(f,offsets[i]))]:frames);
  record('move',ids,receivers,paths,ids.map(()=>axis),caption).rigid={anchor:root,frames,offsets};
}
export function lock(id,receivers,axis,to=1,caption='Turn the cam onto its stud') {
  const pose=at(id), op=record('adjust',[id],receivers,[[pose,pose]],[axis],caption);
  op.captive={from:captive.get(id)??0,to}; captive.set(id,to);
}
