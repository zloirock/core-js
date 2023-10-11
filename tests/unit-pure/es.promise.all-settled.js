import Promise from '@core-js/pure/es/promise';

QUnit.test('Promise.allSettled', assert => {
  assert.isFunction(Promise.allSettled);
  assert.arity(Promise.allSettled, 1);
  assert.true(Promise.allSettled([1, 2, 3]) instanceof Promise, 'returns a promise');
});

QUnit.test('Promise.allSettled, resolved', assert => {
  return Promise.allSettled([
    Promise.resolve(1),
    Promise.reject(2),
    Promise.resolve(3),
  ]).then(it => {
    assert.deepEqual(it, [
      { value: 1, status: 'fulfilled' },
      { reason: 2, status: 'rejected' },
      { value: 3, status: 'fulfilled' },
    ], 'resolved with a correct value');
  });
});

QUnit.test('Promise.allSettled, rejected', assert => {
  // eslint-disable-next-line promise/valid-params -- required for testing
  return Promise.allSettled().then(() => {
    assert.avoid();
  }, () => {
    assert.required('rejected as expected');
  });
});
