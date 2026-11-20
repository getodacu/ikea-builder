import { completeFrame, families, parts, shapes, steps } from './kit.js';
import { compile } from './model.js';
import { unboxPage } from './manual.js';

const correction=[['Outer door leaning one way',35],['Outer door leaning the other way',36]];
export default {
  families, parts, shapes, steps, compile, completeFrame,
  loadScene:()=>import('./scene.js'),
  chapters:[['Unbox',0,0],['Check and fit both tracks',1,8],['Hang the inner frame',9,15],['Fill the inner door',16,21],
    ['Hang the outer frame',22,27],['Fill the outer door',28,33],['Side trims and seals',34,37]],
  groupOrder:['Tracks and frame profiles','Hardware and tool','Finishing pieces','Required, not supplied'],
  unbox:{page:unboxPage,title:'Unbox the PAX frame and rail kit',
    action:'Sort the short inner and long outer roller/catch pairs and split each sheet into four corner pads. Stage the eight separately sold MEHAMN panels (two sets of four) apart from the kit.',
    warning:{text:'Two people are required. Work on a protected surface. This guide starts with two already assembled, wall-secured PAX bays; it does not assemble or anchor them.',page:2}},
  manualNotes:['White 78¾ × 79⅛ in. frame and rail kit, article 404.581.91. The two 100 × 201 cm wardrobes and the eight MEHAMN panels (two sets, article 004.211.85) are not included.',
    'Have a crosshead driver, pointed hand tool, clamps, spirit level and stepladder. IKEA specifies a minimum ceiling height of 80¾ in.; confirm clearance and use the exact official instructions.',
    'Original schematic cross-sections and captive mechanisms illustrate the direction of travel, not loads, clearances, alignment tolerances, damping or safe wall fixing.'],
  manualLinks:[['Two-person setup and tools',2],['Finishing stock and pads',4],['Bay leveling adjusters',6],['Tip-over warning',7],
    ['Side trim arrangements',32],['Brush orientation',34],...correction],
  references:{0:[['Finishing stock and pads',4],['Tip-over warning',7]],1:[['Alternative leveling adjusters',6]],
    25:correction,26:[['Bracket-height correction',25]],37:correction}
};
