// A headless three.js "project": it builds a scene graph, applies transforms + a couple of
// deterministic "animation" steps, raycasts a box, and computes geometry/curve/matrix state — then
// self-checks the numeric result. three.js's math / scene-graph / geometry surface is pure
// computation (no WebGL/DOM), so this runs in node AND down-compiles to ES5 — which is how the
// runtime tier verifies the project stays FUNCTIONAL after unplugin + Babel, not just that it builds.
import * as THREE from 'three';

function round(n, d = 3) {
  return +n.toFixed(d);
}
function arr(v, d = 3) {
  const parts = v.toArray(); // Vector3/Quaternion#toArray — not an iterator helper
  return parts.map(n => round(n, d));
}

export function run() {
  const checks = [];
  function check(label, actual, expected) {
    checks.push({ label, actual, expected, pass: JSON.stringify(actual) === JSON.stringify(expected) });
  }

  // --- vector / quaternion math ---
  check('vec_length', round(new THREE.Vector3(3, 4, 0).length()), 5);
  check('vec_dot', new THREE.Vector3(1, 2, 3).dot(new THREE.Vector3(4, 5, 6)), 32);
  check('vec_cross', arr(new THREE.Vector3(1, 0, 0).cross(new THREE.Vector3(0, 1, 0))), [0, 0, 1]);
  check('vec_lerp', arr(new THREE.Vector3(0, 0, 0).lerp(new THREE.Vector3(10, 20, 30), 0.5)), [5, 10, 15]);
  check('quat_y90', arr(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI / 2, 0))), [0, 0.707, 0, 0.707]);

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

  // --- raycasting ---
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

  // --- curve ---
  const curve = new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 10));
  check('curve_length', round(curve.getLength()), 10);
  check('curve_midpoint', arr(curve.getPoint(0.5)), [0, 0, 5]);

  // --- a deterministic "animation": rotate the group 90deg about Y, read the child's new world pos.
  // Y-90 sends local (1,2,3) -> (3,2,-1), plus the group's (10,0,0) -> (13,2,-1).
  group.rotateY(Math.PI / 4);
  group.rotateY(Math.PI / 4);
  scene.updateMatrixWorld(true);
  mesh.getWorldPosition(worldPos);
  check('animated_world_pos', arr(worldPos, 2), [13, 2, -1]);

  return { checks };
}
