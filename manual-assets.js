import { homedir } from 'node:os';
import { join } from 'node:path';

export const manualAssetDir = (slug,manual) => join(homedir(), '.cache', 'assembly-3d', slug, manual.id);
export const manualAssetFiles = pages => new Set(['manual.pdf', ...[...pages].flatMap(page=>[`${page}-thumb.png`,`${page}.png`])]);
