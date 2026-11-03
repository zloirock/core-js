/* eslint-disable no-sequences, unicorn/no-unreadable-iife -- Preserve the source wrappers and effects under test. */
QUnit.test('destructuring: a retained element default does not hide an instance sibling', assert => {
  const events = [];
  const [{ isArray } = (events.push('default'), Array), { at }] = [undefined, [7, 8]];
  assert.true(isArray([]), 'the native static slot still reads its default receiver');
  assert.same(at.call([7, 8], -1), 8, 'the independent instance method is polyfilled');
  assert.deepEqual(events, ['default'], 'the receiver default runs once');
});

QUnit.test('destructuring: a retained wrapper does not replace a foreign receiver default', assert => {
  // eslint-disable-next-line es/no-nonstandard-symbol-properties -- the foreign default intentionally has no resolve method
  function wrapped([{ Promise: { resolve } = Symbol }] = [globalThis]) {
    return resolve;
  }
  function custom() {
    return 7;
  }
  assert.same(wrapped([{}]), undefined, 'the supplied missing slot reads Symbol.resolve');
  assert.same(wrapped([{ Promise: { resolve: custom } }]), custom, 'a supplied method keeps its identity');
});

QUnit.test('destructuring: a sole instance extraction carries its literal slot effects', assert => {
  const events = [];
  const { w: { [Symbol.iterator]: method } } = { w: (events.push('receiver'), globalThis) };
  assert.same(method, undefined, 'the receiver has no iterator method');
  assert.deepEqual(events, ['receiver'], 'the initializer effect runs exactly once');
});

QUnit.test('destructuring: an opaque default carries its constructor static', assert => {
  const events = [];
  function key() {
    events.push('key');
    return String(Math.random());
  }
  const { [key()]: { groupBy } = Map } = {};
  assert.same(groupBy([1, 2], value => value % 2).get(1)[0], 1);
  assert.deepEqual(events, ['key']);
});

QUnit.test('destructuring: a positional constructor read has no identity guard', assert => {
  function read(flag) {
    let Receiver = Map;
    if (flag) Receiver = Set;
    const [{ groupBy }] = [Receiver];
    return groupBy;
  }
  assert.same(read(false)([3], value => value).get(3)[0], 3);
  assert.same(read(true), undefined, 'the other constructor keeps its own missing slot');
});

QUnit.test('destructuring: a literal IIFE carries a static and preserves its effects', assert => {
  const events = [];
  const { C: { groupBy } } = (() => (events.push('return'), { C: Map }))();
  assert.same(groupBy([5], value => value).get(5)[0], 5);
  assert.deepEqual(events, ['return']);
});

QUnit.test('destructuring: a literal IIFE parameter default keeps the supplied receiver', assert => {
  const events = [];
  function read({ C: { groupBy } } = (() => (events.push('default'), { C: Map }))()) {
    return groupBy([7], value => value).get(7)[0];
  }
  assert.same(read(), 7);
  assert.throws(() => read({ C: undefined }), TypeError);
  assert.deepEqual(events, ['default'], 'a supplied value does not evaluate the default');
});

QUnit.test('destructuring: a literal IIFE loop element carries its static once', assert => {
  const events = [];
  for (const { C: { groupBy } } of [(() => (events.push('element'), { C: Map }))()]) {
    assert.same(groupBy([11], value => value).get(11)[0], 11);
    events.push('body');
  }
  assert.deepEqual(events, ['element', 'body']);
});

QUnit.test('destructuring: a computed container key precedes its later write', assert => {
  const rows = [];
  const key = String(rows.length);
  const { [key]: { groupBy } = Map } = {};
  rows.push(groupBy);
  assert.same(rows[0]([13], value => value).get(13)[0], 13);
});
