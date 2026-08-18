// Method chaining, return value type propagation, mixed polyfills in expressions

// array chains
QUnit.test('chain: Array filter -> map -> find', assert => {
  const result = [1, 2, 3, 4, 5]
    .filter(x => x % 2)
    .map(x => x * 10)
    .find(x => x > 20);
  assert.same(result, 30);
});

QUnit.test('chain: Array flatMap -> includes', assert => {
  assert.true([1, 2, 3].flatMap(x => [x, x * 10]).includes(20));
});

QUnit.test('chain: Array toSorted -> toReversed -> at', assert => {
  assert.same([3, 1, 2].toSorted().toReversed().at(0), 3);
});

QUnit.test('chain: Array flat -> includes', assert => {
  assert.true([[1], [2], [3]].flat().includes(2));
});

// string chains
QUnit.test('chain: String trim -> startsWith', assert => {
  assert.true('  hello world  '.trimStart().startsWith('hello'));
});

QUnit.test('chain: String padStart -> endsWith', assert => {
  assert.true('42'.padStart(5, '0').endsWith('42'));
});

// static -> instance chains (return value type propagation)
QUnit.test('chain: Array.from -> filter', assert => {
  const result = Array.from(new Set([1, 2, 3, 4])).filter(x => x > 2);
  assert.deepEqual(result, [3, 4]);
});

QUnit.test('chain: Object.keys -> includes', assert => {
  assert.true(Object.keys({ a: 1, b: 2 }).includes('a'));
});

QUnit.test('chain: Object.entries -> map', assert => {
  const result = Object.entries({ x: 10 }).map(([k, v]) => `${ k }=${ v }`);
  assert.deepEqual(result, ['x=10']);
});

// test pins `.reduce()` in a chain; suppress `math/prefer-math-sum-precise` here -
// sumPrecise has its own dedicated test
/* eslint-disable math/prefer-math-sum-precise -- see above */
QUnit.test('chain: Array.from -> filter -> reduce', assert => {
  const sum = Array.from({ length: 5 }, (_, i) => i + 1)
    .filter(x => x % 2)
    .reduce((acc, x) => acc + x, 0);
  assert.same(sum, 9);
});
/* eslint-enable math/prefer-math-sum-precise -- end of test-pinned block */

QUnit.test('chain: JSON.stringify -> includes', assert => {
  assert.true(JSON.stringify({ a: 1 }).includes('a'));
});

// collection chains
QUnit.test('chain: Set -> intersection -> Array.from', assert => {
  const result = Array.from(new Set([1, 2, 3, 4]).intersection(new Set([3, 4, 5])));
  assert.deepEqual(result, [3, 4]);
});

QUnit.test('chain: Map -> entries -> Array.from', assert => {
  const entries = Array.from(new Map([['a', 1], ['b', 2]]).entries());
  assert.deepEqual(entries, [['a', 1], ['b', 2]]);
});

QUnit.test('chain: Map -> keys -> Array.from', assert => {
  const result = Array.from(new Map([['a', 1], ['b', 2]]).keys());
  assert.deepEqual(result, ['a', 'b']);
});

// iterator helpers chain
QUnit.test('chain: Iterator helpers', assert => {
  const result = Iterator.from([1, 2, 3, 4, 5, 6])
    .filter(x => x % 2)
    .map(x => x * 10)
    .drop(1)
    .take(1)
    .toArray();
  assert.deepEqual(result, [30]);
});

// promise chain
QUnit.test('chain: Promise.resolve -> then -> catch -> finally', assert => {
  const async = assert.async();
  let finallyRan = false;
  Promise.resolve(1)
    .then(v => v + 1)
    .then(v => { assert.same(v, 2); return v; })
    .catch(() => assert.true(false, 'should not reject'))
    .finally(() => { finallyRan = true; })
    .then(() => {
      assert.true(finallyRan);
      async();
    });
});

QUnit.test('chain: Promise.resolve -> then with Array method', assert => {
  const async = assert.async();
  Promise.resolve([3, 1, 2]).then(arr => arr.toSorted()).then(sorted => {
    assert.deepEqual(sorted, [1, 2, 3]);
    async();
  });
});

// mixed polyfills in single expression
QUnit.test('mixed: polyfill in logical chain', assert => {
  const result = [1, 2, 3].includes(2) && 'hello'.startsWith('h');
  assert.true(result);
});

QUnit.test('mixed: global constructor + instance method', assert => {
  assert.true(new Set([1, 2, 3]).has(2));
});

// type-driven polyfill: return type determines instance method
QUnit.test('type: Object.keys().at()', assert => {
  assert.same(Object.keys({ a: 1, b: 2 }).at(-1), 'b');
});

QUnit.test('type: string .trim().startsWith()', assert => {
  assert.true('  hello'.trimStart().startsWith('hello'));
});

// Set -> Array.from -> instance method chain
QUnit.test('chain: Set -> Array.from -> toSorted -> at', assert => {
  assert.same(Array.from(new Set([5, 3, 1, 4, 2])).toSorted().at(0), 1);
});

// deep chaining with type propagation
QUnit.test('chain: Object.entries -> flatMap -> includes', assert => {
  // eslint-disable-next-line unicorn/prefer-object-iterable-methods -- testing
  assert.true(Object.entries({ a: [1], b: [2] }).flatMap(([, v]) => v).includes(2));
});

// Iterator helpers deep chain
QUnit.test('chain: Iterator.from -> filter -> map -> take -> toArray', assert => {
  const result = Iterator.from([1, 2, 3, 4, 5, 6, 7, 8])
    .filter(x => x % 2 === 0)
    .map(x => x * 10)
    .take(2)
    .toArray();
  assert.deepEqual(result, [20, 40]);
});

// --- Deep optional chain - element-tracking bottoms out at a primitive ---
// the chain element-tracks through the nested arrays (each Array receiver is polyfilled) down
// to the deepest element; one `.at` deeper sits on that primitive, whose receiver narrows to
// Number, so the resolver leaves THAT call raw (Number has no `.at`) and it throws at runtime

QUnit.test('chain: 4-deep optional `.at(0)` short-circuits when first guard is nullish', assert => {
  // `arr.at(5)` is out-of-bounds -> undefined; `?.at(0)` short-circuits the entire chain
  // covers the guard path of the chain polyfill: no inner polyfill fires at runtime
  const arr = [[[1]]];
  assert.same(arr.at(5)?.at(0).at(0).at(0), undefined);
});

QUnit.test('chain: deep `.at(0)` element-tracks to a primitive, leaving the over-deep call raw', assert => {
  const arr = [[[1, 2], [3, 4]], [[5, 6], [7, 8]]];
  // three Array `.at(0)` hops element-track [[1,2],[3,4]] -> [1,2] -> 1: each receiver narrows
  // to Array, so each call is polyfilled and the chain yields the deepest element
  assert.same(arr.at(0)?.at(0).at(0), 1);
  // one `.at` deeper sits on that number: the receiver narrows to Number and the call is left
  // raw (Number has no `.at`), so it throws - the narrow correctly bottomed out at the primitive
  assert.throws(() => arr.at(0)?.at(0).at(0).at(0), TypeError);
});

QUnit.test('chain: 5-deep optional `.at(0)` - outermost polyfilled, M4 stays raw', assert => {
  const arr = [[[1]]];
  // depths: arr=Array[3], arr.at=Array[2], ?.at=Array[1], .at=number, then M4/M5 on number.
  // the intermediate M4 (inner chain member) stays raw; matches babel's re-visit reach
  assert.throws(() => arr.at(0)?.at(0).at(0).at(0).at(0), TypeError);
});

// aliased static -> instance method: receiver-type narrowing must propagate through the
// alias chain (resolveAliasedStaticReturn -> staticPairFromPolyfillEntry/FromDestructure)
// for the inner instance method to dispatch to the type-specific polyfill variant. covers
// both single-word (from -> Array) and multi-word (fromAsync -> Array.fromAsync) entries

QUnit.test('chain: const { from } = Array; from(...).filter(...).findLast(...)', assert => {
  const { from } = Array;
  assert.same(from(new Set([1, 2, 3, 4])).filter(x => x > 2).findLast(x => x < 4), 3);
});

QUnit.test('chain: const { fromAsync } = Array; fromAsync(...).then(arr => arr.at(-1))', assert => {
  const { fromAsync } = Array;
  const async = assert.async();
  fromAsync([10, 20, 30]).then(arr => {
    assert.same(arr.at(-1), 30);
    async();
  });
});

QUnit.test('chain: const { entries } = Object; entries(...).at(0).at(0)', assert => {
  const { entries } = Object;
  assert.same(entries({ a: 1, b: 2 }).at(0).at(0), 'a');
});

// an optional chain over an undefinable proxy root keeps its guard: where `window` is
// absent (Node) the chain SHORT-CIRCUITS to undefined - the static/prototype fallback used
// to fold the guard away and return a live value there; where `window` exists (browsers)
// the guard passes and the claimed ponyfill serves the read
QUnit.test('chain: proto-fallback and combined chains keep the root guard', assert => {
  const win = globalThis.window;
  const hasWindow = win !== undefined;
  let c;
  assert.same((c = globalThis.window)?.self.Set.prototype.has.call(new Set([1]), 1), hasWindow ? true : undefined);
  assert.same(c, win);
  const w = globalThis.window;
  let a;
  assert.same((a = w)?.self.WeakMap.prototype.get.call(new WeakMap(), {}), undefined);
  assert.same(a, win);
  let m;
  assert.same((m = globalThis.window)?.self.Promise.noSuchStatic, undefined);
  assert.same(m, win);
  let w2;
  assert.same((w2 = globalThis.window)?.self.Array.of(5).flat?.().map?.(x => x).at?.(0), hasWindow ? 5 : undefined);
  assert.same(w2, win);
});

// a polyfillable claim nested in a FOREIGN optional chain - an argument, a computed key, the
// callee of a deeper hop. deoptionalizing the claim's own `?.` must not reach out into that chain:
// the enclosing `?.` belongs to the host, and stripping it calls `undefined` where native
// short-circuits. the present-host rows are the boundary: the chain runs and the polyfill serves
QUnit.test('chain: a claim inside a foreign optional chain keeps the host guard', assert => {
  const absent = undefined;
  assert.same(absent?.fn(Array?.from([1])), undefined, 'argument slot');
  assert.same(absent?.wrap[Array?.from([1]).length], undefined, 'computed-key slot');
  assert.same(absent?.b.c(Array?.from([1])), undefined, 'deeper hop');
  assert.same(absent?.fn?.(Array?.from), undefined, 'optional call over a claim READ');
  const present = { fn: v => v, wrap: { 1: 'hit' }, b: { c: v => v } };
  assert.deepEqual(present?.fn(Array?.from([1, 2])), [1, 2]);
  assert.same(present?.wrap[Array?.from([1]).length], 'hit');
  assert.deepEqual(present?.b.c(Array?.from([3])), [3]);
  assert.same(present?.fn?.(Array?.from), Array.from);
});

QUnit.test('chain: an instance claim inside a foreign optional chain keeps the host guard', assert => {
  const arr = [1, 2, 3];
  const absent = undefined;
  assert.same(absent?.fn(arr.at?.(-1)), undefined);
  assert.same(absent?.wrap[arr.at(0)], undefined);
  const present = { fn: v => v, wrap: { 1: 'hit' } };
  assert.same(present?.fn(arr.at?.(-1)), 3);
  assert.same(present?.wrap[arr.at(0)], 'hit');
});

// a side-effecting proxy-hop KEY read under a live `?.`. the guard test is the kept source of the
// hop that owns the key, so it evaluates that effect once - and the alternate must not re-run it.
// the count discriminates only where the guard actually PASSES, i.e. where `window` exists; in a
// window-less realm the chain short-circuits after the same single evaluation
QUnit.test('chain: a side-effecting hop key under a live optional runs once', assert => {
  const hasWindow = globalThis.window !== undefined;
  const log = [];
  function eff(t) {
    log.push(t);
    return t;
  }
  /* eslint-disable no-sequences -- the side-effecting hop KEY is the shape under test */
  const plainRoot = globalThis[eff('a'), 'window']?.self.Array;
  assert.deepEqual(log, ['a'], 'the guarded hop key runs exactly once');
  assert.same(plainRoot, hasWindow ? Array : undefined);
  const g = globalThis;
  const aliasRoot = g[eff('b'), 'window']?.self.Map;
  assert.deepEqual(log, ['a', 'b'], 'an alias-rooted nav runs its key once too');
  assert.same(aliasRoot, hasWindow ? Map : undefined);
  // a key ABOVE the guarded hop is the boundary: the test never reaches it, so it belongs to the
  // alternate and runs only when the guard passes
  const aboveTheGuard = globalThis.window?.[eff('c'), 'self'].Set;
  assert.deepEqual(log, hasWindow ? ['a', 'b', 'c'] : ['a', 'b'], 'a key above the guard rides the alternate');
  /* eslint-enable no-sequences -- back to the ordinary rule below */
  assert.same(aboveTheGuard, hasWindow ? Set : undefined);
});

// a polyfillable GET reading off a chain that already carries a polyfillable CALL: two channels
// render this shape and share one span, so a stand-down in either leaves the guard test reading the
// method natively - invisible where the native exists, a missed polyfill in a stripped realm
QUnit.test('chaining: a poly GET over a poly call keeps both claims', assert => {
  const arr = [[1, 2]];
  const box = { pick: i => arr[i] };
  assert.same(typeof arr.at?.(0).at, 'function', 'the tail GET resolves off the memoized call result');
  assert.same(typeof arr.at(0).at, 'function', 'and so does its non-optional spelling');
  assert.same(arr.at?.(0).length, 2, 'a non-polyfillable tail is unaffected');
  assert.same(arr.at?.(0).at(0), 1, 'a call tail - the shape the chain combine owns - still calls');
  assert.same(typeof box.pick?.(0).at, 'function', 'a non-polyfillable call under the same tail keeps it');
  const empty = [];
  assert.same(empty.at?.(9)?.at, undefined, 'a short-circuited chain yields undefined, not a throw');
});
