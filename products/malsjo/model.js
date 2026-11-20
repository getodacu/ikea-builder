import { createCompiler } from '../../src/timeline.js';
import { families, parts, shapes, stepsForRoute } from './kit.js';
import { pages } from './manual.js';

export function routeSteps({skirting,doorStop}) {
  if (typeof skirting !== 'boolean' || !['left','right'].includes(doorStop)) throw new RangeError('Unknown build route');
  return Object.freeze([0,...pages.map((_,i)=>i+1).filter(n=>skirting || (n!==31 && n!==32))]);
}

export const compile = createCompiler({families,parts,shapes}, route=>{
  const numbers = routeSteps(route), records = stepsForRoute(route);
  return numbers.slice(1).map(number=>records[number-1]);
});
