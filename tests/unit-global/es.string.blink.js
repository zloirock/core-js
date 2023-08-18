QUnit.test('String#blink', assert => {
  const { blink } = String.prototype;
  assert.isFunction(blink);
  assert.arity(blink, 0);
  assert.name(blink, 'blink');
  assert.looksNative(blink);
  assert.nonEnumerable(String.prototype, 'blink');
  assert.same('a'.blink(), '<blink>a</blink>', 'lower case');

  if (typeof Symbol == 'function' && !Symbol.sham) {
    assert.throws(() => blink.call(Symbol('blink test')), 'throws on symbol context');
  }
});
