import escape from '@core-js/pure/es/escape';

QUnit.test('escape', assert => {
  assert.isFunction(escape);
  assert.arity(escape, 1);
  assert.same(escape('!q2ф'), '%21q2%u0444');
  assert.same(escape(null), 'null');
  assert.same(escape(undefined), 'undefined');

  /* eslint-disable es/no-symbol -- safe */
  if (typeof Symbol == 'function') {
    assert.throws(() => escape(Symbol('escape test')), 'throws on symbol argument');
  }
});
