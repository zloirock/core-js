import AggregateError from 'core-js-pure/es/aggregate-error';
import Promise from 'core-js-pure/es/promise';

QUnit.test('Promise.any', assert => {
  assert.isFunction(Promise.any);
  assert.arity(Promise.any, 1);
  assert.true(Promise.any([1, 2, 3]) instanceof Promise, 'returns a promise');
});

QUnit.test('Promise.any, resolved', assert => {
  assert.expect(1);
  const async = assert.async();
  Promise.any([
    Promise.resolve(1),
    Promise.reject(2),
    Promise.resolve(3),
  ]).then(it => {
    assert.same(it, 1, 'resolved with a correct value');
    async();
  });
});

QUnit.test('Promise.any, rejected #1', assert => {
  assert.expect(2);
  const async = assert.async();
  Promise.any([
    Promise.reject(1),
    Promise.reject(2),
    Promise.reject(3),
  ]).catch(error => {
    assert.true(error instanceof AggregateError, 'instanceof AggregateError');
    assert.deepEqual(error.errors, [1, 2, 3], 'rejected with a correct value');
    async();
  });
});

QUnit.test('Promise.any, rejected #2', assert => {
  assert.expect(1);
  const async = assert.async();
  Promise.any().catch(() => {
    assert.required('rejected as expected');
    async();
  });
});

QUnit.test('Promise.any, rejected #3', assert => {
  assert.expect(2);
  const async = assert.async();
  Promise.any([]).catch(error => {
    assert.true(error instanceof AggregateError, 'instanceof AggregateError');
    assert.deepEqual(error.errors, [], 'rejected with a correct value');
    async();
  });
});
