QUnit.test('String#fixed', assert => {
  const { fixed } = core.String;
  assert.isFunction(fixed);
  assert.same(fixed('a'), '<tt>a</tt>', 'lower case');
});
