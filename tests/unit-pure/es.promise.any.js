import AggregateError from '@core-js/pure/es/aggregate-error';
import Promise from '@core-js/pure/es/promise';

QUnit.test('Promise.any', assert => {
  assert.isFunction(Promise.any);
  assert.arity(Promise.any, 1);
  assert.true(Promise.any([1, 2, 3]) instanceof Promise, 'returns a promise');
});

QUnit.test('Promise.any, resolved', assert => {
  return Promise.any([
    Promise.resolve(1),
    Promise.reject(2),
    Promise.resolve(3),
  ]).then(it => {
    assert.same(it, 1, 'resolved with a correct value');
  });
});

QUnit.test('Promise.any, rejected #1', assert => {
  return Promise.any([
    Promise.reject(1),
    Promise.reject(2),
    Promise.reject(3),
  ]).then(() => {
    assert.avoid();
  }, error => {
    assert.true(error instanceof AggregateError, 'instanceof AggregateError');
    assert.deepEqual(error.errors, [1, 2, 3], 'rejected with a correct value');
  });
});

QUnit.test('Promise.any, rejected #2', assert => {
  // eslint-disable-next-line promise/valid-params -- required for testing
  return Promise.any().then(() => {
    assert.avoid();
  }, () => {
    assert.required('rejected as expected');
  });
});

QUnit.test('Promise.any, rejected #3', assert => {
  return Promise.any([]).then(() => {
    assert.avoid();
  }, error => {
    assert.true(error instanceof AggregateError, 'instanceof AggregateError');
    assert.deepEqual(error.errors, [], 'rejected with a correct value');
  });
});
