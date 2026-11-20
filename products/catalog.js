import { manual, previewPages } from './malsjo/manual.js';
import { manual as ekedalenManual, previewPages as ekedalenPreviews } from './ekedalen/manual.js';
import { manual as milsboManual, previewPages as milsboPreviews } from './milsbo/manual.js';
import { manual as duktigManual, previewPages as duktigPreviews } from './duktig/manual.js';
import { manual as hemnesShoeManual, previewPages as hemnesShoePreviews } from './hemnes-shoe/manual.js';
import { manual as braennbollManual, previewPages as braennbollPreviews } from './braennboll/manual.js';
import { manual as vretstorpManual, previewPages as vretstorpPreviews } from './vretstorp/manual.js';
import { manual as paxSlidingManual, previewPages as paxSlidingPreviews } from './pax-sliding/manual.js';
import { manual as malmStorageManual, previewPages as malmStoragePreviews } from './malm-storage/manual.js';
import { manual as knoxhultManual, previewPages as knoxhultPreviews } from './knoxhult/manual.js';
import { manual as smastadLoftManual, previewPages as smastadLoftPreviews } from './smastad-loft/manual.js';
import { manual as raskogManual, previewPages as raskogPreviews } from './raskog/manual.js';
import { manual as poangManual, previewPages as poangPreviews } from './poang/manual.js';
import { manual as billyManual, previewPages as billyPreviews } from './billy/manual.js';
import { manual as nammaroManual, previewPages as nammaroPreviews } from './nammaro/manual.js';
import { manual as alexManual, previewPages as alexPreviews } from './alex/manual.js';
import { manual as relateraManual, previewPages as relateraPreviews } from './relatera/manual.js';
import { manual as nordenManual, previewPages as nordenPreviews } from './norden/manual.js';
import { manual as fjallboManual, previewPages as fjallboPreviews } from './fjallbo/manual.js';
import { manual as brimnesDaybedManual, previewPages as brimnesDaybedPreviews } from './brimnes-daybed/manual.js';

export const products = new Map([
  ['malsjo', {name:'MALSJÖ',description:'Black-stained sideboard',manual,previewPages,load:()=>import('./malsjo/product.js')}],
  ['ekedalen', {name:'EKEDALEN',description:'White extendable dining table, 120/180 × 80 cm, 703.408.07',manual:ekedalenManual,previewPages:ekedalenPreviews,load:()=>import('./ekedalen/product.js')}],
  ['milsbo', {name:'MILSBO',description:'Tall anthracite glass-door cabinet, 303.964.48',manual:milsboManual,previewPages:milsboPreviews,load:()=>import('./milsbo/product.js')}],
  ['duktig', {name:'DUKTIG',description:'Birch play kitchen, 603.199.72',manual:duktigManual,previewPages:duktigPreviews,load:()=>import('./duktig/product.js')}],
  ['hemnes-shoe', {name:'HEMNES',description:'White two-compartment shoe cabinet with top drawer',manual:hemnesShoeManual,previewPages:hemnesShoePreviews,load:()=>import('./hemnes-shoe/product.js')}],
  ['braennboll', {name:'BRÄNNBOLL',description:'Light gray/white gaming station, 405.864.62',manual:braennbollManual,previewPages:braennbollPreviews,load:()=>import('./braennboll/product.js')}],
  ['vretstorp', {name:'VRETSTORP',description:'Three-seat sleeper sofa frame; includes the finishing figures using separately sold covers',manual:vretstorpManual,previewPages:vretstorpPreviews,load:()=>import('./vretstorp/product.js')}],
  ['pax-sliding', {name:'PAX',description:'White sliding-door frames and rail, 78¾ × 79⅛ in., 404.581.91; not wardrobe assembly',manual:paxSlidingManual,previewPages:paxSlidingPreviews,load:()=>import('./pax-sliding/product.js')}],
  ['malm-storage', {name:'MALM',description:'White Full/Double lift-up storage bed, 104.048.16',manual:malmStorageManual,previewPages:malmStoragePreviews,load:()=>import('./malm-storage/product.js')}],
  ['knoxhult', {name:'KNOXHULT',description:'White 72⅜-in. base cabinet with doors and drawer, 003.722.60',manual:knoxhultManual,previewPages:knoxhultPreviews,load:()=>import('./knoxhult/product.js')}],
  ['smastad-loft', {name:'SMÅSTAD',description:'White Twin loft-bed main frame, 504.540.41; desk/storage fit-out in companion booklets',manual:smastadLoftManual,previewPages:smastadLoftPreviews,load:()=>import('./smastad-loft/product.js')}],
  ['raskog', {name:'RÅSKOG',description:'White three-tier utility cart, 305.867.83',manual:raskogManual,previewPages:raskogPreviews,load:()=>import('./raskog/product.js')}],
  ['poang', {name:'POÄNG',description:'Birch-veneer armchair frame, 813.058.07',manual:poangManual,previewPages:poangPreviews,load:()=>import('./poang/product.js')}],
  ['billy', {name:'BILLY',description:'White tall open bookcase, 205.220.46',manual:billyManual,previewPages:billyPreviews,load:()=>import('./billy/product.js')}],
  ['nammaro', {name:'NÄMMARÖ',description:'Light brown stained outdoor chaise, 305.033.54',manual:nammaroManual,previewPages:nammaroPreviews,load:()=>import('./nammaro/product.js')}],
  ['alex', {name:'ALEX',description:'White standalone five-drawer unit, 004.735.46',manual:alexManual,previewPages:alexPreviews,load:()=>import('./alex/product.js')}],
  ['relatera', {name:'RELATERA',description:'White 46⅛ × 23⅝-in. sit/stand desk, 995.528.65',manual:relateraManual,previewPages:relateraPreviews,load:()=>import('./relatera/product.js')}],
  ['norden', {name:'NORDEN',description:'White gateleg table, 104.238.86',manual:nordenManual,previewPages:nordenPreviews,load:()=>import('./norden/product.js')}],
  ['fjallbo', {name:'FJÄLLBO',description:'Black 78-in. TV unit, 005.790.34',manual:fjallboManual,previewPages:fjallboPreviews,load:()=>import('./fjallbo/product.js')}],
  ['brimnes-daybed', {name:'BRIMNES',description:'White Twin daybed with two drawers, 52 assembly steps, 402.287.08',manual:brimnesDaybedManual,previewPages:brimnesDaybedPreviews,load:()=>import('./brimnes-daybed/product.js')}]
]);

export const manualPath = (slug,manual) => `__manual/${slug}/${manual.id}/`;
