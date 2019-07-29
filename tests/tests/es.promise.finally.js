QUnit.test('Promise#finally', assert => {
  assert.isFunction(Promise.prototype.finally);
  assert.arity(Promise.prototype.finally, 1);
  assert.looksNative(Promise.prototype.finally);
  assert.nonEnumerable(Promise.prototype, 'finally');
  assert.ok(Promise.resolve(42).finally(() => { /* empty */ }) instanceof Promise, 'returns a promise');
});

QUnit.test('Promise#finally, resolved', assert => {
  assert.expect(3);
  const async = assert.async();
  let called = 0;
  let argument = null;
  Promise.resolve(42).finally(it => {
    called++;
    argument = it;
  }).then(it => {
    assert.same(it, 42, 'resolved with a correct value');
    assert.same(called, 1, 'onFinally function called one time');
    assert.same(argument, undefined, 'onFinally function called with a correct argument');
    async();
  });
});

QUnit.test('Promise#finally, rejected', assert => {
  assert.expect(2);
  const async = assert.async();
  let called = 0;
  let argument = null;
  Promise.reject(42).finally(it => {
    called++;
    argument = it;
  }).catch(() => {
    assert.same(called, 1, 'onFinally function called one time');
    assert.same(argument, undefined, 'onFinally function called with a correct argument');
    async();
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
  assert.ok(promise.finally(empty) instanceof Promise, '`.finally` returns `Promise` instance #1');
  assert.ok(new promise.constructor(empty).finally(empty) instanceof Promise, '`.finally` returns `Promise` instance #2');
});

