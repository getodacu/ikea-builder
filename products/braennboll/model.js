import { createCompiler } from '../../src/timeline.js';
import { families, parts, shapes, orderedSteps } from './kit.js';

const compileRoute=createCompiler({families,parts,shapes},orderedSteps);
export function compile({footShelfSide='right',skirting=true}={}) {
  return compileRoute({footShelfSide,skirting});
}
