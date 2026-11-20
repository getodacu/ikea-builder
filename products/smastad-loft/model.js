import { createCompiler } from '../../src/timeline.js';
import { families, parts, records, shapes } from './kit.js';
import { pages } from './manual.js';

const build=createCompiler({families,parts,shapes},route=>records(route.layout));
export function compile(route={}) {
  const {layout='right-upper'}=route;
  if(!Object.hasOwn(pages,layout)) throw new RangeError(`Unknown SMÅSTAD layout: ${layout}`);
  return build({layout});
}
