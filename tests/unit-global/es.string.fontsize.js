QUnit.test('String#fontsize', assert => {
  const { fontsize } = String.prototype;
  assert.isFunction(fontsize);
  assert.arity(fontsize, 1);
  assert.name(fontsize, 'fontsize');
  assert.looksNative(fontsize);
  assert.nonEnumerable(String.prototype, 'fontsize');
  assert.same('a'.fontsize('b'), '<font size="b">a</font>', 'lower case');
  assert.same('a'.fontsize('"'), '<font size="&quot;">a</font>', 'escape quotes');

  if (typeof Symbol == 'function' && !Symbol.sham) {
    assert.throws(() => fontsize.call(Symbol(), 'b'), 'throws on symbol context');
    assert.throws(() => fontsize.call('a', Symbol()), 'throws on symbol argument');
  }
});
