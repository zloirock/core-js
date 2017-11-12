QUnit.test('Array.isArray', function (assert) {
  var isArray = core.Array.isArray;
  assert.isFunction(isArray);
  assert.ok(!isArray({}));
  assert.ok(!isArray(function () {
    return arguments;
  }()));
  assert.ok(isArray([]));
});
