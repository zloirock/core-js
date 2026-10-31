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

QUnit.test('positional parameters serve supplied and default instance receivers', assert => {
  const events = [];
  function source() {
    events.push('default');
    return [[4, 5]];
  }
  function full([{ at }]) { return at.call([7, 9], -1); }
  function partial([{ at, length }] = source()) { return [at.call([7, 9], -1), length]; }
  assert.same(full([[4]]), 9);
  assert.deepEqual(partial(), [9, 2]);
  assert.deepEqual(partial([[6, 7, 8]]), [9, 3]);
  assert.deepEqual(events, ['default']);
  assert.same(full([{ at() { return 'own'; } }]), 'own');
  assert.throws(() => partial([null]), TypeError);
});

QUnit.test('a positional assignment preserves native siblings and outer bindings', assert => {
  let at, length;
  const readers = [];
  for ([{ at, length }] of [[[4, 5]], [[6, 7, 8]]]) readers.push([at.call([9], 0), length]);
  assert.deepEqual(readers, [[9, 2], [9, 3]]);
  assert.same(length, 3);
  assert.same(at.call([7], 0), 7);
});

QUnit.test('a positional parameter retains one iterator and closes it once', assert => {
  const events = [];
  const iterable = {
    [Symbol.iterator]() {
      events.push('iterator');
      return {
        next() { events.push('next'); return { value: [4, 5], done: false }; },
        return() { events.push('close'); return {}; },
      };
    },
  };
  function read([{ at, length }]) {
    events.push('body');
    return [at.call([9], 0), length];
  }
  assert.deepEqual(read(iterable), [9, 2]);
  assert.deepEqual(events, ['iterator', 'next', 'close', 'body']);
});

// Babel lowering erases TDZ; the differential keeps the original ReferenceError lock.
QUnit.test('a positional parameter keeps closure reads at parameter initialization', assert => {
  function read(probe = () => at, [{ at }] = [{ get at() { return probe(); } }]) {
    return at;
  }
  assert.same(read(), undefined);
  // eslint-disable-next-line default-param-last -- the getter must precede the last parameter binding
  function later(probe = () => value, [{ at }] = [{ get at() { return probe(); } }], value) {
    return [at, value];
  }
  assert.deepEqual(later(undefined, undefined, 9), [undefined, 9]);
});
