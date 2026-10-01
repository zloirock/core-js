import repeat from '@core-js/pure/es/string/repeat';

QUnit.test('String#repeat', assert => {
  assert.isFunction(repeat);
  assert.same(repeat('qwe', 3), 'qweqweqwe');
  assert.same(repeat('qwe', 2.5), 'qweqwe');
  assert.throws(() => repeat('qwe', -1), RangeError);
  assert.throws(() => repeat('qwe', Infinity), RangeError);

  /* eslint-disable es/no-symbol -- safe */
  if (typeof Symbol == 'function') {
    assert.throws(() => repeat(Symbol('repeat test')), 'throws on symbol context');
  }

  assert.throws(() => repeat(null, 1), TypeError);
  assert.throws(() => repeat(undefined, 1), TypeError);
});
