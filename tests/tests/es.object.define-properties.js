QUnit.test('Object.defineProperties', assert => {
  const { defineProperties } = Object;
  assert.isFunction(defineProperties);
  assert.arity(defineProperties, 2);
  assert.name(defineProperties, 'defineProperties');
  assert.looksNative(defineProperties);
  assert.nonEnumerable(Object, 'defineProperties');
  const source = {};
  const result = defineProperties(source, { q: { value: 42 }, w: { value: 33 } });
  assert.same(result, source);
  assert.same(result.q, 42);
  assert.same(result.w, 33);
});
