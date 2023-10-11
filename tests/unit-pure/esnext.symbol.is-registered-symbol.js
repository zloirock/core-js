import Symbol from '@core-js/pure/full/symbol';

QUnit.test('Symbol.isRegisteredSymbol', assert => {
  const { isRegisteredSymbol } = Symbol;
  assert.isFunction(isRegisteredSymbol, 'Symbol.isRegisteredSymbol is function');
  assert.arity(isRegisteredSymbol, 1, 'Symbol.isRegisteredSymbol arity is 1');
  assert.name(isRegisteredSymbol, 'isRegisteredSymbol', 'Symbol.isRegisteredSymbol.name is "isRegisteredSymbol"');

  assert.true(isRegisteredSymbol(Symbol.for('foo')), 'registered');
  assert.true(isRegisteredSymbol(Object(Symbol.for('foo'))), 'registered, boxed');
  const symbol = Symbol('Symbol.isRegisteredSymbol test');
  assert.false(isRegisteredSymbol(symbol), 'non-registered');
  assert.false(isRegisteredSymbol(Object(symbol)), 'non-registered, boxed');
  assert.false(isRegisteredSymbol(1), '1');
  assert.false(isRegisteredSymbol(true), 'true');
  assert.false(isRegisteredSymbol('1'), 'string');
  assert.false(isRegisteredSymbol(null), 'null');
  assert.false(isRegisteredSymbol(), 'undefined');
  assert.false(isRegisteredSymbol({}), 'object');
  assert.false(isRegisteredSymbol([]), 'array');
});
