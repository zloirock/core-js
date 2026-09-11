import Promise from '@core-js/pure/es/promise';

QUnit.test('Promise#finally', assert => {
  assert.isFunction(Promise.prototype.finally);
  assert.arity(Promise.prototype.finally, 1);
  assert.nonEnumerable(Promise.prototype, 'finally');
  assert.true(Promise.resolve(42).finally(() => { /* empty */ }) instanceof Promise, 'returns a promise');
});

QUnit.test('Promise#finally, resolved', assert => {
  let called = 0;
  let argument = null;
  return Promise.resolve(42).finally(it => {
    called++;
    argument = it;
  }).then(it => {
    assert.same(it, 42, 'resolved with a correct value');
    assert.same(called, 1, 'onFinally function called one time');
    assert.same(argument, undefined, 'onFinally function called with a correct argument');
  });
});

QUnit.test('Promise#finally, rejected', assert => {
  let called = 0;
  let argument = null;
  return Promise.reject(42).finally(it => {
    called++;
    argument = it;
  }).then(() => {
    assert.avoid();
  }, () => {
    assert.same(called, 1, 'onFinally function called one time');
    assert.same(argument, undefined, 'onFinally function called with a correct argument');
  });
});
