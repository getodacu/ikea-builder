import {ExtrudeGeometry,Shape} from 'three';
import {shapes} from './stock.js';
import {rollingDatums} from './rolling.js';
import {fixedDeck} from './outer.js';
import {drawerDatums} from './drawers.js';

function section(g,part,m,min,max,material) {
  m.block(g,part,max.map((v,i)=>v-min[i]),max.map((v,i)=>(v+min[i])/2),material);
}

function pullFront(g,part,m) {
  const {front,frontOpenings:[left,right]}=rollingDatums;
  const [x,y,z]=front.size.map(v=>v/2);
  const bottom=left.bottom-front.pose[1], top=left.top-front.pose[1];
  section(g,part,m,[-x,-y,-z],[x,bottom,z]);
  section(g,part,m,[-x,top,-z],[x,y,z]);
  for(const [lo,hi] of [[-x,left.left],[left.right,right.left],[right.right,x]])
    section(g,part,m,[lo,bottom,-z],[hi,top,z]);
}

function fixedEnd(g,part,m) {
  const {size,stile,topRail,bottomRail,grooveDepth}=fixedDeck.end;
  const [x,y,z]=size.map(v=>v/2), bottom=-y+bottomRail, top=y-topRail;
  section(g,part,m,[-x,-y,-z],[x,bottom,z]);
  section(g,part,m,[-x,top,-z],[x,y,z]);
  section(g,part,m,[-x,bottom,-z],[x,top,-z+stile]);
  section(g,part,m,[-x,bottom,z-stile],[x,top,z]);
  section(g,part,m,[-x+grooveDepth,bottom,-z+stile],[x-grooveDepth,top,z-stile],m.inset);
}

function drawerFront(g,part,m) {
  const [x,y,z]=shapes[part.shape].map(v=>v/2);
  const [groove]=drawerDatums.grooves[part.shape];
  const bottom=groove.center[1]-groove.size[1]/2, top=groove.center[1]+groove.size[1]/2;
  const halfWidth=groove.size[0]/2;
  section(g,part,m,[-x,-y,-z],[x,bottom,z]);
  section(g,part,m,[-x,top,-z],[x,y,z]);
  section(g,part,m,[-x,bottom,-z],[-halfWidth,top,z]);
  section(g,part,m,[halfWidth,bottom,-z],[x,top,z]);
  section(g,part,m,[-halfWidth,bottom,-z+groove.size[2]],[halfWidth,top,z]);
}

function drawerSide(g,part,m) {
  const [x,y,z]=shapes[part.shape].map(v=>v/2);
  const [groove,rebate]=drawerDatums.grooves[part.shape];
  const bottom=groove.center[1]-groove.size[1]/2, top=groove.center[1]+groove.size[1]/2;
  const shoulder=rebate.center[2]+rebate.size[2]/2;
  const core=depth=>groove.center[0]<0?[-x+depth,x]:[-x,x-depth];
  const [grooveLeft,grooveRight]=core(groove.size[0]);
  const [rebateLeft,rebateRight]=core(rebate.size[0]);
  section(g,part,m,[-x,-y,-z],[x,bottom,z]);
  section(g,part,m,[grooveLeft,bottom,-z],[grooveRight,top,z]);
  section(g,part,m,[-x,top,shoulder],[x,y,z]);
  section(g,part,m,[rebateLeft,top,-z],[rebateRight,y,shoulder]);
}

function drawerBrace(g,part,m) {
  const {beam,frontTab,backTab,headGap,headHeight}=drawerDatums.brace;
  const [width,height,length]=beam.size, [x,y,z]=beam.center, gauge=1.5;
  // Stop the cap short so the screw head clears it throughout the slide.
  const relief=headGap+headHeight;
  m.box(g,[width,gauge,length-relief],[x,y+(height-gauge)/2,z-relief/2],m.steel);
  for(const side of [-1,1])
    m.box(g,[gauge,height-gauge,length],[x+side*(width-gauge)/2,y-gauge/2,z],m.steel);

  const [cx,cy,cz]=frontTab.center, [w,h,t]=frontTab.size;
  const [sx,sy]=frontTab.slot, r=frontTab.slotWidth/2;
  const left=cx-w/2, right=cx+w/2, bottom=cy-h/2, top=cy+h/2;
  const tab=new Shape();
  tab.moveTo(left,bottom);
  tab.lineTo(right,bottom);
  tab.lineTo(right,top);
  tab.lineTo(sx+r,top);
  tab.lineTo(sx+r,sy);
  tab.absarc(sx,sy,r,0,-Math.PI,true);
  tab.lineTo(sx-r,top);
  tab.lineTo(left,top);
  tab.closePath();
  m.mesh(g,new ExtrudeGeometry(tab,{depth:t,bevelEnabled:false,curveSegments:8}),m.steel,[0,0,cz-t/2]);
  m.block(g,part,backTab.size,backTab.center,m.steel);
}

function handle(g,part,m) {
  const [width,height,depth]=shapes[part.shape], rear=-depth/2, base=9, seam=rear+base;
  m.block(g,part,[width,9,base],[0,0,rear+base/2],m.zinc);
  // The sloped lip leaves finger clearance behind it, below the drilled mounting bar.
  const tip=depth/2, rim=height/2;
  const profile=new Shape();
  profile.moveTo(-seam,1.5);
  profile.lineTo(-tip+6,1.5);
  profile.lineTo(-tip+1.3,-rim);
  profile.lineTo(-tip,-rim);
  profile.lineTo(-tip,rim-3);
  profile.lineTo(-tip+3,rim);
  profile.lineTo(-seam,4.5);
  profile.closePath();
  const lip=new ExtrudeGeometry(profile,{depth:width,bevelEnabled:false}).rotateY(Math.PI/2);
  m.mesh(g,lip,m.zinc,[-width/2,0,0]);
}

export function panels(g,part,m) {
  switch(part.shape) {
    case 'pullFront': pullFront(g,part,m); break;
    case 'fixedLeft': case 'fixedRight': fixedEnd(g,part,m); break;
    case 'drawer-front': drawerFront(g,part,m); break;
    case 'drawer-side-left': case 'drawer-side-right': drawerSide(g,part,m); break;
    case '118301': drawerBrace(g,part,m); break;
    case '124328': handle(g,part,m); break;
    case 'pullSlat': case 'fixedSlat': case 'fixedHookLeft': case 'fixedHookRight':
      m.block(g,part,shapes[part.shape],undefined,m.pine); break;
    case 'drawer-bottom':
      m.block(g,part,shapes[part.shape],undefined,m.inset); break;
    case 'pullBack': case 'pullEndL': case 'pullEndR':
    case 'pullBearerL': case 'pullBearerC': case 'pullBearerR': case 'fixedBack': case 'drawer-back':
      m.block(g,part,shapes[part.shape]); break;
    default: return false;
  }
  return true;
}
