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
