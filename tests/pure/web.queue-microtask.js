import queueMicrotask from 'core-js-pure/features/queue-microtask';

QUnit.test('queueMicrotask', assert => {
  assert.expect(3);
  assert.isFunction(queueMicrotask);
  assert.arity(queueMicrotask, 1);
  const async = assert.async();
  let done = false;
  let after = false;
  queueMicrotask(() => {
    if (!done) {
      done = true;
      assert.true(after, 'works');
      async();
    }
  });
  setTimeout(() => {
    if (!done) {
      done = true;
      assert.avoid();
      async();
    }
  }, 3e3);
  after = true;
});
