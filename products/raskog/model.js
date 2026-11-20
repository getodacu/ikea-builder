import { createCompiler } from '../../src/timeline.js';
import { families, parts, shapes, steps, useRecords } from './kit.js';

const kit={families,parts,shapes};
export const compile=createCompiler(kit,()=>steps);
export const compileUseDemo=createCompiler(kit,()=>useRecords);
