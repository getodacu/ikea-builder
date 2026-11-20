# BILLY source ledger

- White tall open bookcase, US article 205.220.46: [IKEA article](https://www.ikea.com/us/en/p/billy-bookcase-white-20522046/) links the [official assembly PDF](https://www.ikea.com/us/en/assembly_instructions/billy-bookcase-white__AA-2289108-3-100.pdf). Article envelope: 31½ × 11 × 79½ in. (width × depth × height, approximately 800 × 279 × 2019 mm). One stationary shelf and four adjustable shelves; one package.
- File edition `AA-2289108-3-100`, printed footer `AA-2289108-3`, 16 PDF pages (`pdfinfo`), dated 2024-03-21 on p. 16. Verified `shasum -a 256`: `723b25d46d1c50219e829cf650388b10cfbe6fa0f55a85b95d12ced64454e86a`. Visually inspected Poppler renders of pp. 1–16, including the three bottom-entering and rear-facing figures on pp. 11–13 and both bracket insets on p. 14. PDF pages below are one-based.
- P. 1 is the cover; pp. 2–5 contain the multilingual tip-over warning. Always use the supplied wall attachments. The screws and plugs for the wall are not included; select ones suitable for the actual wall, and seek professional advice if unsure. P. 6 depicts a slotted screwdriver, cross-head screwdriver, pencil, hammer and ruler; work with a helper on a protected surface and ask IKEA if unsure. Pp. 7 and 14 repeat the tip-over pictogram. The p. 14 standing figure and p. 16 support engagement are parts of their numbered figures, not separate steps.
- This is the open article as boxed. Optional doors, extensions or other separately sold items are outside the guide. There is no freestanding route.

## Stock and route balance

|Source|Count and identity|
|---|---|
|p. 7 fittings inventory|12 `118331` cam bolts, 16 `101351` wood dowels, 18 `151705` retainer locking pins, 18 `151706` retainer sleeves, 12 `119081` cam locks, 16 `131372` shelf supports, 2 `109041` short bookcase screws, 4 `100823` washers, 2 `106989` slotted wall brackets. 100 fittings; p. 7 shows one fittings inventory and gives no packet subdivisions.|
|Unnumbered structural figures|2 handed side panels with inward rear channels (p. 8); 1 top, 1 fixed middle shelf, 1 bottom shelf and 1 toe rail (p. 7); 1 folding fiberboard back with two longitudinal folds (p. 12); 4 adjustable shelves of the same stock family (p. 16). 11 structural units, counting the linked folding back as one.|
|External|Slotted and cross-head screwdrivers, pencil, hammer, ruler and surface protection; no supplied tools depicted. Model two wall fixing positions, not included fasteners or prescribed types.|

All 111 supplied pieces install. Six cam bolts per side: two per horizontal panel, none for the dowelled toe rail. The 16 dowels are four per horizontal panel or rail; each moves with its panel. The 12 cams are 4 + 2 + 6, not new hardware when turned. All 18 sleeves receive one locking pin each (six stations across each of the bottom, fixed-shelf and top rear edges). Use two washers through the brackets at the wall and the other two under the supplied screws at the top panel. No pieces are removed or left over.

## Ordered figures

|Step|PDF p.|New stock, reuse, adjustment and handling|
|---:|---:|---|
|1|7|Set out the three horizontal carcass panels and toe rail on protection. Press 16 × `101351` dowels into their end holes, two per end on each of the four pieces. Use the inset hole, not its neighboring connector hole.|
|2|8|Set both side panels with inside faces up and rear grooves identified. Drive 12 × `118331` in the indicated holes, six per side; not the shelf-support rows.|
|3|8|Bring the dowelled toe rail, bottom and fixed middle shelf onto the first side without moving their dowels independently. The small holes on both shelves' narrow edges face the rear groove; the cam-access faces follow the inset.|
|4|9|Insert and turn 4 × `119081` at the first side: two in the bottom and two in the fixed middle shelf, each capturing the previously installed stud.|
|5|10|Seat the prepared top onto the first side, rear pilot row toward the groove and cam access facing away from the already joined shelf faces. Insert and turn 2 × `119081` at the top.|
|6|11|Lower the other side panel over the exposed dowels and studs, rear groove inward and on the same edge as the first. Its six attached studs travel with it.|
|7|11|Insert and turn the remaining 6 × `119081` at the second side: two each at the bottom, fixed shelf and top.|
|8|12|Reposition the whole carcass to present the rear channels. Open out the one folding back along its two longitudinal folds. Feed it squarely from the bottom through both channels toward the top and line up the back's pilot holes with the three rear edges. The plinth below the bottom shelf is not where the lowest retainer row goes.|
|9|13|With the back fully in its channels, insert 18 × `151706` sleeves through the back into the three transverse rows; press 18 × `151705` pins into those same sleeves. These are paired expansion retainers, not nails.|
|10|14|With a helper stand the assembled carcass upright; do not load it. Use 2 × `106989` on top: put 2 × `100823` under the external fixings in the vertical slots, then use 2 × `109041` with the remaining 2 × `100823` through the horizontal slots into the top as in the lower inset. Neither external wall fixing is supplied; see p. 2.|
|11|15|Only after securing to the wall, press in 16 × `131372` at four illustrated levels, two per side at each level. Horizontal shank into side panel, vertical peg upward.|
|12|16|Lower 4 adjustable shelves (two per compartment) onto the supports, engaging the pegs in the shelf undersides. Wall attachment remains mandatory at completion.|

## Mesh and verification limits

Original procedural 3D geometry and original transparent gallery SVG; no IKEA images or diagrams are redistributed. Millimetres, +X viewer-right, +Y up and +Z front, with finished floor at Y=0 and origin below the bookcase center. Width, depth and height follow the US article; the panel thicknesses, rear cutout, channels, pilot sizes and offsets, peg spacing, wall plane, internal clearances and animation paths are diagram-based. The model distinguishes the long back channels from the side shelf-support rows, includes the same three linked back leaves throughout the unfold/slide, and uses two slotted top brackets and two external target symbols. It does not specify wall hardware, certify wall fit or clearance, or determine load. Follow the original IKEA warning and instructions.

`node --test products/billy/model.test.js products/billy/geometry.test.js` covers eleven product tests; all passed in the delivery run. `npm run manual:prepare -- billy` prepared ten preview pages. [Production audit and commands](../../README.md#catalog-verification).

In Chromium, inspected `151705`, replayed the retainer placement at fig. 9 / p. 13 and checked Back/Next, a loaded preview, and focus return. Fig. 12 / p. 16 and Complete showed the four adjustable shelves, 113 placed objects including the two external positions, and the mandatory p. 2 warning. Keyboard completion at 390 × 844 with reduced motion and blocked-scene/PNG completion retained the official links. No use demo.
