import fontcolor from 'core-js-pure/full/string/fontcolor';

QUnit.test('String#fontcolor', assert => {
  assert.isFunction(fontcolor);
  assert.same(fontcolor('a', 'b'), '<font color="b">a</font>', 'lower case');
  assert.same(fontcolor('a', '"'), '<font color="&quot;">a</font>', 'escape quotes');

  /* eslint-disable es/no-symbol -- safe */
  if (typeof Symbol === 'function') {
    assert.throws(() => fontcolor(Symbol(), 'b'), 'throws on symbol context');
    assert.throws(() => fontcolor('a', Symbol()), 'throws on symbol argument');
  }
});
