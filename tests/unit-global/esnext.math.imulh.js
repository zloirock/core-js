QUnit.test('Math.imulh', assert => {
  const { imulh } = Math;
  assert.isFunction(imulh);
  assert.name(imulh, 'imulh');
  assert.arity(imulh, 2);
  assert.looksNative(imulh);
  assert.nonEnumerable(Math, 'imulh');
  assert.same(imulh(0xFFFFFFFF, 7), -1);
  assert.same(imulh(0xFFFFFFF, 77), 4);
  assert.same(imulh(1, 7), 0);
  assert.same(imulh(-1, 7), -1);
});
