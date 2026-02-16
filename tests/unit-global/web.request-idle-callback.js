QUnit.test('request-idle-callback', assert => {
  assert.isFunction(requestIdleCallback);
  assert.arity(requestIdleCallback, 2);
  assert.name(requestIdleCallback, 'requestIdleCallback');

  const done = assert.async(2);

  let called = false;

  requestIdleCallback((deadline) => {
    called = true;
  });

  setTimeout(() => {
    assert.ok(called, 'callback should have been called after ~10 ms');
    done();
  }, 10); 

  requestIdleCallback((deadline) => {
    assert.ok(deadline.didTimeout, 'timeout works');
    done();
  }, {timeout: 0.000001});
});
