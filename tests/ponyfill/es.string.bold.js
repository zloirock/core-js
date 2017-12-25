QUnit.test('String#bold', assert => {
  const { bold } = core.String;
  assert.isFunction(bold);
  assert.same(bold('a'), '<b>a</b>', 'lower case');
});
