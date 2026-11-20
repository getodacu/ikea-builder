import { families, parts, setup, shapes, steps } from './kit.js';
import { compile } from './model.js';
import { companions, layouts, unboxPage } from './manual.js';

export default {
  families,parts,shapes,steps,compile,
  loadScene:()=>import('./scene.js'),
  chapters:[['Unbox',0,0],['End gable',1,5],['Bed frame',6,14],['Raise frame',15,20],['Guard and base',21,27],['Ladder',28,37]],
  groupOrder:['Frame boards','Slatted base','Ladder pieces','Packet 2','Packet 3','Loose fittings'],
  unbox:{page:unboxPage,title:'Unbox the main-frame kit',action:'Lay out the frame boards, slats, ladder parts, packets 2 and 3, and loose fittings. Check the four layouts on page 6 before starting; the storage tower must already be assembled by step 15.',warning:setup},
  manualNotes:[
    'White Twin frame, article 504.540.41. This is the 37-step main-frame booklet only. The storage tower shown at step 15 comes from the storage booklet. Desk and storage assembly are separate.',
    'Use a protected surface and two people. Bring slotted and cross-head screwdrivers. Do not use a powered driver on the angle rails or hammer the ladder dowels.',
    'Use a 38¼ × 74½ in. (97 × 189 cm) mattress, sold separately. The US article lists 8¼ in. maximum thickness and 94½ in. minimum ceiling height; the mattress must not rise above the marked line on the frame.',
    'The upper bed is not suitable for children under six. Do not add hooks or handles or hang ropes or belts. The illustrative model does not certify fit, clearance, handling or load.'
  ],
  manualLinks:[['Two-person setup and tools',2],['Packet 2',3],['Packet 3',4],['Loose fittings and grip warning',5],
    ['Select ladder side and storage drawing',6],['Mattress size and maximum fill line',59],...companions],
  references:{0:[['Compare all four layout drawings',6]],1:[['Compare all four layout drawings',6]],
    15:[['Compare storage drawings',6]],33:[['Grip assembly warning',5]],37:[['Mattress size and maximum fill line',59]]},
  choices:[{step:1,key:'layout',legend:'Ladder side from the front and drawing on page 6',options:layouts,
    initial:'right-upper',requireExplicit:true,prompt:'Choose a ladder and storage layout'}]
};
