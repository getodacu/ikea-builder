# FLAT / FORM — IKEA Builder

FLAT / FORM is an independent [ai.ro](https://ai.ro) project that turns specific official IKEA assembly manual editions into interactive 3D guides. [Contact Us](https://ai.ro/#contact) · [GitHub repository](https://github.com/getodacu/ikea-builder)

Match the model, variant, and article number on the catalog card to your product before building. Open the card’s official IKEA PDF and use the studio to follow numbered instructions and warnings, inspect parts, and replay placements.

After the last numbered instruction, choose **View completed assembly** to orbit the finished model for your selected configuration. The last official page, safety instructions, and references stay available; **Back** returns to the last instruction.

RÅSKOG, NÄMMARÖ, RELATERA and NORDEN also have an optional use demonstration in the completed 3D view. Choose **Reset demonstration** to restore the parked pose. These controls illustrate the manual’s unnumbered use figures; they never advance the printed instructions.

## Run locally

Requires **Node.js 24** and npm.

```sh
npm ci
npm run dev
```

Open the localhost URL printed by Vite and choose an assembly from the catalog. Use `?product=malsjo`, `?product=ekedalen`, or another catalog slug to open its studio directly.

### Optional: local manual previews

Install Poppler (`brew install poppler` on macOS), then run:

```sh
npm run manual:prepare -- malsjo
```

Replace `malsjo` with a catalog slug to download that edition. This verifies the pinned IKEA PDF's SHA-256 and renders page previews into `~/.cache/assembly-3d/`. Use `localhost` or `127.0.0.1` to see previews in the dev server or local build preview. The app works without them; PDFs and page images are not bundled.

## How it works

Vite builds the HTML catalog from the [product registry](products/catalog.js), so the cards and PDF links work without JavaScript. The edition ledgers, such as [the BRIMNES daybed ledger](products/brimnes-daybed/source.md), record the pinned manuals, page evidence, and inventory reconciliation. KALLAX is not offered because its horizontal wall attachment callout conflicts with the supplied stock.

The studio requires JavaScript. [The timeline](src/timeline.js) computes assembly state deterministically; [the guide](src/guide.js) handles navigation and playback; [the scene](src/scene.js) renders the state with Three.js. If 3D or local previews are unavailable, the numbered text and official IKEA links remain usable.

## Test and build

```sh
npm test
npm run build
```

`npm test` runs the Node.js tests.

## Publish

On Node.js 24:

```sh
npm ci
npm test
npm run build
npm run preview
```

Open the preview and check the catalog and an assembly studio. Confirm `dist/LICENSE` and `dist/THIRD_PARTY_NOTICES.md` are present and no manual PDFs or page renders are bundled. Deploy `dist/` unchanged to a static host. The deployed app links to IKEA and does not need the loopback-only `__manual` route.

## License and attribution

The [MIT License](LICENSE) covers original project code, documentation, and illustrations. It does not cover IKEA names, marks, manuals, or other third-party materials; those rights remain with their respective owners.

FLAT / FORM is not affiliated with or endorsed by IKEA. The guide supplements, not replaces, the official manual. Geometry is illustrative and has not been physically verified for fit, wall attachment, or load.

## Add or update an assembly

Follow the [assembly authoring workflow](.agents/skills/ikea-assembly/SKILL.md) to document the official manual edition, reconcile the parts, and verify the modeled steps.

For the gallery, add an original, transparent `products/<slug>/gallery.svg` alongside the guide. Use a `400 × 300` viewBox for every plate. The build takes the caption and both link targets from the registry.
