# EKEDALEN — 703.408.07

White extendable dining table, 120/180 × 80 cm. Published dimensions come from [the IKEA Türkiye English article](https://www.ikea.com.tr/en/product/ekedalen-white-seats-4-6-extendable-dining-table-70340807), which links this [24-page PDF](https://image-ikea.mncdn.com//montaj-kilavuzu/70340807_70340807_1.pdf). The article-number filename has no edition token. Printed edition `AA-1934520-19`, dated 2022-03-10 on p. 24. SHA-256 `32ebf3c693bbf49d18245de4e123257cc970b6bee6ac1a8eeb2bd7d700cdde83` checked with `shasum -a 256`; `pdfinfo` reports 24 pages. Figures and insets read from Poppler renders; this is not the US `AA-1934526-19` document.

## Stock and setup

- P. 2: bring cross-head and slotted screwdrivers; use a protected assembly surface; contact IKEA if unsure. P. 15 step 20 crosses out the powered driver.
- P. 3 packet 1: `154409` ×13, `114613` ×4, `101350` ×14, `154954` ×8, `109021` ×20, `113434` ×12, `156685` ×4. Packet 2: `100041` ×4, `100038` ×4, `110912` ×4, `100843` ×8, `100712` ×8, `107271` ×4, supplied hand wrench `120202` ×1.
- P. 4 packet 3: `10062668` ×1, `10082399` ×4, `109067` ×2, `10064763` ×2, `10082205` ×2. Loose `122483` ×4.
- Unnumbered stock: top and leaf, two handed top guides, two carrier end battens, two carrier crosspieces, two slotted side rails, two end aprons, four legs (two matched pairs), two leaf locating blocks. There are 141 physical instances including the wrench; 140 placed. No route exclusions or removed stock. The wrench stays in inventory. No external stock is placed.
- P. 1 is cover; pp. 2–4 setup/stock; pp. 23–24 are use/storage/extension references, not assembly steps.

## Printed order

|Step|PDF|New IDs / quantities|Existing parts, fit or adjustment|
|---:|---:|---|---|
|1|5|`top`, `154954-1…8`|Turn the top underside up on protection; start four cam studs per long edge.|
|2|5|`guideRear`, `guideFront`, `101350-1…2`|One dowel in the indicated side face/end of each guide.|
|3|6|—|Lower the guides onto the studs, channels inward, and keep the attached dowels.|
|4|6|`113434-1…8`|Four cams face inward in each guide; turn to lock.|
|5|7|`battenR`, `battenL`, `114613-1…4`|Two long cam studs in each batten.|
|6|7|`156685-1…2`|A stop stud beside the indicated cam stud on each batten.|
|7|8|`slatRear`, `slatFront`, `101350-3…10`|Two dowels per end, four ends; close battens onto both crosspieces.|
|8|8|`101350-11…14`|One outer bore at each exposed batten end.|
|9|9|`slideRear`, `slideFront`|Capture all four dowels; slotted faces outward.|
|10|9|`113434-9…12`|Seat and turn two cams per side.|
|11|10|`apronSlide`, `10062668-1`, `109067-1…2`|Face the catch lever as pictured and use the short packet-3 screws.|
|12|10|`122483-1…2`, `109021-1…8`|Turn the caught apron and orient both angles; two screws per angle flange (four flanges).|
|13|11|—|Turn the complete carrier and feed both channels on together; the pictured face, not the exposed cam/stop face, points up.|
|14|11|`156685-3…4`|Use one stop screw on the visible side of each long carrier member.|
|15|12|`10082205-1`, `10064763-1`, `10082399-1…2`|Set the pin into the keeper groove and mount it to the tabletop under the carrier opening.|
|16|13|`154409-1…10`|Three long screws per side at the first pattern and two per side at the second.|
|17|13|`apronFixed`|Lower the apron into the remaining end, with its top-edge bore uppermost.|
|18|14|`122483-3…4`|Two remaining angles; align both flanges of each to the rail and apron.|
|19|14|`109021-9…16`|Four two-screw flange sets secure both angles.|
|20|15|`154409-11…13`|Drive the three long apron screws by hand.|
|21|15|—|Slide the existing carrier closed until the catch clicks.|
|22|16|`legRF`, `legRR`, `110912-1…2`, `100038-1…4`|Use the two pictured fixed-end legs, align the barrel threads with the stud holes, and use the four **short** studs.|
|23|17|—|Fit those same leg assemblies into the fixed-end corner angles.|
|24|18|`100843-1…4`, `100712-1…4`|Press legs into position, equalize the reveals, then use the supplied hand wrench.|
|25|19|`legLF`, `legLR`, `110912-3…4`, `100041-1…4`|Set the remaining leg barrels; use four **long** studs.|
|26|19|—|Fit those same leg assemblies into the sliding-end angles.|
|27|20|`100843-5…8`, `100712-5…8`|Equalize both reveals and tighten with the same wrench.|
|28|21|`107271-1…4`|Press one glide into each leg foot.|
|29|22|`leaf`, `locatorRear`, `locatorFront`, `109021-17…20`|Underside up, fit two locating blocks at the same edge with two packet-1 screws each; do not use the countersunk screws.|
|30|22|`10082205-2`, `10064763-2`, `10082399-3…4`|Set the other pin in the other keeper, then screw it to the separate center receiver on the opposite edge of the same leaf. See pp. 23–24 for unlocking, sliding, using or storing the leaf, and relocking.|

## Geometry and limits

Original procedural Three.js meshes. Millimetres; right-handed datum at the middle of the closed top projected onto the floor, +x right along its length, +y up, +z toward the viewer in the finished view. The numbered kit is assembled top-down in the manual and the scene retains that orientation; the leaf is a separate working piece at 29–30. Overall top width/length and leaf extension follow the article. Rail section, keyed bores, offsets, corner connections, latch, and fastener proportions are diagram-based estimates. The carrier moves as a rigid set; latch and tool depiction does not represent real forces, clearances, load, fit, or torque. The p. 11 view checks opposing guides and whole-carrier direction; p. 22 independently distinguishes the two locating-block receiver pairs from the keeper pair and the countersunk screws from the packet-1 screws.

## Verification

Node 24: `node --test products/ekedalen/model.test.js products/ekedalen/geometry.test.js` passed all six checks, including the two opposed channels, the leaf's three drilled fitting locations, and stock and replay boundaries. `npm run manual:prepare -- ekedalen` verified the pin and prepared 19 cached preview pages. In Chromium at 1440 × 960, selected the guide-rail family, replayed 29, opened and closed cached p. 22 without advancing, went back to 28 and advanced to 30; the studio showed 140 placed and linked official pp. 22–24. At 390 × 844 with reduced motion, used Enter on Start, Jump, Back and Next to complete on 30. A fresh reload with the exact lazy scene request and cached PNG requests blocked retained step 30 text, Jump and the official p. 22 link.

The built preview also retained the text-only path when its hashed scene chunk was blocked. `dist/THIRD_PARTY_NOTICES.md` was present and no PDF/PNG was bundled. On the loopback preview server, p. 22 returned `200 image/png`; the same request with `Host: preview.example` returned `404`.

**Completed-view audit:** The lower p. 24 figure shows the upright 1,800 × 800 mm configuration. The completed view opens the moving end along the existing guides and seats the leaf beside the fixed top, carrying its keeper and locators; steps 21 and 29–30 retain their closed-carrier and separate-leaf poses. The model test checks coplanarity, the four glides, moving-leg hardware and unchanged numbered state. Production Chromium showed the whole table, restored the same frame after rotate/reset, and returned to the p. 22 bench pose on Back. Inspection, pause/resume, the cached p. 22 dialog, delayed 3D load and context loss kept the expected reader state. The static catch depiction does not certify engagement, strength or clearance.
