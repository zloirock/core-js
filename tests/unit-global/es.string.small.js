QUnit.test('String#small', assert => {
  const { small } = String.prototype;
  assert.isFunction(small);
  assert.arity(small, 0);
  assert.name(small, 'small');
  assert.looksNative(small);
  assert.nonEnumerable(String.prototype, 'small');
  assert.same('a'.small(), '<small>a</small>', 'lower case');

  if (typeof Symbol == 'function' && !Symbol.sham) {
    assert.throws(() => small.call(Symbol()), 'throws on symbol context');
  }
});
