QUnit.test('Math.iaddh', assert => {
  const { iaddh } = Math;
  assert.isFunction(iaddh);
  assert.name(iaddh, 'iaddh');
  assert.arity(iaddh, 4);
  assert.looksNative(iaddh);
  assert.nonEnumerable(Math, 'iaddh');
  assert.same(iaddh(0, 2, 1, 0), 2);
  assert.same(iaddh(0, 4, 1, 1), 5);
  assert.same(iaddh(2, 4, 1, 1), 5);
  assert.same(iaddh(0xffffffff, 4, 1, 1), 6);
  assert.same(iaddh(1, 4, 0xffffffff, 1), 6);
});
