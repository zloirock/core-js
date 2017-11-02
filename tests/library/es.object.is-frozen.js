var test = QUnit.test;

test('Object.isFrozen', function (assert) {
  var isFrozen = core.Object.isFrozen;
  assert.isFunction(isFrozen);
  assert.arity(isFrozen, 1);
  var primitives = [42, 'string', false, null, undefined];
  for (var i = 0, length = primitives.length; i < length; ++i) {
    var value = primitives[i];
    assert.ok(function () {
      try {
        isFrozen(value);
        return true;
      } catch (e) { /* empty */ }
    }(), 'accept ' + value);
    assert.same(isFrozen(value), true, 'returns true on ' + value);
  }
  assert.same(isFrozen({}), false);
});
