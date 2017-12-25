QUnit.test('String#small', assert => {
  const { small } = core.String;
  assert.isFunction(small);
  assert.same(small('a'), '<small>a</small>', 'lower case');
});
