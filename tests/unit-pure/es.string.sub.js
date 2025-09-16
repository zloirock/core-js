import sub from '@core-js/pure/es/string/sub';

QUnit.test('String#sub', assert => {
  assert.isFunction(sub);
  assert.same(sub('a'), '<sub>a</sub>', 'lower case');

  /* eslint-disable es/no-symbol -- safe */
  if (typeof Symbol == 'function') {
    assert.throws(() => sub(Symbol('sub test')), 'throws on symbol context');
  }
});
