QUnit.test('String#sup', assert => {
  const { sup } = String.prototype;
  assert.isFunction(sup);
  assert.arity(sup, 0);
  assert.name(sup, 'sup');
  assert.looksNative(sup);
  assert.nonEnumerable(String.prototype, 'sup');
  assert.same('a'.sup(), '<sup>a</sup>', 'lower case');
});
