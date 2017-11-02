var test = QUnit.test;

test('String#sup', function (assert) {
  var sup = core.String.sup;
  assert.isFunction(sup);
  assert.same(sup('a'), '<sup>a</sup>', 'lower case');
});
