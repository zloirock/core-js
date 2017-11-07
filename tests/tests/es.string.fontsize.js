var test = QUnit.test;

test('String#fontsize', function (assert) {
  var fontsize = String.prototype.fontsize;
  assert.isFunction(fontsize);
  assert.arity(fontsize, 1);
  assert.name(fontsize, 'fontsize');
  assert.looksNative(fontsize);
  assert.nonEnumerable(String.prototype, 'fontsize');
  assert.same('a'.fontsize('b'), '<font size="b">a</font>', 'lower case');
  assert.same('a'.fontsize('"'), '<font size="&quot;">a</font>', 'escape quotes');
});
