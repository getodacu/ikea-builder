import { createCompiler } from '../../src/timeline.js';
import { families, parts, routes, shapes } from './kit.js';

function selected({crankSide='left'}={}) {
  if(crankSide!=='left' && crankSide!=='right') throw new RangeError(`Unknown RELATERA crank side: ${crankSide}`);
  return routes[crankSide];
}
const kit={families,parts,shapes};
export const compile=createCompiler(kit,route=>selected(route).assembly);
export const compileDemo=createCompiler(kit,route=>selected(route).demo);
