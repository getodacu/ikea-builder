import { families, parts, shapes, steps, wallWarning } from './kit.js';
import { article, unboxPage } from './manual.js';
import { compile } from './model.js';

export default {
  families, parts, shapes, steps, compile,
  loadScene:()=>import('./scene.js'),
  chapters:[['Unbox',0,0],['End frames and rails',1,10],['Uprights and feet',11,17],['Shelf and top',18,23],
    ['Level and fit doors',24,27],['Square, secure and route',28,30]],
  groupOrder:['Steel frame','Pine panels','Mesh doors','Case fittings · p. 6','Door fittings · p. 6','Required, not supplied'],
  unbox:{page:unboxPage,title:'Lay out the console and door fittings',
    action:'Build with two people on protection. Bring a cross-head screwdriver, a slotted screwdriver and a spirit level. Separate the narrower shelf from the wider top, and check the upright hole patterns and four door edges against the manual.',
    warning:{text:wallWarning,page:2}},
  manualNotes:[wallWarning,
    'The 3D view shows positions, not verified clearances, screw sizes, wall fixings or leveling settings.',
    'IKEA lists a maximum TV weight of 90 lb and maximum shelf load of 110 lb. See the product article for TV placement guidance.'],
  manualLinks:[['Tip-over warning',2],['Tools and two-person setup',5],['Case and door fitting inventory',6],
    ['Leveling before mounting the doors',25],['Check square and tighten',28],['Required wall attachment',29],['Adhesive cable clips',30],['Official US product details',article]],
  references:{7:[['Two-person handling',5]],17:[['Two-person setup',5]],28:[['Opposing adjuster setup',12]],
    29:[['Tip-over warning',2]],30:[['Required wall attachment',29],['Tip-over warning',2]]}
};
