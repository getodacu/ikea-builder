# NORDEN source ledger

- Article 104.238.86, white gateleg table, US: [official article](https://www.ikea.com/us/en/p/norden-gateleg-table-white-10423886/). The article lists six drawers and two drop leaves. Its measurement drawing gives usable tabletop lengths 260 / 890 / 1520 mm, depth 800 mm, height 740 mm, folded outside width 330 mm and open gate-leg span 1280 mm.
- [Official US assembly PDF](https://www.ikea.com/us/en/assembly_instructions/norden-gateleg-table-white__AA-1931387-8-100.pdf), as linked from the exact article, edition `AA-1931387-8-100`, footer `AA-1931387-8`, printed date 2024-11-20, 12 pages. Checked with `shasum -a 256`, `pdfinfo`, `pdftotext -f 12 -l 12` and visual inspection of Poppler renders for all 12 pages. SHA-256 `fa39a4ce4025224450753135170224b1b2882a4539120604da2e4f88a7c47519`. Exact-article underside, folded, drawer close-up and dimension images corroborate the two independently hinged leaves, opposed gate frames, front grips and envelope. None of those images is redistributed.
- P. 1 is the open-product cover. P. 2 calls for a helper, a protected work surface, a hammer and flat/cross-head hand drivers; contact IKEA if uncertain. P. 3 is fittings and supplied tools. P. 12 below fig. 16 is an unnumbered use inset: lift a leaf, swing its gate, and seat the underside locating pin in the gate post. It illustrates one side; repeat with the independent gate on the other side. There is no fig. 17, extra hardware, loading instruction or load rating in the inset. There is no separately illustrated optional accessory or edition route.

## Stock and route balance

|Source|Stock and disposition|
|---|---|
|p. 3, base fittings|4 `105330` long hex bolts, 8 `101352` long dowels, 4 `121121` cross barrels, 4 `107271` round glides, 2 `156508` two-peg gate glides, 2 `120139` slotted mounting plates. All installed.|
|p. 3, tabletop fittings|4 `10005601` two-flange hinges, 42 `100372` short countersunk screws: 4 outer plate holes + 32 hinge holes + 6 plate-to-top holes. All installed.|
|p. 3, drawer fittings|24 `110519` hammer pins, 24 `112996 / 118331` alternate-marked cam studs (one family, not two allocations), 12 `101345` short dowels, 24 `110689` drawer cams. All installed, four pins, four studs, two dowels and four cams per drawer.|
|p. 3, tools|1 `10083377` angle hex key, 1 `110018` stubby cross-head screwdriver; supplied, never installed.|
|Unnumbered table pieces|Two fixed side ladders, each with an already hinged gate frame; two low crossblocks; one narrow center top; two separate drop leaves, each with one factory-fitted underside locator pin. Gate pivots and locator pins have no loose-stock count.|
|Unnumbered drawer pieces|Six sets of two handed side panels, one rear panel, one bottom panel and one notched-grip front. No extra knobs, drawer runners or loose center stop fittings are shown. Slide on existing rails in the side ladders.|
|External|Hammer, flat-head screwdriver and cross-head hand driver as called out on p. 2 (the stubby cross-head on p. 3 is supplied), protected working surface and second person. No wall attachment or external fastener.|

154 numbered fittings installed plus 37 structural units = 191 installed IDs. Two additional pictured tools = 193 supplied pieces. No removals, spares or optional packet balance is inferred. The supports and their preinstalled pivots are parts of the two frame units; the two visible leaf pins are parts of the leaves.

## Ordered figures

|Step|PDF p.|New stock, reuse, motion and handling|
|---:|---:|---|
|1|4|Start with the two side frame units, with their hinged gates positioned as pictured. Prepare two low crossblocks: at each of four ends push 2 × long `101352` into the outer holes; leave the center through-hole for the bolt, and do not use `101345`. Bring the side units onto the keyed joints.|
|2|5|Lay two `120139` plates across the upper ends of the frame. Drive 4 × `100372` in the plates' small outer round holes only, not the slots.|
|3|5|On the protected surface, arrange the center top and both leaves upside down. Fit 4 × `10005601`, two at each seam, with 8 × `100372` per hinge (32 total). Align the barrels down each seam; the locating pin already shown on each leaf is not separately fitted.|
|4|6|With the base upside down and gates tucked against it, insert 4 × `121121` in the crossblocks and align their cross holes with the bolt axis. Tighten 4 × `105330` through the uprights with the supplied `10083377`. Plates and step-2 screws turn with the base.|
|5|7|Lower the same inverted base over the center of the three-panel top; first fit 2 × `100372` through the middle round holes, then 4 × `100372` through the slots (two each plate). Do not refit the four outer screws.|
|6|8|Tap 4 × `107271` into the round single holes of the fixed feet.|
|7|8|Tap 2 × `156508` into the paired holes of the free gate feet. Swing the two leaves toward the underside of the table as pictured; then turn the assembly upright with a helper (p. 2). Keep both gates and leaves folded.|
|8|9|Begin six identical drawer builds. Per drawer, start 2 × `110519` in the left side's rear through-holes, from the indicated face, with a hammer.|
|9|9|Offer that prepared side to the drawer back with the grooved edges keyed together; keep the same started pins.|
|10|9|Tap both started `110519` into the rear panel to complete the joint; no new fittings.|
|11|10|Turn that joined side/back together and slide the bottom panel into the grooves.|
|12|10|Fit the opposite side over the bottom/back grooves and tap 2 × `110519` through its rear holes; 12 additional pins across all drawers.|
|13|11|Lay each grip-notched front face-down and drive 4 × `112996 / 118331` into the marked holes with `110018` (24 total).|
|14|11|Use 2 × short `101345` per drawer in the side-to-front joint (12 total). Turn the partial drawer and seat it over the prepared front, with the bottom edge in its groove.|
|15|11|Insert 4 × `110689` per drawer from the inside faces and turn to lock onto the studs (24 total).|
|16|12|Turn and slide all six assembled drawers into the rail bays; three enter from each opposite end. Leaves and gates stay folded. Link (not renumber) the separate leaf operation below this figure.|

## Model and verification limits

Millimetres: +X right along the span of the tabletop leaves, +Y up, +Z toward the front drawer bank, nominal center at floor level. Board thickness, clearances, hinge positions, pilot hole sizes, pin/receiver depth and demonstration travel are diagram-based; this is not a tolerance, load, clearance or fit certification. The leaf hinges carry their leaf-side screws, the gate feet carry their two-peg glides, and each drawer keeps all its fittings during insertion. Original procedural geometry and original SVG; no IKEA page renders, CAD or photos ship with the guide.

`node --test products/norden/model.test.js products/norden/geometry.test.js`: seven passed. `npm run manual:prepare -- norden`: ten preview pages. [Production audit and commands](../../README.md#catalog-verification).

In Chromium, inspected `105330`, replayed fig. 3 / p. 5, checked the Back/Next pose and closed the loaded preview without seeking. Complete kept both leaves folded at fig. 16 / p. 12, with 191 pieces placed. The use figure opened both leaves and gates, and Reset restored the folded canvas; keyboard use at 390 × 844 with reduced motion jumped to the open pose. Opening Jump or returning to inventory during the motion cancelled it. Forcing WebGL context loss during playback kept Complete and the p. 12 link, hid the use button and left Back working. Blocking the product scene and PNGs on reload also preserved text-only navigation.
