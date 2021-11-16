QUnit.test('Math.signbit', assert => {
  const { signbit } = Math;
  assert.isFunction(signbit);
  assert.name(signbit, 'signbit');
  assert.arity(signbit, 1);
  assert.looksNative(signbit);
  assert.nonEnumerable(Math, 'signbit');
  assert.same(false, signbit(NaN));
  assert.same(false, signbit());
  assert.same(true, signbit(-0));
  assert.same(false, signbit(0));
  assert.same(false, signbit(Infinity));
  assert.same(true, signbit(-Infinity));
  assert.same(false, signbit(13510798882111488));
  assert.same(true, signbit(-13510798882111488));
  assert.same(false, signbit(42.5));
  assert.same(true, signbit(-42.5));
});
