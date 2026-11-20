import { families, parts, shapes, steps, groups, wallWarning } from './kit.js';
import { compile } from './model.js';
import { unboxPage } from './manual.js';

export default {
  families,parts,shapes,steps,compile,
  loadScene:()=>import('./scene.js'),
  chapters:[['Unbox',0,0],['Prepare and join the carcass',1,7],['Fit and lock the back',8,9],['Secure to the wall',10,10],['Fit adjustable shelves',11,12]],
  groupOrder:groups,
  unbox:{page:unboxPage,title:'Unbox the BILLY bookcase',
    action:'Work with a helper on a protected surface. Lay out the two grooved sides, three horizontal carcass panels, toe rail, one folding back and four adjustable shelves. Bring slotted and cross-head screwdrivers, a pencil, a hammer and a ruler.',
    warning:{text:wallWarning,page:2}},
  manualNotes:[wallWarning,'The 3D wall and anchor marks show only the two attachment locations. They do not indicate wall type, fixing size or clearance.'],
  manualLinks:[['Mandatory tip-over warning',2],['Tools, helper and surface protection',6],['Fittings inventory',7],['Both wall brackets and fixings',14]],
  references:{0:[['Tools and protected setup',6]],10:[['Mandatory tip-over warning',2]],
    11:[['Both wall brackets and fixings',14]],12:[['Mandatory tip-over warning',2],['Both wall brackets and fixings',14]]}
};
