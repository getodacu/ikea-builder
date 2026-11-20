import { completeFrame, families, parts, setup, shapes, steps } from './kit.js';
import { compile, compileDemo } from './model.js';
import { unboxPage } from './manual.js';

export default {
  families, parts, shapes, steps, compile, completeFrame,
  useDemo:{label:'Raise the backrest',compile:compileDemo},
  loadScene:()=>import('./scene.js'),
  chapters:[['Unbox',0,0],['Leg preparation',1,1],['Wheel end',2,7],['Foot end',8,13]],
  groupOrder:['Deck and wheel assemblies','Legs and braces','Fittings · p. 3','Supplied tools'],
  unbox:{page:unboxPage,title:'Unbox the chaise',
    action:'Separate the two drilled wheel-end legs from the two padded foot-end legs. Sort the three barrel nut types and keep the long and short wheel sleeves apart.',
    warning:{text:setup,page:2}},
  manualNotes:['The deck stays upside down for figures 2–13. Page 15 shows the two-person turn and the pinch warning.',
    'IKEA describes five backrest positions. The demonstration illustrates one support position only; its motion, joinery dimensions and clearances are schematic.'],
  manualLinks:[['Tools, helper and protected surface',2],['Fittings inventory',3],
    ['Pinch warning when handling the deck',5],['Two-person turn and backrest adjustment',15]],
  references:{
    5:[['Seat the separate wheel stacks',8]],
    13:[['Use illustration: raise and support the backrest',15]]
  }
};
