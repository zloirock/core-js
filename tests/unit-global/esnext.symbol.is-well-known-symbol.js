QUnit.test('Symbol.isWellKnownSymbol', assert => {
  const { isWellKnownSymbol } = Symbol;
  assert.isFunction(isWellKnownSymbol, 'Symbol.isWellKnownSymbol is function');
  assert.nonEnumerable(Symbol, 'isWellKnownSymbol');
  assert.arity(isWellKnownSymbol, 1, 'Symbol.isWellKnownSymbol arity is 1');
  assert.name(isWellKnownSymbol, 'isWellKnownSymbol', 'Symbol.isWellKnownSymbol.name is "isWellKnownSymbol"');
  assert.looksNative(isWellKnownSymbol, 'isWellKnownSymbol looks like native');

  assert.true(isWellKnownSymbol(Symbol.iterator), 'registered-1');
  assert.true(isWellKnownSymbol(Object(Symbol.iterator)), 'registered-2');
  assert.true(isWellKnownSymbol(Symbol.patternMatch), 'registered-3');
  assert.true(isWellKnownSymbol(Object(Symbol.patternMatch)), 'registered-4');
  assert.false(isWellKnownSymbol(Symbol()), 'non-registered');
  assert.false(isWellKnownSymbol(Object(Symbol())), 'non-registered');
  assert.false(isWellKnownSymbol(1), '1');
  assert.false(isWellKnownSymbol(true), 'true');
  assert.false(isWellKnownSymbol('1'), 'string');
  assert.false(isWellKnownSymbol(null), 'null');
  assert.false(isWellKnownSymbol(), 'undefined');
  assert.false(isWellKnownSymbol({}), 'object');
  assert.false(isWellKnownSymbol([]), 'array');
});
