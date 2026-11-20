import { families, parts, setup, shapes, steps } from './kit.js';
import { compile } from './model.js';
import { unboxPage } from './manual.js';

const care=['Check the cover care label before ironing',5];
const expansion=['Open by hand; allow 72 hours for the cushions to expand',41];
const conversion=['Convert the assembled sofa to a bed',44];

export default {
  families,parts,shapes,steps,compile,
  loadScene:()=>import('./scene.js'),
  chapters:[['Unbox',0,0],['Seat and cover',1,9],['Backrest cover',10,14],['Arms and frame',15,26],
    ['Storage and retention',27,32],['Mount and fold',33,38],['Back cushions',39,40]],
  groupOrder:['Frame modules','Hardware','Loose fittings','Required, not supplied'],
  unbox:{page:unboxPage,title:'Unbox the sofa frame',action:'Separate frame modules, fittings and driver. The seven covers come from a separately sold VRETSTORP cover set. The two sheets of four foot pads leave two pads unused.',warning:setup},
  manualNotes:['This guide finishes at the center cushion on page 43. Expansion, fabric care and use as a bed are reference figures, not assembly steps.',
    'Original schematic geometry: rigid upholstery proxies, diagram-based joints and motion, no cloth simulation or verified force, fit, clearance or load.'],
  manualLinks:[['Two people and protected surface',2],['Numbered hardware',3],['Loose fittings and handed mechanisms',4],care,expansion,conversion],
  references:{1:[['Two people and protected surface',2]],5:[care],10:[care],23:[care],38:[conversion],39:[expansion],40:[expansion,conversion]}
};
