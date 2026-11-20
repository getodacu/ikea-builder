import { families, parts, setupWarning, shapes, steps, wallWarning } from './kit.js';
import { compile } from './model.js';
import { unboxPage } from './manual.js';

export default {
  families, parts, shapes, steps, compile,
  loadScene: ()=>import('./scene.js'),
  chapters: [['Unbox',0,0],['Case',1,29],['Secure',30,33],['Doors',34,47],['Drawers',48,73]],
  groupOrder: ['Case panels','Glass doors','Drawer pieces','Packet 1','Packet 2','Packet 3','Loose fittings'],
  unbox: {
    page: unboxPage,
    title: 'Unbox the kit',
    action: 'Lay out the case panels, glass doors, drawer pieces and hardware before you start.',
    warning: {text:setupWarning,page:6}
  },
  manualNotes: [
    'Illustrative geometry; physical fit is unverified.',
    'Diagram-scale estimate: 1450 × 920 × 480 mm. Not a specification.',
    wallWarning,
    'Bring a slotted screwdriver, cross-head screwdriver and hammer. The key is supplied; wall screws and plugs are not. Cable routing is optional. This viewer does not verify wall attachment.'
  ],
  manualLinks: [
    ['Wall anchoring and safety',2],['Two-person setup',6],['Hardware packet 1',7],['Hardware packet 2',8],
    ['Hardware packet 3 and drawer catches',9],['Loose fittings',10],['Drawer removal and adjustment',53],
    ['Door adjustment',54],['Optional cable routing',55]
  ],
  references: {
    29: [['Optional cable routing',55]],
    73: [['Drawer adjustment',53],['Door adjustment',54]]
  },
  choices: [
    {step:30,key:'skirting',legend:'Wall fit',options:[[true,'With skirting (baseboard)'],[false,'Without skirting (baseboard)']],
      initial:true,requireExplicit:true,prompt:'Choose wall fit'},
    {step:45,key:'doorStop',legend:'Door stop (viewed from the front)',options:[['right','Right door'],['left','Left door']],
      initial:'right'}
  ],
  skippedLabels: {31:'With skirting only',32:'With skirting only'}
};
