var test = QUnit.test;

test('String#sup', function (assert) {
  var sup = String.prototype.sup;
  assert.isFunction(sup);
  assert.arity(sup, 0);
  assert.name(sup, 'sup');
  assert.looksNative(sup);
  assert.nonEnumerable(String.prototype, 'sup');
  assert.same('a'.sup(), '<sup>a</sup>', 'lower case');
});
