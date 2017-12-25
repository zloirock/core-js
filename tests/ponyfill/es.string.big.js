QUnit.test('String#big', assert => {
  const { big } = core.String;
  assert.isFunction(big);
  assert.same(big('a'), '<big>a</big>', 'lower case');
});
