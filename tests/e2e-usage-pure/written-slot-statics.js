// a static read off a container slot the file WROTE through another spelling reads the written value: a binding
// a default names, a binding off a selection spelled in place, a member a pattern stores the container into, a
// selection holding a binding a pattern takes off the container
QUnit.test('written slot statics: a binding a parameter default names', assert => {
  const box = { inner: { C: Object } };
  function fill(slot = box.inner) {
    slot.C = Map;
  }
  fill();
  assert.true(box.inner.C.groupBy([1, 2, 3], x => x % 2) instanceof Map);
});

QUnit.test('written slot statics: a binding off a selection spelled in place', assert => {
  function read(flag) {
    const first = { inner: { C: Object } };
    const second = { inner: { C: Object } };
    const { inner: alias } = flag ? first : second;
    alias.C = Map;
    return first.inner.C.groupBy([1, 2, 3], x => x % 2);
  }
  assert.true(read(true) instanceof Map);
});

QUnit.test('written slot statics: a member a pattern stores the container into', assert => {
  const box = { inner: { C: Object } };
  function fill(holder) {
    ({ inner: holder.v } = box);
    holder.v.C = Map;
  }
  fill({});
  assert.true(box.inner.C.groupBy([1, 2, 3], x => x % 2) instanceof Map);
});

QUnit.test('written slot statics: a selection holding a binding a pattern takes off the container', assert => {
  function read(flag) {
    const box = { inner: { C: Map } };
    const { inner: taken } = box;
    const spare = {};
    const via = flag ? taken : spare;
    via.C = { groupBy: () => 'user' };
    return box.inner.C.groupBy([1, 2, 3], x => x % 2);
  }
  assert.same(read(true), 'user');
  assert.true(read(false) instanceof Map);
});

QUnit.test('written slot statics: a static owner a slot holds, under a selection of a pattern binding', assert => {
  const box = { inner: { C: Object } };
  const { inner: held } = box;
  const spare = {};
  const via = held || spare;
  via.C = { fromEntries: () => 'user' };
  assert.same(box.inner.C.fromEntries([['a', 1]]), 'user');
});

QUnit.test('a literal dotted key and a nested constructor slot are independent', assert => {
  const holder = { a: { b: { C: Map } } };
  holder['a.b.C'] = Array;
  assert.deepEqual(holder.a.b.C.groupBy([3, 4], x => x % 2).get(1), [3]);
});

QUnit.test('a write through a wrapper reaches an initially empty array', assert => {
  const list = [];
  const holder = { list };
  holder.list[0] = Map;
  assert.deepEqual(list[0].groupBy([3, 4], x => x % 2).get(0), [4]);
});

QUnit.test('array destructuring captures the key at the time of the read', assert => {
  const keys = ['from'];
  /* eslint-disable prefer-const -- exercise assignment patterns for both captures */
  let before, after;
  [before] = keys;
  keys[0] = 'of';
  [after] = keys;
  /* eslint-enable prefer-const -- both assignments are complete */
  assert.deepEqual(Array[before]('12'), ['1', '2']);
  assert.deepEqual(Array[after]('12'), ['12']);
});
