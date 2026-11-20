import { createCompiler } from '../../src/timeline.js';
import { families, parts, shapes, steps, useRecord } from './kit.js';

const kit={families,parts,shapes};
export const compile=createCompiler(kit,()=>steps);
export const compileUseDemo=createCompiler(kit,()=>[...steps,useRecord]);
