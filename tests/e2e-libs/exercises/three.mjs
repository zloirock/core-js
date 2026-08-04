// A headless three.js "project": scene graph, transforms, geometry, curves, raycasting, an
// "animation" step, serialization round-trips and a handful of official addons — self-checked by its
// numeric state. three's math / scene-graph / geometry / animation / loader surface is pure
// computation (no WebGL/DOM), so this runs in node AND down-compiles to ES5 — which is how the
// runtime tier verifies the project stays FUNCTIONAL after unplugin + Babel, not just that it builds.
//
// WHAT THIS EXERCISE IS FOR, beyond "three still runs". The IE11 leg only proves per-site polyfill
// detection for the code it actually EXECUTES: under `usage-pure` a missed rewrite stays a native
// call, and a native call only fails if something reaches it. So the blocks below are chosen to make
// THREE'S OWN implementation reach for what IE11 lacks — not to use those features here. Measured
// by wrapping the natives and attributing each call to its immediate stack frame: the blocks below
// reach 36 distinct natives from frames inside `three/build/three.core.js` and `three/examples/jsm/`,
// against 16 for the scene-graph-only version this replaces — most of which were module-load side
// effects rather than API-driven paths.
//
// Deliberately kept OUT of this module's own code: `async`/`await` (the async tail below is a plain
// `.then`, so the regenerator machinery that runs is three's `async parseAsync`, not ours), and any
// stdlib call we could make on three's behalf. What this module still needs — the spread of a three
// iterable — is the point: the generator being driven is three's `*[Symbol.iterator]`.
//
// Checks favour derivable values and version-robust invariants over magic vertex totals, so a three
// bump does not redden the suite spuriously. Labels are flat and prefixed by block.
//
// Not reachable headlessly, and deliberately not chased: `Array#includes`, `.keys()`/`.values()`,
// `Math.log2` and `self` live only in `WebGLRenderer` / WebXR. unplugin still injects them; nothing
// here can execute them.
//
// DELIBERATELY EXCLUDED — typed-array PROTOTYPE methods. `usage-pure` cannot serve them, structurally
// and by design, so executing one here fails on real IE11 while every other gate stays green:
//   - a prototype method cannot be delivered without patching the native prototype, which is the one
//     thing `pure` exists to avoid. So every binary-data module is stubbed out of `@core-js/pure` —
//     all 69 of them (`es.typed-array.*`, `es.array-buffer.*`, `es.data-view.*`, `es.uint8-array.*`),
//     via committed `// empty` overrides in `packages/core-js-pure/override/modules/`, no exceptions.
//   - the usage mapping agrees: in `packages/core-js-compat/src/built-in-definitions.mjs` every typed
//     array entry is `{ global: ... }` with no `pure` variant, and the instance-method dispatch has no
//     typed-array receiver at all — its receivers are `array`, `string`, `number`, `regexp`, `date`,
//     `function`, `promise`, `symbol`, `iterator`, `asynciterator`, `domcollection`.
//   - so unplugin rewrites `floats.slice(a, b)` — it cannot know the receiver is not an Array — into
//     `_sliceMaybeArray(floats).call(floats, a, b)`, whose helper falls through to `floats.slice`.
//     On IE11 that is `undefined`, and the call throws `TypeError`.
// This cost the paths through `KeyframeTrack#trim` / `#clone`, `AnimationUtils.subclip` and
// `AnimationUtils.makeClipAdditive`, `BatchedMesh` (`#optimize` -> `copyWithin`,
// `_initColorsTexture` -> `fill`), `InstancedMesh#setColorAt` (-> `fill`),
// `BufferGeometryUtils.mergeVertices` (-> `slice`) and `SortUtils.radixSort` (-> `fill`). Do not add
// them back looking for coverage: `usage-global` covers this ground (it injects the real
// `es.typed-array.*`), and on `usage-pure` there is nothing to cover.
// `Array#find` goes with them — `makeClipAdditive` is the ONLY `.find(` call site in three's core and
// in the five addons, and it is also the one doing `referenceTrack.values.slice(...)` on a Float32Array.
import * as THREE from 'three';
import { deinterleaveAttribute, interleaveAttributes, mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { reduceVertices, traverseGenerator } from 'three/addons/utils/SceneUtils.js';
import { clone as cloneSkinned } from 'three/addons/utils/SkeletonUtils.js';
import { EdgeSplitModifier } from 'three/addons/modifiers/EdgeSplitModifier.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

function eq(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}
function round(n, d = 3) {
  return +n.toFixed(d);
}
function arr(v, d = 3) {
  const parts = v.toArray(); // Vector3/Quaternion#toArray — not an iterator helper
  return parts.map(n => round(n, d));
}

// A 4x4 square with a 1x1 square hole. Drives Earcut (`Array#forEach`, `Array#concat`,
// `Array#splice` in `ShapeUtils`) and, because the extrude below sets `bevelEnabled`,
// `ExtrudeGeometry`'s `getBevelVec` / `scalePt2` (`Number.EPSILON`, `Math.sign`).
function squareWithHole() {
  const shape = new THREE.Shape();
  shape.moveTo(-2, -2);
  shape.lineTo(2, -2);
  shape.lineTo(2, 2);
  shape.lineTo(-2, 2);
  shape.lineTo(-2, -2);
  const hole = new THREE.Path();
  hole.moveTo(-0.5, -0.5);
  hole.lineTo(-0.5, 0.5);
  hole.lineTo(0.5, 0.5);
  hole.lineTo(0.5, -0.5);
  hole.lineTo(-0.5, -0.5);
  shape.holes.push(hole);
  return shape;
}

// A scene carrying everything `toJSON` has to serialize the hard way: a DataTexture (whose image is
// serialized through `Array.from` + `constructor.name`), an integer background (which `ObjectLoader`
// reads back through `Number.isInteger`), and nested userData (deep-cloned through JSON).
function buildScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x112233);
  scene.userData = { tag: 'root', nested: { n: [1, 2, 3] } };
  const texture = new THREE.DataTexture(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]), 2, 1);
  texture.needsUpdate = true;
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), new THREE.MeshStandardMaterial({ color: 0xFF8800, map: texture }));
  mesh.name = 'boxy';
  mesh.position.set(1, 2, 3);
  scene.add(mesh);
  // toJSON serializes `matrix`, not `position` — without this the transform round-trips as identity
  scene.updateMatrixWorld(true);
  return scene;
}

// A skinned mesh whose bones form a chain — enough for Skeleton + SkeletonUtils.clone.
function buildSkinned() {
  const bones = [new THREE.Bone(), new THREE.Bone()];
  bones[0].add(bones[1]);
  bones[1].position.y = 2;
  const geometry = new THREE.BoxGeometry(1, 4, 1);
  const { count } = geometry.getAttribute('position');
  geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(new Uint16Array(count * 4), 4));
  geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(new Float32Array(count * 4), 4));
  const weight = geometry.getAttribute('skinWeight');
  for (let i = 0; i < count; i++) weight.setX(i, 1);
  const mesh = new THREE.SkinnedMesh(geometry, new THREE.MeshBasicMaterial());
  mesh.add(bones[0]);
  mesh.bind(new THREE.Skeleton(bones));
  return mesh;
}

export function run() {
  const checks = [];
  function check(label, actual, expected) {
    checks.push({ label, actual, expected, pass: eq(actual, expected) });
  }

  // --- vector / quaternion math ---
  check('vec_length', round(new THREE.Vector3(3, 4, 0).length()), 5);
  check('vec_dot', new THREE.Vector3(1, 2, 3).dot(new THREE.Vector3(4, 5, 6)), 32);
  check('vec_cross', arr(new THREE.Vector3(1, 0, 0).cross(new THREE.Vector3(0, 1, 0))), [0, 0, 1]);
  check('vec_lerp', arr(new THREE.Vector3(0, 0, 0).lerp(new THREE.Vector3(10, 20, 30), 0.5)), [5, 10, 15]);
  check('quat_y90', arr(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI / 2, 0))), [0, 0.707, 0, 0.707]);

  // --- iterators: every spread below drives a `*[Symbol.iterator]` generator inside three ---
  check('iter_vector2', [...new THREE.Vector2(3, 4)], [3, 4]);
  check('iter_vector3', [...new THREE.Vector3(1, 2, 3)], [1, 2, 3]);
  check('iter_vector4', [...new THREE.Vector4(1, 2, 3, 4)], [1, 2, 3, 4]);
  check('iter_quaternion', [...new THREE.Quaternion()], [0, 0, 0, 1]);
  check('iter_euler', [...new THREE.Euler(0.5, 0, 0, 'ZYX')], [0.5, 0, 0, 'ZYX']);
  check('iter_color', [...new THREE.Color(1, 0.5, 0)], [1, 0.5, 0]);
  const [dx, dy, dz] = new THREE.Vector3(7, 8, 9);
  check('iter_destructure', [dx, dy, dz], [7, 8, 9]);

  // --- MathUtils: Math.trunc (roundToZero), Math.imul (Mulberry32), the clamp name-collision ---
  check('math_round_to_zero', arr(new THREE.Vector3(1.7, -2.7, 3.2).roundToZero()), [1, -2, 3]);
  THREE.MathUtils.seededRandom(42);
  check('math_seeded_random', [round(THREE.MathUtils.seededRandom(), 6), round(THREE.MathUtils.seededRandom(), 6)], [0.448291, 0.852466]);
  check('math_vector_clamp', arr(new THREE.Vector3(5, -5, 0).clamp(new THREE.Vector3(-1, -1, -1), new THREE.Vector3(1, 1, 1))), [1, -1, 0]);
  const unitBox = new THREE.Box3(new THREE.Vector3(-1, -1, -1), new THREE.Vector3(1, 1, 1));
  check('math_box_clamp_point', arr(unitBox.clampPoint(new THREE.Vector3(4, 0, 0), new THREE.Vector3())), [1, 0, 0]);
  check('math_utils_scalars', [
    THREE.MathUtils.clamp(9, 0, 5), THREE.MathUtils.euclideanModulo(-7, 3),
    THREE.MathUtils.pingpong(3.5, 2), THREE.MathUtils.inverseLerp(2, 6, 4),
  ], [5, 2, 0.5, 0.5]);
  check('math_half_float', THREE.DataUtils.fromHalfFloat(THREE.DataUtils.toHalfFloat(1.5)), 1.5);

  // --- scene graph + world transforms ---
  const scene = new THREE.Scene();
  const group = new THREE.Group();
  const geo = new THREE.BoxGeometry(2, 2, 2);
  const mesh = new THREE.Mesh(geo);
  mesh.position.set(1, 2, 3);
  group.add(mesh);
  scene.add(group);
  group.position.set(10, 0, 0);
  scene.updateMatrixWorld(true);
  const worldPos = new THREE.Vector3();
  mesh.getWorldPosition(worldPos);
  check('world_position', arr(worldPos), [11, 2, 3]);

  let count = 0;
  scene.traverse(() => count++);
  check('traverse_count', count, 3); // scene + group + mesh

  // --- geometry bounds ---
  geo.computeBoundingSphere();
  check('bounding_radius', round(geo.boundingSphere.radius), 1.732); // half-diagonal of a 2x2x2 box = sqrt(3)
  geo.computeBoundingBox();
  check('bounding_box', [arr(geo.boundingBox.min), arr(geo.boundingBox.max)], [[-1, -1, -1], [1, 1, 1]]);

  // --- raycasting (Ray#at is one of the name collisions: unplugin rewrites `.at(` and the pure
  // helper must hand back three's own method rather than Array.prototype.at) ---
  const ray = new THREE.Raycaster(new THREE.Vector3(11, 2, 20), new THREE.Vector3(0, 0, -1));
  const hits = ray.intersectObject(mesh, true);
  check('raycast_hits', hits.length, 2);
  check('raycast_dist', round(hits[0].distance), 16);

  // --- matrix4: translate(5,0,0) * scale(2) applied to (1,1,1) -> (7,2,2) ---
  const m = new THREE.Matrix4().makeTranslation(5, 0, 0).multiply(new THREE.Matrix4().makeScale(2, 2, 2));
  check('matrix_apply', arr(new THREE.Vector3(1, 1, 1).applyMatrix4(m)), [7, 2, 2]);

  // --- Box3 from points ---
  const box = new THREE.Box3().setFromPoints([new THREE.Vector3(-3, 0, 1), new THREE.Vector3(2, 5, -4)]);
  check('box3_bounds', [arr(box.min), arr(box.max)], [[-3, 0, -4], [2, 5, 1]]);

  // --- curves. computeFrenetFrames and EllipseCurve both branch on Number.EPSILON ---
  const curve = new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 10));
  check('curve_length', round(curve.getLength()), 10);
  check('curve_midpoint', arr(curve.getPoint(0.5)), [0, 0, 5]);
  const frames = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 2, 0), new THREE.Vector3(3, 0, 1)]).computeFrenetFrames(4, false);
  check('curve_frenet_frames', [frames.tangents.length, frames.normals.length, frames.binormals.length], [5, 5, 5]);
  const tube = new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(), new THREE.Vector3(0, 0, 4)), 4, 0.5, 6, false);
  check('curve_tube_vertices', tube.getAttribute('position').count, 35); // (4+1) rings x (6+1) ring verts
  check('curve_ellipse_quarter', arr(new THREE.EllipseCurve(0, 0, 2, 1, 0, 2 * Math.PI, false, 0).getPoint(0.25)), [0, 1]);

  // --- a deterministic "animation": rotate the group 90deg about Y, read the child's new world pos.
  // Y-90 sends local (1,2,3) -> (3,2,-1), plus the group's (10,0,0) -> (13,2,-1).
  group.rotateY(Math.PI / 4);
  group.rotateY(Math.PI / 4);
  scene.updateMatrixWorld(true);
  mesh.getWorldPosition(worldPos);
  check('animated_world_pos', arr(worldPos, 2), [13, 2, -1]);

  // --- shapes with holes -> Earcut ---
  const shape = squareWithHole();
  const outer = [new THREE.Vector2(0, 0), new THREE.Vector2(4, 0), new THREE.Vector2(4, 4), new THREE.Vector2(0, 4)];
  const inner = [[new THREE.Vector2(1, 1), new THREE.Vector2(1, 2), new THREE.Vector2(2, 2), new THREE.Vector2(2, 1)]];
  check('shape_triangulate_faces', THREE.ShapeUtils.triangulateShape(outer, inner).length, 8); // a quad with a quad hole -> 8 triangles
  const triangle = [new THREE.Vector2(0, 0), new THREE.Vector2(2, 0), new THREE.Vector2(2, 2)];
  check('shape_area_and_winding', [THREE.ShapeUtils.area(triangle), THREE.ShapeUtils.isClockWise(triangle)], [2, false]);
  const shapeGeo = new THREE.ShapeGeometry(shape, 2);
  check('shape_geometry_indices', shapeGeo.getIndex().count, 24); // 8 triangles x 3
  const extruded = new THREE.ExtrudeGeometry(shape, { depth: 1, bevelEnabled: true, bevelSegments: 2, bevelSize: 0.2, bevelThickness: 0.2, steps: 2, curveSegments: 4 });
  extruded.computeBoundingBox();
  // half-extent 2 grown by bevelSize 0.2; depth 1 grown by bevelThickness 0.2 at the front
  check('shape_extrude_bounds', [arr(extruded.boundingBox.min), arr(extruded.boundingBox.max)], [[-2.2, -2.2, -0.2], [2.2, 2.2, 1.2]]);
  const shapePath = new THREE.ShapePath();
  shapePath.moveTo(0, 0);
  shapePath.lineTo(4, 0);
  shapePath.lineTo(4, 4);
  shapePath.lineTo(0, 4);
  shapePath.lineTo(0, 0);
  shapePath.moveTo(1, 1);
  shapePath.lineTo(1, 2);
  shapePath.lineTo(2, 2);
  shapePath.lineTo(2, 1);
  shapePath.lineTo(1, 1);
  const shapes = shapePath.toShapes(true); // the one `new Map()` in three's core
  check('shape_path_to_shapes', [shapes.length, shapes[0].holes.length], [1, 1]);

  // --- geometry derived from a Set inside three ---
  check('geom_wireframe_segments', new THREE.WireframeGeometry(new THREE.BoxGeometry(1, 1, 1)).getAttribute('position').count, 36); // 18 unique edges x 2 endpoints
  check('geom_hard_edges', new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1), 1).getAttribute('position').count, 24); // a cube has 12 hard edges
  const layered = new THREE.DataArrayTexture(new Uint8Array(32), 2, 2, 2);
  check('geom_data_array_texture', [layered.image.width, layered.image.height, layered.image.depth], [2, 2, 2]);

  // --- serialization: Array.from over typed arrays, `constructor.name`, JSON deep clone ---
  const attrJson = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 1, 1, 1], 3)).toJSON().data.attributes.position;
  check('json_attribute_type', attrJson.type, 'Float32Array');
  check('json_attribute_array', attrJson.array, [0, 0, 0, 1, 1, 1]);
  const interleaved = new THREE.BufferGeometry();
  interleaved.setAttribute('position', new THREE.InterleavedBufferAttribute(new THREE.InterleavedBuffer(new Float32Array([0, 0, 0, 1, 1, 1, 1, 1]), 4), 3, 0));
  const interleavedJson = interleaved.toJSON({ geometries: {}, materials: {}, textures: {}, images: {}, shapes: {}, skeletons: {}, animations: {}, nodes: {} });
  // uuid-keyed, and the uuids are random — read the single entry rather than asserting the key
  const interleavedBuffer = interleavedJson.data.interleavedBuffers[Object.keys(interleavedJson.data.interleavedBuffers)[0]];
  check('json_interleaved_type', [interleavedBuffer.type, interleavedBuffer.stride], ['Float32Array', 4]);
  // InterleavedBuffer#toJSON reinterprets the buffer as a Uint32Array through Array.from, so a
  // float 1.0 must arrive as its IEEE-754 bit pattern 0x3F800000
  const ONE = 0x3F800000;
  const rawBuffer = interleavedJson.data.arrayBuffers[Object.keys(interleavedJson.data.arrayBuffers)[0]];
  check('json_interleaved_array_buffer', rawBuffer, [0, 0, 0, ONE, ONE, ONE, ONE, ONE]);

  const sceneJson = buildScene().toJSON();
  check('json_image_type', sceneJson.images[0].url.type, 'Uint8Array');
  check('json_image_data', sceneJson.images[0].url.data, [1, 2, 3, 4, 5, 6, 7, 8]);
  const parsed = new THREE.ObjectLoader().parse(sceneJson);
  check('json_roundtrip_position', arr(parsed.getObjectByName('boxy').position), [1, 2, 3]);
  check('json_roundtrip_background', parsed.background.getHex(), 0x112233); // read back through Number.isInteger
  check('json_roundtrip_userdata', parsed.userData.nested.n, [1, 2, 3]);
  check('json_roundtrip_texture', parsed.getObjectByName('boxy').material.map.image.width, 2);

  // --- textures: `Texture#repeat` collides with String#repeat, and three reads it in copy/toJSON/parse ---
  const texture = new THREE.DataTexture(new Uint8Array(64), 4, 4); // 4x4 RGBA
  texture.repeat.set(2, 3);
  texture.updateMatrix();
  check('tex_repeat_matrix', [texture.matrix.elements[0], texture.matrix.elements[4]], [2, 3]);
  THREE.TextureUtils.contain(texture, 2);
  check('tex_contain', [texture.repeat.x, texture.repeat.y], [2, 1]);
  // eslint-disable-next-line unicorn/no-array-fill-with-reference-type -- three's TextureUtils.fill, not Array#fill (one of the name collisions this fixture exists to exercise)
  THREE.TextureUtils.fill(texture);
  check('tex_fill', [texture.repeat.x, texture.repeat.y], [1, 1]);

  // --- colour: the non-sRGB branch of getStyle formats through Number#toFixed ---
  // setStyle parses as sRGB and getStyle writes sRGB back, so this round-trips exactly; the raw
  // components in between are working-space (linear-sRGB) and would NOT read back as 255,128,0
  check('color_style_srgb', new THREE.Color().setStyle('rgb(255, 128, 0)').getStyle(), 'rgb(255,128,0)');
  check('color_style_linear', new THREE.Color(1, 0.5, 0).getStyle(THREE.LinearSRGBColorSpace), 'color(srgb-linear 1.000 0.500 0.000)');
  check('color_set_style_rgb', new THREE.Color().setStyle('rgb(255, 128, 0)').getHexString(), 'ff8000');
  check('color_set_style_hsl', new THREE.Color().setStyle('hsl(120, 50%, 50%)').getHexString(), '40bf40');
  check('color_by_name', new THREE.Color().setColorName('rebeccapurple').getHexString(), '663399');

  // --- animation: Math.sign in the mixer, RegExp construction in PropertyBinding, JSON in the clip ---
  const cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial());
  cube.name = 'Cube';
  const clip = new THREE.AnimationClip('move', 2, [
    new THREE.VectorKeyframeTrack('.position', [0, 1, 2], [0, 0, 0, 5, 0, 0, 10, 0, 0]),
    new THREE.QuaternionKeyframeTrack('.quaternion', [0, 1], [0, 0, 0, 1, 0, 0.707, 0, 0.707]),
  ]);
  const mixer = new THREE.AnimationMixer(cube);
  mixer.clipAction(clip).play();
  mixer.update(0.5);
  check('anim_mixer_half_step', arr(cube.position), [2.5, 0, 0]);
  mixer.update(1);
  check('anim_mixer_full_step', arr(cube.position), [7.5, 0, 0]);

  const fade = new THREE.AnimationClip('fade', 1, [new THREE.NumberKeyframeTrack('.material.opacity', [0, 1], [0, 1])]);
  fade.userData = { note: 'hi' };
  const fadeBack = THREE.AnimationClip.parse(THREE.AnimationClip.toJSON(fade));
  check('anim_clip_roundtrip', [fadeBack.name, fadeBack.tracks.length, fadeBack.userData.note], ['fade', 1, 'hi']);
  const binding = THREE.PropertyBinding.parseTrackName('Cube.material[color].r');
  check('anim_parse_track_name', [binding.nodeName, binding.objectName, binding.objectIndex, binding.propertyName], ['Cube', 'material', 'color', 'r']);

  // --- instancing. `setColorAt` is deliberately NOT called: see the typed-array note in the header ---
  const instanced = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial(), 3);
  for (let i = 0; i < 3; i++) instanced.setMatrixAt(i, new THREE.Matrix4().makeTranslation(i * 2, 0, 0));
  instanced.computeBoundingBox();
  const instancedHits = new THREE.Raycaster(new THREE.Vector3(2, 0, 10), new THREE.Vector3(0, 0, -1)).intersectObject(instanced, true);
  check('inst_raycast_hits', [instancedHits.length, instancedHits[0].instanceId], [2, 1]);
  check('inst_bounds', [arr(instanced.boundingBox.min), arr(instanced.boundingBox.max)], [[-0.5, -0.5, -0.5], [4.5, 0.5, 0.5]]);

  // --- skinning ---
  const skinned = buildSkinned();
  skinned.skeleton.update();
  const skinnedVertex = new THREE.Vector3().fromBufferAttribute(skinned.geometry.getAttribute('position'), 0);
  skinned.applyBoneTransform(0, skinnedVertex);
  check('skin_bone_transform', arr(skinnedVertex), [0.5, 2, 0.5]);

  // --- Cache keys go through `new URL()` inside three's isBlobURL ---
  THREE.Cache.enabled = true;
  THREE.Cache.add('json:https://example.com/a.json', { v: 1 });
  const cached = THREE.Cache.get('json:https://example.com/a.json');
  THREE.Cache.add('blob:blob:https://example.com/deadbeef', { v: 2 });
  const blobCached = THREE.Cache.get('blob:blob:https://example.com/deadbeef');
  THREE.Cache.clear();
  THREE.Cache.enabled = false;
  check('cache_url_hit', cached.v, 1);
  check('cache_blob_not_stored', blobCached === undefined, true);

  // --- three's own log path runs String#startsWith; capture it instead of printing it ---
  const logged = [];
  THREE.setConsoleFunction((level, message) => logged.push(`${ level }:${ message }`));
  const selfParent = new THREE.Object3D();
  selfParent.add(selfParent);
  THREE.setConsoleFunction(null);
  check('warn_self_add', logged, ['error:THREE.Object3D.add: object can\'t be added as a child of itself.']);

  // --- addons (three/addons/*, same package) ---
  check('addon_merge_geometries_groups', mergeGeometries([new THREE.BoxGeometry(1, 1, 1), new THREE.SphereGeometry(0.5, 6, 4)], true).groups.length, 2);
  const indexedBox = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2);
  const interleavedAttrs = interleaveAttributes([indexedBox.getAttribute('position'), indexedBox.getAttribute('normal')]);
  check('addon_interleave_roundtrip', [interleavedAttrs.length, deinterleaveAttribute(interleavedAttrs[0]).count], [2, 54]);
  // traverseGenerator is a recursive `yield*` — the delegation machinery that runs is the addon's
  check('addon_traverse_generator', [...traverseGenerator(scene)].length, 3);
  check('addon_reduce_vertices', round(reduceVertices(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial()), (max, v) => Math.max(max, v.x), 0)), 0.5);
  check('addon_skeleton_clone', cloneSkinned(buildSkinned()).skeleton.bones.length, 2);
  const split = new EdgeSplitModifier().modify(new THREE.BoxGeometry(1, 1, 1, 2, 2, 2), 1);
  // splitting at the cube's hard edges can only add vertices, never drop indices
  check('addon_edge_split', [split.getAttribute('position').count >= 54, split.getIndex().count], [true, 144]);
  const rounded = new RoundedBoxGeometry(1, 1, 1, 2, 0.2); // Math.sign, seven sites
  rounded.computeBoundingBox();
  check('addon_rounded_box_bounds', [arr(rounded.boundingBox.min), arr(rounded.boundingBox.max)], [[-0.5, -0.5, -0.5], [0.5, 0.5, 0.5]]);

  // --- async tail: three's `async parseAsync`, driven by a plain `.then` so the regenerator +
  // Promise machinery that actually runs belongs to three, not to this module ---
  // eslint-disable-next-line promise/prefer-await-to-then -- .then not await: keeps this module regenerator-free so the async machinery under test is three's own (see header)
  return new THREE.ObjectLoader().parseAsync(buildScene().toJSON()).then(loaded => {
    check('json_async_background', loaded.background.getHex(), 0x112233);
    check('json_async_material', loaded.getObjectByName('boxy').material.type, 'MeshStandardMaterial');
    check('json_async_image_width', loaded.getObjectByName('boxy').material.map.image.width, 2);
    return { checks };
  });
}
