import Symbol from 'core-js-pure/full/symbol';

QUnit.test('Symbol.isWellKnown', assert => {
  const { isWellKnown } = Symbol;
  assert.isFunction(isWellKnown, 'Symbol.isWellKnown is function');
  assert.arity(isWellKnown, 1, 'Symbol.isWellKnown arity is 1');
  assert.name(isWellKnown, 'isWellKnownSymbol', 'Symbol.isWellKnown.name is "isWellKnownSymbol"');

  assert.true(isWellKnown(Symbol.iterator), 'well-known-1');
  assert.true(isWellKnown(Object(Symbol.iterator)), 'well-known-2, boxed');
  assert.true(isWellKnown(Symbol.matcher), 'well-known-3');
  assert.true(isWellKnown(Object(Symbol.matcher)), 'well-known-4, boxed');
  const symbol = Symbol('Symbol.isWellKnown test');
  assert.false(isWellKnown(symbol), 'non-well-known');
  assert.false(isWellKnown(Object(symbol)), 'non-well-known, boxed');
  assert.false(isWellKnown(1), '1');
  assert.false(isWellKnown(true), 'true');
  assert.false(isWellKnown('1'), 'string');
  assert.false(isWellKnown(null), 'null');
  assert.false(isWellKnown(), 'undefined');
  assert.false(isWellKnown({}), 'object');
  assert.false(isWellKnown([]), 'array');
});
