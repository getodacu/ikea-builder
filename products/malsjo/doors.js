export default function author({ step, place, fast, move, adjust, shot, pose }, doorStop) {
  const right = [1, 0, 0], left = [-1, 0, 0], up = [0, 1, 0], down = [0, -1, 0];
  const front = [0, 0, 1], back = [0, 0, -1];
  const runner = (key, screw, receiver, wall, axis) => {
    const mount = wall - 3 * axis[0];
    const target = [mount, 725, 144];
    const rail = fast(key, [receiver], [pose(mount, 725, 0)], axis, 54, target);
    fast(screw, [receiver, ...rail], [target, [mount, 725, -144]], axis, 39, target);
  };

  step('Fit the right outer runner', 'Fasten runner 151127 to the right side panel with two 120639 screws, with the hook at the back.', () => {
    runner('151127', '120639', 'sideR', 677, right);
  });
  step('Fit the left outer runner', 'Fasten runner 151128 to the left side panel with two 120639 screws, with the hook at the back.', () => {
    runner('151128', '120639', 'sideL', -677, left);
  });
  step('Fit the left inner runner', 'Fasten the second 151127 runner to the left face of the upper divider with two 100365 screws, not 100362.', () => {
    runner('151127', '100365', 'dividerTop', -11, right);
  });
  step('Fit the right inner runner', 'Fasten the second 151128 runner to the right face of the upper divider with two 100365 screws, not 100362.', () => {
    runner('151128', '100365', 'dividerTop', 11, left);
  });

  const supports = [[], []];
  step('Fit the shelf supports', 'Push eight 139343 pins into the side panels and lower divider, then slide a 145571 sleeve over the exposed end of each pin.', () => {
    for (const [bay, panel, wall, axis] of [
      [0, 'sideL', -677, left], [0, 'dividerLow', -11, right],
      [1, 'dividerLow', 11, left], [1, 'sideR', 677, right],
    ]) {
      const pins = fast('139343', [panel], [124, -146].map(z => [wall - 2 * axis[0], 339, z]), axis, 36);
      supports[bay].push(...fast('145571', [panel, ...pins], [124, -146].map(z => [wall - 10 * axis[0], 339, z]), axis, 27));
    }
  });
  step('Lower both shelves onto the supports', 'Guide one shelf into each bay at an angle and lower it flat onto the four sleeved pins.', () => {
    for (const [bay, shelf, x] of [[0, 'shelfL', -344], [1, 'shelfR', 344]]) {
      place([shelf], supports[bay], [pose(x, 425, 25, front, 0.15)], back, 352, [x, 400, 160]);
      move([shelf], shelf, [pose(x, 425, -24, front, 0.15), pose(x, 378, -24), pose(x, 356, -24)],
        supports[bay], down, [x + 319, 346, 124], 'Lower the shelf onto the pin sleeves');
      shot(null, [-.55,.23,.86], 270);
    }
  });

  // The prep figures show the backs; their first panel becomes the right-hand door viewed from the front.
  const doors = ['doorR', 'doorL'];
  const prepX = { doorL: -374, doorR: 374 };
  const outer = { doorL: -1, doorR: 1 };
  const members = { doorL: ['doorL'], doorR: ['doorR'] };
  const dampers = {};
  const upperLocks = {};
  const flat = id => pose(prepX[id], 54, 950, right, Math.PI / 2);
  const flatPoint = (id, x, y, depth) => [prepX[id] + x, 54 + depth, 950 + y];
  const upright = id => pose(prepX[id], 344, 660);
  const tilt = id => pose(prepX[id], 259, 865, right, Math.PI / 4);
  const attach = (id, key, receivers, points, axis, clearance, target = null) => {
    const added = fast(key, [id, ...receivers], points, axis, clearance, target);
    members[id].push(...added);
    return added;
  };
  const turn = (id, standing) => {
    move(members[id], id, [tilt(id), standing ? upright(id) : flat(id)], [], standing ? up : down,
      [prepX[id], 54, 660], standing ? 'Stand the prepared glass door up' : 'Lay the prepared glass door rear face up');
  };

  step('Lay out the framed doors and fit the dampers', 'Lay both framed doors rear face up and fit a 128258 damper into each bottom rail, with the damper ends oriented opposite one another.', () => {
    place(doors, [], doors.map(flat), down, 90, [374, 54, 950]);
    for (const id of doors) {
      const p = flatPoint(id, 148 * outer[id], -273, 12);
      dampers[id] = attach(id, '128258', [], [pose(...p, up, id === 'doorR' ? Math.PI : 0)], down, 50);
    }
  });

  const fitPair = (id, key, xs, y, spacing, angle = Math.PI / 2, receivers = []) => xs.flatMap(x => {
    const point = flatPoint(id, x, y, 13);
    const fitting = attach(id, key, receivers, [pose(...point, right, angle)], down, 56);
    attach(id, '100362', fitting, [-spacing, spacing].map(dx => flatPoint(id, x + dx, y, 16)), down, 37, point);
    return fitting;
  });
  step('Secure the dampers', 'Fit two 144641 retaining plates over each damper and drive two 100362 screws through each plate.', () => {
    for (const id of doors) fitPair(id, '144641', [61 * outer[id], 235 * outer[id]], -270, 9, 0, dampers[id]);
  });
  step('Fit the bottom rollers', 'Set a 144637 roller in each bottom corner recess and fasten each roller with two 100362 screws.', () => {
    for (const id of doors) fitPair(id, '144637', [-306, 306], -274, 12);
  });
  step('Fit the upper locking guides', 'Mount a 144638 locking guide at each top corner with two 100362 screws, with the sliding tabs pointing toward the upper track.', () => {
    for (const id of doors) upperLocks[id] = fitPair(id, '144638', [-306, 306], 267, 13);
  });
  step('Stand up the doors and fit the handles', 'Stand the prepared doors upright and place one 146190 handle on the front of each outer stile, securing it from the rear with a 100404 screw.', () => {
    for (const id of doors) turn(id, true);
    for (const id of doors) {
      const x = prepX[id] + 321 * outer[id];
      const handle = attach(id, '146190', [], [pose(x, 344, 672)], back, 49);
      attach(id, '100404', handle, [[x, 344, 657]], front, 49, [x, 344, 649]);
    }
  });
  step('Fit the single door stop', `Lay the doors rear face up and fasten the 123805 stop to the outside stile of the ${doorStop} door with the 109560 screw. Fit only one stop.`, () => {
    for (const id of doors) turn(id, false);
    const id = doorStop === 'left' ? 'doorL' : 'doorR';
    const point = flatPoint(id, 321 * outer[id], 35, 17);
    const stop = attach(id, '123805', [], [point], down, 51);
    attach(id, '109560', stop, [flatPoint(id, 321 * outer[id], 35, 16)], down, 38, point);
  });

  const seat = (id, x, z) => {
    turn(id, true);
    const upper = [x - 306, 650, z - 13];
    // Keep the angled top at rail height while the lower edge swings in.
    move(members[id], id, [pose(x, 352, 414, right, -0.23), pose(x, 354, z + 86, right, -0.23), pose(x, 362, z + 67, right, -0.23)],
      ['upperFront'], back, upper, 'Angle the upper guides into the track');
    shot(null, [-.44,-.14,.88], 320);
    move(members[id], id, [pose(x, 358, z + 34, right, -0.12), pose(x, 357, z + 12, right, -0.04), pose(x, 356, z)],
      ['upperFront', 'base'], down, [x - 306, 66, z - 13], 'Swing in the bottom and seat the rollers');
    shot([x-Math.sign(x)*306,69,z-13], [-Math.sign(x),.20,.50], 270);
    for (const [i, lock] of upperLocks[id].entries()) {
      adjust([lock], [id, 'upperFront'], null, up, [x + (i === 0 ? -306 : 306), upper[1], upper[2]], { from: 0, to: 1 });
      shot(null, [i===0?.32:-.32,-.47,-.82], 105);
    }
  };
  step('Seat and lock the rear-track door', 'Angle the top of the left door into the rear upper track, then lower both rollers into the rear bottom track. Push both upper locking tabs up until they click.', () => {
    seat('doorL', -335, 167);
  });
  step('Seat and lock the front-track door', 'Angle the top of the right door into the front upper track, then lower both rollers into the front bottom track. Push both upper locking tabs up until they click.', () => {
    seat('doorR', 335, 209);
  });
}
