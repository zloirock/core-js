QUnit.test('Object.isSealed', function (assert) {
  var isSealed = core.Object.isSealed;
  assert.isFunction(isSealed);
  assert.arity(isSealed, 1);
  var primitives = [42, 'string', false, null, undefined];
  for (var i = 0, length = primitives.length; i < length; ++i) {
    var value = primitives[i];
    assert.ok(function () {
      try {
        isSealed(value);
        return true;
      } catch (e) { /* empty */ }
    }(), 'accept ' + value);
    assert.same(isSealed(value), true, 'returns true on ' + value);
  }
  assert.same(isSealed({}), false);
});
