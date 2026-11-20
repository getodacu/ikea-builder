import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readdir, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { products } from './products/catalog.js';
import { manualAssetDir } from './manual-assets.js';

async function prepare({manual,previewPages}, directory) {
  const response = await fetch(manual.url, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`IKEA manual download: HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const hash = createHash('sha256').update(bytes).digest('hex');
  if (hash !== manual.sha256) throw new Error(`IKEA manual SHA-256 mismatch: expected ${manual.sha256}, got ${hash}`);

  const parent = dirname(directory);
  await mkdir(parent, { recursive: true, mode: 0o700 });
  const stage = await mkdtemp(join(parent, '.prepare-'));
  try {
    const pdf = join(stage, 'manual.pdf');
    await writeFile(pdf, bytes);
    for (const page of previewPages) {
      assert(Number.isInteger(page) && page >= 1 && page <= manual.pages, `Invalid manual page: ${page}`);
      for (const [size, name] of [[240, `${page}-thumb`], [1600, `${page}`]]) {
        const { error, status, signal } = spawnSync('pdftoppm', [
          '-f', page, '-l', page, '-singlefile', '-scale-to', size, '-png', pdf, join(stage, name)
        ], { stdio: 'inherit' });
        if (error?.code === 'ENOENT') throw new Error('Install Poppler (brew install poppler on macOS) and rerun the preparation command');
        if (error) throw error;
        if (status !== 0) throw new Error(`pdftoppm failed for PDF page ${page} (${signal ?? status})`);
      }
    }
    await mkdir(directory, { recursive: true, mode: 0o700 });
    for (const name of await readdir(stage)) await rename(join(stage, name), join(directory, name));
  } finally {
    await rm(stage, { recursive: true, force: true });
  }
  console.log(`Prepared manual and ${previewPages.size} page previews in ${directory}`);
}

const slug = process.argv[2], entry = products.get(slug);
if (!entry || process.argv.length!==3) {
  console.error(`Usage: npm run manual:prepare -- <product> (${[...products.keys()].join(', ')})`);
  process.exitCode = 1;
} else {
  try {
    await prepare(entry, manualAssetDir(slug, entry.manual));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
