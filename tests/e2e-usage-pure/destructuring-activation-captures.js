QUnit.test('a parameter receiver survives reentry while its property is read', assert => {
  const events = [];
  function source() {
    events.push('default');
    return {
      get at() {
        events.push('outer', ...read([8, 9, 10]));
        return function () { return 'own'; };
      },
      length: 2,
    };
  }
  function read({ at, length } = source()) { return [at.call([4, 5], -1), length]; }
  assert.deepEqual(read(), ['own', 2]);
  assert.deepEqual(events, ['default', 'outer', 5, 3]);
  assert.deepEqual(read([6]), [5, 1]);
  assert.deepEqual(events, ['default', 'outer', 5, 3], 'a supplied receiver bypasses the default');
});

QUnit.test('a catch receiver retains its read order and throwing residual', assert => {
  const events = [];
  const failure = {};
  function read(value) {
    try {
      throw value;
    } catch ({ at, tail }) {
      events.push('body');
      return [at.call([4, 5], -1), tail];
    } finally {
      events.push('finally');
    }
  }
  assert.deepEqual(read([3]), [5, undefined]);
  events.length = 0;
  const source = {
    get at() {
      events.push('at');
      return function () { return 7; };
    },
    get tail() { events.push('tail'); throw failure; },
  };
  assert.throws(() => read(source), error => error === failure);
  assert.deepEqual(events, ['at', 'tail', 'finally']);
});

QUnit.test('loop head captures retain per-iteration and shared var bindings', assert => {
  const readers = [];
  for (const { at, length } of [[4, 5], [6, 7, 8]]) readers.push(() => [at.call([9], 0), length]);
  assert.deepEqual(readers.map(read => read()), [[9, 2], [9, 3]]);
  const shared = [];
  // eslint-disable-next-line no-var -- sharing the head binding across iterations is the observable
  for (var { at: method, length: size } of [[4, 5], [6, 7, 8]]) shared.push(() => [method.call([9], 0), size]);
  assert.deepEqual(shared.map(read => read()), [[9, 3], [9, 3]]);
  let assigned, length;
  for ({ at: assigned, length } of [[4, 5], [6, 7, 8]]) assert.same(assigned.call([9], 0), 9);
  assert.same(length, 3, 'an assignment head writes the outer target');
});

QUnit.test('relocated loop heads keep continue, break and iterator closing', assert => {
  const events = [];
  const iterable = {
    [Symbol.iterator]() {
      let index = 0;
      return {
        next() { events.push('next'); return { value: [++index], done: false }; },
        return() { events.push('close'); return { done: true }; },
      };
    },
  };
  for (const { at } of iterable) {
    events.push(at.call([7], 0));
    if (events.length === 2) continue;
    break;
  }
  assert.deepEqual(events, ['next', 7, 'next', 7, 'close']);
});

QUnit.test('a loop initializer keeps prefix and sibling reads around its capture', assert => {
  const events = [];
  const values = [4, 5];
  function read() {
    // eslint-disable-next-line no-unreachable-loop -- only the initializer ordering is under test
    for (const before = (events.push('before'), 1),
               { at, length } = (events.push(before), values),
               after = (events.push(length), at.call(values, -1)); ;) return after;
  }
  assert.same(read(), 5);
  assert.deepEqual(events, ['before', 1, 2]);
});
