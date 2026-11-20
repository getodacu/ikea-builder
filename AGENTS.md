# Agent instructions

- **Assembly changes:** Read [the IKEA assembly skill](.agents/skills/ikea-assembly/SKILL.md) before adding, revising, or validating a product. It defines the manual evidence, inventory reconciliation, geometry, and delivery checks.
- **Product boundaries:** Keep edition-specific steps, choices, geometry, and source evidence in `products/<slug>/`. Register products in `products/catalog.js`; keep `src/` product-agnostic.
- **Playback:** Keep assembly state deterministic in `src/timeline.js`. `src/guide.js` handles navigation and playback; `src/scene.js` renders the resulting state. Preserve text instructions and official page links when 3D or local previews are unavailable.
- **Manual assets:** Keep PDF and page renders in the local cache. The `__manual` route is loopback-only; deployed builds use official IKEA links.
- **Verification:** See [README.md](README.md) for setup and commands. Run the relevant `node --test <file>` for model, timeline, or geometry changes. For browser changes, exercise the affected path in the assembly studio. Assembly additions and revisions follow the skill's full delivery checks.
- **Publishing:** Follow [the release checklist](README.md#publish) when preparing a build for publication or pushing to a public repository.
