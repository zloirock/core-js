QUnit.test('String#italics', assert => {
  const { italics } = core.String;
  assert.isFunction(italics);
  assert.same(italics('a'), '<i>a</i>', 'lower case');
});
