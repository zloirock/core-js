QUnit.test('Math.umulh', assert => {
  const { umulh } = Math;
  assert.isFunction(umulh);
  assert.name(umulh, 'umulh');
  assert.arity(umulh, 2);
  assert.looksNative(umulh);
  assert.nonEnumerable(Math, 'umulh');
  assert.same(umulh(0xFFFFFFFF, 7), 6);
  assert.same(umulh(0xFFFFFFF, 77), 4);
  assert.same(umulh(1, 7), 0);
  assert.same(umulh(-1, 7), 6);
});
