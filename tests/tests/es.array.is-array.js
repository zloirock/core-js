var test = QUnit.test;

test('Array.isArray', function (assert) {
  var isArray = Array.isArray;
  assert.isFunction(isArray);
  assert.arity(isArray, 1);
  assert.name(isArray, 'isArray');
  assert.looksNative(isArray);
  assert.nonEnumerable(Array, 'isArray');
  assert.ok(!isArray({}));
  assert.ok(!isArray(function () {
    return arguments;
  }()));
  assert.ok(isArray([]));
});
