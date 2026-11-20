import { completeFrame, families, parts, setup, shapes, steps } from './kit.js';
import { compile } from './model.js';
import { unboxPage } from './manual.js';

export default {
  families, parts, shapes, steps, compile, completeFrame,
  loadScene:()=>import('./scene.js'),
  chapters:[['Unbox',0,0],['Top guides',1,4],['Sliding carrier',5,16],['Close frame',17,21],['Legs and glides',22,28],['Extension leaf',29,30]],
  groupOrder:['Table pieces','Packet 1','Packet 2','Packet 3','Loose fittings'],
  unbox:{page:unboxPage,title:'Unbox the table',action:'Lay out the tabletop, extension leaf, rails, aprons, legs and hardware. Keep the similar screws and both threaded rod lengths separate.',warning:setup},
  manualNotes:['The table stays upside down for assembly. Steps 29–30 fit the leaf separately; pages 23–24 show using and storing it.',
    'Original illustrative geometry. Published top dimensions are 1200/1800 × 800 mm; joinery sizes, physical fit, and torque are not verified.'],
  manualLinks:[['Tools and protected surface',2],['Packets 1 and 2',3],['Packet 3 and corner angles',4],['Unlock, slide, insert and relock',23],['Extend the tabletop',24]],
  references:{30:[['Unlock, slide, insert and relock',23],['Extend the tabletop',24]]}
};
