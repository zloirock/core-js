QUnit.test('escape', assert => {
  assert.isFunction(escape);
  assert.name(escape, 'escape');
  assert.arity(escape, 1);
  assert.looksNative(escape);
  assert.same(escape('!q2ф'), '%21q2%u0444');
  assert.same(escape('\n'), '%0A', 'percent encoding uses uppercase hex digits');
  assert.same(escape('\u0001'), '%01', 'low code points use uppercase hex');
  assert.same(escape('\u00FF'), '%FF', 'code < 256 uses uppercase hex');
  assert.same(escape(null), 'null');
  assert.same(escape(undefined), 'undefined');

  if (typeof Symbol == 'function' && !Symbol.sham) {
    assert.throws(() => unescape(Symbol('escape test')), 'throws on symbol argument');
  }
});
