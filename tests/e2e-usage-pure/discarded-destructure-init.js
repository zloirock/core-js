/* eslint-disable @stylistic/no-extra-parens -- nested sequences and assignment slots are the source forms under test */
QUnit.test('destructuring: an emptied declaration keeps nested initializer effects before binding', assert => {
  const events = [];
  const { from: read = (events.push('default'), () => []) } =
    (events.push('outer'), (events.push(Array.of('inner')[0]), Array));
  events.push(read([7])[0]);
  assert.deepEqual(events, ['outer', 'inner', 7]);
});

QUnit.test('destructuring: a bodyless assignment keeps the initializer under its branch', assert => {
  const events = [];
  let read;
  for (const take of [false, true]) {
    if (take) ({ values: read = (events.push('default'), () => []) } =
      (events.push('outer'), (events.push('inner'), Object)));
    events.push(take);
  }
  assert.deepEqual(read({ x: 7 }), [7]);
  assert.deepEqual(events, [false, 'outer', 'inner', true]);
});

QUnit.test('destructuring: a consumed getter initializer still reads once', assert => {
  const events = [];
  const source = { get constructorValue() {
    events.push('getter');
    return Array;
  } };
  let read;
  // eslint-disable-next-line prefer-const -- the assignment is the host under test
  ({ from: read } = (events.push('prefix'), source.constructorValue));
  events.push(read([7])[0]);
  assert.deepEqual(events, ['prefix', 'getter', 7]);
});

QUnit.test('destructuring: a consumed loop initializer stores its receiver before binding', assert => {
  const events = [];
  let held;
  // eslint-disable-next-line no-var, no-unreachable-loop -- the var initializer is rescued inside its one-iteration loop
  for (var { entries: read } = (events.push('prefix'), held = Object); ;) {
    events.push(typeof held, read({ x: 7 })[0][1]);
    break;
  }
  assert.deepEqual(events, ['prefix', 'function', 7]);
});

QUnit.test('destructuring: an instance overwrite keeps the other initializer properties', assert => {
  const events = [];
  const values = [7, 8];
  let read;
  ({ y: { at: read } } = { before: events.push('plain-before'), y: values, after: events.push('plain-after') });
  assert.same(read.call(values, -1), 8);
  for (const take of [false, true]) {
    if (take) ({ y: { at: read } } = { before: events.push('branch-before'), y: values, after: events.push('branch-after') });
  }
  assert.same(read.call(values, -1), 8);
  (0, ({ y: { at: read } } = { before: events.push('seq-before'), y: values, after: events.push('seq-after') }), events.push('tail'));
  assert.same(read.call(values, -1), 8);
  assert.deepEqual(events, ['plain-before', 'plain-after', 'branch-before', 'branch-after', 'seq-before', 'seq-after', 'tail']);
});

QUnit.test('destructuring: a consumed realm getter stays between sibling initializers', assert => {
  const events = [];
  // eslint-disable-next-line unicorn/no-static-only-class -- the class getter is the source receiver under test
  class Source {
    static get realm() {
      events.push('getter');
      return globalThis;
    }
  }
  const before = events.push('before'),
        { from: read } = (events.push(Array.of('prefix')[0]), Source.realm.Array),
        after = events.push(read([7])[0]);
  assert.same(before, 1);
  assert.same(after, 4);
  assert.deepEqual(events, ['before', 'prefix', 'getter', 7]);
});

QUnit.test('destructuring: a bodyless consumed getter keeps its throw and dead default', assert => {
  const events = [];
  let fail = false;
  const sentinel = {};
  function mark() {
    events.push('getter');
    if (fail) throw sentinel;
  }
  // Keep the getter's return source-proven; its opaque effect still throws before the read.
  // eslint-disable-next-line unicorn/no-static-only-class -- the class getter is the source receiver under test
  class Source {
    static get realm() {
      mark();
      return globalThis;
    }
  }
  // eslint-disable-next-line no-var -- a bodyless declaration must keep its initializer inside the branch
  if (events.length === 0) var { from: read = (events.push('default'), null) } = (events.push('prefix'), Source.realm.Array);
  assert.deepEqual(read([7]), [7]);
  assert.deepEqual(events, ['prefix', 'getter']);
  fail = true;
  assert.throws(() => {
    // eslint-disable-next-line no-var -- the same bodyless host must propagate its getter's throw
    if (fail) var { of: other } = (events.push('throw-prefix'), Source.realm.Array);
    return other;
  }, error => error === sentinel);
  assert.deepEqual(events, ['prefix', 'getter', 'throw-prefix', 'getter']);
});
