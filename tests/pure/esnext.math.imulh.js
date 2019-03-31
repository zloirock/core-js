import imulh from 'core-js-pure/features/math/imulh';

QUnit.test('Math.imulh', assert => {
  assert.isFunction(imulh);
  assert.arity(imulh, 2);
  assert.same(imulh(0xFFFFFFFF, 7), -1);
  assert.same(imulh(0xFFFFFFF, 77), 4);
  assert.same(imulh(1, 7), 0);
  assert.same(imulh(-1, 7), -1);
});
