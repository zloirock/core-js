QUnit.test('String#sub', assert => {
  const { sub } = String.prototype;
  assert.isFunction(sub);
  assert.arity(sub, 0);
  assert.name(sub, 'sub');
  assert.looksNative(sub);
  assert.nonEnumerable(String.prototype, 'sub');
  assert.same('a'.sub(), '<sub>a</sub>', 'lower case');

  if (typeof Symbol == 'function' && !Symbol.sham) {
    assert.throws(() => sub.call(Symbol()), 'throws on symbol context');
  }
});
