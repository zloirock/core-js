QUnit.test('Math.imulh', assert => {
  const { imulh } = core.Math;
  assert.isFunction(imulh);
  assert.arity(imulh, 2);
  assert.same(imulh(0xffffffff, 7), -1);
  assert.same(imulh(0xfffffff, 77), 4);
  assert.same(imulh(1, 7), 0);
  assert.same(imulh(-1, 7), -1);
});
