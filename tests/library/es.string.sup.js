QUnit.test('String#sup', assert => {
  const { sup } = core.String;
  assert.isFunction(sup);
  assert.same(sup('a'), '<sup>a</sup>', 'lower case');
});
