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
