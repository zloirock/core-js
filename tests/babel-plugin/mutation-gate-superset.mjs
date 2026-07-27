// Unit tests for the mutation gate's SUPERSET property. typing answers "is this namespace patched"
// from the cheap per-file census (`mutationRoots`) instead of the scoped mutation pre-pass, which is
// sound only while the cheap roots cover every namespace the scoped pass can attribute a write to.
// under-reporting there would drop a polyfill the replacement needs, so the invariant is checked
// shape by shape rather than by outcome: for each patch channel, every pair the scoped pass records
// must have its namespace named by the roots (or the roots must be open)
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import * as nodePath from 'node:path';
import { createChecker } from '../polyfill-provider/harness.mjs';
import { collectMutationPrePass, createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { collectFileCensus } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { mutationShapesReducer } from '../../packages/core-js-polyfill-provider/detect-usage/mutations.js';

const { BABEL_REQUIRE_FROM } = process.env;
const requireBabel = BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ nodePath.resolve(BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { parseAsync, traverse } = requireBabel('@babel/core');

const { checkTruthy, finish } = createChecker('mutation-gate-superset');

// every channel the scoped pass understands, including the shapes that reach a namespace through a
// wrapper, a value fan or a mutator call - the gate must name the namespace in all of them
const CHANNELS = [
  ['plain member write', 'Object.create = x;'],
  ['alias of the namespace', 'var O = Object; O.create = x;'],
  ['alias chain', 'var A = Object; var B = A; B.create = x;'],
  ['through the global object', 'globalThis.Object.create = x;'],
  ['destructured by key', 'var { Object: O } = globalThis; O.create = x;'],
  ['assign onto the namespace', 'Object.assign(Object, { create: x });'],
  ['assign onto the global object', 'Object.assign(globalThis, { Object: x });'],
  ['defineProperty', 'Object.defineProperty(Object, "create", { value: x });'],
  ['defineProperties', 'Object.defineProperties(Object, { create: { value: x } });'],
  ['Reflect.defineProperty', 'Reflect.defineProperty(Object, "create", { value: x });'],
  ['Reflect.set', 'Reflect.set(Object, "create", x);'],
  ['sequence-wrapped receiver', '(0, Object).create = x;'],
  ['conditional value fan', '(c ? Object : Map).create = x;'],
  ['logical value fan', '(Object || Map).create = x;'],
  ['top-level this', 'Object.assign(this, { Object: x });'],
  ['delete', 'delete Object.create;'],
  ['for-of head', 'for (Object.create of xs) {}'],
  ['computed namespace name', 'globalThis["Ob" + "ject"].create = x;'],
  ['prototype write', 'Object.prototype.foo = x;'],
  // the shapes module lowering leaves behind: a proxy entry required rather than imported (its
  // `module.exports` IS the global object) and the interop wrapper whose `.default` is
  ['lowered require', 'var g = require("core-js/actual/global-this"); g.Object.create = x;'],
  ['lowered optional require', 'var g = require?.("core-js/actual/global-this"); g.Object.create = x;'],
  ['lowered webpack require', 'var g = (0, require)("core-js/actual/global-this"); g.Object.create = x;'],
  ['lowered interop wrapper', 'var _g = _interopRequireDefault(require("core-js/actual/global-this")); _g.default.Object.create = x;'],
  // multi-hop proxy chains: the namespace sits deeper than the cheap walk carries, so these must
  // leave the query open rather than name the first hop and rule the real namespace out
  ['two proxy hops', 'globalThis.globalThis.Object.create = x;'],
  ['mixed proxy hops', 'globalThis.self.Object.create = x;'],
  ['window-rooted hops', 'window.globalThis.Object.create = x;'],
];

async function programOf(code) {
  const ast = await parseAsync(code, { configFile: false, babelrc: false, sourceType: 'script' });
  let programPath = null;
  traverse(ast, {
    Program(p) {
      programPath = p;
      p.stop();
    },
  });
  return programPath;
}

// the namespace a recorded key belongs to: the pass spells pairs `<namespace>.<key>` and receiver
// deopts with a marker prefix the caller filters out before asking
function namespaceOf(key) {
  return String(key).split('.', 1)[0];
}

for (const [label, source] of CHANNELS) {
  const programPath = await programOf(source);
  const census = collectFileCensus(programPath.node, [mutationShapesReducer(null)]);
  const adapter = createBabelAdapter({ method: 'usage-pure', getMutatedStatics: () => null });
  const scoped = [...collectMutationPrePass(programPath, adapter, census).mutated ?? []];
  const roots = census.mutationRoots;
  const uncovered = scoped
    .filter(key => !String(key).startsWith('*'))
    .filter(key => !(roots?.open || roots?.names?.has(namespaceOf(key))));
  checkTruthy(`gate covers the scoped set: ${ label }`, uncovered.length === 0);
}

// the negatives the gate is allowed to rule out - a write that reaches no namespace must leave the
// roots without one, otherwise every file with ordinary member writes degrades every narrow
const NEGATIVES = [
  ['member of a namespace', 'var cos = Math.cos; cos.marker = 1;'],
  ['dynamic member of a plain object', 'var m = lib[k]; m.create = x;'],
  ['this inside a function', 'function f() { Object.assign(this, { Object: x }); }'],
  ['ordinary local write', 'var o = {}; o.create = x;'],
  ['require of a non-proxy entry', 'var g = require("core-js/actual/array/from"); g.create = x;'],
  ['require of a foreign package', 'var g = require("lodash/get"); g.create = x;'],
];

for (const [label, source] of NEGATIVES) {
  const programPath = await programOf(source);
  const census = collectFileCensus(programPath.node, [mutationShapesReducer(null)]);
  const roots = census.mutationRoots;
  checkTruthy(`gate rules out: ${ label }`, !roots?.open && !roots?.names?.has('Object'));
}

// every write POSITION and SPELLING probed during the defense cycle: the gate must still name the
// namespace, whatever operator carries the write, whatever statement hosts it, and whatever the
// minifier collapsed it into. these are not superset checks but direct claims - `Object` has to be
// among the roots (or the roots open), because typing reads exactly that answer
const NAMES_OBJECT = [
  ['logical-or assign', 'Object.create ||= x;'],
  ['nullish assign', 'Object.create ??= x;'],
  ['logical-and assign', 'Object.create &&= x;'],
  ['compound assign', 'Object.create += x;'],
  ['update expression', 'Object.create++;'],
  ['delete', 'delete Object.create;'],
  ['static block', 'class C { static { Object.create = x; } }'],
  ['object pattern target', '({ p: Object.create } = src);'],
  ['array pattern target', '[Object.create] = [x];'],
  ['nested pattern target', '({ a: { b: Object.create } } = src);'],
  ['rest pattern target', '[...Object.create] = xs;'],
  ['for-in head', 'for (Object.create in src) {}'],
  ['for-of head', 'for (Object.create of src) {}'],
  ['chained assignment', 'y = Object.create = x;'],
  ['labeled block', 'lbl: { Object.create = x; }'],
  ['dead branch', 'if (0) { Object.create = x; }'],
  ['try block', 'try { Object.create = x; } catch (e) {}'],
  ['loop body', 'for (var i = 0; i < 1; i++) { Object.create = x; }'],
  ['switch case', 'switch (k) { case 1: Object.create = x; }'],
  ['nested blocks', '{ { { Object.create = x; } } }'],
  ['getter body', 'const h = { get x() { Object.create = x; return 1; } };'],
  ['class field initialiser', 'class C { f = (Object.create = x); }'],
  ['param default', 'function f(a = (Object.create = x)) {}'],
  // eslint-disable-next-line no-template-curly-in-string -- the interpolation IS the shape under test
  ['template interpolation', 'const t = `${ Object.create = x }`;'],
  ['after the use', 'var o = Object.create(null); Object.create = x;'],
  ['inside a function', 'function g() { Object.create = x; }'],
  ['sequence chain', 'var o = (Object.create = x, Object.create(null));'],
  ['single expression', 'var r = ((Object.create = x), Object.create(null));'],
  ['nested sequences', 'var o = ((0, (Object.create = x)), (0, Object.create)(null));'],
  ['minified alias', 'var O = Object, o = (O.create = x, O.create(null));'],
];

for (const [label, source] of NAMES_OBJECT) {
  const programPath = await programOf(source);
  const census = collectFileCensus(programPath.node, [mutationShapesReducer(null)]);
  const roots = census.mutationRoots;
  checkTruthy(`gate names the namespace: ${ label }`, !!(roots?.open || roots?.names?.has('Object')));
}

finish();
