QUnit.test('String#anchor', assert => {
  const { anchor } = String.prototype;
  assert.isFunction(anchor);
  assert.arity(anchor, 1);
  assert.name(anchor, 'anchor');
  assert.looksNative(anchor);
  assert.nonEnumerable(String.prototype, 'anchor');
  assert.same('a'.anchor('b'), '<a name="b">a</a>', 'lower case');
  assert.same('a'.anchor('"'), '<a name="&quot;">a</a>', 'escape quotes');

  if (typeof Symbol == 'function' && !Symbol.sham) {
    assert.throws(() => anchor.call(Symbol(), 'b'), 'throws on symbol context');
    assert.throws(() => anchor.call('a', Symbol()), 'throws on symbol argument');
  }
});
