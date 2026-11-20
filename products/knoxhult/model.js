import { createCompiler } from '../../src/timeline.js';
import { build, families, parts, shapes, steps } from './kit.js';

const playback=createCompiler({families,parts,shapes},({drawerBay})=>drawerBay==='left'?steps:build(drawerBay));
export const compile=({drawerBay='left'}={})=>playback({drawerBay});
