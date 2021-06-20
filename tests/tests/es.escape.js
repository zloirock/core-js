QUnit.test('escape', assert => {
  assert.isFunction(escape);
  assert.name(escape, 'escape');
  assert.arity(escape, 1);
  assert.looksNative(escape);
  assert.same(escape('!q2ф'), '%21q2%u0444');
  assert.same(escape(null), 'null');
  assert.same(escape(undefined), 'undefined');
});
