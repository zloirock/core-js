import defineProperties from '@core-js/pure/es/object/define-properties';

QUnit.test('Object.defineProperties', assert => {
  assert.isFunction(defineProperties);
  assert.arity(defineProperties, 2);
  const source = {};
  const result = defineProperties(source, { q: { value: 42 }, w: { value: 33 } });
  assert.same(result, source);
  assert.same(result.q, 42);
  assert.same(result.w, 33);

  // eslint-disable-next-line prefer-arrow-callback -- required for testing
  assert.same(defineProperties(function () { /* empty */ }, { prototype: {
    value: 42,
    writable: false,
  } }).prototype, 42, 'function prototype with non-writable descriptor');
});
