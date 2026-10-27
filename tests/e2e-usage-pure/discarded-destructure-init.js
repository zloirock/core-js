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
