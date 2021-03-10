import defineProperties from 'core-js-pure/full/object/define-properties';

QUnit.test('Object.defineProperties', assert => {
  assert.isFunction(defineProperties);
  assert.arity(defineProperties, 2);
  const source = {};
  const result = defineProperties(source, { q: { value: 42 }, w: { value: 33 } });
  assert.same(result, source);
  assert.same(result.q, 42);
  assert.same(result.w, 33);
});
