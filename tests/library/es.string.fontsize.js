var test = QUnit.test;

test('String#fontsize', function (assert) {
  var fontsize = core.String.fontsize;
  assert.isFunction(fontsize);
  assert.same(fontsize('a', 'b'), '<font size="b">a</font>', 'lower case');
  assert.same(fontsize('a', '"'), '<font size="&quot;">a</font>', 'escape quotes');
});
