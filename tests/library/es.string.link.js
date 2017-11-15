QUnit.test('String#link', assert => {
  const { link } = core.String;
  assert.isFunction(link);
  assert.same(link('a', 'b'), '<a href="b">a</a>', 'lower case');
  assert.same(link('a', '"'), '<a href="&quot;">a</a>', 'escape quotes');
});
