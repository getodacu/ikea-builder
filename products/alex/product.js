import { families, parts, shapes, steps, stackingWarning } from './kit.js';
import { compile } from './model.js';
import { unboxPage } from './manual.js';

const article='https://www.ikea.com/us/en/p/alex-drawer-unit-white-00473546/';
const warning={text:stackingWarning,page:4};
export default {
  families,parts,shapes,steps,compile,
  loadScene:()=>import('./scene.js'),
  chapters:[['Unbox',0,0],['Cabinet',1,8],['Three deep drawers',9,14],['Two shallow drawers',15,21],['Fit the drawers',23,23]],
  groupOrder:['Cabinet panels','Deep drawers','Shallow drawers','Fittings · p. 3','Desk-only fittings'],
  unbox:{page:unboxPage,title:'Unbox the standalone drawer unit',
    action:'Protect the work surface. Set out both cabinet sides with their fitted runners and separate the three deep drawer sets from the two shallow ones. Bring slotted and cross-head screwdrivers and a hammer; scissors are needed only for the alternate pad template.',warning},
  manualNotes:[stackingWarning,
    'This guide assembles the five-drawer standalone unit on its four supplied pads. Caster mounting and desk support are separate applications. The four 110907 screws and hex key are supplied for desk support, not used here.',
    'The drawer runner fit and open positions are schematic. Follow the official insets when engaging and securing each drawer.'],
  manualLinks:[['US ALEX article and dimensions',article],['Tools and protected surface',2],['Fittings inventory',3],
    ['Do not stack',4],['Panel orientation: use the left figure',8],['Caster reference (not included)',11],
    ['Desk conversion reference',12],['Desk support only (not a standalone step)',21],['Drawer sizes and runner engagement',22],
    ['Alternate placement for the same four pads',23]],
  references:{0:[['Tools and protected surface',2],['Do not stack',4]],
    8:[['Alternate placement for the same four pads',23],['Optional caster reference',11]],
    21:[['Desk-only figure 22 — omit for standalone',21]],23:[['Do not stack',4]]}
};
