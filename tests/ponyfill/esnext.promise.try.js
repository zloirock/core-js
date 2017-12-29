import Promise from '../../ponyfill/fn/promise';

QUnit.test('Promise.try', assert => {
  assert.isFunction(Promise.try);
  assert.arity(Promise.try, 1);
  assert.ok(Promise.try(() => 42) instanceof Promise, 'returns a promise');
});

QUnit.test('Promise.try, resolved', assert => {
  assert.expect(1);
  const async = assert.async();
  Promise.try(() => 42).then(it => {
    assert.same(it, 42, 'resolved with a correct value');
    async();
  });
});

QUnit.test('Promise.try, rejected', assert => {
  assert.expect(1);
  const async = assert.async();
  Promise.try(() => {
    throw new Error();
  }).catch(() => {
    assert.ok(true, 'rejected as expected');
    async();
  });
});
