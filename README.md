# FLAT / FORM — IKEA Builder

An interactive 3D companion to official IKEA assembly manuals. The catalog currently covers the **MALSJÖ black-stained sideboard**. Follow the numbered steps, inspect parts, replay placements, and open the corresponding official manual pages. If 3D is unavailable, the text instructions and official links remain usable.

The guide supplements the official IKEA manual. The 3D geometry is illustrative and does not verify physical fit or wall attachment.

## Run locally

Requires **Node.js 24** and npm.

```sh
npm ci
npm run dev
```

Open the localhost URL printed by Vite and choose MALSJÖ from the catalog. Use `?product=malsjo` to open the studio directly.

### Optional: local manual previews

Install Poppler (`brew install poppler` on macOS), then run:

```sh
npm run manual:prepare -- malsjo
```

This downloads the pinned IKEA PDF, verifies its SHA-256, and renders page previews into `~/.cache/assembly-3d/`. Use `localhost` or `127.0.0.1` to see previews in the dev server or local build preview. The app works without them; PDFs and page images are not bundled.

## Test and build

```sh
npm test
npm run build
npm run preview
```

`npm test` runs the Node.js tests. Deploy `dist/` to a static web host; the build includes `THIRD_PARTY_NOTICES.md`.

## Add or update an assembly

Follow the [assembly authoring workflow](.agents/skills/ikea-assembly/SKILL.md) to document the official manual edition, reconcile the parts, and verify the modeled steps.
