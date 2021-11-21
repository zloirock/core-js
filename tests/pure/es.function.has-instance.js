import HAS_INSTANCE from 'core-js-pure/features/symbol/has-instance';

QUnit.test('Function#@@hasInstance', assert => {
  assert.true(HAS_INSTANCE in Function.prototype);
  assert.true(Function[HAS_INSTANCE](() => { /* empty */ }));
  assert.false(Function[HAS_INSTANCE]({}));
});
