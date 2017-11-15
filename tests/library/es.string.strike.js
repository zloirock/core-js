QUnit.test('String#strike', assert => {
  const { strike } = core.String;
  assert.isFunction(strike);
  assert.same(strike('a'), '<strike>a</strike>', 'lower case');
});
