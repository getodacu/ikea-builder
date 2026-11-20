import { families, parts, shapes, steps, wallWarning } from './kit.js';
import { compile } from './model.js';
import { unboxPage } from './manual.js';

export default {
  families, parts, shapes, steps, compile,
  loadScene:()=>import('./scene.js'),
  chapters:[['Unbox',0,0],['Lower cabinet',1,11],['Worktop underside',12,14],['Upper cabinet',15,25],['Upper door',26,31],
    ['Join and anchor',32,36],['Lower doors',37,44],['Sink and cooktop',45,46]],
  groupOrder:['Lower cabinet','Upper cabinet','Worktop and inserts','Catch and screw packet','Loose fittings','Required, not supplied'],
  unbox:{page:unboxPage,title:'Unbox the play kitchen',action:'Adults assemble with two people and a protected surface. Bring a cross-head screwdriver, pencil, ruler and hammer. Set aside the included hex key, distinguish the look-alike screws and keep loose fittings away from children.',warning:wallWarning},
  manualNotes:['This guide follows the full lower- and upper-unit assembly. Page 9 also shows a jump to page 14; page 12 illustrates three leg-height settings.',
    'The cooktop is one housed module. Four 1.5 V LR6 (AA) batteries are not supplied. The sink detaches; do not use the kitchen with water or real food.',
    'Schematic original geometry. The kit cannot verify anchoring, clearances, torque or actual fit.'],
  manualLinks:[['Mandatory wall attachment',2],['Tools and two-person setup',6],['Wall pictogram and loose modules',7],['Fittings and included hex key',8],
    ['Manual opening and p. 14 jump',9],['Leg-height options',12],['Cooktop battery compartment and polarity',31]],
  references:{8:[['Three leg-height settings',12]],34:[['Tools and two-person setup',6]],36:[['Mandatory wall attachment',2]],
    46:[['Cooktop battery compartment and polarity',31],['Cooktop release inset',32]]}
};
