import HAS_INSTANCE from '../../packages/core-js-pure/fn/symbol/has-instance';

QUnit.test('Function#@@hasInstance', assert => {
  assert.ok(HAS_INSTANCE in Function.prototype);
  assert.ok(Function[HAS_INSTANCE](() => { /* empty */ }));
  assert.ok(!Function[HAS_INSTANCE]({}));
});
