/* eslint-disable no-var -- an unbraced `var` is a host under test */
// an initializer that stores the value it yields (`= stored = source`) keeps that value whole: a nested claim
// reads its hop off what the store installed, after the store runs once, wherever the destructure stands
QUnit.test('destructuring: a nested claim under a stored initializer reads its hop once off the stored value', assert => {
  const events = [];
  const source = {
    get y() {
      events.push('y');
      return [1, 2];
    },
  };
  let stored;
  const { y: { at } } = stored = source;
  assert.same(at.call([5, 6], -1), 6, 'the claim reads the polyfilled method');
  assert.same(stored, source, 'the store keeps the source value');
  assert.deepEqual(events, ['y'], 'the hop getter runs once');
});

QUnit.test('destructuring: every host of a stored initializer serves its nested claim', assert => {
  let calls = 0;
  function make() {
    calls++;
    return { y: [1, 2] };
  }
  const holder = {
    set value(value) {
      calls += 10;
      this.last = value;
    },
  };
  const values = [];
  let stored, assigned;
  const { y: { includes } } = holder.value = make();
  if (calls) var { y: { findLast } } = stored = make();
  values.push(stored);
  // eslint-disable-next-line no-unreachable-loop -- the loop head is the host under test
  for (const { y: { toSorted } } = (calls++, stored = make()); ;) {
    assert.deepEqual(toSorted.call([2, 1]), [1, 2]);
    break;
  }
  values.push(stored);
  // eslint-disable-next-line prefer-const -- the assignment is the host under test
  ({ y: { with: assigned } } = stored = make());
  values.push(stored);
  assert.true(includes.call([5, 6], 6));
  assert.same(findLast.call([1, 2, 3], item => item < 3), 2);
  assert.deepEqual(assigned.call([1, 2], 0, 3), [3, 2]);
  assert.same(holder.last.y.length, 2, 'the member store keeps the value it installed');
  assert.deepEqual(values.map(value => value.y.length), [2, 2, 2], 'each store keeps the value it installed');
  assert.same(calls, 15, 'every initializer and the setter run once');
});

QUnit.test('destructuring: an init a nested claim reads through runs once in a loop head', assert => {
  const events = [];
  function make() {
    events.push('make');
    return { y: [1, 2], inner: { data: [3, 4] } };
  }
  function Box() {
    events.push('box');
    this.y = [[1], [2]];
  }
  // eslint-disable-next-line no-unreachable-loop -- the loop head is the host under test
  for (const { y: { at } } = make(); ;) {
    assert.same(at.call([5, 6], -1), 6);
    break;
  }
  for (let { y: { flat } } = new Box(), i = 0; i < 1; i++) assert.deepEqual(flat.call([[1], [2]]), [1, 2]);
  // eslint-disable-next-line no-unreachable-loop -- the loop head is the host under test
  for (var { data: { includes } } = make().inner; ;) {
    assert.true(includes.call([3, 4], 4));
    break;
  }
  assert.deepEqual(events, ['make', 'box', 'make'], 'each init runs once');
});

QUnit.test('destructuring: a prefix stored ahead of a realm nav runs once', assert => {
  const events = [];
  const holder = {
    set realm(value) {
      events.push('set');
      this.last = value;
    },
  };
  let stored;
  const { Array: { prototype: { findLastIndex } } } = holder.realm = globalThis.self;
  const { String: { prototype: { padEnd } } } = (events.push('prefix'), globalThis.self);
  // eslint-disable-next-line no-unreachable-loop -- the loop head is the host under test
  for (const { Array: { prototype: { fill } } } = stored = holder.realm = globalThis.self; ;) {
    assert.deepEqual(fill.call([1, 2], 0), [0, 0]);
    break;
  }
  assert.same(findLastIndex.call([1, 2, 3], item => item < 3), 1);
  assert.same(padEnd.call('a', 3, 'b'), 'abb');
  assert.same(holder.last, stored, 'the setter keeps the realm it was handed');
  assert.deepEqual(events, ['set', 'prefix', 'set'], 'each store and prefix runs once');
});

QUnit.test('destructuring: a realm-returning call memoized for a sibling hop runs once', assert => {
  const events = [];
  function realm() {
    events.push('realm');
    return globalThis;
  }
  const { Array: { prototype: { findLast } }, Object: object } = realm();
  const { String: { prototype: { trimEnd } }, missing = 1 } = (events.push('prefix'), realm());
  assert.same(findLast.call([1, 2, 3], item => item < 3), 2);
  assert.same(trimEnd.call('a  '), 'a');
  assert.same(object, Object);
  assert.same(missing, 1);
  assert.deepEqual(events, ['realm', 'prefix', 'realm'], 'each call runs once');
});
