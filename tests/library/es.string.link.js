QUnit.test('String#link', function (assert) {
  var link = core.String.link;
  assert.isFunction(link);
  assert.same(link('a', 'b'), '<a href="b">a</a>', 'lower case');
  assert.same(link('a', '"'), '<a href="&quot;">a</a>', 'escape quotes');
});
