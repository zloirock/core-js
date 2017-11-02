var test = QUnit.test;

test('String#fontcolor', function (assert) {
  var fontcolor = core.String.fontcolor;
  assert.isFunction(fontcolor);
  assert.same(fontcolor('a', 'b'), '<font color="b">a</font>', 'lower case');
  assert.same(fontcolor('a', '"'), '<font color="&quot;">a</font>', 'escape quotes');
});
