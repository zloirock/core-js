// the SE-order probes of the defense cycles over the destructure wrappers, replayed as tests: each
// body runs as probed and its prints are compared to what native printed when the probe ran
/* eslint-disable no-shadow, unicorn/no-useless-spread, unicorn/no-array-push-push, sonarjs/no-unused-collection, prefer-const, no-unused-vars, sonarjs/no-dead-store, sonarjs/no-unused-vars, @stylistic/quotes, @stylistic/max-statements-per-line, @stylistic/comma-spacing, @stylistic/max-len, @stylistic/no-extra-parens, unicorn/consistent-function-style, unicorn/prefer-optional-catch-binding, unicorn/catch-error-name, id-match, no-underscore-dangle -- generated from the probes as written */
function collect() {
  const out = [];
  const console = { log: (...items) => out.push(items.map(String).join(' ')) };
  return { out, console };
}

QUnit.test('destructuring probe 3: const [x] = [...[[1, 2]], ...[[3]]]; console.log(x', assert => {
  const { out, console } = collect();
  const [x] = [...[[1, 2]], ...[[3]]]; console.log(x.at(-1));
  assert.deepEqual(out, ["2"]);
});

QUnit.test('destructuring probe 5: const box = [[1]]; const [a] = [...[box]]; a.push(', assert => {
  const { out, console } = collect();
  const box = [[1]]; const [a] = [...[box]]; a.push('s'); console.log(String(box[0].at(0)), String(box.at(-1)));
  assert.deepEqual(out, ["1 s"]);
});

QUnit.test('destructuring probe 6: const log = []; const [{ from: f }] = [...([Array]', assert => {
  const { out, console } = collect();
  const log = []; const [{ from: f }] = [...([Array])]; log.push(f === Array.from); console.log(log.join(' '));
  assert.deepEqual(out, ["true"]);
});

QUnit.test('destructuring probe 7: const log = []; const known = { w: Object, y: [1] ', assert => {
  const { out, console } = collect();
  const log = []; const known = { w: Object, y: [1] }; const [{ w: { is }, y: { at } }] = [known, log.push('s')]; console.log(typeof is, typeof at, String(log));
  assert.deepEqual(out, ["function function s"]);
});

QUnit.test('destructuring probe 8: const log = []; const r = { w: Object, y: [1] }; c', assert => {
  const { out, console } = collect();
  const log = []; const r = { w: Object, y: [1] }; const eff = () => { log.push('e'); return 0; }; const [, { w: { values }, y: { at } }] = [eff(), r]; console.log(typeof values, typeof at, String(log));
  assert.deepEqual(out, ["function function e"]);
});

QUnit.test('destructuring probe 9: const log = []; const r = { w: Object, y: [1] }; c', assert => {
  const { out, console } = collect();
  const log = []; const r = { w: Object, y: [1] }; const eff = () => { log.push('e'); return 0; }; const [{ w: { values }, y: { at } }] = [r, eff()]; console.log(typeof values, typeof at, String(log));
  assert.deepEqual(out, ["function function e"]);
});

QUnit.test('destructuring probe 10: const log = []; const r = { w: Object, y: [1] }; c', assert => {
  const { out, console } = collect();
  const log = []; const r = { w: Object, y: [1] }; const eff = t => { log.push(t); return 0; }; const [{ w: { values }, y: { at } }] = [r, eff('n')]; console.log(typeof values, typeof at, String(log));
  assert.deepEqual(out, ["function function n"]);
});

QUnit.test('destructuring probe 11: const log = []; let pick = 1; const userObj = { fr', assert => {
  const { out, console } = collect();
  const log = []; let pick = 1; const userObj = { from: () => 'user' }; const { 1: { from: f } } = [0, pick ? Array : userObj]; log.push(f === Array.from); console.log(log.join(' '));
  assert.deepEqual(out, ["true"]);
});

QUnit.test('destructuring probe 12: const r = (([{ [Symbol.iterator]: it }]) => typeof', assert => {
  const { out, console } = collect();
  const r = (([{ [Symbol.iterator]: it }]) => typeof it)([[1]]); console.log(r);
  assert.deepEqual(out, ["function"]);
});

QUnit.test('destructuring probe 13: const r = (({ a: { hasOwn }, b: { is } }) => [type', assert => {
  const { out, console } = collect();
  const r = (({ a: { hasOwn }, b: { is } }) => [typeof hasOwn, typeof is])({ a: Object, b: Object }); console.log(String(r));
  assert.deepEqual(out, ["function,function"]);
});

QUnit.test('destructuring probe 15: const r = { w: Object, y: [1] }; let { w: { values', assert => {
  const { out, console } = collect();
  const r = { w: Object, y: [1] }; let { w: { values }, y: { at } } = r; console.log(typeof values, typeof at);
  assert.deepEqual(out, ["function function"]);
});

QUnit.test('destructuring probe 16: const v = Object.seal(...[[7]]); console.log(v.at(', assert => {
  const { out, console } = collect();
  const v = Object.seal(...[[7]]); console.log(v.at(0));
  assert.deepEqual(out, ["7"]);
});

QUnit.test('destructuring probe 17: for (const _r of [{ w: Object }]) { let { w: { key', assert => {
  const { out, console } = collect();
  for (const _r of [{ w: Object }]) { let { w: { keys } } = _r; console.log(typeof keys, _r.w === Object); }
  assert.deepEqual(out, ["function true"]);
});

QUnit.test('destructuring probe 18: for (const { is } of [Object, Object]) console.log', assert => {
  const { out, console } = collect();
  for (const { is } of [Object, Object]) console.log(typeof is);
  assert.deepEqual(out, ["function","function"]);
});

QUnit.test('destructuring probe 19: for (const { w: [{ hasOwn }] } of [{ w: [Object] }', assert => {
  const { out, console } = collect();
  for (const { w: [{ hasOwn }] } of [{ w: [Object] }, { w: [Object] }]) console.log(typeof hasOwn);
  assert.deepEqual(out, ["function","function"]);
});

QUnit.test('destructuring probe 20: for (const { w: [{ keys }] } of [{ w: [Object] }])', assert => {
  const { out, console } = collect();
  for (const { w: [{ keys }] } of [{ w: [Object] }]) console.log(typeof keys);
  assert.deepEqual(out, ["function"]);
});

QUnit.test('destructuring probe 21: for (const { w: { is }, z } of [{ w: Object, z: \'s', assert => {
  const { out, console } = collect();
  for (const { w: { is }, z } of [{ w: Object, z: 's' }, { w: Object, z: 2 }]) console.log(typeof is, z);
  assert.deepEqual(out, ["function s","function 2"]);
});

QUnit.test('destructuring probe 22: for (const { w: { keys } } of [{ w: Object }, { w:', assert => {
  const { out, console } = collect();
  for (const { w: { keys } } of [{ w: Object }, { w: Object }]) console.log(typeof keys);
  assert.deepEqual(out, ["function","function"]);
});

QUnit.test('destructuring probe 23: function f(a = [9]) { return a.at(0); } console.lo', assert => {
  const { out, console } = collect();
  function f(a = [9]) { return a.at(0); } console.log(f(...[[1]]), f());
  assert.deepEqual(out, ["1 9"]);
});

QUnit.test('destructuring probe 24: let n = 0; const e = t => { console.log(t); return', assert => {
  const { out, console } = collect();
  let n = 0; const e = t => { console.log(t); return Object; }; for (const { w: { entries } } of [{ w: e('a') }]) console.log(typeof entries);
  assert.deepEqual(out, ["a","function"]);
});

QUnit.test('destructuring probe 25: let n = 0; const e = t => { console.log(t); return', assert => {
  const { out, console } = collect();
  let n = 0; const e = t => { console.log(t); return Object; }; for (const { w: { entries }, at } of [{ w: e('a'), at: e('b') }]) console.log(typeof entries, typeof at);
  assert.deepEqual(out, ["a","b","function function"]);
});

QUnit.test('destructuring probe 26: let n = 0; const e = t => { console.log(t); return', assert => {
  const { out, console } = collect();
  let n = 0; const e = t => { console.log(t); return Object; }; for (const { w: { is } } of [{ w: e('a') }, { w: e('b') }]) console.log(typeof is);
  assert.deepEqual(out, ["a","b","function","function"]);
});

QUnit.test('destructuring probe 27: let n = 0; const e = t => { console.log(t); return', assert => {
  const { out, console } = collect();
  let n = 0; const e = t => { console.log(t); return n++; }; const r = (({ w: [{ hasOwn }] }) => typeof hasOwn)({ w: [(e('a'), Object)], z: e('b') }); console.log(r);
  assert.deepEqual(out, ["a","b","function"]);
});

QUnit.test('destructuring probe 28: let n = 0; const e = t => { console.log(t); return', assert => {
  const { out, console } = collect();
  let n = 0; const e = t => { console.log(t); return n++; }; function g({ w: [{ is }] } = { w: [(e('d'), Object)] }) { return typeof is; } console.log(g());
  assert.deepEqual(out, ["d","function"]);
});

QUnit.test('destructuring probe 31: try { const r = null; let { w: { values }, y: { at', assert => {
  const { out, console } = collect();
  try { const r = null; let { w: { values }, y: { at } } = r; console.log('no'); } catch (e) { console.log('throws'); }
  assert.deepEqual(out, ["throws"]);
});

QUnit.test('destructuring probe 32: try { const r = { w: Object }; let { w: { values }', assert => {
  const { out, console } = collect();
  try { const r = { w: Object }; let { w: { values }, y: { at } } = r; console.log('no'); } catch (e) { console.log('throws'); }
  assert.deepEqual(out, ["throws"]);
});
