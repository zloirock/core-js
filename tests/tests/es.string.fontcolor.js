QUnit.test('String#fontcolor', assert => {
  const { fontcolor } = String.prototype;
  assert.isFunction(fontcolor);
  assert.arity(fontcolor, 1);
  assert.name(fontcolor, 'fontcolor');
  assert.looksNative(fontcolor);
  assert.nonEnumerable(String.prototype, 'fontcolor');
  assert.same('a'.fontcolor('b'), '<font color="b">a</font>', 'lower case');
  assert.same('a'.fontcolor('"'), '<font color="&quot;">a</font>', 'escape quotes');
});
