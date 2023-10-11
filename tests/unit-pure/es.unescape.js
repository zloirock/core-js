import unescape from '@core-js/pure/es/unescape';

QUnit.test('unescape', assert => {
  assert.isFunction(unescape);
  assert.arity(unescape, 1);
  assert.same(unescape('%21q2%u0444'), '!q2ф');
  assert.same(unescape('%u044q2%21'), '%u044q2!');
  assert.same(unescape(null), 'null');
  assert.same(unescape(undefined), 'undefined');

  /* eslint-disable es/no-symbol -- safe */
  if (typeof Symbol == 'function') {
    assert.throws(() => unescape(Symbol('unescape test')), 'throws on symbol argument');
  }
});
