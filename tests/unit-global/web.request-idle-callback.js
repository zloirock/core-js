// setTimeouts have loose limits
// as CI is very slow
QUnit.test('requestIdleCallback', assert => {
  assert.isFunction(requestIdleCallback);
  assert.arity(requestIdleCallback, 1);
  assert.name(requestIdleCallback, 'requestIdleCallback');

  const done = assert.async(3);

  let called = false;

  requestIdleCallback(deadline => {
    assert.false(deadline.didTimeout);
    assert.true(deadline.timeRemaining() > 0);
    called = true;
  });

  setTimeout(() => {
    assert.true(called);
    done();
  }, 1000);

  assert.isFunction(cancelIdleCallback);
  assert.arity(cancelIdleCallback, 1);
  assert.name(cancelIdleCallback, 'cancelIdleCallback');

  const handle = requestIdleCallback(() => {
    // Shouldn't ever be called.
    assert.true(false);
  });
  cancelIdleCallback(handle);

  // Give the inner "shouldn't ever be called"
  // assert a chance to run and fail.
  setTimeout(() => {
    done();
  }, 1000);

  let ran = false;
  requestIdleCallback(() => {
    ran = true;
  });
  requestIdleCallback(() => {
    // Test that the operation is FIFO.
    assert.true(ran);
    done();
  });
});
