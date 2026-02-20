QUnit.test('requestIdleCallback', assert => {
  // Avoid infinite waiting if a handle is not called.
  assert.timeout(3000);

  assert.isFunction(requestIdleCallback);
  assert.arity(requestIdleCallback, 1);
  assert.name(requestIdleCallback, 'requestIdleCallback');

  const done = assert.async(3);

  requestIdleCallback(deadline => {
    assert.false(deadline.didTimeout, "timed out without a timeout");
    assert.strictEqual(typeof deadline.timeRemaining(), 'number', "not a number");
    done();
  });

  assert.isFunction(cancelIdleCallback);
  assert.arity(cancelIdleCallback, 1);
  assert.name(cancelIdleCallback, 'cancelIdleCallback');

  const handle = requestIdleCallback(() => {
    // Shouldn't ever be called.
    assert.true(false, "canceled callback called");
  });
  cancelIdleCallback(handle);

  // Give the inner "shouldn't ever be called"
  // assert a chance to run and fail.
  setTimeout(() => {
    done();
  }, 500);

  let ran = false;
  requestIdleCallback(() => {
    ran = true;
  });
  requestIdleCallback(() => {
    // Test that the operation is FIFO.
    assert.true(ran, "not FIFO");
    done();
  });
});
