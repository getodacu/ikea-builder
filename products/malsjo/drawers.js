const DOWN = [0, -1, 0];
const IN = [0, 0, -1];
const UP = [0, 1, 0];
const X = [1, 0, 0];
const Z = [0, 0, 1];
const FACE_DOWN = [0, Math.SQRT1_2, -Math.SQRT1_2];
const WORK_Z = 945;
const FLAT_Y = 18;
const UPRIGHT_Y = 91;
const SIDE_X = [-312.5, 312.5];
const BOLT_Y = [34, -12];
const DOWEL_Y = [11, -37];
const DIVIDER_X = -110;

export default function author({ step, place, placeAlong, fast, move, adjust, shot, pose, compose, ids, shapes }) {
  const flatPose = (x, y, z) => pose(x, y, z, FACE_DOWN, Math.PI);

  function drawer(compartment) {
    const prefix = compartment ? 'dR' : 'dL';
    const x = compartment ? 560 : -560;
    const front = `${prefix}Front`;
    const sides = [`${prefix}SideL`, `${prefix}SideR`];
    const back = `${prefix}Back`;
    const bottom = `${prefix}Bottom`;
    const members = [front, ...sides, back, bottom];
    const divider = 'dRDivider';
    const partitions = ['dRDividerA', 'dRDividerB'];
    const tray = 'dRTray';
    const sideDowels = [];
    let frontBolts, dividerDowels;
    const label = compartment ? 'Compartment drawer' : 'Plain drawer';

    // The manual shows the front laid face down, with its bottom edge toward the viewer.
    const flat = (dx, dy, dz) => [x - dx, FLAT_Y - dz, WORK_Z - dy];
    const upright = (dx, dy, dz) => [x + dx, UPRIGHT_Y + dy, WORK_Z + dz];
    const fit = (...args) => {
      const fitted = fast(...args);
      members.push(...fitted);
      return fitted;
    };
    const turn = () => {
      move([...members], front, [
        flatPose(x, 112, WORK_Z),
        pose(x, 112, WORK_Z, UP, Math.PI),
        pose(x, 112, WORK_Z),
        pose(x, UPRIGHT_Y, WORK_Z),
      ], [], X, upright(0, 0, 0), `Turn the ${label.toLowerCase()} upright`);
      shot(null,[-.45,.31,.88],1200);
    };

    const sidePrep = i => [x + (i ? -103 : 103), 26, WORK_Z + 290];
    const sideAngle = i => i ? -Math.PI / 2 : Math.PI / 2;

    step(`Prepare the ${label.toLowerCase()} sides`, 'Lay the two sides with the grooved faces up as shown and push two dowels into the front end of each side.', () => {
      place(sides, [], sides.map((_, i) => pose(...sidePrep(i), Z, sideAngle(i))), DOWN, 55);
      sides.forEach((side, i) => {
        const [sx, sy, sz] = sidePrep(i);
        sideDowels[i] = fit('101345', [side], DOWEL_Y.map(y => [sx + (i ? y + 12 : -y - 12), sy, sz + 186]), IN, 38);
      });
    });
    step(`Prepare the ${label.toLowerCase()} front`, 'Lay the drawer front face down and drive two cam bolts into the marked holes at each end.', () => {
      place([front], [], [flatPose(x, FLAT_Y, WORK_Z)], DOWN, 58);
      frontBolts = fit('118331', [front], SIDE_X.flatMap(sx => BOLT_Y.map(y => flat(sx, y, -20))), DOWN, 44);
    });
    step(`Join the sides to the ${label.toLowerCase()} front`, 'Lower the two grooved sides onto the front, matching the left and right edge details in the insets.', () => {
      sides.forEach((side, i) => {
        const [sx, , sz] = sidePrep(i);
        const [ex, ey, ez] = flat(SIDE_X[i], -12, -197);
        move([side, ...sideDowels[i]], side, [
          pose(sx, 300, sz, Z, sideAngle(i)),
          flatPose(ex, ey + 115, ez),
          flatPose(ex, ey, ez),
        ], [front, ...frontBolts.slice(i * 2, i * 2 + 2)], DOWN, flat(SIDE_X[i], -12, -12));
        shot(flat(SIDE_X[i], DOWEL_Y[0], -12), [-Math.sign(ex-x)*.70,.60,.45], 210);
      });
    });
    step('Lock the drawer-front joints', 'Insert the four cams from the outside of the sides and turn them with a screwdriver to lock the front.', () => {
      sides.forEach((side, i) => {
        const sign = i ? -1 : 1;
        const axis = [-sign, 0, 0];
        const points = BOLT_Y.map(y => flat(SIDE_X[i] - sign * 7, y, -33));
        const open = points.map(p => pose(...p, Z, -sign * Math.PI / 2));
        const cams = fit('131361', [side, front], open, axis, 42);
        // Quarter-turn around the cam's outward axis, keeping its face against the side.
        adjust(cams, [side, front], points.map(p => [...p, sign / 2, 0.5, -sign / 2, 0.5]), axis, points[0]);
      });
    });

    if (compartment) {
      const prepZ = WORK_Z + 390;
      step('Prepare the fixed divider', 'Push two dowels into the front end of the loose fixed divider.', () => {
        place([divider], [], [pose(x, 26, prepZ, Z, Math.PI / 2)], DOWN, 55);
        members.push(divider);
        dividerDowels = fit('101345', [divider], [27, -34].map(y => [x - y - 6, 26, prepZ + 178]), IN, 38);
      });
      step('Join the fixed divider to the front', 'Lower the divider’s dowelled end into the front, keeping its exposed corner and holes oriented as shown.', () => {
        const [ex, ey, ez] = flat(DIVIDER_X, -6, -189);
        move([divider, ...dividerDowels], divider, [
          pose(x, 270, prepZ, Z, Math.PI / 2),
          flatPose(ex, ey + 125, ez),
          flatPose(ex, ey, ez),
        ], [front], DOWN, flat(DIVIDER_X, -6, -12));
        shot(flat(DIVIDER_X,27,-12), [.72,.60,.42], 205);
      });
    }

    step('Slide in the drawer bottom', 'Feed the bottom panel down the two side grooves until it seats against the drawer front.', () => {
      const receivers = compartment ? [front, ...sides, divider] : [front, ...sides];
      place([bottom], receivers, [flatPose(...flat(0, -60, -197))], DOWN, 380, flat(0, -60, -12));
      shot(flat(SIDE_X[0],-60,-370), [-.80,.45,.55], 280);
    });
    step('Seat the drawer back', 'Start one end of the back at the notched side, swing the other end down, then seat the back over the exposed edge of the bottom panel.', () => {
      const center = flat(0, -12, -374), [endX,endY,endZ] = center;
      const radius = shapes.drawerBack[0]/2;
      const path = [15,10,5,0].map(deg => {
        const a = deg*Math.PI/180;
        return compose(pose(endX+radius*(Math.cos(a)-1),endY+6+radius*Math.sin(a),endZ,Z,a),flatPose(0,0,0));
      });
      placeAlong(back,[...sides,bottom],[...path,flatPose(...center)],DOWN,center);
      shot(null,[.15,.68,.72],710);
    });
    step('Fasten the drawer back', compartment
      ? 'Hammer two fasteners through each side into the back, then two through the back into the fixed divider.'
      : 'Hammer two fasteners through each side into the back.', () => {
      sides.forEach((side, i) => {
        const sign = i ? -1 : 1;
        fit('110519', [side, back], [24, -42].map(y => flat(SIDE_X[i] - sign * 4, y, -374)), [-sign, 0, 0], 45);
      });
      if (compartment) fit('110519', [back, divider], [24, -42].map(y => flat(DIVIDER_X, y, -378)), DOWN, 46);
    });
    step('Fit the drawer runner catches', 'Fasten the handed catches below the drawer front, with 144291 on the illustrated left and 144290 on the illustrated right; use two screws per catch.', () => {
      const y = FLAT_Y + 15;
      const z = WORK_Z + 73;
      ['144291', '144290'].forEach((family, i) => {
        const sx = x + (i ? 278 : -278);
        const target = [sx, y, z];
        const catches = fit(family, [front, bottom, sides[1 - i]], [pose(...target)], DOWN, 55, target);
        fit('109560', [front, ...catches], [-21, 21].map(dx => [sx + dx, y + 1, z]), DOWN, 38);
      });
    });
    step('Fit the center pin and sleeve', 'Press the pin into the underside center of the drawer front and fit its sleeve over it.', () => {
      const pin = fit('139343', [front], [flat(0, -75, -15)], DOWN, 38);
      fit('145571', [front, ...pin], [flat(0, -75, -23)], DOWN, 34);
    });

    if (compartment) {
      step('Fit the two additional partitions', 'Turn the drawer upright, lower the two partitions beside the fixed divider and secure them with four screws as shown.', () => {
        turn();
        const xs = [24, 187];
        place(partitions, [front, bottom, back, divider], xs.map(dx => pose(...upright(dx, -9, -188))), DOWN, 120);
        shot(upright(xs[0],-58,-22), [-.60,.72,-.45], 260);
        members.push(...partitions);
        partitions.forEach((id, i) => {
          const sign = i ? 1 : -1;
          fit('109504', [id], [-55, -320].map(z => upright(xs[i] - sign * 5, -6, z)), [sign, 0, 0], 41);
        });
      });
    }

    step('Attach the two drawer knobs', compartment
      ? 'Fit the two knobs on the front using screws inserted from inside the drawer.'
      : 'Turn the plain drawer upright and fit its two knobs using screws inserted from inside the drawer.', () => {
      if (!compartment) turn();
      const points = z => [-164, 164].map(dx => upright(dx, 0, z));
      const screws = fit('100404', [front], points(-13), Z, 36);
      fit('141144', [front, ...screws], points(22), IN, 46);
    });

    if (compartment) {
      step('Prepare and seat the organizer tray', 'Press four clips onto the corners of the separate upside-down tray, then turn the tray upright and set it into the compartment drawer.', () => {
        const prepZ = WORK_Z + 490;
        place([tray], [], [pose(x, 42, prepZ, X, Math.PI)], DOWN, 56);
        members.push(tray);
        const clips = fit('122353', [tray], [-166, 166].flatMap(dx => [-109, 109].map(dz => pose(
          x + dx, 66, prepZ + dz, UP,
          (dz > 0 ? (dx > 0 ? 1 : 0) : (dx > 0 ? 2 : 3)) * Math.PI / 2,
        ))), DOWN, 35);
        const target = upright(66, 63, -238);
        move([tray, ...clips], tray, [
          pose(x, 244, prepZ, X, Math.PI),
          pose(x, 244, prepZ),
          pose(target[0], 244, target[2]),
          pose(...target),
        ], [divider, ...partitions], DOWN, [target[0], target[1] - 24, target[2]]);
        shot(upright(66-176,39,-238), [.72,.52,.40], 290);
      });
    } else {
      step('Cap the unused back holes', 'Press the two caps into the vertically aligned holes on the inside of the plain drawer back.', () => {
        fit('150980', [back], [24, -42].map(y => upright(DIVIDER_X, y, -365)), IN, 40);
      });
    }
    return { front, members, x, label };
  }

  const right = drawer(true);
  const left = drawer(false);
  step('Insert both drawers', 'Align each completed drawer with its runners and push it fully in: plain drawer on the left, compartment drawer on the right.', () => {
    const rail127 = ids('151127');
    const rail128 = ids('151128');
    // The outer runners were mounted before the matching ones on the center divider.
    for (const [drawer, bayX, rails] of [
      [left, -344, [rail128[0], rail127[1]]],
      [right, 344, [rail128[1], rail127[0]]],
    ]) {
      move(drawer.members, drawer.front, [
        pose(drawer.x, 776, WORK_Z),
        pose(bayX, 776, 648),
        pose(bayX, 776, 418),
        pose(bayX, 776, 213),
      ], rails, IN, [bayX - 278, 704, 191], drawer.label);
      shot(null, [.55,-.27,.80], 320);
    }
  });
}
