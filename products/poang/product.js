import { completeFrame, families, parts, shapes, steps } from './kit.js';
import { unboxPage } from './manual.js';
import { compile } from './model.js';

const setup='Protect the work surface. Use a slotted hand screwdriver, not a powered driver. The hex key is supplied.';
const tightening=['Final tightening: check all six side screws with the supplied key',14];
const cushion=['Separate cushion fitting (not included)',15];

export default {
  families,parts,shapes,steps,compile,completeFrame,
  loadScene:()=>import('./scene.js'),
  chapters:[['Unbox',0,0],['Back',1,4],['Seat',5,7],['Arm frames',8,11]],
  groupOrder:['Back pieces','Seat pieces','Side frames and braces','Fittings · p. 3'],
  unbox:{page:unboxPage,title:'Unbox the frame',
    action:'Lay out the bent birch stiles, four bowed slats, fabric seat, two arm frames and their braces. Compare screw lengths and shank widths before you begin.',
    warning:{text:setup,page:2}},
  manualNotes:['Frame only, birch veneer, US article 813.058.07. A POÄNG cushion is sold separately.',
    setup,'Bends and joining details are illustrative; use the official instructions to check the physical fit.'],
  manualLinks:[['Tools and work surface',2],['Frame overview and protective pads',4],tightening,cushion],
  references:{0:[['Frame overview and protective pads',4]],11:[tightening,cushion]}
};
