/* eslint-disable prefer-const -- Assignment patterns are the regression subject. */
export function readSplitArray(input) {
  const { list: [{ at }], y } = input;
  return [at.call([7, 8], -1), y];
}

export function assignSplitArray(input) {
  let at, y;
  ({ list: [{ at }], y } = input);
  return [at.call([7, 8], -1), y];
}

QUnit.test('destructuring: child claims survive the realm anchor', assert => {
  const { globalThis: { Array: { prototype: { at } }, Object: o } } = globalThis;
  assert.same(at.call([7, 8], -1), 8);
  assert.same(typeof o, 'function');
  let iterator, object;
  ({ globalThis: { Array: { prototype: { [Symbol.iterator]: iterator = null } }, Object: object } } = globalThis);
  assert.same(iterator.call([7]).next().value, 7);
  assert.same(typeof object, 'function');
});

QUnit.test('destructuring: array captures keep their next property after the claimed read', assert => {
  for (const read of [readSplitArray, assignSplitArray]) {
    const events = [];
    const method = { get at() {
      events.push('at');
      return function () { return 23; };
    } };
    const input = {
      get list() { events.push('list'); return [method]; },
      get y() { events.push('y'); return 1; },
    };
    assert.deepEqual(read(input), [23, 1]);
    assert.deepEqual(events, ['list', 'at', 'y']);
    assert.deepEqual(read({ list: [[7, 8]], y: 1 }), [8, 1]);
  }
});

QUnit.test('destructuring: fallback patterns keep supplied values and serve their default', assert => {
  function pick() { return true; }
  function read({ w: { Array: { from } } = pick() ? globalThis : {} } = {}) {
    return from([7]);
  }
  assert.deepEqual(read(), [7]);
  assert.same(read({ w: { Array: { from() { return 23; } } } }), 23);
  const box = {};
  ({ from: { length: box.length = 9 } } = Array);
  assert.same(box.length, 1);
  // eslint-disable-next-line es/no-nonstandard-array-properties -- Retain a non-claiming sibling beside the static read.
  const { from: { length }, missing } = globalThis.Array;
  assert.same(length, 1);
  assert.same(missing, undefined);
});

QUnit.test('destructuring: computed realm source runs once before its nested instance read', assert => {
  const events = [];
  function get() {
    events.push('call');
    return globalThis;
  }
  const { Array: { prototype: { flat }, isArray } } = get();
  assert.deepEqual(flat.call([[7]]), [7]);
  assert.same(isArray([]), true);
  assert.deepEqual(events, ['call']);
});
