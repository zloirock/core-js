var test = QUnit.test;

test('String#anchor', function (assert) {
  var anchor = core.String.anchor;
  assert.isFunction(anchor);
  assert.same(anchor('a', 'b'), '<a name="b">a</a>', 'lower case');
  assert.same(anchor('a', '"'), '<a name="&quot;">a</a>', 'escape quotes');
});
