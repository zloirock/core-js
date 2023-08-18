QUnit.test('String#bold', assert => {
  const { bold } = String.prototype;
  assert.isFunction(bold);
  assert.arity(bold, 0);
  assert.name(bold, 'bold');
  assert.looksNative(bold);
  assert.nonEnumerable(String.prototype, 'bold');
  assert.same('a'.bold(), '<b>a</b>', 'lower case');

  if (typeof Symbol == 'function' && !Symbol.sham) {
    assert.throws(() => bold.call(Symbol('bold test')), 'throws on symbol context');
  }
});
