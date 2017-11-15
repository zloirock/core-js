QUnit.test('String#fontsize', assert => {
  const { fontsize } = core.String;
  assert.isFunction(fontsize);
  assert.same(fontsize('a', 'b'), '<font size="b">a</font>', 'lower case');
  assert.same(fontsize('a', '"'), '<font size="&quot;">a</font>', 'escape quotes');
});
