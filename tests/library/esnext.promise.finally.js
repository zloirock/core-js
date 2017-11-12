var Promise = core.Promise;

QUnit.test('Promise#finally', function (assert) {
  assert.isFunction(Promise.prototype.finally);
  assert.arity(Promise.prototype.finally, 1);
  assert.nonEnumerable(Promise.prototype, 'finally');
  assert.ok(Promise.resolve(42).finally(function () { /* empty */ }) instanceof Promise, 'returns a promise');
});

QUnit.test('Promise#finally, resolved', function (assert) {
  assert.expect(3);
  var async = assert.async();
  var called = 0;
  var argument = null;
  Promise.resolve(42).finally(function (it) {
    called++;
    argument = it;
  }).then(function (it) {
    assert.same(it, 42, 'resolved with a correct value');
    assert.same(called, 1, 'onFinally function called one time');
    assert.same(argument, undefined, 'onFinally function called with a correct argument');
    async();
  });
});

QUnit.test('Promise#finally, rejected', function (assert) {
  assert.expect(2);
  var async = assert.async();
  var called = 0;
  var argument = null;
  Promise.reject(42).finally(function (it) {
    called++;
    argument = it;
  }).catch(function () {
    assert.same(called, 1, 'onFinally function called one time');
    assert.same(argument, undefined, 'onFinally function called with a correct argument');
    async();
  });
});
