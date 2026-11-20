import {families,parts,shapes,steps} from './kit.js';
import {compile} from './model.js';
import {unboxPage} from './manual.js';

const article='https://www.ikea.com/us/en/p/brimnes-daybed-frame-with-2-drawers-white-40228708/';
const care='https://www.ikea.com/us/en/manuals/brimnes-daybed-frame-with-2-drawers-white__AA-2551000-2-100.pdf';
export default {
  families,parts,shapes,steps,compile,loadScene:()=>import('./scene.js'),
  chapters:[['Unbox',0,0],['Rolling base',1,15],['Pullout deck',16,25],['Outer frame',26,33],['Fixed deck and joining',34,39],['Two drawers',40,52]],
  groupOrder:['Frame panels','Bed slats','Drawer panels','Packet 1','Packet 2','Packet 3','Loose fittings'],
  unbox:{page:unboxPage,title:'Unbox the BRIMNES Twin daybed',
    action:'Separate the rolling base, fixed bed and two drawer kits. Sort the 12 shorter slats from the 13 longer ones. Keep the three fittings packets separate.',
    warning:{text:'Work with two people on a soft, protected surface. Bring slotted and cross-head screwdrivers and a hammer. If uncertain, contact IKEA.',page:2}},
  manualNotes:['Two Twin mattresses are required and sold separately, as is bedding. Stack the mattresses for single mode; place them side by side for double mode. Never separate the bases into two beds.',
    'Do not sit on the incomplete fixed frame or step into an open drawer. Follow the official manual for assembly and use.'],
  manualLinks:[['US BRIMNES article and dimensions',article],['Tools and protected work surface',2],['Packet 1',3],['Packets 2 and 3',4],['Rails, handles, braces and tracks',5],
    ['Identify the short slats',18],['Identify the two drilled long slats',25],['Incomplete frame warning',28],['Two-person frame engagement',29],['Drawer warning and mattress use',36],['Advice and care booklet',care]],
  references:{0:[['Packets 2 and 3',4],['Loose fittings',5]],23:[['Slat length selector',18]],34:[['Long slat side drilling',25]],
    39:[['Do not sit on the incomplete frame',28]],52:[['Safe drawer and mattress use',36],['Two-Twin-mattress guidance',article]]}
};
