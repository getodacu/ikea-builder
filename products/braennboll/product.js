import { families, parts, shapes, steps, wallWarning } from './kit.js';
import { compile } from './model.js';
import { unboxPage } from './manual.js';

export default {
  families, parts, shapes, steps, compile,
  loadScene:()=>import('./scene.js'),
  chapters:[['Unbox',0,0],['Steel frame',1,10],['Foot shelf',11,16],['Back and cable tray',17,22],
    ['Desktop and side panels',23,29],['Shelves',30,33],['Doors',34,41],['Level and secure',42,45]],
  groupOrder:['Steel frame','Work surfaces','Felt and door pieces','Fittings · p. 6','Fittings · p. 7','Cam covers','Required, not supplied'],
  unbox:{page:unboxPage,title:'Unbox both packages',
    action:'Use two people and protect the assembly surface. Lay out the five crossrails by profile. Bring a slotted and a cross-head screwdriver and a spirit level; the hex key is supplied.',
    warning:{text:wallWarning,page:2}},
  manualNotes:[wallWarning,
    'Levels, screw sizes, wall substrates and clearances are not verified by the 3D view. The wall and baseboard are illustrative.'],
  manualLinks:[['Wall attachment warning',2],['Tools and two-person setup',5],['Fittings inventory',6],['Wall fittings and tool',7],
    ['Choose the foot shelf from the front',15],['Check the door edges and level',37],['Wall fit and direct attachment',38],
    ['Baseboard spacers',39],['Adjust spacers and attach',40]],
  references:{11:[['Front-view shelf selector',15]],16:[['Both shelf routes rejoin here',23]],
    42:[['Wall fit and tip-over illustration',38]],43:[['Tip-over warning',2]],45:[['Tip-over warning',2]]},
  choices:[
    {step:11,key:'footShelfSide',legend:'Foot shelf (viewed from the front)',options:[['right','Right side'],['left','Left side']],
      initial:'right',requireExplicit:true,prompt:'Choose a foot shelf side'},
    {step:42,key:'skirting',legend:'Wall fit after leveling',options:[[true,'With baseboard'],[false,'Without baseboard']],
      initial:true,requireExplicit:true,prompt:'Choose wall fit'}
  ],
  skippedLabels:{44:'With baseboard only',45:'With baseboard only'}
};
