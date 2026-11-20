# RÅSKOG source ledger

- Exact article: white utility cart, 305.867.83, US/en. [IKEA article](https://www.ikea.com/us/en/p/raskog-utility-cart-white-30586783/) lists one package and reports width 17¾ in., length 13¾ in., height 30⅜ in. (about 451 × 349 × 772 mm). IKEA lists 13 lb per tier and 40 lb total, and describes the lockable casters as keeping the cart in place when parked.
- [Article-linked IKEA PDF](https://www.ikea.com/us/en/assembly_instructions/raskog-utility-cart-white__AA-2475409-4-100.pdf), file edition `AA-2475409-4-100`, printed footer `AA-2475409-4`, 8 pages (`pdfinfo`), dated 2025-09-29 in the p. 8 footer. The exact file linked in the article was checked with `shasum -a 256`: `ee9cda5c9dc5b0aa9bee61a0ec1a4bafff9bac0ddbe2f0c68fee4e9e5ef9ab69`. Inspected rendered pp. 1–8, not just their text index.
- One-based PDF pages: p. 1 identifies the finished cart; p. 2 calls for a cross-head screwdriver, protection under the work, and contacting IKEA if unsure; p. 3 is the numbered fittings inventory. P. 8's lower inset is use guidance, not an assembly figure: lever angled up for unlocked, lowered to lock. No alternate assembly route, separately fitted tray lids, or external fixings in this booklet.

## Stock and balance

|Source|Count and identity|
|---|---|
|p. 3|6 `124154` smooth round-head tray bolts; 6 `10119612` domed flange nuts; 8 `121194` short cross-head tube screws.|
|p. 3, p. 5 inset, p. 7|1 `130772` supplied wrench, reused at the tray nuts and caster flats; tool, not installed.|
|p. 3 and fig. 6|2 complete braked swivels, listings `10121215 / 10121236 / 10169640` printed beside the same 2× drawing. The stem, wrench flats, swivel/fork, axle, wheel and brake lever are integral, not loose stock.|
|p. 3 and fig. 7|2 complete plain swivels, markings `10121224 / 10121235 / 10169527` beside the same 2× drawing; stem, flats, swivel/fork, axle and wheel integral. The multiple markings do not multiply the quantities.|
|Unnamed in figs. 1–2|2 lower paired riser sections with middle/lower tabs, 2 upper paired riser sections with top tabs, 2 curved base hoops with integral stem receivers. The twin tubes and welded tabs of each riser are one stock unit.|
|Unnamed in figs. 3–5|3 mesh-bottom trays stamped 1, 2 and 3; 6 independent curved clamp plates, two per tray, wrapped around the paired uprights. Tray mesh and stamped ears are integral.|
|Not supplied|Cross-head screwdriver and protective mat. Packaging is not an installed part.|

40 supplied units: 25 in the numbered drawing (including the four casters and the wrench), plus 15 structural units. All fit on the single route except the wrench, which remains a tool. No fastener is removed, traded for another size, or used twice as new stock.

## Ordered figures

|Fig.|PDF p.|New stock, reuse, handling and orientation|
|---:|---:|---|
|1|4|Join 2 upper paired risers to 2 lower paired risers, small upper ends into the lower sockets. Match the tube holes and the orientation of the integral plates; secure with 4 × `121194` (two per end) and a cross-head screwdriver.|
|2|4|Seat both joined risers over 2 base hoops, matching both base spigot holes per end with the holes in the risers. The risers and their four screws travel as joined pairs; add the other 4 × `121194`.|
|3|5|Tray **1** at the bottom. Fit 2 clamp plates outside the paired uprights, curved wings against the tubes. Seat 2 × `124154` outside-in through the plates/tabs, and 2 × `10119612` from inside the tray; tighten with supplied wrench.|
|4|6|Tray **2** at the middle level, with 2 more clamp plates, 2 × `124154` and 2 × `10119612`; same outside bolt head, inside nut and clamp orientation.|
|5|6|Tray **3** at the top; last 2 clamp plates, 2 × `124154` and 2 × `10119612` in the same orientation.|
|6|7|Lay the assembly on the protected surface as shown so the underside faces out. Fit and tighten the **2 braked** casters with the supplied wrench. The leader lines reach the nearer two corners at one short end, on different base hoops.|
|7|8|Still on the protected surface, thread the **2 plain** casters into both corners at the opposite short end. The two wheels already fitted in fig. 6 remain in place. See p. 8 inset for the separate raised/unlocked to lowered/locked brake action.|

The installed count by figure is 8, 14, 21, 28, 35, 37, 39; one wrench remains uninstalled. The complete view stands the same assembled cart upright, unlocked. The optional use demonstration lowers both integral levers together, with the four wheels, both swivels and all cart poses unchanged. Neither the display turn nor the brake use is an eighth numbered figure.

## Geometry and evidence limits

Original procedural 3D and original hand-drawn transparent gallery SVG, based on the article envelope and manual figures. No IKEA image, PDF or render is shipped. Millimetres, +X right along the long width, +Y up, +Z front; finished floor Y=0. The braked short end is model-left in this coordinate system. Tube diameters, depths, tab and hole profiles, basket elevations, frame and lever travel are schematic estimates, not fit measurements. The open mesh floor depicts the through-pattern, not the manufactured weave. Turns and insertion paths are instructional, not safety/clearance certification. Load numbers are IKEA article guidance, not inferred from the model.

`node --test products/raskog/model.test.js products/raskog/geometry.test.js`: eight passed. `npm run manual:prepare -- raskog`: six preview pages prepared from the pinned file. [Production audit and commands](../../README.md#catalog-verification).

In Chromium, inspected `124154`, replayed fig. 3, and returned to the same p. 5 source and canvas after Back/Next and the preview dialog. Complete retained fig. 7 / p. 8 and 39 placed pieces. Both brake levers lowered; Reset restored the unlocked canvas. Opening the PDF preview, going Back or changing the motion preference during playback interrupted it as intended. At 390 × 844 the keyboard reached the use control, reduced motion showed its end immediately and Reset restored the parked pose (pixel comparison at 2× scale). Without the scene and PNGs, p. 8 and the handling caution remained available, without a demo or broken preview button.
