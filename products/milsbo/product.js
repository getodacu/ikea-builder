import { families, parts, setupWarning, shapes, steps } from './kit.js';
import { unboxPage } from './manual.js';
import { compile } from './model.js';

const tip=['Tip-over warning and suitable wall fixings',2];
const setup=['Two-person setup and tools',6];
const reference=['Slide-bolt operation and optional lighting',34];
export default {
  families,parts,shapes,steps,compile,
  loadScene:()=>import('./scene.js'),
  chapters:[['Unbox',0,0],['Base',1,6],['Uprights and roof',7,12],['Glass and shelf rests',13,21],['Doors and leveling',22,28],['Anchor and shelves',29,30]],
  groupOrder:['Frame and legs','Glass and doors','Hardware','Wall brackets','Required, not supplied'],
  unbox:{page:unboxPage,title:'Unbox the tall glass-door cabinet',
    action:'Check both cartons on a protected surface. Keep the short and long versions of each screw separate. The hex key is supplied; have a cross-head screwdriver and spirit level ready.',warning:setupWarning},
  manualNotes:['Use two people. Keep the roof screws loose until all four cabinet panes sit behind their retainers. Anchor both brackets before fitting or loading shelves.',
    'Only one key is fitted; the second is a spare. Lighting is sold separately. The 3D guide illustrates the assembly order, not glass stress, wall fastening, force, or fit.'],
  manualLinks:[tip,setup,['Hardware inventory',7],['Wall attachment before shelves',32],reference],
  references:{0:[tip,setup],13:[setup],20:[['Glass edge and retainer detail',16]],22:[reference],27:[reference],28:[setup],29:[tip],30:[['Anchor before placing shelves',32],reference]}
};
