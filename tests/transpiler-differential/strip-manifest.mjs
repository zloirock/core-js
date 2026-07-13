// The strip-oracle MANIFEST: the single source of truth for which leaf builtins the stripped
// realm removes. Consumed by BOTH sides of the oracle contract:
//   - strip-builtins.mjs (the `--import` preload) APPLIES it to the worker realm;
//   - generate.mjs DERIVES the per-snippet `strip` flag from it (a snippet reading one of these
//     is a provable-injection case, so its stripped run must reproduce the full-env reference).
// Keeping them in one place is the point - the previous hand-mirrored lists let the two sides
// disagree (a strip:true family whose target was never stripped ran a vacuous leg).
// Strip ONLY leaf feature methods/statics that core-js IMPLEMENTS and never consumes internally,
// and that the transpiled OUTPUTS themselves don't need to run. NOT foundational primitives
// (slice / push / indexOf / Function.prototype.call / defineProperty), NOT constructors
// (Promise / Map / Set), NOT Symbol / Symbol.iterator - removing those would break core-js's own
// internals or the realm itself, not exercise a polyfill (see the array-iterator note in
// strip-builtins.mjs for a language-level counterexample).

export const STRIP_PROTO = {
  Array: [
    'at', 'flat', 'flatMap', 'includes', 'findLast', 'findLastIndex',
    'toReversed', 'toSorted', 'toSpliced', 'with',
  ],
  String: ['at', 'includes', 'padStart', 'padEnd', 'replaceAll', 'trimStart', 'trimEnd'],
  // the new-Set-methods leaf ops: core-js implements each on its own pure Set and never consumes
  // them internally, so removing them from the native prototype (the constructor stays) only
  // forces a missed `new Set` -> pure-Set rewrite to surface instead of silently using native
  Set: [
    'union', 'intersection', 'difference', 'symmetricDifference',
    'isSubsetOf', 'isSupersetOf', 'isDisjointFrom',
  ],
};

export const STRIP_STATIC = {
  Array: ['from', 'of', 'fromAsync'],
  Object: ['fromEntries', 'groupBy', 'hasOwn'],
  Map: ['groupBy'],
  // Error.isError: the pure static falls back to its own structural check when the native is
  // absent. stripping keeps HALF-REALM states consistent: a realm with the native slot-based
  // isError but WITHOUT host DOMException (a bare vm realm) would brand-reject the ponyfill
  // DOMException - a combination no real engine has (engines lacking DOMException lack
  // Error.isError too)
  Error: ['isError'],
  // Number.isInteger: the pure static stands alone (is-integral-number falls back to its own
  // impl when the native is absent - evaluated at load, after the preload)
  Number: ['isInteger'],
};

// usage-pure also rewrites the `Iterator` constructor and every `globalThis` reference to pure
// imports, so they belong in the strip set too (deleted as GLOBAL bindings by the preload)
export const STRIP_GLOBALS = ['Iterator', 'globalThis'];

// the e2e-usage-pure stripped-realm EXTENSION: whole constructors absent on the oldest
// targets (IE11: no Promise / Symbol / AggregateError / Iterator / explicit-resource-management)
// whose pure implementations stand alone by design - the pure flavor MUST serve them where the
// engine has nothing. the differential's own stripped worker keeps these (its snippets run with
// no harness, but its full-env reference leg needs the natives for the untranspiled source);
// the e2e stripped realm has a FULL-ENV twin run instead, so the reference lives there and the
// constructors are strippable. the e2e runner strips a fresh `node:vm` realm, so the outer
// harness (QUnit / reporter) keeps its natives - only the transpiled bundle sees the gaps
// NOTE: `Symbol` is deliberately NOT stripped (same as the base manifest): the pure fake
// symbols are string keys and cannot interoperate with the realm's REMAINING native
// symbol-keyed protocols (a native matchAll iterator, Reflect.ownKeys symbol entries) - a
// half-stripped realm matches no real engine; true no-Symbol fidelity would require
// stripping every symbol-producing native.
// NOTE: the `Iterator` global and the %IteratorPrototype% HELPERS are a PAIRED feature (they
// ship together in every engine) and the broad stripped-realm legs must strip them TOGETHER
// (ITERATOR_PROTO_HELPERS below): core-js probes the native helpers THROUGH the global
// (absent -> "no native" -> forced falsy -> own method not installed), while the pure
// prototype INHERITS the native %IteratorPrototype% from the protocol channel
// (`Object.create` over the `[].keys()` chain in pure mode). deleting only the global leaves
// a no-engine half-state where a stale surviving native (Node 22: helpers predate the
// close-on-early-error semantics) serves pure calls. with the pair stripped, the pure
// prototype chain has no helpers at all and every module installs its own - the standalone
// path the legs exist to prove. the differential keeps the global-only strip: its snippets
// are armed narrowly, and its polyfilled outputs' values-iterators DO lean on the surviving
// native helpers (see the %IteratorPrototype% note above)
export const E2E_STRIP_GLOBALS = [
  'Promise',
  'AggregateError',
  // no native engine ships the AsyncIterator global yet, so this delete is a no-op today;
  // once one does, the Iterator pairing rule above applies to it the same way
  'AsyncIterator',
  'DisposableStack',
  'AsyncDisposableStack',
  'SuppressedError',
];

// the composed global-strip set for the broad stripped-realm legs (e2e / unit-pure bundles)
export const E2E_STRIP_REALM_GLOBALS = [...STRIP_GLOBALS, ...E2E_STRIP_GLOBALS];

// the %IteratorPrototype% helper methods paired with the `Iterator` global (see the pairing
// note above) - the broad legs strip them together with it
export const ITERATOR_PROTO_HELPERS = [
  'map', 'filter', 'take', 'drop', 'flatMap',
  'reduce', 'toArray', 'forEach', 'some', 'every', 'find',
];

// ONE applier for both strip consumers - the differential preload evaluates it in its worker
// realm, the e2e/unit stripped-realm runner evaluates it inside a vm context. self-contained
// ES5 source (lists embedded as JSON) so a realm boundary never has to import anything; ends
// with a CANARY - a consumer realm where the strip silently failed to apply must die loudly,
// not run a vacuous full-env pass under a stripped-realm label
export function buildStripScript(globalNames, iteratorProtoHelpers = []) {
  return `
  var STRIP_PROTO = ${ JSON.stringify(STRIP_PROTO) };
  var STRIP_STATIC = ${ JSON.stringify(STRIP_STATIC) };
  var GLOBAL_NAMES = ${ JSON.stringify(globalNames) };
  var ITER_HELPERS = ${ JSON.stringify(iteratorProtoHelpers) };
  var ITER_PROTO = Object.getPrototypeOf(Object.getPrototypeOf([].values()));
  ITER_HELPERS.forEach(function (name) { try { delete ITER_PROTO[name]; } catch (e) { /* skip */ } });
  var GLOBAL = Function('return this')();
  var CTORS = { Array: Array, String: String, Set: Set, Object: Object, Map: Map, Number: Number, Error: Error };
  Object.keys(STRIP_PROTO).forEach(function (name) {
    STRIP_PROTO[name].forEach(function (method) { try { delete CTORS[name].prototype[method]; } catch (e) { /* frozen - skip */ } });
  });
  Object.keys(STRIP_STATIC).forEach(function (name) {
    STRIP_STATIC[name].forEach(function (key) { try { delete CTORS[name][key]; } catch (e) { /* skip */ } });
  });
  GLOBAL_NAMES.forEach(function (name) { delete GLOBAL[name]; });
  var leftovers = [];
  Object.keys(STRIP_PROTO).forEach(function (name) {
    STRIP_PROTO[name].forEach(function (method) { if (method in CTORS[name].prototype) leftovers.push(name + '.prototype.' + method); });
  });
  Object.keys(STRIP_STATIC).forEach(function (name) {
    STRIP_STATIC[name].forEach(function (key) { if (key in CTORS[name]) leftovers.push(name + '.' + key); });
  });
  GLOBAL_NAMES.forEach(function (name) { if (name in GLOBAL) leftovers.push(name); });
  ITER_HELPERS.forEach(function (name) { if (name in ITER_PROTO) leftovers.push('%IteratorPrototype%.' + name); });
  if (leftovers.length) throw new Error('strip-manifest: strip did not apply: ' + leftovers.join(', '));
  `;
}
