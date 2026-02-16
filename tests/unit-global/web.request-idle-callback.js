QUnit.test('requestIdleCallback', assert => {
  assert.true(typeof requestIdleCallback === 'function');
  assert.arity(requestIdleCallback, 2);
  assert.name(requestIdleCallback, 'requestIdleCallback');

  const done = assert.async(2);

  let called = false;

  requestIdleCallback(() => {
    called = true;
  });

  setTimeout(() => {
    assert.true(called);
    done();
  }, 10);

  requestIdleCallback(deadline => {
    assert.true(deadline.didTimeout);
    done();
  }, { timeout: 0.000001 });
});
