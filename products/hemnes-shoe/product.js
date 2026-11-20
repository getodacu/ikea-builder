import { families, parts, safety, shapes, steps } from './kit.js';
import { compile } from './model.js';
import { unboxPage } from './manual.js';

export default {
  families, parts, shapes, steps, compile,
  loadScene:()=>import('./scene.js'),
  chapters:[['Unbox',0,0],['Cabinet sides',1,9],['Join the cabinet',10,20],['Anchor to wall',21,21],['Tilt-out bins',22,29],['Top drawer',30,37]],
  groupOrder:['Cabinet pieces','Tilt-out pieces','Drawer pieces','Cabinet fittings','Runner packet','Required, not supplied'],
  unbox:{page:unboxPage,title:'Unbox the shoe cabinet',
    action:'With two people on a protective surface, sort the cabinet, two bin kits and separate top drawer. Bring a flat-blade screwdriver, cross-head screwdriver and hammer. Keep the two supplied hex keys, two cam sizes and runner packet screws separate. If unsure about assembly, contact IKEA.',
    warning:safety},
  manualNotes:['The cabinet has two front feet and must be attached to a wall before fitting the bins. The two wall attachment symbols are not supplied hardware or specifications.',
    'Published envelope: 890 × 300 × 1270 mm (width × depth × height). Original illustrative geometry does not verify fit, load, clearance, or anchoring.'],
  manualLinks:[['Wall attachment warning',2],['Tools, two people and protective surface',5],['Supplied hardware and roller set',6],['Required wall attachment',17],['Bin pivot and stop inset',21],['Separate drawer seating',24]],
  references:{0:[['Wall attachment warning',2],['Tools and setup illustrations',5]],21:[['Wall attachment warning',2]],
    28:[['Install the receivers and stop pins',9],['Captive bin-side pin',18]],37:[['Cabinet-side runners',10],['Drawer-side runners',23]]}
};
