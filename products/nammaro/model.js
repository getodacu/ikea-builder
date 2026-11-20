import { createCompiler } from '../../src/timeline.js';
import { demo, families, parts, shapes, steps } from './kit.js';

const kit={families,parts,shapes};
export const compile=createCompiler(kit,()=>steps);
export const compileDemo=createCompiler(kit,()=>demo);
