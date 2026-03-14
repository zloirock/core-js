QUnit.test('idle callbacks', assert => {
  // Avoid infinite waiting if a handle is not called.
  assert.timeout(3000);

  assert.isFunction(requestIdleCallback);
  assert.arity(requestIdleCallback, 1);
  assert.name(requestIdleCallback, 'requestIdleCallback');

  const done = assert.async(4);

  requestIdleCallback(deadline => {
    assert.false(deadline.didTimeout, 'timed out without a timeout');
    assert.strictEqual(typeof deadline.timeRemaining(), 'number', 'not a number');
    done();
  });

  // A string is coerced into NaN ==> no timeout.
  requestIdleCallback(deadline => {
    assert.false(deadline.didTimeout, 'timed out without a timeout');
    done();
  }, { timeout: 'Allison' });

  assert.isFunction(cancelIdleCallback);
  assert.arity(cancelIdleCallback, 1);
  assert.name(cancelIdleCallback, 'cancelIdleCallback');

  const handle = requestIdleCallback(() => {
    // Shouldn't ever be called.
    assert.true(false, 'canceled callback called');
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
    assert.true(ran, 'not FIFO');
    done();
  });

  assert.throws(requestIdleCallback, TypeError);
  assert.throws(cancelIdleCallback, TypeError);
  assert.throws(() => {
    requestIdleCallback('allison');
  }, TypeError);
  // Shouldn't do anything, as allison is not a number.
  cancelIdleCallback('allison');

  assert.isFunction(IdleDeadline);
  assert.arity(IdleDeadline, 0);
  assert.name(IdleDeadline, 'IdleDeadline');
  assert.throws(IdleDeadline, TypeError);
});
