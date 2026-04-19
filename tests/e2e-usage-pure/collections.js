// Map/Set/WeakMap/WeakSet
QUnit.test('Map iteration: entries/keys/values/forEach', assert => {
  const map = new Map([['a', 1], ['b', 2], ['c', 3]]);
  assert.deepEqual(Array.from(map.keys()), ['a', 'b', 'c']);
  assert.deepEqual(Array.from(map.values()), [1, 2, 3]);
  assert.deepEqual(Array.from(map.entries()), [['a', 1], ['b', 2], ['c', 3]]);
  const collected = [];
  map.forEach((v, k) => collected.push([k, v]));
  assert.deepEqual(collected, [['a', 1], ['b', 2], ['c', 3]]);
});

QUnit.test('Map: get/set/has/delete/clear/size', assert => {
  const map = new Map();
  map.set('x', 1);
  map.set('y', 2);
  assert.same(map.size, 2);
  assert.same(map.get('x'), 1);
  assert.true(map.has('y'));
  map.delete('x');
  assert.false(map.has('x'));
  map.clear();
  assert.same(map.size, 0);
});

QUnit.test('Set iteration: entries/keys/values/forEach', assert => {
  const set = new Set([1, 2, 3]);
  assert.deepEqual(Array.from(set.keys()), [1, 2, 3]);
  assert.deepEqual(Array.from(set.values()), [1, 2, 3]);
  assert.deepEqual(Array.from(set.entries()), [[1, 1], [2, 2], [3, 3]]);
  const collected = [];
  set.forEach(v => collected.push(v));
  assert.deepEqual(collected, [1, 2, 3]);
});

QUnit.test('Set: add/has/delete/clear/size', assert => {
  const set = new Set();
  set.add(1);
  set.add(2);
  assert.same(set.size, 2);
  assert.true(set.has(1));
  set.delete(1);
  assert.false(set.has(1));
  set.clear();
  assert.same(set.size, 0);
});

QUnit.test('Map iteration via Array.from', assert => {
  const map = new Map([['a', 1], ['b', 2]]);
  assert.deepEqual(Array.from(map), [['a', 1], ['b', 2]]);
});

QUnit.test('Set iteration via Array.from', assert => {
  const set = new Set([10, 20, 30]);
  assert.deepEqual(Array.from(set), [10, 20, 30]);
});

QUnit.test('WeakMap: set/get/has/delete', assert => {
  const wm = new WeakMap();
  const key = {};
  wm.set(key, 42);
  assert.true(wm.has(key));
  assert.same(wm.get(key), 42);
  wm.delete(key);
  assert.false(wm.has(key));
});

QUnit.test('WeakSet: add/has/delete', assert => {
  const ws = new WeakSet();
  const obj = {};
  ws.add(obj);
  assert.true(ws.has(obj));
  ws.delete(obj);
  assert.false(ws.has(obj));
});

QUnit.test('WeakMap constructor with iterable', assert => {
  const k1 = {};
  const k2 = {};
  const wm = new WeakMap([[k1, 'a'], [k2, 'b']]);
  assert.same(wm.get(k1), 'a');
  assert.same(wm.get(k2), 'b');
});
QUnit.test('WeakMap: getOrInsert', assert => {
  const wm = new WeakMap();
  const key = {};
  assert.same(wm.getOrInsert(key, 42), 42);
  assert.same(wm.getOrInsert(key, 99), 42);
});

// Set methods (intersection, union, etc.)
QUnit.test('Set: intersection', assert => {
  const a = new Set([1, 2, 3, 4]);
  const b = new Set([3, 4, 5]);
  assert.deepEqual(Array.from(a.intersection(b)), [3, 4]);
});

QUnit.test('Set: union', assert => {
  const a = new Set([1, 2]);
  const b = new Set([2, 3]);
  assert.deepEqual(Array.from(a.union(b)).toSorted(), [1, 2, 3]);
});

QUnit.test('Set: difference', assert => {
  const a = new Set([1, 2, 3]);
  const b = new Set([2, 3, 4]);
  assert.deepEqual(Array.from(a.difference(b)), [1]);
});

// Map.getOrInsertComputed
QUnit.test('Map: getOrInsertComputed', assert => {
  const m = new Map();
  const v1 = m.getOrInsertComputed('key', k => k.length);
  assert.same(v1, 3);
  const v2 = m.getOrInsertComputed('key', () => 999);
  assert.same(v2, 3);
});

QUnit.test('WeakMap: keys derived from Array.from-built array of objects', assert => {
  const data = new WeakMap();
  const keys = Array.from({ length: 3 }, () => ({}));
  keys.forEach((k, i) => data.set(k, i * 10));
  assert.same(data.get(keys.at(0)), 0);
  assert.same(data.get(keys.at(-1)), 20);
  assert.true(keys.every(k => data.has(k)));
});
