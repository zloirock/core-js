QUnit.test('Object.isExtensible', function (assert) {
  var isExtensible = core.Object.isExtensible;
  assert.isFunction(isExtensible);
  assert.arity(isExtensible, 1);
  var primitives = [42, 'string', false, null, undefined];
  for (var i = 0, length = primitives.length; i < length; ++i) {
    var value = primitives[i];
    assert.ok(function () {
      try {
        isExtensible(value);
        return true;
      } catch (e) { /* empty */ }
    }(), 'accept ' + value);
    assert.same(isExtensible(value), false, 'returns true on ' + value);
  }
  assert.same(isExtensible({}), true);
});
