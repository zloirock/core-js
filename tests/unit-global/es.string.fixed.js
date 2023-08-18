QUnit.test('String#fixed', assert => {
  const { fixed } = String.prototype;
  assert.isFunction(fixed);
  assert.arity(fixed, 0);
  assert.name(fixed, 'fixed');
  assert.looksNative(fixed);
  assert.nonEnumerable(String.prototype, 'fixed');
  assert.same('a'.fixed(), '<tt>a</tt>', 'lower case');

  if (typeof Symbol == 'function' && !Symbol.sham) {
    assert.throws(() => fixed.call(Symbol('fixed test')), 'throws on symbol context');
  }
});
