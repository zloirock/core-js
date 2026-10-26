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
  // three guarded producers nested in one chain: the innermost claim's guard hoists through two
  // owners' tests, and the root's own polyfill has to land in the test it belongs to (this
  // shape once aborted the build). every tail is LIVE on the window-present branch - a tail
  // sitting on a scalar short-circuits to undefined there and the assert stops discriminating
  assert.same(globalThis.window?.Array.of([6]).flat?.().map?.(x => x).at?.(0).toFixed?.(0), hasWindow ? '6' : undefined);
  assert.same(globalThis.window?.self?.self.Array.of([6]).flat?.().map?.(x => [[x].at(0)]).at?.(0).flat?.().at?.(0), hasWindow ? 6 : undefined);
  assert.deepEqual(globalThis.window?.Array.from([1, [2]]).flat?.().map?.(x => x * 2).at?.(-1).toString?.(), hasWindow ? '4' : undefined);
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

QUnit.test('chain: unsupported tails keep nested claims and call receivers', assert => {
  const log = [];
  const box = { read() {
    log.push(this === box);
    return [1, [2]].flat();
  } };
  assert.same((log.push('receiver'), box).read().length, 2);
  assert.deepEqual(log, ['receiver', true]);
  assert.same(Array.from({ 0: 1, 1: 2, length: 2 }).length, 2);
  // eslint-disable-next-line es/no-nonstandard-map-properties -- an unsupported tail must still visit its constructor
  assert.same(globalThis.Map.unrelatedField, undefined);
  assert.same(new globalThis.Map([['x', 1]]).size, 1);
  const absent = null;
  assert.same(absent?.unrelatedField?.(log.push('argument')), undefined);
  assert.deepEqual(log, ['receiver', true]);
});

QUnit.test('chain: ordinary callable properties keep getters, arguments and receivers', assert => {
  const log = [];
  function argument() {
    log.push('argument');
    return Array.from([7]);
  }
  const reads = [
    ['call', source => source.call(argument())], ['bind', source => source.bind(argument())],
    ['constructor', source => source.constructor(argument())], ['prototype', source => source.prototype(argument())],
  ];
  for (const [key, read] of reads) {
    log.length = 0;
    let box = {};
    const original = box;
    Object.defineProperty(box, key, { get() {
      log.push('get');
      box = {};
      return function (value) {
        log.push('body');
        return [this === original, value[0]];
      };
    } });
    assert.deepEqual(read(box), [true, 7], key);
    assert.deepEqual(log, ['get', 'argument', 'body'], key);
    assert.notSame(box, original, 'getter changed the binding, not the captured receiver');
  }
});

QUnit.test('chain: inherited call, bind and prototype constructor keep their behavior', assert => {
  function read(value) { return this.base + value[0]; }
  const receiver = { base: 5 };
  assert.same(read.call(receiver, Array.of(7)), 12);
  assert.same(read.bind(receiver)(Array.of(7)), 12);
  // eslint-disable-next-line prefer-destructuring -- direct static alias capture is the form under test
  const from = Array.from;
  assert.deepEqual(from.call(Array, { 0: 3, length: 1 }), [3]);
  assert.deepEqual(from.bind(Array)({ 0: 3, length: 1 }), [3]);
  const C = Map;
  // eslint-disable-next-line new-cap -- constructor is the prototype property under test
  const value = new C.prototype.constructor([[1, 7]]);
  assert.same(value.get(1), 7);
  assert.true(C.prototype.has.call(value, 1));
});

QUnit.test('chain: optional ordinary calls distinguish nullish from falsy', assert => {
  let reads = 0;
  function argument() {
    reads++;
    return Array.from([7]);
  }
  const absent = { call: null, bind: undefined };
  assert.same(absent.call?.(argument()), undefined);
  assert.same(absent.bind?.(argument()), undefined);
  assert.same(reads, 0);
  const present = { constructor: 0, prototype: false };
  assert.throws(() => present.constructor?.(argument()), TypeError);
  assert.throws(() => present.prototype?.(argument()), TypeError);
  assert.same(reads, 2, 'arguments run before a non-callable value throws');
});

QUnit.test('chain: copied callbacks retain their receiver writes', assert => {
  const effects = [];
  const result = [[1, 2], [3, 4]].map((rows, index) => {
    rows = (effects.push(`read${ index }`), index ? 'cd' : rows.slice());
    const first = rows.at(0);
    rows = (effects.push(`write${ index }`), index ? [7, 8] : 'ab');
    return [first, rows.at(-1), rows.includes(index ? 8 : 'b')];
  });
  assert.deepEqual(result, [[1, 'b', true], ['c', 8, true]]);
  assert.deepEqual(effects, ['read0', 'write0', 'read1', 'write1']);
});
