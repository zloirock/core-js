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
