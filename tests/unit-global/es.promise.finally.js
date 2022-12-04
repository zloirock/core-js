QUnit.test('Promise#finally', assert => {
  assert.isFunction(Promise.prototype.finally);
  assert.arity(Promise.prototype.finally, 1);
  assert.looksNative(Promise.prototype.finally);
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

const promise = (() => {
  try {
    return Function('return (async function () { /* empty */ })()')();
  } catch { /* empty */ }
})();

if (promise && promise.constructor !== Promise) QUnit.test('Native Promise, patched', assert => {
  assert.isFunction(promise.finally);
  assert.arity(promise.finally, 1);
  assert.looksNative(promise.finally);
  assert.nonEnumerable(promise.constructor.prototype, 'finally');
  function empty() { /* empty */ }
  assert.true(promise.finally(empty) instanceof Promise, '`.finally` returns `Promise` instance #1');
  assert.true(new promise.constructor(empty).finally(empty) instanceof Promise, '`.finally` returns `Promise` instance #2');
});

