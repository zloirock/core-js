QUnit.test('String#sub', assert => {
  const { sub } = core.String;
  assert.isFunction(sub);
  assert.same(sub('a'), '<sub>a</sub>', 'lower case');
});
