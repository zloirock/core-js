QUnit.test('Symbol.isWellKnownSymbol', assert => {
  const { isWellKnownSymbol } = Symbol;
  assert.isFunction(isWellKnownSymbol, 'Symbol.isWellKnownSymbol is function');
  assert.nonEnumerable(Symbol, 'isWellKnownSymbol');
  assert.arity(isWellKnownSymbol, 1, 'Symbol.isWellKnownSymbol arity is 1');
  assert.name(isWellKnownSymbol, 'isWellKnownSymbol', 'Symbol.isWellKnownSymbol.name is "isWellKnownSymbol"');
  assert.looksNative(isWellKnownSymbol, 'isWellKnownSymbol looks like native');

  assert.true(isWellKnownSymbol(Symbol.iterator), 'well-known-1');
  assert.true(isWellKnownSymbol(Object(Symbol.iterator)), 'well-known-2, boxed');
  assert.true(isWellKnownSymbol(Symbol.customMatcher), 'well-known-3');
  assert.true(isWellKnownSymbol(Object(Symbol.customMatcher)), 'well-known-4, boxed');
  const symbol = Symbol('Symbol.isWellKnownSymbol test');
  assert.false(isWellKnownSymbol(symbol), 'non-well-known');
  assert.false(isWellKnownSymbol(Object(symbol)), 'non-well-known, boxed');
  assert.false(isWellKnownSymbol(1), '1');
  assert.false(isWellKnownSymbol(true), 'true');
  assert.false(isWellKnownSymbol('1'), 'string');
  assert.false(isWellKnownSymbol(null), 'null');
  assert.false(isWellKnownSymbol(), 'undefined');
  assert.false(isWellKnownSymbol({}), 'object');
  assert.false(isWellKnownSymbol([]), 'array');
});
