// A headless planck.js project - the Box2D port: shapes and their mass, the contact solver, joints,
// the world queries and the serializer round-trip, verified by the state the simulation produces. So
// a green run means the physics still COMPUTES after unplugin and Babel, not merely that it builds.
//
// Its reason on an axis is the PHASE one, which until now rested on the htmlparser2 family alone:
// planck ships its own `src/**/*.ts` and is listed in `TS_SOURCE_PACKAGES`, so the runtime tier builds
// these cells from those sources. The two TypeScript fixtures are deliberately unlike each other -
// that graph is mixed, a few packages with sources among packages without, while this one is
// TypeScript end to end, and it is classes and numeric math rather than a parser. The exercise itself
// imports the BARE specifier either way, so the raw tier still runs against the published JS.
//
// What it brings besides is the simulation profile: every check below is a fixed-timestep integration
// whose result the setup defines, which is what lets an exercise assert numbers at all.
//
// `Vec2#sub` shares its name with the annex-B `String#sub`, and the two cells answer that differently
// - which is what the baselines record. `usage-global` injects `es.string.sub`, since patching a
// prototype costs nothing to be wrong about. `usage-pure` rewrites NOTHING: the receiver resolves to
// planck's own class, so no helper is put in front of the call. Measured both ways, from the sources
// and from the published JS (`.work/defense/probe-planck-annotations.mjs`) - the annotations are not
// what decides it. So the collision here is a recorded resolution, not the IE11 trap that a receiver
// the provider CANNOT resolve would be.
//
// Determinism is the premise of the whole file and planck supplies it: no `Math.random()` on any path
// used here, a fixed `STEP` and fixed iteration counts, and the two worlds of `deterministic_run` are
// built the same way inside one process. `Testbed` - the one DOM-shaped export - stays out; it is a
// stub that throws until a renderer mounts it, and nothing headless needs it.
//
// No spread, `for-of`, `async` or generator here, and the loops are plain `for`: those forms compile
// to Babel helpers that reach for the stdlib from THIS module, which would prove nothing about planck.
// What the checks do reach through planck's own frames is stated where it happens - `Number.isFinite`
// behind `Vec2.isValid`, `indexOf` and `splice` over the listener list behind `world.off`, and
// `JSON.stringify` behind `Vec2#toString`. The serializer is NOT one of them: it builds plain objects
// and never calls `JSON` itself, so the text the round-trip travels as is this file's own.
import { AABB, Box, Circle, DistanceJoint, Edge, RevoluteJoint, Rot, Serializer, Transform, Vec2, World, testOverlap } from 'planck';
import { checker } from './checks.mjs';

const STEP = 1 / 60;
const VELOCITY_ITERATIONS = 8;
const POSITION_ITERATIONS = 3;
const GRAVITY = -10;

// local on purpose, like three's twin of it - see the note in checks.mjs
function round(n, d = 3) {
  return +n.toFixed(d);
}
function xy(vector, digits = 3) {
  return [round(vector.x, digits), round(vector.y, digits)];
}
function advance(world, steps) {
  for (let i = 0; i < steps; i++) world.step(STEP, VELOCITY_ITERATIONS, POSITION_ITERATIONS);
}
// a world with a ground edge wide enough that nothing here reaches its ends
function groundedWorld() {
  const world = new World(new Vec2(0, GRAVITY));
  world.createBody().createFixture(new Edge(new Vec2(-40, 0), new Vec2(40, 0)));
  return world;
}
// one settled box, reported as numbers: the same setup twice has to answer the same
function simulate() {
  const world = groundedWorld();
  const body = world.createDynamicBody(new Vec2(0.25, 3));
  body.createFixture(new Box(0.3, 0.3), { density: 1, friction: 0.3, restitution: 0.2 });
  advance(world, 90);
  return [round(body.getPosition().x, 6), round(body.getPosition().y, 6), round(body.getAngle(), 6)];
}
// a read of something an API is allowed NOT to produce - `createJoint` answers null on a locked
// world, `toJson` answers whatever graph it built. NaN reddens the check that names the shape;
// dereferencing the absence would cost every check after it instead
function num(value) {
  return typeof value === 'number' ? value : NaN;
}
function massOf(shape, density) {
  const massData = { mass: 0, center: new Vec2(), I: 0 };
  shape.computeMass(massData, density);
  return massData;
}

export function run() {
  const { checks, check } = checker();

  // --- vector and transform math, planck's own ---
  check('vec_sub', xy(new Vec2(5, 3).sub(new Vec2(2, 1))), [3, 2]); // the String#sub collision
  check('vec_add_mul', xy(new Vec2(1, 2).add(new Vec2(3, 4)).mul(2)), [8, 12]);
  check('vec_length', new Vec2(3, 4).length(), 5);
  check('vec_dot_cross', [Vec2.dot(new Vec2(1, 2), new Vec2(3, 4)), Vec2.cross(new Vec2(1, 2), new Vec2(3, 4))], [11, -2]);
  // `Vec2.isValid` is where planck asks `Number.isFinite` about a value handed to it
  check('vec_is_valid', [Vec2.isValid(new Vec2(1, 2)), Vec2.isValid({ x: NaN, y: 0 })], [true, false]);
  // `Vec2#toString` is planck's own `JSON.stringify` call site - the one place this file reaches
  // `JSON` through planck rather than around it. The text is compared whole and NOT parsed back: a
  // neutralised `toString` would then throw and cost every check after it, and a `Vec2` that grows
  // another own field is a release worth re-reading this line for
  check('vec_to_string', String(new Vec2(1, 2)), '{"x":1,"y":2}');
  // a quarter turn about the origin sends (1,0) to (0,1), and the transform translates it by (1,0)
  check('transform_mul', xy(Transform.mul(new Transform(new Vec2(1, 0), Math.PI / 2), new Vec2(1, 0))), [1, 1]);
  check('rot_mul_vec', xy(Rot.mulVec2(Rot.neo(Math.PI / 2), new Vec2(1, 0))), [0, 1]);

  // --- integration under gravity, with nothing to collide with ---
  const fall = new World(new Vec2(0, GRAVITY));
  const falling = fall.createDynamicBody(new Vec2(0, 0));
  falling.createFixture(new Circle(0.2), 1);
  const floating = fall.createDynamicBody({ position: new Vec2(5, 0), gravityScale: 0 });
  floating.createFixture(new Circle(0.2), 1);
  advance(fall, 60);
  // velocity is the plain sum of `g * STEP` over the steps, so one second of it is `g` exactly
  check('fall_velocity', round(falling.getLinearVelocity().y, 6), GRAVITY);
  // position is NOT the textbook `g*t^2/2`: planck integrates semi-implicitly, adding the ALREADY
  // updated velocity each step, which sums to `g * STEP^2 * n(n+1)/2` = 5.08333... over 60 steps. The
  // integrator defines that number, not the release - it moves when planck changes how it integrates,
  // which is exactly when this check should be re-read
  check('fall_position', round(falling.getPosition().y, 4), -5.0833);
  check('fall_gravity_scale', xy(floating.getPosition()), [5, 0]);

  // --- a box dropped on the ground: contact, rest, sleep ---
  const world = groundedWorld();
  const box = world.createDynamicBody(new Vec2(0, 4));
  box.createFixture(new Box(0.3, 0.3), { density: 1, friction: 0.4 });
  let kept = 0;
  let removed = 0;
  function removedListener() {
    removed++;
  }
  world.on('begin-contact', () => { kept++; });
  world.on('begin-contact', removedListener);
  // `off` is planck walking its own listener list - `indexOf` to find this one, `splice` to drop it
  world.off('begin-contact', removedListener);
  advance(world, 300);
  // one landing, one event; and the removed listener may not see it, or `off` did nothing
  check('contact_events', [kept, removed], [1, 0]);
  // a box of half-height 0.3 at rest on the ground sits 0.3 above it - the geometry says so, and a
  // solver that stopped solving leaves it at 4 while one that stopped colliding sends it past 0
  check('box_rest_height', round(box.getPosition().y, 1), 0.3);
  // and once it is at rest planck puts it to sleep, which is the island bookkeeping rather than the solver
  check('box_asleep', box.isAwake(), false);

  // --- restitution: the bouncy ball comes back up, the dead one does not ---
  const bounceWorld = groundedWorld();
  const bouncy = bounceWorld.createDynamicBody(new Vec2(-2, 3));
  bouncy.createFixture(new Circle(0.3), { density: 1, restitution: 0.8 });
  const dead = bounceWorld.createDynamicBody(new Vec2(2, 3));
  dead.createFixture(new Circle(0.3), { density: 1, restitution: 0 });
  advance(bounceWorld, 60);
  // sampled twice, because the two balls fall together: they part only after the bounce, so a single
  // late sample would also pass for a run where the bouncy one simply fell more slowly
  const partedAfterBounce = bouncy.getPosition().y > dead.getPosition().y;
  advance(bounceWorld, 30);
  check('restitution_rebound', [partedAfterBounce, bouncy.getPosition().y > dead.getPosition().y], [true, true]);
  check('restitution_rest', round(dead.getPosition().y, 1), 0.3); // r = 0.3, and it stays where it landed

  // --- joints: a motor that holds its speed, and a rope that keeps its length ---
  const jointWorld = new World(new Vec2(0, GRAVITY));
  const anchor = jointWorld.createBody(new Vec2(0, 5));
  const wheel = jointWorld.createDynamicBody(new Vec2(0, 5));
  wheel.createFixture(new Circle(0.5), 1);
  const motor = jointWorld.createJoint(new RevoluteJoint(
    { motorSpeed: 2, maxMotorTorque: 20, enableMotor: true }, anchor, wheel, new Vec2(0, 5)));
  const hanging = jointWorld.createDynamicBody(new Vec2(3, 5));
  hanging.createFixture(new Box(0.2, 0.2), 1);
  jointWorld.createJoint(new DistanceJoint({ length: 2 }, anchor, new Vec2(3, 7), hanging, new Vec2(3, 5)));
  advance(jointWorld, 120);
  // 2 rad/s for 2 seconds, and 20 N.m is far more than this wheel needs to hold that speed
  check('joint_motor_angle', round(num(motor && motor.getJointAngle()), 1), 4);
  // the rope hangs from (3,7) with gravity pulling on the body: a joint solver doing nothing lets it stretch
  check('joint_distance_kept', round(Vec2.distance(new Vec2(3, 7), hanging.getPosition()), 3), 2);

  // --- world queries, asked about the box that came to rest above ---
  let ray = null;
  world.rayCast(new Vec2(0, 5), new Vec2(0, -1), (fixture, point, normal, fraction) => {
    ray = {
      onBox: fixture.getBody() === box,
      // the hit is the box's TOP, which is its centre plus the half-height - a relation to where the
      // box ended up, so the rest height above is what pins it rather than a second copy of 0.3
      above: round(point.y - box.getPosition().y, 1),
      up: round(normal.y, 3),
      // strictly between the ray's ends: a `0` or `1` would mean the hit was reported at one of them
      inside: fraction > 0 && fraction < 1,
    };
    return fraction;
  });
  check('ray_cast_hit', ray, { onBox: true, above: 0.3, up: 1, inside: true });
  const found = [];
  // an AABB around the box alone: the ground edge lies at y = 0, below this window
  world.queryAABB(new AABB(new Vec2(-0.5, 0.2), new Vec2(0.5, 0.8)), fixture => {
    found.push(fixture.getBody() === box);
    return true;
  });
  check('query_aabb', found, [true]);

  // --- shapes: mass from density and area, and the distance path behind `testOverlap` ---
  const boxMass = massOf(new Box(0.5, 0.5), 2); // a 1x1 box at density 2
  check('shape_box_mass', [round(boxMass.mass), xy(boxMass.center)], [2, [0, 0]]);
  check('shape_circle_mass', round(massOf(new Circle(1), 1).mass), 3.142); // pi r^2 at density 1
  const origin = new Transform();
  check('shape_overlap', [
    testOverlap(new Circle(1), 0, new Circle(1), 0, origin, new Transform(new Vec2(1.5, 0), 0)),
    testOverlap(new Circle(1), 0, new Circle(1), 0, origin, new Transform(new Vec2(4, 0), 0)),
  ], [true, false]);
  const outer = new AABB(new Vec2(-2, -2), new Vec2(2, 2));
  check('shape_aabb', [outer.contains(new AABB(new Vec2(-1, -1), new Vec2(1, 1))), round(outer.getPerimeter())], [true, 16]);

  // --- the serializer: planck's own JSON path, and the world it rebuilds from it ---
  // `toJson` renders a REF GRAPH - a flat array whose entries point at each other by index - so the
  // round-trip below travels as text, the way a saved level would
  const json = Serializer.toJson(world);
  check('json_ref_graph', [Array.isArray(json), round(num(json[0] && json[0].gravity && json[0].gravity.y))], [true, GRAVITY]);
  const restored = Serializer.fromJson(JSON.parse(JSON.stringify(json)));
  // that it is a REBUILT world, not the one that was serialized: counting bodies alone is satisfied
  // by a `fromJson` handing its argument's own world straight back, and so is the height below
  check('json_body_count', [restored.getBodyCount(), restored === world], [2, false]);
  let restoredBox = restored.getBodyList();
  while (restoredBox && restoredBox.isStatic()) restoredBox = restoredBox.getNext();
  // the settled height survives the trip, on a body that is a new object
  check('json_roundtrip_rest_height', [round(num(restoredBox && restoredBox.getPosition().y), 1), restoredBox === box], [0.3, false]);

  // --- determinism WITHIN one run: two worlds built the same way, stepped the same way ---
  // the runner already runs this file twice; what this adds is that a second world in the SAME
  // process answers identically, which is what a solver keeping state outside its world would break.
  // The second half is what stops it passing on a simulation that never moved: the box starts at y 3
  const first = simulate();
  check('deterministic_run', [first, first[1] < 1], [simulate(), true]);

  return { checks };
}
