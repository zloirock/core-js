var test = QUnit.test;
var Promise = core.Promise;

test('Promise.try', function (assert) {
  assert.isFunction(Promise['try']);
  assert.arity(Promise['try'], 1);
  assert.ok(Promise['try'](function () {
    return 42;
  }) instanceof Promise, 'returns a promise');
});

test('Promise.try, resolved', function (assert) {
  assert.expect(1);
  var async = assert.async();
  Promise['try'](function () {
    return 42;
  }).then(function (it) {
    assert.same(it, 42, 'resolved with a correct value');
    async();
  });
});

test('Promise.try, rejected', function (assert) {
  assert.expect(1);
  var async = assert.async();
  Promise['try'](function () {
    throw new Error();
  })['catch'](function () {
    assert.ok(true, 'rejected as expected');
    async();
  });
});
