QUnit.test('String#fontcolor', assert => {
  const { fontcolor } = String.prototype;
  assert.isFunction(fontcolor);
  assert.arity(fontcolor, 1);
  assert.name(fontcolor, 'fontcolor');
  assert.looksNative(fontcolor);
  assert.nonEnumerable(String.prototype, 'fontcolor');
  assert.same('a'.fontcolor('b'), '<font color="b">a</font>', 'lower case');
  assert.same('a'.fontcolor('"'), '<font color="&quot;">a</font>', 'escape quotes');

  if (typeof Symbol == 'function' && !Symbol.sham) {
    const symbol = Symbol('fontcolor test');
    assert.throws(() => fontcolor.call(symbol, 'b'), 'throws on symbol context');
    assert.throws(() => fontcolor.call('a', symbol), 'throws on symbol argument');
  }
});
