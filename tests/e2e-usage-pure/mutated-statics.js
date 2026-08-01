import HeldMap from '@core-js/pure/actual/map/constructor';
// Monkey-patched STATICS live in their own module: the mutation pre-pass is per-FILE, so a
// patch here would poison the key for every sibling test in a shared module. SLOT writes
// (bare reassign / ctor replacement / delete) are BANNED here - a slot write deopts the
// whole name and every read of it goes verbatim, which breaks engines missing the native
// (they live in mutated-slots.js). each test restores what it patches

// alias-mutation canonicalization at runtime: a patch through a const alias must win over
// the polyfill substitution for reads of the same static (restored afterwards)
QUnit.test('mutated-statics: alias mutation wins over substitution', assert => {
  const A = Array;
  const had = 'of' in A;
  const original = A.of;
  A.of = function patched() {
    return 'patched';
  };
  assert.same(A.of(1), 'patched');
  assert.same(Array.of(2), 'patched');
  // precise restore: assigning `undefined` back would leave an own undefined property
  if (had) A.of = original;
  else delete A.of;
});

// a patch through a DESTRUCTURE-LEAF alias (`const { Iterator: I } = globalThis; I.range = ...`) names the same
// global static as a dotted patch - the pre-pass must follow the destructure KEY (I -> Iterator) via the read-side
// canon, not the raw declarator init (`globalThis`). before the fix the patch was mis-keyed and the read of
// `Iterator.range` routed to the injected polyfill, ignoring the user patch. uses Iterator.range: Iterator is not
// ctor-slot-replaced here and `range` is patched by no sibling (the sibling tests patch Iterator.from), so the
// static is only touched via the path under test and its destructure binding routes through the same pure ctor
QUnit.test('mutated-statics: destructure-leaf alias mutation wins over substitution', assert => {
  const { Iterator: I } = globalThis;
  const had = 'range' in I;
  const original = I.range;
  I.range = function patched() {
    return 'destructure-leaf-patched';
  };
  try {
    assert.same(Iterator.range(0, 3), 'destructure-leaf-patched');
  } finally {
    if (had) I.range = original;
    else delete I.range;
  }
});

// a patch through a COMPUTED const-aliased key (`const k = 'from'; Array[k] = ...`) names the
// same slot as a dotted patch; the resolver follows the const binding, so the later read keeps
// the user patch instead of routing to the polyfill. patch AND restore go through the const-key
// so `Array.from` is only ever touched via the path under test - a dotted restore would mark the
// slot mutated on its own and mask whether the const-key shape is the thing detected
QUnit.test('mutated-statics: computed const-key mutation wins over substitution', assert => {
  const key = 'from';
  const had = 'from' in Array;
  const original = Array[key];
  Array[key] = function patched() {
    return 'cck-patched';
  };
  try {
    assert.same(Array.from([1]), 'cck-patched');
  } finally {
    if (had) Array[key] = original;
    else delete Array[key];
  }
});

// the same const-key resolution applies when the patch arrives through Object.defineProperty
// with a const-aliased key argument (restored through the same key)
QUnit.test('mutated-statics: defineProperty const-key mutation wins over substitution', assert => {
  const key = 'fromEntries';
  const original = Object[key];
  Object.defineProperty(Object, key, {
    value: function patched() { return 'dp-patched'; },
    configurable: true,
    writable: true,
  });
  try {
    assert.same(Object.fromEntries([['a', 1]]), 'dp-patched');
  } finally {
    Object[key] = original;
  }
});

// a wrapper-fronted namespace (`(0, Object).assign(...)`, a common minified shape) still
// resolves to the global Object, so the assign-installed patch wins over the substitution.
// restore through a computed key so the slot is only ever touched via untracked-by-the-old-code
// shapes - a dotted restore would mark it mutated and mask the wrapper-peel under test
QUnit.test('mutated-statics: wrapper-fronted assign mutation wins over substitution', assert => {
  const key = 'fromAsync';
  const had = 'fromAsync' in Array;
  const original = Array[key];
  (0, Object).assign(Array, { fromAsync: function patched() { return 'wf-patched'; } });
  try {
    assert.same(Array.fromAsync([1]), 'wf-patched');
  } finally {
    if (had) Array[key] = original;
    else delete Array[key];
  }
});

// a monkey-patched static routes every surface through one constructor object: the patch,
// the member read, the destructure extraction and the in-check all observe the same value
QUnit.test('mutated-statics: mutated static routes all surfaces through one object', assert => {
  const orig = Iterator.from;
  Iterator.from = function () { return 'patched'; };
  try {
    assert.same(Iterator.from(0), 'patched');
    const { from } = Iterator;
    assert.same(from(0), 'patched');
    assert.true('from' in Iterator);
  } finally {
    Iterator.from = orig;
  }
});

// the patch flows through aliasing and class inheritance off the routed constructor
QUnit.test('mutated-statics: mutated static flows through alias and super', assert => {
  const orig = Iterator.from;
  Iterator.from = function () { return 'flow'; };
  try {
    const I = Iterator;
    assert.same(I.from(0), 'flow');
    class K extends Iterator {
      static make() { return super.from(0); }
    }
    assert.same(K.make(), 'flow');
  } finally {
    Iterator.from = orig;
  }
});

// popular shim patterns at runtime: the mutated key's entry is imported up front
// (polyfill-then-patch), so a guard finds the key PRESENT on the routed constructor and the
// shim stays dead code - on every target, including engines missing the global natively
QUnit.test('mutated-statics: guarded shims stay dead on the enriched constructor', assert => {
  Iterator.from ||= function () { return 'dead-shim'; };
  assert.same(Iterator.from([5].values()).next().value, 5);
  Promise.allSettled = Promise.allSettled || function () { return 'dead-shim'; };
  assert.same(typeof Promise.allSettled, 'function');
  return Promise.allSettled([Promise.resolve(7)]).then(rs => {
    assert.same(rs[0].value, 7);
  });
});

/* eslint-disable es/no-nonstandard-map-properties -- the or-shim pattern targets a deliberately missing key */
QUnit.test('mutated-statics: or-shim on a missing key assigns and serves the shim', assert => {
  Map.customShimKey = Map.customShimKey || function () { return 'served'; };
  try {
    assert.same(Map.customShimKey(), 'served');
  } finally {
    delete Map.customShimKey;
  }
});
/* eslint-enable es/no-nonstandard-map-properties -- end of the missing-key shim pattern */

// a prototype patch lands on the ponyfill prototype that routed instances actually use
/* eslint-disable es/no-nonstandard-iterator-prototype-properties, no-extend-native -- the prototype patch IS the case under test */
QUnit.test('mutated-statics: prototype patch flows through routed instances', assert => {
  Iterator.prototype.customDrop = function () { return 'proto-patch'; };
  try {
    assert.same(Iterator.from([1].values()).customDrop(), 'proto-patch');
  } finally {
    delete Iterator.prototype.customDrop;
  }
});
/* eslint-enable es/no-nonstandard-iterator-prototype-properties, no-extend-native -- end of the prototype-patch case */

// the up-front instance-entry import pins the CORE-JS implementation: a third-party
// prototype patch is not adopted, dispatch helpers keep serving the real polyfill
QUnit.test('mutated-statics: prototype patch does not displace the instance polyfill', assert => {
  /* eslint-disable no-extend-native -- the prototype patch IS the case under test */
  const had = 'at' in String.prototype;
  const orig = String.prototype.at;
  String.prototype.at = function () { return 'bogus'; };
  try {
    assert.same('abc'.at(0), 'a');
  } finally {
    if (had) String.prototype.at = orig;
    else delete String.prototype.at;
  }
  /* eslint-enable no-extend-native -- end of the prototype-patch case */
});

// an optional-member delete is a mutation like any other: it routes through the same
// constructor object the reads use, so the pair stays consistent
/* eslint-disable es/no-nonstandard-map-properties -- the custom-key mutation IS the case under test */
QUnit.test('mutated-statics: optional delete routes through the constructor', assert => {
  Map.customOptDel = 7;
  assert.same(Map.customOptDel, 7);
  delete Map?.customOptDel;
  assert.false('customOptDel' in Map);
});
/* eslint-enable es/no-nonstandard-map-properties -- end of the optional-delete case */

// the ctor-slot replacement test above mutates `globalThis.Map`, making (globalThis, Map)
// a mutated pair FILE-WIDE: bare writes and through-global reads then share the LIVE slot,
// so a key patch lands exactly where the raw destructure read looks
QUnit.test('mutated-statics: slot-mutated ctor shares one object across surfaces', assert => {
  function patched() { return 'patched'; }
  Map.groupBy = patched;
  try {
    assert.same(Map.groupBy(), 'patched');
    const { Map: { groupBy: rawRead } } = globalThis;
    assert.same(rawRead, patched);
  } finally {
    delete Map.groupBy;
  }
});

// with NO slot mutation on the ctor, the nested-proxy destructure normalizes to a flat
// read off the routed constructor - the patch and the read share one object, so the
// patched static is visible through the destructured binding
QUnit.test('mutated-statics: nested-proxy destructure reads through the routed constructor', assert => {
  function patched() { return 'patched'; }
  Iterator.zip = patched;
  try {
    const { Iterator: { zip: routedRead } } = globalThis;
    assert.same(routedRead, patched);
  } finally {
    delete Iterator.zip;
  }
});

// A value-fan mutation receiver names a built-in through any branch. each shape (ternary / logical /
// inline chain-assign / computed const-key) must be detected so the patch and the read route through the
// SAME ponyfill constructor and the patch wins. patch AND restore go through the path under test - a
// dotted restore would mark the slot on its own and make the substitution-bail vacuous. a distinct,
// otherwise-unmutated static per test keeps each fail-before keyed on exactly its shape's detection.
QUnit.test('mutated-statics: ternary-receiver mutation wins over substitution', assert => {
  function patched() { return 'ternary-win'; }
  const useP = true;
  const original = Promise.any;
  (useP ? Promise : Map).any = patched;
  try {
    assert.same(Promise.any([]), 'ternary-win');
  } finally {
    (useP ? Promise : Map).any = original;
  }
});

QUnit.test('mutated-statics: logical-receiver mutation wins over substitution', assert => {
  function patched() { return 'logical-win'; }
  const original = Promise.all;
  // a falsy left operand (`[].pop()` is undefined) selects the Promise branch at runtime; the gate fans
  // both branches statically
  ([].pop() || Promise).all = patched;
  try {
    assert.same(Promise.all([]), 'logical-win');
  } finally {
    ([].pop() || Promise).all = original;
  }
});

QUnit.test('mutated-statics: inline chain-assign receiver mutation wins over substitution', assert => {
  function patched() { return 'chain-assign-win'; }
  const original = Promise.race;
  const box = {};
  (box.recv = Promise).race = patched;
  try {
    assert.same(box.recv, Promise);
    assert.same(Promise.race([]), 'chain-assign-win');
  } finally {
    (box.recv = Promise).race = original;
  }
});

QUnit.test('mutated-statics: computed const-key container mutation wins over substitution', assert => {
  function patched() { return 'computed-key-win'; }
  const registry = { Promise };
  const ckey = 'Promise';
  const original = Promise.try;
  registry[ckey].try = patched;
  try {
    assert.same(Promise.try(() => 0), 'computed-key-win');
  } finally {
    registry[ckey].try = original;
  }
});

// A namespace reached as a proxy-global member (`globalThis.Reflect`, `self.Object`) names the same
// global namespace, so the mutator call is detected; `Reflect.set(target, key, value, RECEIVER)` writes
// to the receiver, the real mutation host. patch and restore reuse the shape.
QUnit.test('mutated-statics: proxy-global namespace mutator wins over substitution', assert => {
  function patched() { return 'namespace-win'; }
  const original = Promise.withResolvers;
  globalThis.Reflect.set(Promise, 'withResolvers', patched);
  try {
    assert.same(Promise.withResolvers(), 'namespace-win');
  } finally {
    globalThis.Reflect.set(Promise, 'withResolvers', original);
  }
});

QUnit.test('mutated-statics: Reflect.set receiver-host mutation wins over substitution', assert => {
  function patched() { return 'receiver-win'; }
  const original = Promise.reject;
  Reflect.set({}, 'reject', patched, Promise);
  try {
    assert.same(Promise.reject('x'), 'receiver-win');
  } finally {
    Reflect.set({}, 'reject', original, Promise);
  }
});

// An `Object.assign` source given as a const-bound variable resolves to its object-literal init, so the
// copied static key is detected like an inline literal source. patch and restore reuse the variable shape.
QUnit.test('mutated-statics: variable-source Object.assign mutation wins over substitution', assert => {
  function patched() { return 'var-source-win'; }
  const original = Iterator.concat;
  const patchSrc = { concat: patched };
  Object.assign(Iterator, patchSrc);
  try {
    assert.same(Iterator.concat([]), 'var-source-win');
  } finally {
    const restoreSrc = { concat: original };
    Object.assign(Iterator, restoreSrc);
  }
});

// `delete Array.from; Array.from?.(...)` keeps the native member (the substitution bails), so the
// optional `?.` MUST survive - dropping it would call the deleted slot unconditionally and throw where
// the native chain short-circuits to undefined. asserts the chain yields undefined rather than throwing.
QUnit.test('mutated-statics: deleted static keeps its optional short-circuit', assert => {
  const original = Array.from;
  delete Array.from;
  try {
    const r = Array.from?.([1]).at(0);
    assert.same(r, undefined);
  } finally {
    Array.from = original;
  }
});

// a PATCHED inherited static reached via `this.X?.()` in a static method with two trailing
// instance polyfills: the optional must dispatch to the patch (no deopt to the pure static),
// while the trailing methods still polyfill against the patch's result. live oracle for the
// chain-combine keeping ownership of a mutated inherited static (bailing it stranded the
// trailing polys as overlapping rewrites - a composition crash at transform time)
QUnit.test('mutated-statics: patched inherited static through optional this-call keeps the patch', assert => {
  const had = 'from' in Array;
  const original = Array.from;
  Array.from = function patched() {
    return [8, [9]];
  };
  try {
    class C extends Array {
      static make() {
        return this.from?.([1, 2]).flat().at(-1);
      }
    }
    assert.same(C.make(), 9);
  } finally {
    if (had) Array.from = original;
    else delete Array.from;
  }
});

// a LOCAL Object shadow silences only the BARE mutator callee: a proxy-global chain still names
// the REAL namespace, so a patch through it is recorded and the later read keeps the user patch
// instead of routing to the receiver-less pure helper. Math.sumPrecise: patched by no sibling
// test; both namespaces are shadowed locally, so EVERY mutator here (patch and restore) reaches
// the real namespace only through the proxy-global chain - a bare dotted restore (or a `delete`)
// would self-mark the slot and mask whether the proxy chain is the thing detected
QUnit.test('mutated-statics: proxy-global mutator with a local namespace shadow keeps the patch', assert => {
  const Object = { defineProperty() { return 'local-noop'; } };
  const Reflect = { deleteProperty() { return 'local-noop'; } };
  assert.same(Object.defineProperty(), 'local-noop');
  assert.same(Reflect.deleteProperty(), 'local-noop');
  const had = 'sumPrecise' in Math;
  const original = Math.sumPrecise;
  globalThis.Object.defineProperty(Math, 'sumPrecise', {
    value: function patched() { return 'proxy-shadow-patched'; },
    configurable: true,
    writable: true,
  });
  try {
    assert.same(Math.sumPrecise([1, 2]), 'proxy-shadow-patched');
  } finally {
    if (had) {
      globalThis.Object.defineProperty(Math, 'sumPrecise', { value: original, configurable: true, writable: true });
    } else globalThis.Reflect.deleteProperty(Math, 'sumPrecise');
  }
});

// a COMPUTED const-aliased mutator callee (`Object[dp]` over `const dp = 'defineProperty'`) names
// the same mutator as the dotted form, so the patch records and the read keeps it. Object.groupBy:
// patched by no sibling test; the restore stays on the COMPUTED-callee channel - a bare `delete`
// would self-mark the slot and mask whether the computed form is the thing detected
QUnit.test('mutated-statics: computed mutator callee keeps the patch', assert => {
  const dp = 'defineProperty';
  const del = 'deleteProperty';
  const had = 'groupBy' in Object;
  const original = Object.groupBy;
  Object[dp](Object, 'groupBy', {
    value: function patched() { return 'computed-callee-patched'; },
    configurable: true,
    writable: true,
  });
  try {
    assert.same(Object.groupBy([1], it => it), 'computed-callee-patched');
  } finally {
    if (had) {
      Object[dp](Object, 'groupBy', { value: original, configurable: true, writable: true });
    } else Reflect[del](Object, 'groupBy');
  }
});

// a CALL-EXPRESSION mutation receiver (`getArr().from = patch`) records like an identifier
// one - the later bare read serves the patch instead of the extracted pure static
QUnit.test('mutated-statics: call-receiver patch is honored by later reads', assert => {
  const original = Array.from;
  function getArr() { return Array; }
  getArr().from = () => 'patched';
  try {
    assert.same(Array.from('ab'), 'patched');
  } finally {
    getArr().from = original;
  }
});

// a MUTATED ctor read through a kept-assign navigation: the claim machinery must NOT collapse
// `.Set` to its pristine ponyfill - the read goes through the receiver swap, so the user's
// patched class (with its own name) stays visible; the kept assignment still runs. the
// non-optional spelling survives transpile-lowering, so every leg runs it
QUnit.test('mutated-statics: kept-assign navigation honors a patched ctor', assert => {
  const original = globalThis.Set;
  globalThis.Set = class PatchedSet extends original {};
  let m;
  let p;
  try {
    assert.same((m = globalThis.window).self.Set.name, 'PatchedSet');
    assert.same(m, globalThis.window);
    // the resolvable-root optional spelling: lowered legs desugar it into the ternary-alias
    // shape, and the swap must still serve the patched class there
    assert.same((p = globalThis)?.self.Set.name, 'PatchedSet');
    assert.same(p, globalThis);
  } finally {
    globalThis.Set = original;
  }
});

// a MUTATED static behind a double proxy-hop optional chain: the mutation cancels the
// always-defined claim, so the `?.` must keep its guard and bind the chain ROOT - the
// sealed emit (`((n = w)?.Array).of(1)` - the paren kills the short-circuit) threw here
// on the absent `window`, and a nav-level memo collapsed into the always-defined ponyfill
// (the guard never fired). where `window` is absent (Node) the chain must short-circuit to
// undefined; where it exists (browsers) the raw guarded nav serves the PATCH - assignment
// and prefix side effect running exactly once either way
QUnit.test('mutated-statics: double-hop optional chain over a patched static short-circuits', assert => {
  const original = Array.of;
  globalThis.Array.of = function patched() { return [7]; };
  const win = globalThis.window;
  const hasWindow = win !== undefined;
  try {
    let n;
    let sc = 0;
    const r = (sc++, n = globalThis.window)?.self?.self.Array.of(1).flat?.();
    if (hasWindow) assert.deepEqual(r, [7]);
    else assert.same(r, undefined);
    assert.same(n, win);
    assert.same(sc, 1);
    let v;
    const nameTail = (v = globalThis.window)?.self?.self.Set.name.at?.(0);
    assert.same(nameTail, hasWindow ? 'S' : undefined);
    assert.same(v, win);
    // the ALIAS spelling of the same root rides the same guard (the sealed emit threw here too)
    const w = globalThis.window;
    let a;
    const viaAlias = (a = w)?.self?.self.Array.of(1).flat?.();
    if (hasWindow) assert.deepEqual(viaAlias, [7]);
    else assert.same(viaAlias, undefined);
    assert.same(a, win);
  } finally {
    globalThis.Array.of = original;
  }
});

// a SINGLE proxy hop under a DOUBLE `?.` over an undefinable root: the leaf swap used to
// claim the prefix always-defined and eat the ROOT guard - the chain then read a live value
// where native short-circuits to undefined on the absent `window` (Node); with `window`
// present (browsers) the surviving guard passes and the patch stays visible. covers the
// mutated AND the non-mutated leaf, and the alias spelling
QUnit.test('mutated-statics: single-hop double-optional chain keeps its root guard', assert => {
  const original = globalThis.Set;
  globalThis.Set = class PatchedSet extends original {};
  const win = globalThis.window;
  const hasWindow = win !== undefined;
  try {
    let v;
    assert.same((v = globalThis.window)?.self?.Set.name, hasWindow ? 'PatchedSet' : undefined);
    assert.same(v, win);
    let n;
    assert.same((n = globalThis.window)?.self?.Array.isArray([1]), hasWindow ? true : undefined);
    assert.same(n, win);
    const w = globalThis.window;
    let a;
    assert.same((a = w)?.self?.Set.name, hasWindow ? 'PatchedSet' : undefined);
    assert.same(a, win);
    // a raw mutated-static read over the same root rides the surviving guard too - the
    // patch must be LIVE here (the raw read is the point; without it `window.Array.of`
    // does not exist on ie11 and the call throws natively)
    const originalOf = Array.of;
    globalThis.Array.of = function patchedOf() { return [1]; };
    try {
      let c;
      const ofRead = (c = globalThis.window)?.Array?.of(9);
      if (hasWindow) assert.deepEqual(ofRead, [1]);
      else assert.same(ofRead, undefined);
      assert.same(c, win);
    } finally {
      globalThis.Array.of = originalOf;
    }
    // the always-defined root keeps the leaf-swap deopt and serves the patch
    let p;
    assert.same((p = globalThis)?.self.Set.name, 'PatchedSet');
    assert.same(p, globalThis);
  } finally {
    globalThis.Set = original;
  }
});

// an array literal is a static container on the WRITE side too: its slots are index-keyed members, so
// a patch THROUGH one names the same static the receiver walk reads. regression: only the read side
// saw the slot, and the polyfill silently overrode the replacement. the patch is restored right after
// the read - a live one would follow every later `Array.of` in this module
QUnit.test('mutated-statics: a patch through an array slot beats the polyfill', assert => {
  const originalOf = Array.of;
  const box = [Array];
  box[0].of = function patchedOf() { return 'PATCHED'; };
  try {
    const { 0: { of } } = box;
    assert.same(of(1, 2), 'PATCHED');
  } finally {
    globalThis.Array.of = originalOf;
  }
  // the same slot with NO patch resolves its static, so the pairing is not vacuous
  const clean = [Object];
  const { 0: { keys } } = clean;
  assert.deepEqual(keys({ a: 1 }), ['a']);
});

// the slot-write family that never spells a member write still replaces what the container's slot
// holds - a mutator call, a callee that may write, a delete, a dynamic key. each must keep the
// program's replacement winning over the polyfill; no global is touched, so nothing to restore
QUnit.test('mutated-statics: non-member-write slot changes keep their replacement', assert => {
  const viaAssign = { k: Array };
  Object.assign(viaAssign, { k: { of: () => 'ASSIGN' } });
  const { k: { of: assignOf } } = viaAssign;
  assert.same(assignOf(1), 'ASSIGN');
  const viaClosure = { k: Array };
  (function poison(target) { target.k = { of: () => 'CLOSURE' }; })(viaClosure);
  const { k: { of: closureOf } } = viaClosure;
  assert.same(closureOf(1), 'CLOSURE');
  const viaDynamic = { k: Array };
  const dynamicKey = 'k';
  viaDynamic[dynamicKey] = { of: () => 'DYNAMIC' };
  const { k: { of: dynamicOf } } = viaDynamic;
  assert.same(dynamicOf(1), 'DYNAMIC');
  const viaDelete = { k: Array };
  delete viaDelete.k;
  const { k: deletedSlot } = viaDelete;
  assert.same(deletedSlot, undefined);
});

// the escape family at runtime: a repositioned container, a thrown-and-patched one and an aliased
// one must all read what the PROGRAM left in the slot, never the polyfill. locals only - no restore
QUnit.test('mutated-statics: escape-family reads match native', assert => {
  const repositioned = [{ of: () => 'FIRST' }, Array];
  repositioned.reverse();
  const { 0: { of: shifted } } = repositioned;
  assert.same(shifted, Array.of);
  const thrown = { k: Array };
  try {
    throw thrown;
  } catch (error) {
    error.k = { of: () => 'CAUGHT' };
  }
  const { k: { of: fromThrown } } = thrown;
  assert.same(fromThrown(1), 'CAUGHT');
  const aliased = { k: Array };
  const aliasHandle = aliased;
  aliasHandle.k = { of: () => 'ALIASED' };
  const { k: { of: fromAlias } } = aliased;
  assert.same(fromAlias(1), 'ALIASED');
});

// the remaining bail family at runtime: an optional receiver keeps NATIVE throw semantics when the
// chain is undefined, and a wholly-reassigned / conditionally-written / parameter-passed container
// reads what the program put there - the polyfill never overrides any of them
QUnit.test('mutated-statics: bail-family runtime semantics match native', assert => {
  const holeHost = {};
  assert.throws(() => {
    // eslint-disable-next-line no-unsafe-optional-chaining -- the native throw IS the case under test
    const { at } = holeHost.missing?.list;
    return at;
  }, TypeError);
  // the initial container value is intentionally dead - the reassignment IS the case under test
  // eslint-disable-next-line no-useless-assignment -- see above
  let swapped = { k: Array };
  swapped = { k: { of: () => 'SWAPPED' } };
  const { k: { of: fromSwapped } } = swapped;
  assert.same(fromSwapped(1), 'SWAPPED');
  const conditional = { k: Array };
  const always = true;
  if (always) conditional.k = { of: () => 'CONDITIONAL' };
  const { k: { of: fromConditional } } = conditional;
  assert.same(fromConditional(1), 'CONDITIONAL');
  const viaParam = (function (incoming) {
    const { k: { of } } = incoming;
    return of;
  })({ k: { of: () => 'PARAM' } });
  assert.same(viaParam(1), 'PARAM');
});

// a user patch on the static wins through an ALIAS-resolved computed key exactly like the
// literal spelling - the alias names the same mutated slot, so no ponyfill may substitute
QUnit.test('mutated-statics: patch wins through an alias-resolved computed key', assert => {
  const original = Array.from;
  Array.from = function patched() { return 'ALIAS-KEY'; };
  try {
    const key = 'from';
    const aliasedKey = key;
    assert.same(Array[aliasedKey]?.([1]), 'ALIAS-KEY');
  } finally {
    Array.from = original;
  }
});

// a patch through a HELD pure ctor import (the spelling a second plugin pass sees after the
// first pass minted the ctor binding): the minted-shape mutation gate must register it, so
// the read dispatches the patch - a substituted polyfill here would defeat the user's patch
QUnit.test('mutated-statics: patch through a held pure ctor import wins', assert => {
  const original = HeldMap.groupBy;
  HeldMap.groupBy = function patched() { return 'HELD-CTOR'; };
  try {
    assert.same(HeldMap.groupBy([], it => it), 'HELD-CTOR');
  } finally {
    HeldMap.groupBy = original;
  }
});
