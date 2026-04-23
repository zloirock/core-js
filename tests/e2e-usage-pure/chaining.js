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
  assert.true('  hello world  '.trim().startsWith('hello'));
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

QUnit.test('chain: Array.from -> filter -> reduce', assert => {
  const sum = Math.sumPrecise(Array.from({ length: 5 }, (_, i) => i + 1)
    .filter(x => x % 2));
  assert.same(sum, 9);
});

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
  assert.true('  hello'.trim().startsWith('hello'));
});

// Set -> Array.from -> instance method chain
QUnit.test('chain: Set -> Array.from -> toSorted -> at', assert => {
  assert.same(Array.from(new Set([5, 3, 1, 4, 2])).toSorted().at(0), 1);
});

// deep chaining with type propagation
QUnit.test('chain: Object.entries -> flatMap -> includes', assert => {
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

// --- Deep optional chain - outer receiver types bottom out at primitive via element-tracking ---
// `arr.at(0)?.at(0).at(0).at(0)`: 4-deep chain on 3-nested array. Outer M4 receiver type
// resolves to `number`, but the generic-fallback retry polyfills it anyway. Without the
// retry, the outermost `.at(0)` stayed raw and broke under native-`.at`-less targets

QUnit.test('chain: 4-deep optional `.at(0)` short-circuits when first guard is nullish', assert => {
  // `arr.at(5)` is out-of-bounds -> undefined; `?.at(0)` short-circuits the entire chain
  // covers the guard path of the chain polyfill: no inner polyfill fires at runtime
  const arr = [[[1]]];
  assert.same(arr.at(5)?.at(0).at(0).at(0), undefined);
});

QUnit.test('chain: 4-deep optional `.at(0)` reaches outermost polyfill on non-null chain', assert => {
  const arr = [[[1, 2], [3, 4]], [[5, 6], [7, 8]]];
  // arr.at(0) = [[1,2],[3,4]] -> .at(0) = [1,2] -> .at(0) = 1 -> `.at(0)` on number throws.
  // validates the outermost polyfill DOES execute (it's the throw source, not the raw skip)
  assert.throws(() => arr.at(0)?.at(0).at(0).at(0), TypeError);
});

QUnit.test('chain: 5-deep optional `.at(0)` - outermost polyfilled, M4 stays raw', assert => {
  const arr = [[[1]]];
  // depths: arr=Array[3], arr.at=Array[2], ?.at=Array[1], .at=number, then M4/M5 on number.
  // the intermediate M4 (inner chain member) stays raw; matches babel's re-visit reach
  assert.throws(() => arr.at(0)?.at(0).at(0).at(0).at(0), TypeError);
});
