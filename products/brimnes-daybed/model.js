import {createCompiler} from '../../src/timeline.js';
import {families,parts,shapes,steps} from './kit.js';

export const compile=createCompiler({families,parts,shapes},()=>steps);
