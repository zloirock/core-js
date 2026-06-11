// Destructuring: const { method } = Constructor - ObjectPattern path in usagePure

QUnit.test('destructuring: const { from } = Array', assert => {
  const { from } = Array;
  assert.deepEqual(from([1, 2, 3]), [1, 2, 3]);
  assert.deepEqual(from('abc'), ['a', 'b', 'c']);
});

QUnit.test('destructuring: const { assign, keys } = Object', assert => {
  const { assign, keys } = Object;
  assert.deepEqual(assign({}, { a: 1 }), { a: 1 });
  assert.deepEqual(keys({ x: 1, y: 2 }), ['x', 'y']);
});

QUnit.test('destructuring: const { resolve, all } = Promise', assert => {
  const { resolve, all } = Promise;
  const async = assert.async();
  all([resolve(1), resolve(2)]).then(r => {
    assert.deepEqual(r, [1, 2]);
    async();
  });
});

QUnit.test('destructuring: const { isFinite, isNaN } = Number', assert => {
  const { isFinite, isNaN } = Number;
  assert.true(isFinite(42));
  assert.false(isFinite(Infinity));
  assert.true(isNaN(NaN));
  assert.false(isNaN(1));
});

QUnit.test('destructuring: const { sign, trunc } = Math', assert => {
  const { sign, trunc } = Math;
  assert.same(sign(-5), -1);
  assert.same(trunc(1.9), 1);
});

QUnit.test('destructuring: const { ownKeys } = Reflect', assert => {
  const { ownKeys } = Reflect;
  assert.deepEqual(ownKeys({ a: 1 }), ['a']);
});

// multi-word method names exercise the kebab->camel conversion in the polyfill-entry
// resolver: canonical entry path uses kebab segments (`reflect/set-prototype-of`,
// `array/from-async`, `promise/with-resolvers`) but lookup-table keys are camelCase.
// without the conversion these destructures would not be recognised as polyfill aliases

QUnit.test('destructuring: const { setPrototypeOf } = Object', assert => {
  const { setPrototypeOf } = Object;
  const obj = {};
  setPrototypeOf(obj, { tag: 'custom' });
  assert.same(obj.tag, 'custom');
});

QUnit.test('destructuring: const { setPrototypeOf } = Reflect', assert => {
  const { setPrototypeOf } = Reflect;
  const obj = {};
  assert.true(setPrototypeOf(obj, { tag: 'reflect' }));
  assert.same(obj.tag, 'reflect');
});

QUnit.test('destructuring: const { fromAsync } = Array', assert => {
  const { fromAsync } = Array;
  const async = assert.async();
  fromAsync([1, 2, 3], x => x * 10).then(arr => {
    assert.deepEqual(arr, [10, 20, 30]);
    async();
  });
});

QUnit.test('destructuring: const { fromEntries, getOwnPropertyDescriptor } = Object', assert => {
  const { fromEntries, getOwnPropertyDescriptor } = Object;
  assert.deepEqual(fromEntries([['a', 1], ['b', 2]]), { a: 1, b: 2 });
  assert.same(getOwnPropertyDescriptor({ x: 42 }, 'x').value, 42);
});

QUnit.test('destructuring: const { canParse, parse } = URL', assert => {
  const { canParse, parse } = URL;
  assert.true(canParse('https://example.com'));
  assert.same(parse('https://example.com').hostname, 'example.com');
});

QUnit.test('destructuring: const { groupBy } = Map (multi-word renamed)', assert => {
  const { groupBy: mapGroupBy } = Map;
  const result = mapGroupBy([1, 2, 3, 4], x => x % 2 ? 'odd' : 'even');
  assert.deepEqual(result.get('odd'), [1, 3]);
});

// rest element - polyfill extracted, rest semantics preserved (from excluded from rest)
QUnit.test('destructuring: rest element with polyfilled property', assert => {
  const { from, ...rest } = Array;
  assert.deepEqual(from([1, 2]), [1, 2]);
  assert.false('from' in rest);
});

QUnit.test('destructuring: rest element with multiple polyfilled properties', assert => {
  const { assign, keys, ...rest } = Object;
  assert.deepEqual(assign({}, { a: 1 }), { a: 1 });
  assert.deepEqual(keys({ x: 1 }), ['x']);
  assert.false('assign' in rest);
  assert.false('keys' in rest);
});

// assignment destructuring (not declaration)
QUnit.test('destructuring: assignment expression', assert => {
  let from;
  // eslint-disable-next-line prefer-const -- testing assignment destructuring
  ({ from } = Array);
  assert.deepEqual(from([1, 2, 3]), [1, 2, 3]);
});

// renamed binding
QUnit.test('destructuring: renamed binding', assert => {
  const { from: arrayFrom } = Array;
  assert.deepEqual(arrayFrom([1]), [1]);
});

// from globalThis proxy
QUnit.test('destructuring: from globalThis', assert => {
  const { Promise: P } = globalThis;
  const async = assert.async();
  P.resolve(42).then(v => {
    assert.same(v, 42);
    async();
  });
});

QUnit.test('destructuring: const { from } = Array ?? null', assert => {
  const { from } = Array ?? null;
  assert.deepEqual(from([1, 2]), [1, 2]);
});

QUnit.test('destructuring: const { from } = Array || Promise', assert => {
  const { from } = Array || Promise;
  assert.deepEqual(from('ab'), ['a', 'b']);
});

QUnit.test('destructuring: sequence expression init', assert => {
  const { from } = (0, Array);
  assert.deepEqual(from('abc'), ['a', 'b', 'c']);
});

QUnit.test('destructuring: with default value', assert => {
  const { from = null } = Array;
  assert.same(typeof from, 'function');
  assert.deepEqual(from([1]), [1]);
});

// deferred-SE fixed-point loop: when a destructure SE contains a callback whose body
// has another destructure-with-SE, the inner SE must survive the compiler's lift

QUnit.test('destructuring: nested SE inside lifted callback', assert => {
  const log = [];
  let captured;
  const wrap = obj => {
    log.push('outer');
    captured = obj.fn;
  };
  const innerFn = () => {
    const { of } = (log.push('inner'), Array);
    return of;
  };
  const { from } = (wrap({ fn: innerFn }), Array);
  assert.deepEqual(log, ['outer']);
  assert.same(typeof captured(), 'function');
  assert.deepEqual(log, ['outer', 'inner']);
  assert.same(typeof from, 'function');
});

QUnit.test('destructuring: triple-level nested SE', assert => {
  const log = [];
  let mid, deep;
  const outer = cb => {
    log.push('outer');
    mid = cb;
  };
  const wrap = cb => {
    log.push('mid');
    deep = cb;
  };
  const { from } = (outer(() => {
    const { of } = (wrap(() => {
      const { fromAsync } = (log.push('deep'), Array);
      return fromAsync;
    }), Array);
    return of;
  }), Array);
  assert.deepEqual(log, ['outer']);
  mid();
  assert.deepEqual(log, ['outer', 'mid']);
  assert.same(typeof deep(), 'function');
  assert.deepEqual(log, ['outer', 'mid', 'deep']);
  assert.same(typeof from, 'function');
});

QUnit.test('destructuring: nested SE in assignment form', assert => {
  const log = [];
  let captured;
  const wrap = obj => {
    log.push('outer');
    captured = obj.fn;
  };
  const innerFn = () => {
    const { of } = (log.push('inner'), Array);
    return of;
  };
  let from;
  // eslint-disable-next-line prefer-const -- testing assignment-form destructure path
  ({ from } = (wrap({ fn: innerFn }), Array));
  captured();
  assert.deepEqual(log, ['outer', 'inner']);
  assert.same(typeof from, 'function');
});

QUnit.test('destructuring: deeply nested with Array.from / array defaults', assert => {
  const { a: { b = Array.from('xyz'), c: [first = 'none'] = [] } = {} } = { a: { c: [] } };
  assert.deepEqual(b, ['x', 'y', 'z']);
  assert.same(first, 'none');
});

// IIFE-invoked param destructure with a member-expression default + a classifiable caller-arg:
// the caller passes the receiver, so the member default never fires; the polyfill must be wired
// onto the live caller-arg, not the dead default (else the destructured method is undefined)
QUnit.test('destructuring: IIFE member-default overridden by caller-arg', assert => {
  // eslint-disable-next-line es/no-nonstandard-iterator-properties -- testing
  const result = (function ({ of } = globalThis.Iterator) {
    return of(1);
  })(Array);
  assert.deepEqual(result, [1]);
});

// --- Computed-key destructuring ---
// a const-Identifier computed key `[k]` is recognised as a polyfill alias just like a plain key:
// declaration form body-extracts (`const m = _polyfill`), param-default form mirrors the key into
// a synth default (`{ [k]: m } = { [k]: _polyfill }`). these run the transformed output to prove
// the binding resolves, a caller-passed receiver still wins, and mutable / sibling-reading keys
// stay on the single-read fallback path

QUnit.test('computed-key: const { [k]: from } = Array', assert => {
  const k = 'from';
  const { [k]: from } = Array;
  assert.deepEqual(from([1, 2, 3]), [1, 2, 3]);
  assert.deepEqual(from('abc'), ['a', 'b', 'c']);
});

QUnit.test('computed-key: param-default no-arg uses the polyfilled default', assert => {
  const k = 'of';
  const fn = function ({ [k]: of } = Array) {
    return of(7, 8);
  };
  assert.deepEqual(fn(), [7, 8]);
});

// the synth default scopes the polyfill to the no-arg case; a caller-passed receiver must still
// win. were the computed key body-extracted ("polyfill always wins") both calls would return [1]
QUnit.test('computed-key: param-default preserves a caller-passed receiver', assert => {
  const k = 'of';
  const fn = function ({ [k]: of } = Array) {
    return of(1);
  };
  assert.deepEqual(fn(), [1]);
  const custom = { of: (...args) => ['custom', ...args] };
  assert.deepEqual(fn(custom), ['custom', 1]);
});

// plain key `k` and computed key `[k]` share the Identifier name 'k' but address different slots;
// the per-receiver polyfill map must key them apart, else plain `k` picks up the computed polyfill
QUnit.test('computed-key: plain `k` and computed `[k]` do not collide', assert => {
  const k = 'of';
  // eslint-disable-next-line es/no-nonstandard-array-properties -- plain key 'k' is an intentionally absent property
  const fn = function ({ k: plainK, [k]: ofMethod } = Array) {
    return [plainK, ofMethod(9)];
  };
  const [plainK, ofResult] = fn();
  assert.same(plainK, undefined);
  assert.deepEqual(ofResult, [9]);
});

QUnit.test('computed-key: interior position { from, [k]: build, of }', assert => {
  // computed key is itself a polyfilled static, so it resolves on every target (not just native)
  const k = 'fromAsync';
  const fn = function ({ from, [k]: build, of } = Array) {
    return [from([3]), typeof build, of(4)];
  };
  const [fromResult, buildType, ofResult] = fn();
  assert.deepEqual(fromResult, [3]);
  assert.same(buildType, 'function');
  assert.deepEqual(ofResult, [4]);
});

QUnit.test('computed-key: per-branch synth { from, [k]: len } = cond ? Array : Object', assert => {
  const k = 'length';
  const pick = cond => (function ({ from, [k]: len } = cond ? Array : Object) {
    return typeof from === 'function' ? [from([5]), typeof len] : null;
  })();
  assert.deepEqual(pick(true), [[5], 'number']);
  assert.same(pick(false), null);
});

// `[of]` reads the SIBLING binding `of`, so the synth default (evaluated before the pattern binds)
// would read the wrong value - the scope-gate keeps this on the single-read inline-default path
QUnit.test('computed-key: sibling-binding read stays single-read', assert => {
  const fn = function ({ of, [of]: picked } = Array) {
    return [typeof of, picked];
  };
  const [ofType, picked] = fn();
  assert.same(ofType, 'function');
  assert.same(picked, undefined);
});

// computed destructure key with a side-effecting prefix `[(eff(), 'from')]` resolving to a
// polyfillable static: the prefix effect runs exactly once AND the static is polyfilled, so `from`
// is a working Array.from even on engines without the native (the polyfill wins instead of leaving
// `from` undefined). regression: the effect was once dropped, then the static was bailed (left
// native -> undefined on ie:11)
QUnit.test('computed-key: side-effecting prefix preserved, run once', assert => {
  const log = [];
  const { [(log.push('eff'), 'from')]: from } = Array;
  assert.deepEqual(log, ['eff']);
  assert.deepEqual(from([1, 2, 3]), [1, 2, 3]);
});

// same bail across other destructure shapes - the side effect must survive in each
QUnit.test('computed-key: side-effecting prefix in nested destructure', assert => {
  const log = [];
  const { x: { [(log.push('eff'), 'from')]: from } } = { x: Array };
  assert.deepEqual(log, ['eff']);
  assert.deepEqual(from([4, 5]), [4, 5]);
});

QUnit.test('computed-key: side-effecting prefix in param-default destructure', assert => {
  const log = [];
  const pick = ({ [(log.push('eff'), 'from')]: from } = Array) => from;
  const from = pick();
  assert.deepEqual(log, ['eff']);
  assert.deepEqual(from([6, 7]), [6, 7]);
});

// the polyfilled key flanked by SIBLING computed keys with their own side-effecting prefixes, on both
// sides. the middle effect can't be lifted out (it would reorder relative to the siblings), so the key
// stays in the residual pattern (value -> throwaway) and the polyfill is extracted separately. all
// three effects must run in SOURCE ORDER, and the siblings must still bind
QUnit.test('computed-key: side-effecting siblings on both sides run in order', assert => {
  const log = [];
  // sibling keys read standard, non-polyfilled Array statics (`length`, `prototype`) so they survive as
  // residual bindings while the middle `from` is polyfilled - the point is that all three key prefixes
  // run in source order
  const { [(log.push('before'), 'length')]: x, [(log.push('eff'), 'from')]: from, [(log.push('after'), 'prototype')]: y } = Array;
  assert.deepEqual(log, ['before', 'eff', 'after']);
  assert.strictEqual(x, Array.length);
  assert.strictEqual(y, Array.prototype);
  assert.deepEqual(from([1, 2, 3]), [1, 2, 3]);
});

// two ADJACENT polyfilled side-effecting keys: both stay in the residual (renamed), each polyfill
// extracted to its own binding, effects in order
QUnit.test('computed-key: adjacent polyfilled side-effecting keys', assert => {
  const log = [];
  const { [(log.push('e1'), 'from')]: from, [(log.push('e2'), 'of')]: of } = Array;
  assert.deepEqual(log, ['e1', 'e2']);
  assert.deepEqual(from([4, 5]), [4, 5]);
  assert.deepEqual(of(6, 7), [6, 7]);
});

// a side-effecting computed key resolving to an INSTANCE method (`flat`): the polyfill needs the
// receiver, so the key stays in the residual (it can't lift the effect out) and `const m = _flat(arr)`
// is extracted. regression: the effect was dropped (babel) / nothing emitted (unplugin)
QUnit.test('computed-key: side-effecting prefix on instance-method key kept', assert => {
  const log = [];
  const arr = [3, [4]];
  const { [(log.push('eff'), 'flat')]: m } = arr;
  assert.deepEqual(log, ['eff']);
  assert.strictEqual(typeof m, 'function');
});

// instance-method key with side-effecting siblings on both sides: effects run in source order, every
// binding survives
QUnit.test('computed-key: instance-method key with side-effecting siblings runs in order', assert => {
  const log = [];
  const arr = [5, [6]];
  const { [(log.push('before'), 'length')]: x, [(log.push('eff'), 'flat')]: m, [(log.push('after'), 'concat')]: n } = arr;
  assert.deepEqual(log, ['before', 'eff', 'after']);
  assert.strictEqual(x, arr.length);
  assert.strictEqual(typeof m, 'function');
  assert.strictEqual(typeof n, 'function');
});

// for-init declarator: a loop header can't host a preceding statement, so the polyfill is bound as a
// SIBLING declarator (`for (const { [k]: _unused } = Array, from = _Array$from; ...)`). regression: the
// effect was preserved but the static read the NATIVE via an inline default (broken on ie:11)
QUnit.test('computed-key: side-effecting prefix in for-init declarator', assert => {
  const log = [];
  let ran = 0;
  for (const { [(log.push('eff'), 'from')]: from } = Array; ran < 1; ran++) {
    assert.strictEqual(typeof from, 'function');
    assert.deepEqual(from([1, 2]), [1, 2]);
  }
  assert.deepEqual(log, ['eff']);
});

// multi-declarator: the polyfill is extracted to a preceding `const`, the key stays in the residual
// declarator. same native-via-inline-default regression as for-init
QUnit.test('computed-key: side-effecting prefix in multi-declarator', assert => {
  const log = [];
  const a = 1,
        { [(log.push('eff'), 'from')]: from } = Array;
  assert.strictEqual(a, 1);
  assert.deepEqual(log, ['eff']);
  assert.deepEqual(from([3, 4]), [3, 4]);
});

// nested destructure mixing a STATIC key (`from`) and an INSTANCE key (`flat`) in sibling branches, each
// with its own effecting prefix. BOTH polyfill: the receiver `[1, [2]]` is a side-effect-free literal, so
// it is safe to re-reference for the instance extract (`m = _flatMaybeArray([1, [2]])`). regression: this
// once crashed unplugin (the static branch's split swallowed the sibling branch), and `flat` was left
// NATIVE (undefined on IE 11) - exercise `m` so a missing polyfill fails. both effects run in source order
QUnit.test('computed-key: nested static + instance sibling branches', assert => {
  const log = [];
  const { x: { [(log.push('s'), 'from')]: f }, y: { [(log.push('i'), 'flat')]: m } } = { x: Array, y: [1, [2]] };
  assert.deepEqual(log, ['s', 'i']);
  assert.deepEqual(f([5, 6]), [5, 6]);
  assert.deepEqual(m.call([3, [4]]), [3, 4]);
});

// a side-effecting computed key two levels deep: key kept in place, polyfill bound separately
QUnit.test('computed-key: side-effecting prefix two levels deep', assert => {
  const log = [];
  const { a: { b: { [(log.push('e'), 'from')]: f } } } = { a: { b: Array } };
  assert.deepEqual(log, ['e']);
  assert.deepEqual(f([7, 8]), [7, 8]);
});

// a `...rest` sibling: the key stays in the residual (rest excludes it) and the effect runs ONCE.
// regression: babel lifted the effect AND kept the key for rest exclusion -> the effect ran twice
QUnit.test('computed-key: side-effecting prefix with a rest sibling runs once', assert => {
  const log = [];
  const { [(log.push('eff'), 'from')]: from, ...rest } = Array;
  assert.deepEqual(log, ['eff']);
  assert.deepEqual(from([1, 2]), [1, 2]);
  assert.strictEqual(typeof rest, 'object');
});

// nested key with a rest sibling - same once-only guarantee one level down
QUnit.test('computed-key: nested side-effecting prefix with a rest sibling runs once', assert => {
  const log = [];
  const { x: { [(log.push('eff'), 'from')]: from, ...rest } } = { x: Array };
  assert.deepEqual(log, ['eff']);
  assert.deepEqual(from([3, 4]), [3, 4]);
  assert.strictEqual(typeof rest, 'object');
});

// nested key in a for-init declarator. regression: the unplugin flatten's statement-lift is illegal in
// a loop header, so it crashed (inner-transformed effect) / dropped the effect; now it stays in place
QUnit.test('computed-key: nested side-effecting prefix in a for-init declarator', assert => {
  const log = [];
  let bound;
  let once = true;
  for (const { x: { [(log.push('eff'), 'from')]: from } } = { x: Array }; once; once = false) bound = from;
  assert.deepEqual(log, ['eff']);
  assert.deepEqual(bound([5, 6]), [5, 6]);
});

// a polyfilled SE-key (`from`) beside a non-polyfilled one (`isArray`, native for the target): the
// polyfilled key uses the residual, the native key stays in the pattern, and BOTH effects run in order
QUnit.test('computed-key: polyfilled + non-polyfilled side-effecting keys both run', assert => {
  const log = [];
  const { [(log.push('a'), 'from')]: from, [(log.push('b'), 'isArray')]: isArr } = Array;
  assert.deepEqual(log, ['a', 'b']);
  assert.deepEqual(from([1, 2]), [1, 2]);
  assert.true(isArr([]));
});

// a NESTED instance method with an Identifier receiver now polyfills: the receiver is resolved by
// walking the RHS along the nesting key (`y` -> `arr`), and `_flatMaybeArray(arr)` is extracted. the
// extracted `m` is the (unbound) flat method, used via `m.call(arr)` - exactly as native `arr.flat` is
QUnit.test('computed-key: nested instance method with Identifier receiver polyfills', assert => {
  const log = [];
  const arr = [1, [2]];
  const { y: { [(log.push('eff'), 'flat')]: m } } = { y: arr };
  assert.deepEqual(log, ['eff']);
  assert.deepEqual(m.call(arr), [1, 2]);
});

// static + instance mixed nested branches: BOTH polyfill, both effects run in source order
QUnit.test('computed-key: nested mixed static + instance branches both polyfill', assert => {
  const log = [];
  const arr = [1, [2]];
  const { x: { [(log.push('s'), 'from')]: from }, y: { [(log.push('i'), 'flat')]: flat } } = { x: Array, y: arr };
  assert.deepEqual(log, ['s', 'i']);
  assert.deepEqual(from([3, 4]), [3, 4]);
  assert.deepEqual(flat.call(arr), [1, 2]);
});

// a NESTED instance method WITHOUT a side-effect key now polyfills too when the receiver resolves to a
// bare Identifier: `const m = _flatMaybeArray(arr)`. `m` is the unbound flat method, used via `m.call(arr)`
QUnit.test('destructuring: nested instance method (no SE-key) polyfills with Identifier receiver', assert => {
  const arr = [1, [2]];
  const { y: { flat: m } } = { y: arr };
  assert.deepEqual(m.call(arr), [1, 2]);
});

// a nested instance method in a FOR-INIT declarator: the polyfill binds as a SIBLING declarator in the
// loop header (a preceding statement is impossible there). regression: babel threw "Duplicate declaration"
QUnit.test('destructuring: nested instance method in a for-init declarator polyfills', assert => {
  const arr = [1, [2]];
  let once = true;
  let bound;
  for (const { y: { flat: m } } = { y: arr }; once; once = false) bound = m;
  assert.deepEqual(bound.call(arr), [1, 2]);
});

// a nested instance method in a MULTI-declarator: the polyfill binds as a TRAILING sibling declarator
// (`..., m = _flatMaybeArray(arr)`), safe even when the receiver is bound earlier in the same declaration
QUnit.test('destructuring: nested instance method in a multi-declarator polyfills', assert => {
  const arr = [1, [2]];
  const z = 1,
        { y: { flat: m } } = { y: arr };
  assert.strictEqual(z, 1);
  assert.deepEqual(m.call(arr), [1, 2]);
});

// two separate destructure declarators in one declaration - a static (`from`) and a nested instance
// (`flat`): both polyfill, the instance binds via its own trailing sibling declarator
QUnit.test('destructuring: two destructure declarators (static + nested instance) both polyfill', assert => {
  const arr = [1, [2]];
  const { a: { from: f } } = { a: Array },
        { y: { flat: m } } = { y: arr };
  assert.deepEqual(f([3, 4]), [3, 4]);
  assert.deepEqual(m.call(arr), [1, 2]);
});

// a parenthesized RHS object literal: parens are transparent, so the nested instance still resolves its
// receiver through them (the receiver resolver peels parens / TS casts before walking the literal)
QUnit.test('destructuring: nested instance with a parenthesized RHS polyfills', assert => {
  const arr = [1, [2]];
  // eslint-disable-next-line @stylistic/no-extra-parens -- testing the receiver resolver peels a parenthesized RHS
  const { y: { flat: m } } = ({ y: arr });
  assert.deepEqual(m.call(arr), [1, 2]);
});

// an ArrayPattern wrapper around the nested instance: the receiver resolver walks array indices (not just
// object keys), and the host-emission path already handles ArrayPattern - so this polyfills too
QUnit.test('destructuring: nested instance under an array-pattern wrapper polyfills', assert => {
  const arr = [1, [2]];
  const [{ y: { flat: m } }] = [{ y: arr }];
  assert.deepEqual(m.call(arr), [1, 2]);
});

// an ArrayPattern that DIRECTLY wraps the instance pattern (no intervening object key): the wrapper peels
// to the declarator, and the receiver resolves through the array index
QUnit.test('destructuring: nested instance directly under an array-pattern wrapper polyfills', assert => {
  const arr = [1, [2]];
  const [{ flat: m }] = [arr];
  assert.deepEqual(m.call(arr), [1, 2]);
});

// a nested instance method in a destructuring-ASSIGNMENT (no declaration to extract a `const` into): the
// polyfill appends `m = _flatMaybeArray(arr)` after the statement, overwriting the native value
QUnit.test('destructuring: nested instance in a destructuring-assignment polyfills', assert => {
  const arr = [1, [2]];
  let m;
  // eslint-disable-next-line prefer-const -- testing assignment destructuring
  ({ y: { flat: m } } = { y: arr });
  assert.deepEqual(m.call(arr), [1, 2]);
});

// a destructuring-assignment with a top-level sibling binding alongside the nested instance: the sibling
// survives the destructure, and the appended instance overwrite (`m = _flatMaybeArray(arr)`) does not
// disturb it
QUnit.test('destructuring: destructuring-assignment with a sibling binding polyfills', assert => {
  const arr = [1, [2]];
  let m;
  let z;
  // eslint-disable-next-line prefer-const -- testing assignment destructuring
  ({ y: { flat: m }, z } = { y: arr, z: 9 });
  assert.strictEqual(z, 9);
  assert.deepEqual(m.call(arr), [1, 2]);
});

// a side-effect-free LITERAL receiver re-references safely, so the nested instance polyfills even without
// a bare-Identifier receiver - here an array literal, exercised on IE 11 where native `flat` is absent
QUnit.test('destructuring: nested instance off an array-literal receiver polyfills', assert => {
  const { y: { flat: m } } = { y: [1, [2]] };
  assert.deepEqual(m.call([3, [4]]), [3, 4]);
});

// a non-array literal receiver type: a string method off a CONSTANT template literal (a string constant,
// so it re-references like a string literal) polyfills
QUnit.test('destructuring: nested instance off a constant template-literal receiver polyfills', assert => {
  const { y: { padStart: m } } = { y: 'ab' };
  assert.strictEqual(m.call('cd', 4, 'x'), 'xxcd');
});

// an ArrayPattern wrapper whose leaf is a const-ALIAS of the constructor (`const A = Array; [A]`): the
// leaf is canonicalized back to Array, so the static `from` polyfills (it once dropped for the alias)
QUnit.test('destructuring: array-wrapper with a const-alias static leaf', assert => {
  const A = Array;
  const [{ from }] = [A];
  assert.deepEqual(from([1, 2]), [1, 2]);
  assert.deepEqual(from('xy'), ['x', 'y']);
});

// the same const-alias canonicalization through the OBJECT-nested resolver (no array wrapper) - a sibling
// code path that must resolve the alias too
QUnit.test('destructuring: object-nested const-alias static leaf', assert => {
  const A = Array;
  const { x: { from } } = { x: A };
  assert.deepEqual(from([3, 4]), [3, 4]);
});

// an SE-bearing IIFE init in a flattenable destructure: the flatten harvests the discarded
// init's chain-root call and re-emits it ahead of the extraction - the side effect runs exactly
// once and the binding gets the polyfill
QUnit.test('destructuring: array-wrapper SE-bearing IIFE init flattens, setup runs once', assert => {
  let calls = 0;
  const [{ from }] = [(() => {
    calls++;
    return Array;
  })()];
  assert.same(calls, 1);
  assert.deepEqual(from([1, 2]), [1, 2]);
});

// the no-SE twin flattens to the pure import - the IIFE is dropped whole
QUnit.test('destructuring: array-wrapper no-SE IIFE init flattens', assert => {
  const [{ from }] = [(() => Array)()];
  assert.deepEqual(from([5, 6]), [5, 6]);
});

QUnit.test('destructuring: array-wrapper SE IIFE under member hop flattens, setup runs once', assert => {
  let calls = 0;
  const [{ from }] = [(() => {
    calls++;
    return globalThis;
  })().Array];
  assert.same(calls, 1);
  assert.deepEqual(from([7]), [7]);
});

QUnit.test('destructuring: proxy-receiver SE IIFE host flattens, setup runs once', assert => {
  let calls = 0;
  const [{ Array: { from } }] = [(() => {
    calls++;
    return globalThis;
  })()];
  assert.same(calls, 1);
  assert.deepEqual(from([8, 9]), [8, 9]);
});

// the nested-object twin (no array wrapper): same harvest contract, the host IIFE setup survives
QUnit.test('destructuring: nested-object SE IIFE host flattens, setup runs once', assert => {
  let calls = 0;
  const { Array: { from } } = (() => {
    calls++;
    return globalThis;
  })();
  assert.same(calls, 1);
  assert.deepEqual(from([1, 2]), [1, 2]);
});

// branchy init with an SE-bearing IIFE branch: per-branch handling keeps the setup intact
QUnit.test('destructuring: conditional init with SE IIFE branch, setup runs once', assert => {
  let calls = 0;
  const cond = true;
  const { from } = cond ? (() => {
    calls++;
    return Array;
  })() : Array;
  assert.same(calls, 1);
  assert.deepEqual(from([1, 2]), [1, 2]);
});

// assignment-form destructure from an SE-bearing IIFE: the setup survives the rewrite
QUnit.test('destructuring: assignment form from SE IIFE, setup runs once', assert => {
  let calls = 0;
  let from;
  // eslint-disable-next-line prefer-const -- the ASSIGNMENT form (not a declaration) is under test
  ({ from } = (() => {
    calls++;
    return Array;
  })());
  assert.same(calls, 1);
  assert.deepEqual(from([3, 4]), [3, 4]);
});

// const-alias wrapper: the IIFE setup runs at the ALIAS declaration; the flatten of the alias
// READ must not re-emit it (once double-ran via a deref-escaped harvest)
QUnit.test('destructuring: alias wrapper with SE IIFE runs setup once', assert => {
  let calls = 0;
  const wrapper = [(() => {
    calls++;
    return Array;
  })()];
  const [{ from }] = wrapper;
  assert.same(calls, 1);
  assert.deepEqual(from([1, 2]), [1, 2]);
});

// a chain-assignment in the discarded init is rescued whole: the binding captures the value and
// the setup runs exactly once (it was once silently dropped by the flatten)
QUnit.test('destructuring: assignment in discarded init is rescued', assert => {
  let a;
  const [{ from }] = [(a = globalThis).Array];
  assert.same(a, globalThis);
  assert.deepEqual(from([1, 2]), [1, 2]);
});

QUnit.test('destructuring: assignment host of nested destructure is rescued', assert => {
  let a;
  const { Array: { of } } = a = globalThis;
  assert.same(a, globalThis);
  assert.deepEqual(of(3, 4), [3, 4]);
});

QUnit.test('destructuring: array-leaf assignment with SE IIFE is rescued, all preserved', assert => {
  let calls = 0;
  let a;
  const [{ from }] = [a = (() => {
    calls++;
    return Array;
  })()];
  assert.same(calls, 1);
  assert.same(a, Array);
  assert.same(typeof from, 'function');
});

// the rescued assignment may itself wrap an SE-bearing IIFE: one rescue carries both the
// binding update and the setup, each exactly once
QUnit.test('destructuring: rescued assignment wrapping SE IIFE', assert => {
  let calls = 0;
  let a;
  const [{ from }] = [(a = (() => {
    calls++;
    return globalThis;
  })()).Array];
  assert.same(calls, 1);
  assert.same(a, globalThis);
  assert.deepEqual(from([5]), [5]);
});

// the untaken conditional branch's IIFE must NOT run: branch semantics survive the per-branch
// synth (the taken plain branch yields the polyfill, the call branch stays unevaluated)
QUnit.test('destructuring: conditional init, untaken SE IIFE branch does not run', assert => {
  let calls = 0;
  const cond = false;
  const { from } = cond ? (() => {
    calls++;
    return Array;
  })() : Array;
  assert.same(calls, 0);
  assert.deepEqual(from([1, 2]), [1, 2]);
});

// logical RHS with an inline-call side: the call branch synths with its setup rescued; the
// gate value short-circuits exactly as written
QUnit.test('destructuring: logical AND with SE IIFE side, setup runs once', assert => {
  let calls = 0;
  const cond = true;
  const { from } = cond && (() => {
    calls++;
    return Array;
  })();
  assert.same(calls, 1);
  assert.deepEqual(from([1, 2]), [1, 2]);
});

// assignment-destructure hosts beyond the expression statement: the receiver still resolves and
// the polyfill is wired (for-init / call-arg positions)
QUnit.test('destructuring: assignment form in call-arg position', assert => {
  let from;
  const id = x => x;
  id({ Array: { from } } = globalThis);
  assert.deepEqual(from([1, 2]), [1, 2]);
});

// nested parameter default body-extracts under polyfill-always-wins: the no-arg call uses the
// polyfill binding
QUnit.test('destructuring: nested param default, no-arg call gets the polyfill', assert => {
  function f({ Array: { from } } = globalThis) {
    return from([3, 4]);
  }
  assert.deepEqual(f(), [3, 4]);
});

// the caller-passed argument keeps winning over the polyfilled leaf default - a body-extract
// once silently ignored it
QUnit.test('destructuring: nested param default, caller argument wins', assert => {
  function f({ Array: { from } } = globalThis) {
    return from;
  }
  assert.same(f({ Array: { from: 'custom' } }), 'custom');
  assert.same(typeof f(), 'function');
});

// multi-leaf nested param default: every leaf gets its own polyfilled default; a rest sibling
// keeps collecting the remaining keys
QUnit.test('destructuring: nested param default with multiple leaves and rest', assert => {
  function f({ Array: { from, of, ...rest } } = globalThis) {
    return [from([1]), of(2), typeof rest];
  }
  const [a, b, c] = f();
  assert.deepEqual(a, [1]);
  assert.deepEqual(b, [2]);
  assert.same(c, 'object');
});

// an absent leaf in a caller-supplied object stays undefined exactly as native: the synthesized
// default fires only for the no-argument call
QUnit.test('destructuring: nested param default, absent caller leaf stays undefined', assert => {
  function f({ Array: { from } } = globalThis) {
    return from;
  }
  assert.same(f({ Array: {} }), undefined);
  assert.same(typeof f(), 'function');
});

// a declared function's rest-bearing param stays verbatim - the caller-supplied value and the
// rest exclusion behave exactly as native (the old body-extract silently ignored the caller)
QUnit.test('destructuring: declared rest param, caller value passes through', assert => {
  function f({ from, ...rest } = Array) {
    return [from, Object.keys(rest).length];
  }
  const [v, restLen] = f({ from: 'custom', x: 1 });
  assert.same(v, 'custom');
  assert.same(restLen, 1);
});

// rest in a nested param default keeps collecting the REAL receiver's extra enumerable keys
// (an app-extended static) - a synthesized default literal would have dropped them
QUnit.test('destructuring: nested param rest collects app-extended statics', assert => {
  // eslint-disable-next-line es/no-nonstandard-array-properties -- deliberate app-extension probe
  Array.testExtendedHelper = 'ext';
  try {
    function f({ Array: { from, ...rest } } = globalThis) {
      return rest.testExtendedHelper;
    }
    assert.same(f(), 'ext');
  } finally {
    // eslint-disable-next-line es/no-nonstandard-array-properties -- cleanup of the probe
    delete Array.testExtendedHelper;
  }
});

// sibling branches in a nested param default both keep working on the no-argument call - a
// one-branch synthesized literal would TypeError the other branch
QUnit.test('destructuring: nested param default with sibling branches', assert => {
  function f({ Array: { of }, JSON: { stringify } } = globalThis) {
    return [of(1), stringify({ a: 1 })];
  }
  const [a, b] = f();
  assert.deepEqual(a, [1]);
  assert.same(b, '{"a":1}');
});

// an effectful parameter default keeps running its effect on the no-argument call - a
// synthesized literal would have silently dropped it
QUnit.test('destructuring: effectful nested param default keeps the effect', assert => {
  const log = [];
  function f({ Array: { from } } = (log.push(1), globalThis)) {
    return from;
  }
  f();
  assert.same(log.length, 1);
  assert.same(typeof f({ Array: { from: 'x' } }), 'string');
  assert.same(log.length, 1);
});

// duplicate destructure keys: with only no-argument calls both bindings get the polyfilled
// leaf default; a caller-supplied object keeps winning through a visible-caller IIFE (an
// argument-passing caller forbids the lossy leaf defaults on a declared function - that
// shape stays verbatim, native parity)
QUnit.test('destructuring: nested param default with duplicate keys', assert => {
  function f({ Array: { from, from: dup } } = globalThis) {
    return [from, dup];
  }
  const [a, b] = f();
  assert.same(a, b);
  assert.deepEqual(a([1, 2]), [1, 2]);
  const [c, d] = (({ Array: { from, from: dup } } = globalThis) => [from, dup])({ Array: { from: 'x' } });
  assert.same(c, 'x');
  assert.same(d, 'x');
});

// an unpolyfilled side-effecting computed key beside a polyfilled one: the key's prefix effect
// runs exactly once and the unpolyfilled value reads the receiver by its static name
QUnit.test('destructuring: unpolyfilled SE computed key runs its effect once', assert => {
  let c = 0;
  // eslint-disable-next-line es/no-nonstandard-array-properties -- deliberate unpolyfilled-key probe
  const r = (({ from, [(c++, 'custom')]: x } = Array) => [from([1]), x, c])();
  assert.deepEqual(r[0], [1]);
  assert.same(r[1], undefined);
  assert.same(r[2], 1);
});

// per-branch synth with an unpolyfilled sibling: the taken branch supplies the polyfill for the
// resolvable key and the branch receiver's own value for the other
QUnit.test('destructuring: per-branch synth keeps unpolyfilled sibling branch-consistent', assert => {
  const cond = true;
  const r = (({ from, custom } = cond ? Array : Iterator) => [from([1, 2]), custom])();
  assert.deepEqual(r[0], [1, 2]);
  assert.same(r[1], undefined);
});

// multi-key destructure from a conditional with an inline-call branch: the call setup runs
// exactly once and every key works - an unresolved key reads the memoized call result
QUnit.test('destructuring: multi-key call branch memoizes the call once', assert => {
  let c = 0;
  const cond = true;
  const { from, custom } = cond ? (() => {
    c++;
    return Array;
  })() : Array;
  assert.deepEqual(from([1, 2]), [1, 2]);
  assert.same(custom, undefined);
  assert.same(c, 1);
});

// nested conditional with two call branches: only the taken branch's call runs, exactly once,
// and its branch-specific polyfill binds
QUnit.test('destructuring: nested conditional call branches memoize per leaf', assert => {
  const a = false;
  const b = true;
  let c = 0;
  const { of, custom } = a ? (() => {
    c++;
    return Array;
  })() : (b ? (() => {
    c++;
    return Array;
  })() : Array);
  assert.deepEqual(of(7), [7]);
  assert.same(custom, undefined);
  assert.same(c, 1);
});

// the call-site scan: a non-exported function whose every call leaves the default in place gets
// the polyfill via body-extract (nothing exists to lose); a caller passing a real argument keeps
// winning in its own function
QUnit.test('destructuring: call-site scan restores the polyfill for default-only calls', assert => {
  function stays({ from, ...rest } = Array) {
    return [from([1]), Object.keys(rest).length];
  }
  const [arr, restLen] = stays();
  assert.deepEqual(arr, [1]);
  assert.same(restLen, 0);
  function overridden({ of } = Array) {
    return of;
  }
  assert.same(overridden({ of: 'custom' }), 'custom');
});

// the full-tree mirror carries every sibling branch of the synthesized default
QUnit.test('destructuring: mirrored default carries sibling branches', assert => {
  function f({ Array: { of }, JSON: { stringify } } = globalThis) {
    return [of(3), stringify(1)];
  }
  const [a, b] = f();
  assert.deepEqual(a, [3]);
  assert.same(b, '1');
  const custom = f({ Array: { of: v => ['custom', v] }, JSON: { stringify: () => 'cs' } });
  assert.deepEqual(custom[0], ['custom', 3]);
  assert.same(custom[1], 'cs');
});

// a logical fallback default collapses left into the literal - caller values still win
QUnit.test('destructuring: logical fallback default collapses left', assert => {
  function f({ from } = Array || Iterator) {
    return from;
  }
  assert.deepEqual(f()([4, 5]), [4, 5]);
  assert.same(f({ from: 'custom' }), 'custom');
});

// logical-root defaults: pure forms collapse into the mirrored literal; an effectful operand
// keeps running exactly once per evaluation
QUnit.test('destructuring: logical-root nested defaults', assert => {
  const alt = {};
  function f({ Array: { from } } = globalThis || alt) {
    return from;
  }
  assert.deepEqual(f()([8]), [8]);
  assert.same(f({ Array: { from: 'w' } }), 'w');
  let c = 0;
  const m = 1;
  function g({ Array: { of } } = (c++, m) && globalThis) {
    return of;
  }
  assert.same(typeof g(), 'function');
  assert.same(c, 1);
  // the default expression evaluates only on the no-argument call - the caller path skips it
  assert.same(g({ Array: { of: 'x' } }), 'x');
  assert.same(c, 1);
});

// mixed logical operators: the mirror lands inside the left operand of the outer fallback;
// the kept selections stay native on both paths
QUnit.test('destructuring: mixed logical param default', assert => {
  function make(m) {
    const alt = { Array: { from: 'alt' } };
    function f({ Array: { from } } = (m && globalThis) || alt) {
      return from;
    }
    return f();
  }
  assert.same(typeof make(1), 'function');
  assert.same(make(0), 'alt');
});

// effectful logical declarator inits: the mirror swaps only the receiver node, every kept
// operand runs (or stays dead) exactly as native
QUnit.test('destructuring: effectful logical declarator inits', assert => {
  let c = 0;
  const m = 1;
  const { Array: { from } } = (c++, m) && globalThis;
  assert.deepEqual(from([3]), [3]);
  assert.same(c, 1);
  let d = 0;
  const { Array: { of } } = (d++, globalThis) || { Array: {} };
  assert.deepEqual(of(4), [4]);
  assert.same(d, 1);
});

// host-shape edges of the precise receiver mirror: a multi-declarator host keeps its sibling
// and the effect; the assignment-form cascade keeps the whole RHS running
QUnit.test('destructuring: multi-declarator and assignment hosts with effectful logical', assert => {
  let c = 0;
  const m = 1;
  // eslint-disable-next-line @stylistic/one-var-declaration-per-line -- the multi-declarator host IS the shape under test
  const a = 5, { Array: { from } } = (c++, m) && globalThis;
  assert.deepEqual(from([a]), [5]);
  assert.same(c, 1);
  let of;
  // eslint-disable-next-line prefer-const -- assignment-form host is the shape under test
  ({ Array: { of } } = (c++, m) && globalThis);
  assert.deepEqual(of(6), [6]);
  assert.same(c, 2);
});

// both reachable leaves of a guarded fallback unfold: the polyfill binds on the truthy AND the
// falsy selection; an unmirrorable local fallback keeps native semantics
QUnit.test('destructuring: guarded fallback unfolds both leaves', assert => {
  function pick(m) {
    function f({ Array: { from } } = (m && globalThis) || globalThis) {
      return from;
    }
    return f();
  }
  assert.deepEqual(pick(1)([1]), [1]);
  assert.deepEqual(pick(0)([2]), [2]);
  const alt = { Array: { from: 'alt' } };
  const falsy = 0;
  function g({ Array: { from } } = (falsy && globalThis) || alt) {
    return from;
  }
  assert.same(g(), 'alt');
});

// the flatten must not discard a guarded init: the falsy selection keeps its native TypeError,
// the truthy one gets the mirrored polyfill
QUnit.test('destructuring: guarded declarator init keeps falsy-path throw', assert => {
  function attempt(m) {
    try {
      const { Array: { from } } = m && globalThis;
      return typeof from;
    } catch {
      return 'throw';
    }
  }
  assert.same(attempt(1), 'function');
  assert.same(attempt(0), 'throw');
});

// ternary inits: the polyfill binds on either selection; an effectful test runs exactly once;
// a guarded branch keeps its native falsy throw
QUnit.test('destructuring: ternary inits over proxy aliases', assert => {
  function pick(c) {
    const { Array: { from } } = c ? globalThis : globalThis;
    return from;
  }
  assert.deepEqual(pick(true)([1]), [1]);
  assert.deepEqual(pick(false)([2]), [2]);
  const log = [];
  const c = true;
  const { Array: { of } } = (log.push(1), c) ? globalThis : globalThis;
  assert.deepEqual(of(3), [3]);
  assert.same(log.length, 1);
});

// transparent IIFE inits: the call keeps running (body effects once per evaluation, selection
// native), the polyfill binds through the mirrored return leaves
QUnit.test('destructuring: transparent IIFE inits', assert => {
  let c = 0;
  const m = 1;
  const { Array: { from } } = (() => {
    c++;
    return m && globalThis;
  })();
  assert.deepEqual(from([1]), [1]);
  assert.same(c, 1);
  function g({ Array: { of } } = (() => globalThis)()) {
    return of;
  }
  assert.deepEqual(g()(2), [2]);
});

// an identity IIFE with an effectful argument keeps the call and the effect; the polyfill
// binds through the mirrored leaf inside the argument
QUnit.test('destructuring: identity IIFE with effectful argument', assert => {
  let c = 0;
  const { Array: { from } } = (g => g)((c++, globalThis));
  assert.deepEqual(from([4]), [4]);
  assert.same(c, 1);
});

// chain-assignment inits: the binding captures the native value; a guarded RHS keeps its
// falsy-path TypeError while the truthy path polyfills
QUnit.test('destructuring: chain assignment inits', assert => {
  let w;
  const { Array: { from } } = w = globalThis || globalThis;
  assert.deepEqual(from([5]), [5]);
  assert.same(w, globalThis);
  function attempt(m) {
    try {
      let v;
      const { Array: { of } } = v = m && globalThis;
      return [typeof of, v];
    } catch {
      return 'throw';
    }
  }
  assert.same(attempt(1)[0], 'function');
  assert.same(attempt(1)[1], globalThis);
  assert.same(attempt(0), 'throw');
});

// assignment-form hosts with collapsible fallback RHS: the binding gets the polyfill, an
// IIFE RHS runs exactly once
QUnit.test('destructuring: assignment-form fallback RHS', assert => {
  let from;
  // eslint-disable-next-line prefer-const -- assignment-form host is the shape under test
  ({ Array: { from } } = globalThis || globalThis);
  assert.deepEqual(from([6]), [6]);
  let of;
  let c = 0;
  // eslint-disable-next-line prefer-const -- assignment-form host is the shape under test
  ({ Array: { of } } = (() => {
    c++;
    return globalThis;
  })());
  assert.deepEqual(of(7), [7]);
  assert.same(c, 1);
});

// duplicate hop keys bail the synthesized literal - both subtrees still read the same
// receiver property and every leaf binds through the fallback emission
QUnit.test('destructuring: duplicate hop keys keep both subtrees working', assert => {
  function f({ Array: { from }, Array: { of } } = globalThis) {
    return [from, of];
  }
  const [a, b] = f();
  assert.deepEqual(a([8]), [8]);
  assert.deepEqual(b(9), [9]);
});

// a defaulted destructure with an unknown member keeps the generic dispatch: the runtime
// flavor (string here, array via the default) picks the right polyfill either way
QUnit.test('destructuring: defaulted binding generic dispatch', assert => {
  const { v = [] } = JSON.parse('{"v":"hello"}');
  assert.same(v.at(0), 'h');
  const { w = [3, 4] } = JSON.parse('{}');
  assert.same(w.at(-1), 4);
});

// literal-init presence: a plain value kills the default; a getter-supplied value keeps the
// fold's generic dispatch working on the actual runtime flavor
QUnit.test('destructuring: literal presence and accessor fold', assert => {
  const [d = 0] = ['hi'];
  assert.same(d.at(-1), 'i');
  // eslint-disable-next-line es/no-accessor-properties -- the accessor-supplied member IS the shape under test
  const { g = 's' } = { get g() { return [9]; } };
  assert.same(g.at(0), 9);
});

// shared-helper edges: spread-expanded IIFE receiver arg, wrapper-default vs live caller-arg,
// and a const-captured super-class alias surviving an upstream reassignment after the capture
QUnit.test('destructuring: spread args, wrapper defaults, captured super alias', assert => {
  // eslint-disable-next-line prefer-const -- a mutable flag keeps the branch pick a runtime decision
  let c = true;
  // eslint-disable-next-line unicorn/no-useless-spread -- the inline-array spread IS the shape under test
  const viaSpread = ((x, { from }) => from)(...[1, c ? Array : Iterator]);
  assert.same(viaSpread([1, 2]).length, 2);
  // eslint-disable-next-line es/no-nonstandard-array-prototype-properties -- the [] is a dead wrapper default, never the receiver
  const viaArg = (({ from } = []) => from([3]))(Array);
  assert.same(viaArg[0], 3);
  let G = globalThis;
  const Base = G.Array;
  // eslint-disable-next-line no-useless-assignment -- the dead store IS the shape under test
  G = null;
  class C extends Base {
    static make() {
      return super.of(9);
    }
  }
  assert.same(C.make()[0], 9);
});

// assignment-form array wrapper + rest: the cascade keeps the wrap (rest reads the matching
// init element, excludes the consumed key) and the polyfill overrides the captured binding
QUnit.test('destructuring: assignment array wrap with rest cascade', assert => {
  let from, rest;
  // eslint-disable-next-line prefer-const -- the ASSIGNMENT-form destructure is the shape under test
  [{ from, ...rest }] = [Array];
  assert.same(from([7])[0], 7);
  // pristine built-in statics are non-enumerable, so rest only proves the consumed-key exclusion
  assert.false('from' in rest);
});

// an unclassifiable IIFE arg keeps native priority (caller value wins) while the wrapper
// default carries the polyfill for the undefined-arg path
QUnit.test('destructuring: wrapper default vs unclassifiable caller arg', assert => {
  const f = ({ of } = Array) => of;
  const custom = { of: 'caller' };
  assert.same(f(custom), 'caller');
  assert.same(f()(6)[0], 6);
  assert.same(f(undefined)(7)[0], 7);
});

// for-init array wrapper + rest: the polyfill rides a sibling declarator inside the loop
// header (a preceding statement is illegal there) and rest keeps the consumed-key exclusion
QUnit.test('destructuring: for-init array wrap with rest', assert => {
  // eslint-disable-next-line no-unreachable-loop -- the for-init HEADER is the shape under test
  for (const [{ of, ...r }] = [Array]; ;) {
    assert.same(of(3)[0], 3);
    assert.false('of' in r);
    break;
  }
});

// classification edges: an SE-buried proxy root substitutes its static with the prefix
// running exactly once, and a shared static-object wrapper resolves SIBLING statics
QUnit.test('destructuring: se-buried proxy static and sibling wrapper statics', assert => {
  let n = 0;
  const grouped = (n++, globalThis).Map.groupBy(['ab', 'c'], s => s.length);
  assert.same(grouped.get(2)[0], 'ab');
  assert.same(n, 1);
  const w = { a: Array, b: Promise };
  const { a: { of }, b: { resolve } } = w;
  assert.same(of(5)[0], 5);
  assert.same(typeof resolve, 'function');
});

// SE prefix of a fully-consumed proxy-tail destructure runs exactly once; the dead tail
// read is dropped without affecting the extracted bindings
QUnit.test('destructuring: se prefix lift on proxy tail', assert => {
  let n = 0;
  const { from, of } = (n++, globalThis.Array);
  assert.same(from([5])[0], 5);
  assert.same(of(6)[0], 6);
  assert.same(n, 1);
});

// a partial-consume residual with an SE-buried proxy-hop root keeps the effect across the
// hop collapse (runs exactly once) while the polyfillable key still extracts
QUnit.test('destructuring: se-buried hop collapse keeps effect', assert => {
  let n = 0;
  // eslint-disable-next-line no-unused-vars -- the unpolyfillable sibling forces the partial consume
  const { from, formatRangeToParts } = (n++, globalThis).globalThis.Array;
  assert.same(from([9])[0], 9);
  assert.same(n, 1);
});

// the in-check fold keeps the receiver chain's buried SE prefix evaluating exactly once
QUnit.test('destructuring: in-fold keeps buried receiver effect', assert => {
  let n = 0;
  const has = 'groupBy' in (n++, globalThis).Map;
  assert.true(has);
  assert.same(n, 1);
});

// duplicate container keys read the LAST (live) value: the substitution must target the
// live Iterator, not the dead first Array (a first-match container walk picked the corpse)
QUnit.test('destructuring: duplicate container keys read the live value', assert => {
  // eslint-disable-next-line no-dupe-keys -- the duplicate IS the case under test
  const ND = { M: Array, M: Iterator };
  const { from } = ND.M;
  assert.same(from([7].values()).next().value, 7);
});

// the assignment-destructure's own write registers the alias: receiver narrowing through
// the binding serves the typed dispatch and the value flows end to end
QUnit.test('destructuring: assignment-destructure alias narrows receiver type', assert => {
  let from;
  // eslint-disable-next-line prefer-const -- the `let x; ({ x } = Source)` form IS the case under test
  ({ from } = Array);
  assert.same(from([5, 6]).at(0), 5);
  assert.same(from('ab').at(1), 'b');
});

// a mid-sequence destructure assignment is split by the pre-pass and the alias serves the
// polyfill - the trailing sequence expression still runs
QUnit.test('destructuring: mid-sequence assignment destructure polyfills', assert => {
  let from;
  const calls = [];
  // eslint-disable-next-line @stylistic/no-extra-parens -- the parenthesized sequence-slot assignment form IS the case under test
  (({ from } = Array), calls.push('after'));
  assert.same(calls.length, 1);
  assert.same(from([5, 6]).at(-1), 6);
});
