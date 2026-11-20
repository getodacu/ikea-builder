# MALSJÖ source ledger

This independent guide supplements the [official IKEA MALSJÖ black-stained sideboard manual](https://www.ikea.com/us/en/assembly_instructions/malsjoe-sideboard-black-stained__AA-1848992-8-2.pdf). Edition: US-linked, multilingual; file `AA-1848992-8-2`, footer `AA-1848992-8`, dated `2021-02-23`, 56 PDF pages, SHA-256 `daed552aff65aba9ba7b659af284ed1a0cc1e3b2cb7b2842c3fcaed039923a41`. Use the edition as the identifier, not an inferred article number. PDF pages below are one-based. Figures were rendered locally with `pdftoppm`; no source media is redistributed.

From the ikea-builder checkout, use Node 24 and run `npm ci`, `npm test`, and `npm run build`. Use `npm run dev`, or run `npm run preview -- --host 127.0.0.1 --port 5198 --strictPort` and open `http://127.0.0.1:5198/?product=malsjo`.

For optional PDF page previews, install Poppler (`brew install poppler` on macOS) and run `npm run manual:prepare -- malsjo` from the checkout with HTTPS access to IKEA. The command verifies the pinned SHA-256 before rendering and stores the PDF and PNGs under `$HOME/.cache/assembly-3d/malsjo/AA-1848992-8-2/`, outside the project. Vite dev and preview serve the cache only over loopback. Without a prepared cache, or on a public host, use the official page links.

The workbench fills the viewport without entering browser fullscreen. Tab to the instruction rail to scroll it with the keyboard. The chapter strip scrolls horizontally on narrow screens, and the IKEA manual opens in a separate scrollable panel.

During playback the automatic camera frames the active contact and looks obliquely into the receiving face. Staging beats keep a wider view. The camera takes 450 ms to approach the first joint, 300 ms to turn between joints, and 800 ms to return to the overview; part movements still use 700 ms per operation.

In the settled overview, steps with multiple mounting actions or multiple fitted parts mark each affected part with a lime dot at its installed position. The dots stay visible over the wood so covered fittings are still easy to locate.

Reviewed seven alternatives: [HEMNES](https://www.ikea.com/us/en/assembly_instructions/hemnes-daybed-frame-with-3-drawers-white__AA-1917803-6-2.pdf) (36 pages), [BRIMNES](https://www.ikea.com/us/en/assembly_instructions/brimnes-daybed-frame-with-2-drawers-gray__AA-1086559-14-100.pdf) (36), [FLEKKE](https://www.ikea.com/nz/en/assembly_instructions/flekke-day-bed-frame-with-2-drawers-white__AA-1866851-18-100.pdf) (48), [MALM](https://www.ikea.com/us/en/assembly_instructions/malm-storage-bed-dark-brown-veneer__AA-2055625-9-100.pdf) (40), [IDANÄS](https://www.ikea.com/nl/en/assembly_instructions/idanas-bed-frame-white__AA-2213685-5-100.pdf) (24), [TUFJORD](https://www.ikea.com/us/en/assembly_instructions/tufjord-upholstered-bed-frame-tallmyra-black-blue__AA-2408713-2-100.pdf) (28), and [KALLAX](https://www.ikea.com/ae/en/assembly_instructions/kallax-desk-black-brown__AA-2448323-3-100.pdf) (44). MALM's lift is the strongest alternative; MALSJÖ has more distinct interfaces (wall fittings, paired door tracks and locks, handed runners, and two drawer builds).

- P. 1 cover; pp. 2–5 multilingual tip-over warning; p. 6 protected surface, two-person preparation, slotted and cross-head screwdrivers and hammer. External tools and suitable wall screws/plugs are not kit instances.
- P. 7 packet 1 (137, including key `100001`); p. 8 packet 2 (66); p. 9 packet 3 (66) and four loose catches; p. 10 fifteen other loose items, including cable cover `147901`. `118331` / `112956` are alternate identifiers for the same pictured bolt; packet 1 and 3 contribute 18 + 8. `100362` = 20 + 24; `109560` = 1 + 8; `100404` = 2 + 4; `139343` and `145571` = 8 + 2 each.
- Pp. 11–52: 73 numbered figures. Packet-opening and informational icons point to pages, not extra steps. Pp. 53–55: drawer adjustment/removal, door adjustment, and optional light-cable routing, respectively. P. 56 colophon.
- 31 unnumbered physical pieces: four plinth rails and base; two framed sides, two cross rails, two dividers, one folding captive back, top, two shelves, two already-framed doors; ten principal drawer boards, three fixed drawer partitions, and one already-built removable organizer tray. The three partitions are the step-52 board and two dashed boards in step 59. The tray in step 61 is not the drawer from step 60. The right drawer has the organizer; the left does not (p. 42).
- Full Unbox: **319** = 137 + 66 + 66 + 19 + 31. With skirting: **317** mandatory installed plus one supplied key and one optional cable cover. Without: **315** mandatory, same key/cover, two unused spacers. Both branches use the two wall brackets, two washers, and two covers. The p. 30 no-skirting arrow goes to p. 32 / step 33; only printed 31–32 are bypassed. P. 39 alternatives use one bumper and one screw; only their location changes. No component extracted from a captive fitting adds another physical ID.

## Numbered figure evidence

`New` counts a piece when prepared or joined for the first time, not when its module is transported. `Reuse / adjustment` gives the retained participants and the reason (receiving structures remain installed and are not counted as new). Screws and similarly named fittings are keyed by the lead visible number.

| Step | PDF | New | Figure evidence; reuse / adjustment |
|---:|---:|---:|---|
| 1 | 11 | 24 | Four plinth rails, 10 `102553` brackets (4/2/2/2) and 10 `100362`; bevel and straight end insets differ. |
| 2 | 12 | 2 | One `118331` in each end rail. |
| 3 | 12 | 2 | `101350` in the two ends of the straight long rail. |
| 4 | 13 | 2 | Stand and join three rails; two `113434` cross cams turn to lock. `118137` crossed out. |
| 5 | 13 | 4 | Four `113434` in the beveled rail, two per end. |
| 6 | 14 | 4 | Four `123026`; turn existing cams to the stop mark, not past it. |
| 7 | 14 | 0 | Turn and seat the existing beveled rail and its fittings in both end rails. |
| 8 | 15 | 4 | Four `113434` in the end-rail bores while holding the corners flush. |
| 9 | 16 | 0 | Turn eight existing cross cams at the two beveled-rail joints. |
| 10 | 16 | 11 | Base panel and 10 `100362` through the existing angle brackets. |
| 11 | 17 | 6 | Six `107971` feet in paired holes: two per end rail and one centered on each long rail. |
| 12 | 17 | 6 | Two handed side frames, two `118331` per inside face at the rail stations. |
| 13 | 18 | 10 | Plain and grooved cross rails and eight `101350`, two per end. |
| 14 | 18 | 0 | Stand both framed sides open, raise the plain and grooved rails between them, then close each side onto the rail ends. |
| 15 | 19 | 4 | Insert and tighten four `118137` over the prepared bolts at the rail ends. |
| 16 | 20 | 3 | Lower divider and two `100214` with `100001`; two people, edge-hole orientation inset. |
| 17 | 21 | 2 | Two `118331` at the centers of the cross rails. |
| 18 | 21 | 1 | Upper divider slides onto existing bolts, small bore as shown. |
| 19 | 22 | 2 | Two `118137` in the upper divider; rotate to lock. |
| 20 | 22 | 6 | Roll the case; fit six `101350` at the exposed bottom edges (three pairs). |
| 21 | 23 | 4 | Turn prepared plinth base; add four `118331` at its ends. |
| 22 | 23 | 2 | Bring prepared base to case, orient front tracks; two `100214` into the lower divider. |
| 23 | 24 | 4 | Four `118137` secure the base; finish by standing the full case on its feet. |
| 24 | 25 | 1 | Folded back is one piece; unfold at the illustrated hinge and lower into the channels. |
| 25 | 26 | 7 | Top panel upside down, six `118331` on its underside. |
| 26 | 26 | 6 | Six `101350` at exposed top edges, three left/center/right pairs; flip and seat the existing top and bolts. |
| 27 | 27 | 6 | Six `118137` below the top, then turn cabinet to show the back. |
| 28 | 28 | 24 | Twelve `130616` sockets and twelve `130617` pins; the two-piece fittings click. |
| 29 | 28 | 2 | Two `109562` through the indicated back holes; light cable is reference p. 55 only. |
| 30 | 29 | 2 | Seat two `141413` sideways into the rear stiles; both wall routes. |
| 31 | 30 | 2 | Skirting only: screw two `141414` into the brackets; keep the pictured engagement. |
| 32 | 31 | 0 | Skirting only: turn the cabinet to face out against the skirting, then adjust both `141414` to the stationary wall. |
| 33 | 32 | 4 | Both routes: from inside the cabinet, use suitable external fixings through two `126916` with the dished face toward the screw head; click on both `133304` covers. |
| 34 | 33 | 3 | `151127` on the outer right bay side, two `120639`. |
| 35 | 33 | 3 | `151128` on the outer left bay side, two `120639`. |
| 36 | 34 | 3 | Second `151127` on the divider's left face, two `100365`, not `100362`. |
| 37 | 34 | 3 | Second `151128` on the divider's right face, two `100365`, not `100362`. |
| 38 | 35 | 16 | Eight `139343` and eight `145571`, in pairs at shelf support points. |
| 39 | 35 | 2 | Introduce the two shelves; tilt each in and lower onto its four supports. |
| 40 | 36 | 4 | Both framed doors laid flat, two `128258` dampers with opposite ends as pictured. |
| 41 | 37 | 12 | Four `144641` striker plates, two `100362` per plate. |
| 42 | 37 | 12 | Four `144637` lower rollers, two `100362` each. |
| 43 | 38 | 12 | Four `144638` upper locks, two `100362` each. |
| 44 | 38 | 4 | Present the prepared doors upright; two `146190`, one `100404` each from the back. |
| 45 | 39 | 2 | One `123805` + one `109560`; right or left location only. Left-hand reference figure is the right-stop default. |
| 46 | 40 | 0 | Rear/inner track first; lift top, angle and seat both lower rollers, lock both captive upper tabs until the pictured click. Wrong track crossed out. |
| 47 | 41 | 0 | Front/outer track; same top-in, bottom-seat, upper-lock order for the other door. Door adjustment stays at reference p. 54. |
| 48 | 42 | 6 | Organizer drawer sides; four `101345`, two per leading end. |
| 49 | 43 | 5 | Organizer drawer front and four `118331` / `112956`. |
| 50 | 43 | 0 | Seat prepared sides on the front; keyed edge details in both insets. |
| 51 | 43 | 4 | Four `131361`; turn to catch front bolts. |
| 52 | 44 | 3 | First (fixed) partition and two `101345`. |
| 53 | 44 | 0 | Seat the prepared partition into its marked holes, not the neighboring hole. |
| 54 | 44 | 1 | Drawer bottom slides along grooves to the front. |
| 55 | 44 | 1 | Start one end of the back at the notched side, swing the other end down, then seat it over the bottom edge. |
| 56 | 45 | 6 | Hammer six `110519`: four through sides and two through rear into the fixed partition. |
| 57 | 45 | 6 | One each `144291` and `144290` (left/right in underside view), two `109560` each. |
| 58 | 46 | 2 | One `139343` + `145571` centered under the drawer front. |
| 59 | 46 | 6 | Turn drawer upright; two additional partitions, four `109504` (two per partition). |
| 60 | 47 | 4 | Two `141144` knobs and two `100404`. |
| 61 | 47 | 5 | Separate supplied organizer tray, four `122353` at underside corners; turn and place in the right drawer. |
| 62 | 48 | 6 | Plain drawer sides and four `101345`. |
| 63 | 48 | 5 | Plain drawer front and four `118331` / `112956`. |
| 64 | 49 | 0 | Seat the existing sides on the front as shown. |
| 65 | 49 | 4 | Four `131361`; turn to lock the front. |
| 66 | 49 | 1 | Slide the plain drawer's bottom along both grooves. |
| 67 | 49 | 1 | Start and swing the plain drawer's back in the same way, then seat it over the bottom edge. |
| 68 | 50 | 4 | Hammer four `110519` through the side ends; no fixed partition fasteners here. |
| 69 | 50 | 6 | One each `144291` and `144290`, secured by four `109560`. |
| 70 | 51 | 2 | One `139343` + `145571` centered under the front. |
| 71 | 51 | 4 | Turn upright; two `141144` knobs and two `100404`. |
| 72 | 52 | 2 | Two `150980` caps on the inside back of the plain drawer. |
| 73 | 52 | 0 | Align and push both already prepared drawer modules onto the cabinet runners. |

For the authored default route, unique IDs **moved / adjusted** per step (step numbers not listed: 0 / 0). These include fittings carried by a rigid module but exclude stationary receivers. An ID can be both moved and adjusted.

```text
4:19/2  6:0/4  7:17/0  8:0/4  9:0/8  14:16/0  15:0/4  19:0/2
20:28/0  21:59/0  22:63/0  23:103/4  24:1/1  26:7/0  27:123/6  32:153/2
39:2/0  44:40/0  45:44/0  46:22/2  47:24/2  50:6/0  51:0/4
53:3/0  59:34/0  61:5/0  64:6/0  65:0/4  71:29/0  73:84/0
```

Without skirting omits 31–32 and moves 151 IDs at 33. With the left door stop, the two stop IDs ride with step 46 instead of 47 (24 and 22 moved, respectively).

## Geometry and rights

Original Three.js primitives and triangulated recesses only. The viewer uses a dark gray finish; the linked manual covers the black-stained model. Bore and pocket positions follow the authored fastener and mating-part poses. The drawer-bottom and case-back grooves are open in the meshes. All positions are schematic millimeters, +Y up, +Z front, origin at finished footprint center. The 1450 × 920 × 480 mm envelope is a diagram-scale estimate, **not a product specification**. Silhouette cues come from pp. 1 and 52. Step 26 seats at the two side edges and upper divider; runner handedness and relative placement come from pp. 33–34. Pp. 40–41 determine the seating order and upper lock throw. The door datums are nominally Z 167 / 209; the corresponding track centers are Z 154 / 196 at the rear-mounted fittings.

All fastener hole centers, trim sizes, groove cross-sections, hinge and latch travel, approach offsets, and camera targets are nominal reconstructions from these figures, not measured dimensions. The illustrative wall is not a drilling template and the viewer never certifies anchoring, fit, clearance, or load. The setup tools and wall fixings are described, not pictured as supplied parts. The production build ships no IKEA PDF or page images and generates its dependency notice from Vite's license configuration.

The reader asks for wall fit at step 30 before advancing, but still allows jumping to a numbered figure. Short windows and phones use one scrolling page with sticky playback controls. The last figure remains visible at guide completion; its links cover drawer and door adjustment.

During bolt and screw replays, lime rings mark the modeled openings on the receiving surfaces. The camera frames the group before the fasteners move in. Pause and orbit to inspect an opening; the rings clear when the fitting operation ends.

## Verification

`npm test` checks the printed page sequence and supplied quantities, all four route combinations, exact boundary snapshots, and targeted joint, wall and drawer geometry.

**IKEA Builder checks (Node 24.19.0):** `npm ci`, `npm test` (15 passing), and `npm run build` succeeded. All four routes reconcile at every boundary, and camera/hold timing and sampled frames matched the copied example on all four routes. The build contains notices and no PDF or PNG media.

**Production Chromium at `127.0.0.1:5198`:** Unbox showed 319 supplied / 0 placed; step 1 showed 24 placed and linked p. 11. Replay, pause/resume, Back and seeking returned to the same boundaries. At 30, Next gated on a wall-fit choice and then advanced to 31 with skirting or 33 without; step 33 kept the two-bracket warning and p. 32. Changing the stop side retained focus. Step 73 showed 317 placed with skirting and 315 without, plus both adjustment links. Verified the bolt and step-26 dowel views, keyboard entry and reduced motion at 320 × 720, catalog links without JavaScript, and navigation with the scene chunk and thumbnails blocked.

**Private previews:** The existing cache served p. 32 as `image/png`; opening and closing it kept step 33. A non-local Host, off-list page, and POST returned 404. The cache was already prepared, so a fresh IKEA download and Poppler run were not exercised. No physical fit, clearance, anchoring, or load verification.

**Historical example checks:** Chromium production preview was walked from Unbox through 73 at 1440 × 900 with playback and at 320 × 720 and 667 × 375 with reduced motion. The review also exercised both wall routes, the left door-stop choice, keyboard navigation, orbit/reset and the cached p. 32 preview. Blocking the production scene and manual-image requests preserved the reader and official links. The example build contained no PDF or PNG manual media. None of these checks establish physical fit, clearance or anchoring.

**Completed-view audit:** The pinned p. 52 endpoint retained both drawers across all four stop-side and wall-fit combinations in the production Chromium view. Step 73 remained the source for completion (317 placed with skirting, 315 without); the p. 2 warning and pp. 53–54 references stayed available. The stop and spacer IDs were reconciled in the model; they are not visible from the default front angle.
