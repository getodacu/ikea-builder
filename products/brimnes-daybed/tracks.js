import {ExtrudeGeometry,Shape} from 'three';
import {fixedDeck} from './outer.js';
import {rollingDatums} from './rolling.js';
import {drawerDatums} from './drawers.js';
import {shapes} from './stock.js';

const signs=[-1,1];
const pullSlatX=new Set(rollingDatums.slats.map(slat=>slat.pose[0]));

function straightRail(g,part,m) {
  const [length]=shapes[part.shape];
  const {webZ,flangeY,thickness,slotLength}=rollingDatums.rail;
  const slots=part.holes.filter(h=>h.normal[2]!==0).map(h=>({...h,slot:slotLength,slotAxis:0}));
  const rounds=part.holes.filter(h=>h.normal[1]!==0);
  const collars=rounds.filter(h=>h.normal[1]<0&&pullSlatX.has(h.point[0])).map(h=>({...h,radius:5.2,depth:1.35}));
  m.block(g,part,[length,26,thickness],[0,1,webZ],m.steel,slots).name='slotted mounting web';
  // The front rolling receiver is offset toward the inner edge of this common section.
  m.block(g,part,[length,thickness,22],[0,flangeY,2],m.steel,[...rounds,...collars]).name='slat flange';
}

function bentRail(g,part,m) {
  const {tabX,upperY}=fixedDeck.front, span=tabX-1;
  const width=16, z=-1.5, rise=upperY+6;
  m.block(g,part,[2*span,2,width],[0,0,z],m.steel).name='interleave rail';
  for(const s of signs) {
    m.block(g,part,[2,rise+1,width],[s*tabX,(rise-1)/2,z],m.steel).name='two-hole bent end';
    m.box(g,[2*span,1.4,1.2],[0,1.7,z+s*(width/2-.6)],m.steel);
    const turn=new Shape();
    turn.moveTo(0,0);turn.lineTo(s*7,0);turn.lineTo(s*7,7);
    turn.quadraticCurveTo(s*7,0,0,0);
    m.mesh(g,new ExtrudeGeometry(turn,{depth:width,bevelEnabled:false}),m.steel,[s*(span-7),1,z-width/2]);
  }
}

const stamps={
  C:[[2.8,4.2],[.7,4.2],[0,3.5],[0,.7],[.7,0],[2.8,0]],
  D:[[0,0],[0,4.2],[1.8,4.2],[2.8,3.2],[2.8,1],[1.8,0],[0,0]],
  L:[[0,4.2],[0,0],[2.8,0]],
  R:[[0,0],[0,4.2],[2,4.2],[2.8,3.5],[2.8,2.7],[2,2.1],[0,2.1],[1.1,2.1],[2.8,0]]
};
function stamp(g,m,key,face,y,z) {
  for(const [i,letter] of [...key].entries()) {
    const strokes=stamps[letter];
    for(let j=1;j<strokes.length;j++) {
      const [u,v]=strokes[j-1], [a,b]=strokes[j], dy=b-v, dz=-face*(a-u);
      m.box(g,[.11,.43,Math.hypot(dy,dz)+.13],
        [face*1.045,y+(v+b)/2,z-face*(4.1*i+(a+u)/2)],m.steel).rotation.x=Math.atan2(-dy,dz);
    }
  }
}

function runner(g,part,m) {
  const key=part.family, cabinet=key[0]==='C';
  const face=(cabinet?key[1]==='L':key[1]==='R')?1:-1;
  const end=cabinet?1:-1, zStart=cabinet?-265:-241, zEnd=cabinet?241:265;
  const height=cabinet?24:11.5, base=cabinet?-3.2:-8;
  const centerZ=(zStart+zEnd)/2, length=zEnd-zStart, wheelZ=end*Math.abs(drawerDatums.runner.wheelZ);
  const wheelY=cabinet?-9:drawerDatums.runner.wheelY-drawerDatums.runner.y;
  m.block(g,part,[2,height,length],[0,base+height/2,centerZ],m.dark).name='runner web';

  // Opposed lips carry the other rail's roller, not their own. Staggered treads
  // leave two lanes so the rear rollers can pass the cabinet rollers on entry.
  const radius=11, surface=radius-Math.abs(wheelY), shelfY=-end*(surface+.75);
  m.box(g,[6.7,1.5,length],[face*7.15,shelfY,centerZ],m.dark).name='roller bearing lip';
  let start=zStart;
  for(const stop of [...drawerDatums.runner.pilots,zEnd+4.4]) {
    const finish=stop-4.4;
    m.box(g,[2.8,1.5,finish-start],[face*2.4,shelfY,(start+finish)/2],m.dark);
    start=stop+4.4;
  }
  if(cabinet) {
    // The open nose lets the tilted rear roller enter before it levels under the guide.
    const guideEnd=194;
    m.box(g,[9.5,1.5,guideEnd-zStart],[face*5.75,21.55,(guideEnd+zStart)/2],m.dark);
  } else {
    for(const z of drawerDatums.runner.pilots) m.box(g,[7,1.5,68],[-face*2.5,-8.75,z],m.dark);
  }
  m.box(g,[2,17,24],[0,-end*5,end*253],m.dark).name='roller mount';
  m.ring(g,radius,7.5,2.6,[face*4.7,wheelY,wheelZ],m.plastic,'x').name='roller-tread';
  m.cylinder(g,7.7,2.2,[face*4.7,wheelY,wheelZ],m.inset,'x');
  m.cylinder(g,2.4,6.45,[face*3.225,wheelY,wheelZ],m.zinc,'x');
  stamp(g,m,key,face,cabinet?9:-6.9,end*175);
}

function caster(g,part,m) {
  const [width,,length]=shapes[part.shape], y=-8;
  m.block(g,part,[width,2,length],[0,18,0],m.steel);
  const cheek=new Shape();
  cheek.moveTo(-19,17);cheek.lineTo(19,17);
  cheek.quadraticCurveTo(9,14,5.2,-8);
  cheek.quadraticCurveTo(4.2,-13,0,-13);
  cheek.quadraticCurveTo(-4.2,-13,-5.2,-8);
  cheek.quadraticCurveTo(-9,14,-19,17);
  const fork=new ExtrudeGeometry(cheek,{depth:2.6,bevelEnabled:false,curveSegments:6});
  fork.rotateY(Math.PI/2);
  for(const s of signs) m.mesh(g,fork,m.steel,[s*6.7-1.3,0,0]);
  m.ring(g,12,9.1,9,[0,y,0],m.rubber,'x');
  m.ring(g,9.3,7.5,7,[0,y,0],m.dark,'x');
  for(let i=0;i<6;i++) {
    const a=i*Math.PI/3;
    m.box(g,[7,5.8,1.6],[0,y+5.2*Math.cos(a),5.2*Math.sin(a)],m.dark).rotation.x=a;
  }
  m.cylinder(g,3.3,9.2,[0,y,0],m.dark,'x');
  m.cylinder(g,2.55,17.3,[0,y,0],m.zinc,'x');
}

function foot(g,part,m) {
  const prongs=fixedDeck.feet.prongsZ;
  m.box(g,[16,2,36],[0,-1,0],m.plastic);
  m.block(g,part,[12.5,2,32],[0,-3,0],m.plastic,
    prongs.map(z=>({point:[0,-4,z],normal:[0,-1,0],radius:4.1,depth:1.3})));
  for(const z of prongs) m.cylinder(g,2.15,5,[0,2.5,z],m.steel,'y',1.35);
}

function hook(g,part,m) {
  const {hand,holes}=part;
  const seats=holes.filter(h=>h.point[2]!==0).map(h=>({...h,normal:[hand,0,0],radius:3.35,depth:.55}));
  m.block(g,part,[3,9,45],[0,0,2.5],m.steel,[...holes,...seats]);
  const toe=new Shape();
  toe.moveTo(-25,4.5);toe.lineTo(-17,4.5);toe.lineTo(-17,9);
  toe.quadraticCurveTo(-17,10.5,-18.5,10.5);toe.lineTo(-23.5,10.5);
  toe.quadraticCurveTo(-25,10.5,-25,9);toe.closePath();
  const mesh=new ExtrudeGeometry(toe,{depth:3,bevelEnabled:false,curveSegments:4});
  mesh.rotateY(Math.PI/2);
  m.mesh(g,mesh,m.steel,[-1.5,0,0]).name='hook return';
}

export function tracks(g,part,m) {
  switch(part.family) {
    case '112976': straightRail(g,part,m);break;
    case '112978': bentRail(g,part,m);break;
    case 'CL': case 'CR': case 'DL': case 'DR': runner(g,part,m);break;
    case '111401': caster(g,part,m);break;
    case '130787': foot(g,part,m);break;
    case '123660': hook(g,part,m);break;
    case '130485':
      m.block(g,part,[5,13,7],[0,0,0],m.plastic);
      for(const s of signs) m.cylinder(g,1.8,15,[0,0,s*4.65],m.plastic);
      break;
    case '110646': {
      const [hole]=part.holes;
      const ring=m.ring(g,8.5,hole.radius,10,[0,0,0],m.plastic);
      ring.geometry.userData.mouths??=[hole,{point:[0,-5,0],normal:[0,-1,0],radius:hole.radius}];
      break;
    }
    default: return false;
  }
  return true;
}
