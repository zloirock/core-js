QUnit.test('Math.log1p', assert => {
  const { log1p } = Math;
  assert.isFunction(log1p);
  assert.name(log1p, 'log1p');
  assert.arity(log1p, 1);
  assert.looksNative(log1p);
  assert.nonEnumerable(Math, 'log1p');
  assert.same(log1p(''), log1p(0));
  assert.same(log1p(NaN), NaN);
  assert.same(log1p(-2), NaN);
  assert.same(log1p(-1), -Infinity);
  assert.same(log1p(0), 0);
  assert.same(log1p(-0), -0);
  assert.same(log1p(Infinity), Infinity);
  assert.epsilon(log1p(5), 1.791759469228055);
  assert.epsilon(log1p(50), 3.9318256327243257);
});
