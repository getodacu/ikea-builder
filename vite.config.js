import { open, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { manualPath, products } from './products/catalog.js';
import { manualAssetDir, manualAssetFiles } from './manual-assets.js';

const manuals = [...products].map(([slug,{manual,previewPages}])=>({
  prefix:`/${manualPath(slug,manual)}`, directory:manualAssetDir(slug,manual), files:manualAssetFiles(previewPages)
}));
const loopback = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1']);
const localHost = /^(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i;

const escape = text => text.replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const catalog = {
  name: 'assembly-catalog',
  transformIndexHtml: {
    order: 'pre',
    handler(html) {
      const cards = [...products].map(([slug, { name, description, manual }], index) => {
        const key = escape(encodeURIComponent(slug));
        const title = escape(name);
        const number = String(index + 1).padStart(2, '0');
        return `<li class="gallery-card">
          <a class="gallery-open" href="?product=${key}" aria-labelledby="gallery-title-${key} gallery-action-${key}">
            <div class="gallery-plate" aria-hidden="true">
              <span class="gallery-badge">PLATE ${number}</span>
              <img src="./products/${key}/gallery.svg?no-inline" alt="" width="400" height="300" decoding="async"${index === 0 ? '' : ' loading="lazy"'}>
            </div>
            <div class="gallery-copy">
              <h3 id="gallery-title-${key}">${title}</h3>
              <p>${escape(description)}</p>
              <span class="gallery-action" id="gallery-action-${key}">Open studio <span aria-hidden="true">→</span></span>
            </div>
          </a>
          <a class="gallery-manual" href="${escape(manual.url)}" aria-label="Official IKEA manual (PDF) for ${title}">Official IKEA manual (PDF) <span aria-hidden="true">↗</span></a>
        </li>`;
      });
      return html.replace('<!-- assembly-count -->', String(products.size))
        .replace('<!-- assembly-catalog -->', () => cards.join('\n        '));
    }
  }
};

function installManualRoute(server) {
  server.middlewares.use(async (req, res, next) => {
    const pathname = req.url.split(/[?#]/, 1)[0];
    if (!pathname.startsWith('/__manual/')) return next();
    const end = status => { res.statusCode = status; res.end(); };
    if ((req.method !== 'GET' && req.method !== 'HEAD') || !loopback.has(req.socket.remoteAddress)
      || !localHost.test(req.headers.host)) return end(404);
    const entry = manuals.find(({prefix})=>pathname.startsWith(prefix));
    if (!entry) return end(404);
    const name = pathname.slice(entry.prefix.length);
    if (!entry.files.has(name)) return end(404);

    try {
      const file = await open(join(entry.directory, name), 'r');
      try {
        const stat = await file.stat();
        if (!stat.isFile()) return end(404);
        res.setHeader('Content-Length', stat.size);
        res.setHeader('Content-Type', name === 'manual.pdf' ? 'application/pdf' : 'image/png');
        res.setHeader('Cache-Control', 'private, no-store');
        res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        if (req.method === 'HEAD') return res.end();
        await pipeline(file.createReadStream(), res);
      } finally {
        await file.close();
      }
    } catch (error) {
      if (res.destroyed || res.writableEnded) return;
      if (res.headersSent) return res.destroy(error);
      end(error.code === 'ENOENT' ? 404 : 500);
    }
  });
  // Answer for this prefix before Vite's Host check can substitute its own 403.
  const { stack } = server.middlewares;
  stack.unshift(stack.pop());
}

export default {
  base: './',
  plugins: [catalog,{
    name: 'local-assembly-manuals',
    configureServer: installManualRoute,
    configurePreviewServer: installManualRoute
  },{
    name: 'project-license',
    async generateBundle() {
      const source = await readFile(new URL('./LICENSE', import.meta.url));
      this.emitFile({ type: 'asset', fileName: 'LICENSE', source });
    }
  }],
  build: { license: { fileName: 'THIRD_PARTY_NOTICES.md' } }
};
