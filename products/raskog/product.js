import { completeFrame, families, parts, shapes, setupNote, steps } from './kit.js';
import { compile, compileUseDemo } from './model.js';
import { unboxPage } from './manual.js';

export default {
  families, parts, shapes, steps, compile, completeFrame,
  useDemo:{label:'Lock the caster brakes',compile:compileUseDemo},
  loadScene:()=>import('./scene.js'),
  chapters:[['Unbox',0,0],['Keyed steel frame',1,2],['Three trays',3,5],['Swivel casters',6,7]],
  groupOrder:['Steel frame','Trays and clamps','Fittings and tool · p. 3'],
  unbox:{page:unboxPage,title:'Unbox the cart',action:`${setupNote} Find the three numbered trays and separate the two braked casters from the two plain ones.`},
  manualNotes:[setupNote,'The two brake levers belong on the two casters at one short end, not at diagonal corners. Lower both levers to lock the parked cart.'],
  manualLinks:[['Tools and surface protection',2],['Fittings, tool and caster markings',3],['Tray orientation and wrench',5],['Brake lever operation',8]],
  references:{1:[['Tools and surface protection',2]],3:[['Bolt and nut orientation',5]],
    6:[['Caster markings',3]],7:[['Brake lever operation (unnumbered inset)',8]]}
};
