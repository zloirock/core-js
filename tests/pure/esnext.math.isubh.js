import isubh from 'core-js-pure/features/math/isubh';

QUnit.test('Math.isubh', assert => {
  assert.isFunction(isubh);
  assert.arity(isubh, 4);
  assert.same(isubh(0, 2, 1, 0), 1);
  assert.same(isubh(0, 4, 1, 1), 2);
  assert.same(isubh(2, 4, 1, 1), 3);
  assert.same(isubh(0xffffffff, 4, 1, 1), 3);
  assert.same(isubh(1, 4, 0xffffffff, 1), 2);
});
