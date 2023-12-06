QUnit.test('String#substr', assert => {
  const { substr } = String.prototype;
  assert.isFunction(substr);
  assert.arity(substr, 2);
  assert.name(substr, 'substr');
  assert.looksNative(substr);
  assert.nonEnumerable(String.prototype, 'substr');

  assert.same('12345'.substr(1, 3), '234');

  assert.same('ab'.substr(-1), 'b');

  if (typeof Symbol == 'function' && !Symbol.sham) {
    assert.throws(() => substr.call(Symbol('substr test'), 1, 3), 'throws on symbol context');
  }

  assert.throws(() => substr.call(null, 1, 3), TypeError, 'Throws on null as `this`');
  assert.throws(() => substr.call(undefined, 1, 3), TypeError, 'Throws on undefined as `this`');
});
