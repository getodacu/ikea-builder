import { families, parts, shapes, steps } from './kit.js';
import { unboxPage } from './manual.js';
import { compile } from './model.js';

const leftLift=['Exploded left lift — reference only',37];
const rightLift=['Exploded right lift — reference only',38];
export default {
  families,parts,shapes,steps,compile,
  loadScene:()=>import('./scene.js'),
  chapters:[['Unbox',0,0],['Bed shell',1,11],['Supports and lift mounts',12,19],['Steel carriage',20,24],
    ['Struts and latch',25,30],['Slats and mattress',31,34],['Storage floor',35,36]],
  groupOrder:['Bed pieces','Packet 1','Packet 2','Packet 3','Loose fittings','Handed lift modules','Required, not supplied'],
  unbox:{page:unboxPage,title:'Unbox the Full/Double storage bed',
    action:'Sort the four cartons, three hardware packets, handed lift units and Full/Double slat stock. Bring a flat-head and a cross-head screwdriver. IKEA sells the mattress and bed linen separately.',
    warning:{text:'Use two people and a protected work surface. Contact IKEA if you are unsure.',page:2}},
  manualNotes:['White Full/Double article 104.048.16: 32 slats, 64 caps and two 124432 lift struts. The other sizes shown in the same booklet are not included.',
    'Full/Double mattress maximum: 40 kg (88 lb). Original schematic geometry does not verify fit, forces, torque or safe supports. Follow the official handling warnings.'],
  manualLinks:[['Tools and protected two-person setup',2],['Packet 1',3],['Packets 2 and 3',4],['Loose supports and caps',5],['Lift handedness and strut size chart',6],
    ['Mount the carriage with two people',25],['Keep the base closed when moving the bed',31],['Mattress required before normal lifting',32],
    ['Full/Double mattress limit',33],['Loaded-lift warnings',34],['Storage floor and no-entry warning',36],leftLift,rightLift],
  references:{16:[['Handed lift chart',6],leftLift,rightLift],17:[leftLift,rightLift],18:[leftLift,rightLift],24:[['Two-person setup',2]],
    25:[leftLift,rightLift],26:[leftLift,rightLift],27:[leftLift,rightLift],30:[['Foot-end keeper installation',29]],
    31:[['Two-person setup',2]],32:[['Full/Double mattress limit',33]],33:[['Loaded-lift warnings',34]],
    34:[['Mattress required before lifting',32],['Do not enter the storage cavity',36]],36:[['Loaded-lift warnings',34],leftLift,rightLift]}
};
