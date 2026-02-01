import is from '@core-js/pure/es/object/is';

QUnit.test('Object.is', assert => {
  assert.isFunction(is);
  assert.true(is(1, 1), '1 is 1');
  assert.true(is(NaN, NaN), '1 is 1');
  assert.false(is(0, -0), '0 is not -0');
  assert.false(is({}, {}), '{} is not {}');
});
