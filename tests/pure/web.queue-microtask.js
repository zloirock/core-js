import queueMicrotask from 'core-js-pure/full/queue-microtask';

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
      assert.ok(after, 'works');
      async();
    }
  });
  setTimeout(() => {
    if (!done) {
      done = true;
      assert.ok(false, 'fails');
      async();
    }
  }, 3e3);
  after = true;
});
