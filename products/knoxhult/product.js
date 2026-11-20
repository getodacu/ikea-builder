import { families, parts, shapes, steps, wallWarning } from './kit.js';
import { compile } from './model.js';
import { unboxPage } from './manual.js';

export default {
  families, parts, shapes, steps, compile,
  loadScene:()=>import('./scene.js'),
  chapters:[['Unbox',0,0],['Cabinet frame',1,28],['Drawer layout',29,32],['Worktop and anchoring',33,38],
    ['Shelves and doors',39,41],['Drawer',42,53]],
  groupOrder:['Cabinet and shelves','Doors and drawer','Hardware p. 4','Hardware p. 5','Required, not supplied'],
  unbox:{
    page:unboxPage,
    title:'Unbox the three packages',
    action:'Sort the panels, door and drawer pieces and the two hardware groups. Work with a helper on a protected surface; bring the tools pictured on page 3.',
    warning:{text:wallWarning,page:2}
  },
  manualNotes:[
    wallWarning,
    'Illustrative geometry; it does not verify physical fit, clearance, torque or wall strength. Only the standalone countertop offset is shown in 3D.',
    'Sink, strainer/stopper, faucet and knobs or handles are sold separately. No countertop cutting, plumbing or appliance work is covered.'
  ],
  manualLinks:[['Wall safety',2],['Tools and two-person setup',3],['Small hardware',4],['Fittings and runners',5],
    ['Three drawer layouts',20],['Worktop offset insets',29],['Mark all four wall positions',31],['Fixings and retainers',32],['Hinge adjustment',42]],
  references:{
    1:[['Tools and setup',3]],29:[['Compare all three layouts',20]],33:[['Standalone and adjoining countertop offsets',29]],
    35:[['Wall anchoring warning',2],['Wall fixings and retainers',32]],36:[['Mark the bracket positions',31]],37:[['Wall anchoring warning',2]],
    38:[['Wall fixings and retainers',32]],41:[['Adjust the doors',42]],53:[['Adjust the doors',42]]
  },
  choices:[{step:29,key:'drawerBay',legend:'Drawer bay (viewed from the front)',options:[['left','Left bay'],['right','Right bay'],['center','Center bay']],
    initial:'left',requireExplicit:true,prompt:'Choose the drawer bay'}]
};
