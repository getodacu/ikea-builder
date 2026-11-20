import {ExtrudeGeometry,Group,LatheGeometry,Path,Shape,Vector2} from 'three';
import {shapes} from './kit.js';
import {meshTools} from './mesh.js';
import {panels} from './panels.js';
import {tracks} from './tracks.js';

function turned(g,m,profile,mat,segments=18) {
  return m.mesh(g,new LatheGeometry(profile.map(([x,y])=>new Vector2(x,y)),segments),mat);
}
function cap(g,m,shape,y,height) {
  const geo=new ExtrudeGeometry(shape,{depth:height,bevelEnabled:false,curveSegments:16});
  geo.rotateX(-Math.PI/2);return m.mesh(g,geo,m.zinc,[0,y,0]);
}
function cam(g,m,large) {
  const r=large?22:7.5, a=large?0:-Math.PI/2, spread=.56;
  const rotor=new Group();rotor.name='cam-turn';g.add(rotor);
  // Open radial entrance for the stud neck; the head and jaw turn together.
  const jaw=new Shape();jaw.absarc(0,0,r-.3,a+spread,a+2*Math.PI-spread,false);
  jaw.lineTo(.22*r*Math.cos(a-spread),.22*r*Math.sin(a-spread));jaw.lineTo(.22*r*Math.cos(a+spread),.22*r*Math.sin(a+spread));jaw.closePath();
  cap(rotor,m,jaw,-6,9.5);
  const top=new Shape();top.absarc(0,0,r,0,2*Math.PI,false);
  if(large) {
    const socket=new Path();for(let i=0;i<6;i++){const a=i*Math.PI/3;socket[i?'lineTo':'moveTo'](3.8*Math.cos(a),3.8*Math.sin(a));} socket.closePath();top.holes.push(socket);
    for(let i=0;i<5;i++) {
      const a=i*2*Math.PI/5,cut=new Path();cut.absarc(0,0,r-3,a+.13,a+.85,false);
      cut.lineTo(7*Math.cos(a+.60),7*Math.sin(a+.60));cut.closePath();top.holes.push(cut);
    }
  } else {
    const slot=new Path();slot.moveTo(-5.8,-.8);slot.lineTo(5.8,-.8);slot.lineTo(5.8,.8);slot.lineTo(-5.8,.8);slot.closePath();top.holes.push(slot);
  }
  cap(rotor,m,top,3.5,2.5);
}
const screws=new Set(['109542','109567','102138','100372','105307','105163','100359','100365']);
function hardware(g,part,m) {
  const key=part.family,[w,h,d]=shapes[part.shape],r=w/2,lo=-h/2,hi=h/2;
  if(screws.has(key)) {
    const shaft=key==='105163'?2.65:key==='109542'?2.6:2.25,head=key==='100359'?2.5:2;
    const profile=[[0,lo],[shaft*.6,lo+.7]];
    for(let y=lo+2;y<hi-head-2;y+=2.5) profile.push([shaft,y],[shaft*.79,y+.65]);
    profile.push([shaft*.9,hi-head],[r,hi-head+.65],[r,hi],[0,hi]);turned(g,m,profile,m.zinc);
    m.box(g,[w*.63,.14,.85],[0,hi+.01,0],m.dark);m.box(g,[.85,.14,w*.63],[0,hi+.02,0],m.dark);
  } else if(key==='118331'||key==='114671') {
    const profile=[[0,lo],[r*.52,lo],[r*.62,lo+1]];
    for(let i=2;i<8;i+=2)profile.push([r*.68,lo+i],[r*.56,lo+i+.6]);
    profile.push([r*.60,lo+9],[r,lo+9],[r,lo+11],[r*.8,lo+11],[r*.8,hi-7],[r*.53,hi-6],[r*.53,hi-2.5],[r*.88,hi-2.5],[r*.88,hi],[0,hi]);
    turned(g,m,profile,m.zinc);
  } else if(key==='101345'||key==='101359') {
    turned(g,m,[[0,lo],[r-.9,lo],[r,lo+1.5],[r,hi-1.5],[r-.9,hi],[0,hi]],m.wood,14);
  } else if(key==='119030'||key==='114670') cam(g,m,key==='114670');
  else if(key==='110525') {
    turned(g,m,[[0,lo],[2.35,lo],[2.5,lo+.6],[2.5,0],[r,0],[r,1.2],[2.5,1.2],[2.5,hi-.6],[2.35,hi],[0,hi]],m.plastic);
  } else if(key==='100602') {
    turned(g,m,[[3,lo],[4.25,lo],[4.25,hi-1.5],[r,hi-1.5],[r,hi],[2.3,hi],[2.3,hi-2],[0,hi-2],[0,lo+12],[3,lo+12],[3,lo]],m.zinc);
  } else if(key==='110519') {
    turned(g,m,[[0,lo],[2.4,lo],[2.9,lo+2],[2.9,hi-2],[r,hi-1.8],[r,hi],[0,hi]],m.zinc);
  } else if(key==='100049'||key==='108490') {
    m.cylinder(g,h/2,d,[h/2-w/2,0,0],m.zinc,'z',h/2,6);
    m.cylinder(g,h/2,w,[0,0,h/2-d/2],m.zinc,'x',h/2,6);
  } else throw Error(`Missing BRIMNES geometry for ${part.shape}`);
}

export function createGeometry() {
  const m=meshTools(),templates=new Map();
  return {
    instantiate(part) {
      const key=part.shape+'/'+(part.hand??'')+'/'+JSON.stringify(part.holes);
      let template=templates.get(key);
      if(!template) {
        template=new Group();
        if(!panels(template,part,m)&&!tracks(template,part,m)) hardware(template,part,m);
        templates.set(key,template);
      }
      const node=template.clone(true),rotor=node.getObjectByName('cam-turn');
      if(rotor) node.userData.setCaptive=amount=>{rotor.rotation.y=-amount*(part.family==='114670'?Math.PI*1.5:Math.PI*.75);};
      return node;
    },
    dispose(){templates.clear();m.dispose();}
  };
}
