// esnext proposals: various stages
QUnit.test('esnext: Array#filterReject', assert => {
  assert.deepEqual([1, 2, 3, 4].filterReject(x => x % 2), [2, 4]);
});

QUnit.test('esnext: Array#uniqueBy', assert => {
  assert.deepEqual([1, 2, 3, 2, 1].uniqueBy(), [1, 2, 3]);
  assert.deepEqual(
    [{ id: 1 }, { id: 2 }, { id: 1 }].uniqueBy(x => x.id),
    [{ id: 1 }, { id: 2 }],
  );
});

QUnit.test('esnext: Number#clamp', assert => {
  assert.same((2).clamp(4, 6), 4);
  assert.same((5).clamp(2, 8), 5);
  assert.same((10).clamp(2, 8), 8);
});

QUnit.test('esnext: Function#demethodize', assert => {
  const push = [].push.demethodize();
  const arr = [1, 2];
  push(arr, 3);
  assert.deepEqual(arr, [1, 2, 3]);
});

QUnit.test('esnext: String.cooked', assert => {
  assert.same(String.cooked(['Hi\\n', '!'], 'Bob'), 'Hi\\nBob!');
});

QUnit.test('esnext: Set.from', assert => {
  assert.deepEqual(Array.from(Set.from([1, 2, 3, 2, 1])), [1, 2, 3]);
});

QUnit.test('esnext: Map.from', assert => {
  const m = Map.from([[1, 'a'], [2, 'b']]);
  assert.same(m.get(1), 'a');
  assert.same(m.get(2), 'b');
});

QUnit.test('esnext: WeakMap.from', assert => {
  const k1 = {},
        k2 = {};
  const wm = WeakMap.from([[k1, 1], [k2, 2]]);
  assert.same(wm.get(k1), 1);
  assert.same(wm.get(k2), 2);
});

QUnit.test('esnext: Iterator.zip', assert => {
  assert.deepEqual(Array.from(Iterator.zip([[1, 2, 3], [4, 5, 6]])), [[1, 4], [2, 5], [3, 6]]);
});

QUnit.test('esnext: Iterator#chunks', assert => {
  assert.deepEqual(Array.from(Iterator.from([1, 2, 3, 4, 5]).chunks(2)), [[1, 2], [3, 4], [5]]);
});

QUnit.test('esnext: Iterator#windows', assert => {
  assert.deepEqual(Array.from(Iterator.from([1, 2, 3, 4]).windows(2)), [[1, 2], [2, 3], [3, 4]]);
});

QUnit.test('esnext: Set.of', assert => {
  const set = Set.of(1, 2, 3);
  assert.same(set.size, 3);
  assert.true(set.has(2));
});

QUnit.test('esnext: Map.of', assert => {
  const map = Map.of(['a', 1], ['b', 2]);
  assert.same(map.size, 2);
  assert.same(map.get('a'), 1);
});

QUnit.test('esnext: WeakSet.from', assert => {
  const obj1 = {};
  const obj2 = {};
  const ws = WeakSet.from([obj1, obj2]);
  assert.true(ws.has(obj1));
  assert.true(ws.has(obj2));
});
