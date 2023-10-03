import Symbol from 'core-js-pure/full/symbol';

QUnit.test('Symbol.isWellKnown', assert => {
  const { isWellKnown } = Symbol;
  assert.isFunction(isWellKnown, 'Symbol.isWellKnown is function');
  assert.arity(isWellKnown, 1, 'Symbol.isWellKnown arity is 1');
  assert.name(isWellKnown, 'isWellKnownSymbol', 'Symbol.isWellKnown.name is "isWellKnownSymbol"');

  assert.true(isWellKnown(Symbol.iterator), 'registered-1');
  assert.true(isWellKnown(Object(Symbol.iterator)), 'registered-2, boxed');
  assert.true(isWellKnown(Symbol.matcher), 'registered-3');
  assert.true(isWellKnown(Object(Symbol.matcher)), 'registered-4, boxed');
  const symbol = Symbol('Symbol.isWellKnown test');
  assert.false(isWellKnown(symbol), 'non-registered');
  assert.false(isWellKnown(Object(symbol)), 'non-registered, boxed');
  assert.false(isWellKnown(1), '1');
  assert.false(isWellKnown(true), 'true');
  assert.false(isWellKnown('1'), 'string');
  assert.false(isWellKnown(null), 'null');
  assert.false(isWellKnown(), 'undefined');
  assert.false(isWellKnown({}), 'object');
  assert.false(isWellKnown([]), 'array');
});
