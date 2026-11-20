import { families, parts, shapes, steps, setup, capWarning } from './kit.js';
import { article, frameArticle, topArticle, unboxPage } from './manual.js';
import { compile, compileDemo } from './model.js';

export default {
  families, parts, shapes, steps, compile,
  loadScene:()=>import('./scene.js'),
  chapters:[['Unbox',0,0],['Rails and columns',1,5],['Supports and feet',6,8],['Shaft, crank and hook',9,12],
    ['Tabletop and cable holder',13,16],['Cover every opening',17,17]],
  groupOrder:['Underframe and mechanisms','Fittings and supplied keys','Tabletop and caps'],
  unbox:{page:unboxPage,title:'Unbox the wide RELATERA desk',action:`Open the underframe and 46⅛ × 23⅝-in. tabletop packages. ${setup}`},
  manualNotes:[capWarning,
    'Keep the desk away from blinds, stairs and other hazards to children. IKEA specifies a maximum evenly distributed load of 110 lb, no more than 33 lb concentrated on a small surface, and no more than 11 lb on the hook. See the IKEA US desk article below.',
    'The demonstration shows representative movement, not a calibrated number of turns or a test of loads and clearances.'],
  manualLinks:[['IKEA US desk article: placement, covered holes and loads',article],['IKEA US underframe 805.403.06',frameArticle],
    ['IKEA US tabletop 305.402.95',topArticle],['Two people, tools and surface protection',2],['Fittings and keys',3],['Tabletop caps by width',4],
    ['Level the desk using the glides',18],['Unlock, crank and park the handle',19],['Distribute weight across the top',20]],
  references:{1:[['Wide-top caps and dimensions',4]],11:[['Both crank mounting positions',12]],
    17:[['Level the desk using the glides',18],['Unlock, crank and park the handle',19],['Distribute weight',20],
      ['IKEA US safety guidance: placement, covered holes and loads',article]]},
  choices:[{step:11,key:'crankSide',legend:'Crank side (viewed from the front)',options:[['left','Left side'],['right','Right side']],
    initial:'left',requireExplicit:true,prompt:'Choose a crank side'}],
  useDemo:{label:'Raise the desk with the crank',compile:compileDemo}
};
