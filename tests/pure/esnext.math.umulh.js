import umulh from 'core-js-pure/features/math/umulh';

QUnit.test('Math.umulh', assert => {
  assert.isFunction(umulh);
  assert.arity(umulh, 2);
  assert.same(umulh(0xFFFFFFFF, 7), 6);
  assert.same(umulh(0xFFFFFFF, 77), 4);
  assert.same(umulh(1, 7), 0);
  assert.same(umulh(-1, 7), 6);
});
