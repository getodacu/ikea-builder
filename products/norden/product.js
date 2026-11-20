import { families, parts, setup, shapes, steps } from './kit.js';
import { unboxPage } from './manual.js';
import { compile, compileUseDemo } from './model.js';

const leafReference=['Raise a leaf, swing its gate and seat the locating pin',12];
export default {
  families, parts, shapes, steps, compile,
  loadScene:()=>import('./scene.js'),
  chapters:[['Unbox',0,0],['Underframe and hinges',1,4],['Attach and turn the table',5,7],['Build six drawers',8,15],['Insert the drawers',16,16]],
  groupOrder:['Table pieces','Drawer pieces','Fittings','Tools'],
  unbox:{page:unboxPage,title:'Unbox the table',action:'Lay out the two side-frame units, tabletop pieces and six drawer sets. Separate the long base dowels from the short drawer dowels.',warning:setup},
  manualNotes:[
    'The two gate supports are already hinged to the side frames. Each leaf has its own locating pin; engage it in the gate post when opening that leaf.',
    'The 3D demonstration illustrates the manual’s unnumbered use inset, not a load rating or a physical fit check.'
  ],
  manualLinks:[['Two people, hand tools and a protected surface',2],['Fittings and supplied tools',3],leafReference],
  references:{16:[leafReference]},
  useDemo:{label:'Open both gateleg leaves',compile:compileUseDemo}
};
