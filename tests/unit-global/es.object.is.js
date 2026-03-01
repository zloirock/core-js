QUnit.test('Object.is', assert => {
  const { is } = Object;
  assert.isFunction(is);
  assert.arity(is, 2);
  assert.name(is, 'is');
  assert.looksNative(is);
  assert.nonEnumerable(Object, 'is');
  assert.true(is(1, 1), '1 is 1');
  assert.true(is(NaN, NaN), 'NaN is NaN');
  assert.false(is(0, -0), '0 is not -0');
  assert.false(is({}, {}), '{} is not {}');
});
