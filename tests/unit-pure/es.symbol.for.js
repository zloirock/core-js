import Symbol from '@core-js/pure/es/symbol';

QUnit.test('Symbol.for', assert => {
  assert.isFunction(Symbol.for, 'Symbol.for is function');
  const symbol = Symbol.for('foo');
  assert.strictEqual(Symbol.for('foo'), symbol, 'registry');
  assert.true(Object(symbol) instanceof Symbol, 'returns symbol');
  assert.throws(() => Symbol.for(Symbol('foo')), 'throws on symbol argument');
});
