# NÄMMARÖ source ledger

- [Official US article](https://www.ikea.com/us/en/p/naemmaroe-chaise-outdoor-light-brown-stained-30503354/): light brown stained outdoor chaise, article 305.033.54. Total length 76 in., total width 26⅜ in., maximum height 30¾ in.; seat height 11¾ in., seat width 22½ in., seat length 45¼ in., backrest length 29⅞ in. The article describes a backrest adjustable to five positions. Wood is stained solid acacia; the wheel covers are thermoplastic elastomer.
- [Official PDF](https://www.ikea.com/us/en/assembly_instructions/naemmaroe-chaise-outdoor-light-brown-stained__AA-2307889-5-100.pdf), linked from that article: edition `AA-2307889-5-100`, footer `AA-2307889-5`, date `2026-02-05` (p. 16), 16 pages. `shasum -a 256` returned `aecd32830f1f4b46bfea6c1338bbc17dfb65005d65d07f976c5e45f2c16c95f1`; `pdfinfo` confirmed 16 pages. Inspected the Poppler renders of all 16 PDF pages; numbers below are one-based PDF pages.
- P. 1 is the cover; p. 2 shows a slotted screwdriver, two people, a protected work surface and consulting IKEA if unsure. P. 3 is the fittings/tools inventory. P. 5 includes a pinching inset before the upside-down deck is handled. P. 15 shows two people turning the chaise upright, repeats the pinching inset, and illustrates lifting and propping the backrest. P. 15 is not a numbered assembly step. P. 16 is the colophon. No alternate assembly, cushion, or cover is supplied by this article.

## Stock and balance

|Source|Physical stock|
|---|---|
|p. 3 fittings|2 × `10089529` axle bolt; 2 × `113134` foot-end hex-socket bolt; 4 × `114729` slotted-end leg stud; 2 × `128832` dowel; 2 × `117215` long wheel sleeve; 2 × `112074` short wheel sleeve; 4 × `116562` leg barrel nut; 2 × `10089533` wheel-end brace barrel nut; 2 × `113153` foot-end brace barrel nut; 4 × `114577` hex nut; 6 × `117217` flat washer; 4 × `106675` split washer. 36 fittings. No alternate markings or packet split pictured.|
|p. 3 supplied hand tools|1 × `128632` combination wrench; 1 × `100001` bent hex key. Both remain tools, not installed stock.|
|pp. 4–11 unnumbered pieces|One slatted chaise deck assembly with captive pivoting backrest and support, two hand-specific wheel-end legs, two hand-specific padded foot-end legs, one wheel-end brace with integral end tongues, one foot-end drilled brace, and two wheels with integral covers (9 installed pieces). Corner brackets, pivot, catches and foot pads are already fitted, not separate kit items.|
|p. 2 external|Slotted screwdriver, surface protection and a second person. No additional fixings are specified.|

47 supplied units as above: 45 installed and two tools remaining, no unused fittings or removals. The two wheel stacks and four leg studs are carried into their receivers, not reissued. Installed stock remains unchanged during the turn and backrest adjustment.

## Ordered figures

|Fig.|PDF p.|New stock, reuse and adjustment|
|---:|---:|---|
|1|4|Lay out four legs on the protected surface; use the four marked `116562` nuts, not either brace nut variant. Insert into the open end of each leg and align its side thread with the drilled hole; turn in one slotted `114729` stud per leg, leaving the protruding ends for mounting.|
|2|5|Introduce the preassembled deck upside down on protection and mount the two axle-bored wheel-end legs using the same two prepared studs. Match the depicted paired drillings at the bracket and leave the single large axle openings facing outward at the free ends. Keep fingers out of pinch points around the folded backrest and the frame.|
|3|6|Between the wheel-end legs, engage the brace's two integral end tongues with the illustrated inboard openings; its barrel drillings face up in the work pose.|
|4|6|Insert 2 × `10089533` into that brace, not `113153`; line up the sideways threads for the axles.|
|5|7|Make two identical loose wheel stacks. From hex head toward the threaded tip: `10089529`, `117217`, long `117215`, wheel, `117217`, short `112074`, then `117217`. Long/short sleeves are not interchangeable; one axle per wheel.|
|6|8|Bring the same two complete axle stacks in from opposite outside faces through their respective rear legs and into the brace nuts. Use the combination wrench (`128632`) on the hex heads and a slotted screwdriver to hold/align the barrel nuts.|
|7|9|At the wheel-end corner brackets, add 2 × `106675` split washer and 2 × `114577` nut to the leg studs installed in fig. 1; tighten in place with the ring end of the supplied wrench. Do not put these nuts on the wheel axles.|
|8|10|Fit the other two legs at the foot end using their prepared studs. Keep their paired small holes toward one another at the padded free ends, not toward the outside.|
|9|11|Prepare the loose foot-end brace with 2 × `128832` in the designated holes below the bolt holes in the pictured work pose. Keep the two barrel pockets on the access face.|
|10|11|Engage the same brace and attached dowels between the two foot-end legs; align each dowel with the matching small leg hole and leave the brace barrel pockets accessible.|
|11|12|Insert the two smaller `113153` barrel nuts into the foot-end brace, cross-thread entrances aligned with the bolt bores.|
|12|13|Insert 2 × `113134` from the outside faces through the padded legs into the brace nuts, using the supplied `100001` key and a slotted screwdriver on the barrels.|
|13|14|At the foot-end corner brackets, add the remaining 2 × `106675` and 2 × `114577` on the already installed leg studs and tighten with the wrench. Then see p. 15: two people turn the whole chaise upright, keeping fingers clear of pinch points.|

## Model fidelity and verification

Original procedural Three.js meshes and hand-authored transparent SVG; nothing is traced or redistributed from the PDF or article. Millimetres, +X to the right (foot end), +Y up, +Z toward the viewer, origin below the nominal center at the final floor. Article dimensions establish the envelope; section sizes, drill diameters, depths, clearances, pivot and latch geometry are diagram estimates. The numbered model stays on its protected upside-down work face from fig. 2 through fig. 13. A slight opening at each loose leg joint is an illustrative way to show both brace ends engaging, not an additional figure or a calibrated clearance. The same installed IDs turn upright for Complete. The optional use demonstration shows one schematic support detent, not calibrated angles, fitting tolerances, or a load rating. Consult the official diagram before assembly, turning, or adjusting the chaise.

`node --test products/nammaro/model.test.js products/nammaro/geometry.test.js`: seven passed. `npm run manual:prepare -- nammaro`: twelve preview pages. [Production audit and commands](../../README.md#catalog-verification).

In Chromium, inspected `113134`, replayed fig. 5 / p. 7, returned to the same source and pose via Back/Next and closed the loaded preview without seeking. Complete showed the 45-piece chaise upright and flat, retained fig. 13 / p. 14 and linked the p. 15 two-person turn and pinch warning. The use control raised the backrest onto the support; Reset restored it flat. Keyboard use at 390 × 844 with reduced motion went directly to the raised pose. In the text-only reload the turn, warning and use reference survived without the demo or thumbnail.
