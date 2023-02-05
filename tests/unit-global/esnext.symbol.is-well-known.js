QUnit.test('Symbol.isWellKnown', assert => {
  const { isWellKnown } = Symbol;
  assert.isFunction(isWellKnown, 'Symbol.isWellKnown is function');
  assert.nonEnumerable(Symbol, 'isWellKnown');
  assert.arity(isWellKnown, 1, 'Symbol.isWellKnown arity is 1');
  assert.name(isWellKnown, 'isWellKnown', 'Symbol.isWellKnown.name is "isWellKnown"');
  assert.looksNative(isWellKnown, 'isWellKnown looks like native');

  assert.true(isWellKnown(Symbol.iterator), 'registered-1');
  assert.true(isWellKnown(Object(Symbol.iterator)), 'registered-2');
  assert.true(isWellKnown(Symbol.patternMatch), 'registered-3');
  assert.true(isWellKnown(Object(Symbol.patternMatch)), 'registered-4');
  assert.false(isWellKnown(Symbol()), 'non-registered');
  assert.false(isWellKnown(Object(Symbol())), 'non-registered');
  assert.false(isWellKnown(1), '1');
  assert.false(isWellKnown(true), 'true');
  assert.false(isWellKnown('1'), 'string');
  assert.false(isWellKnown(null), 'null');
  assert.false(isWellKnown(), 'undefined');
  assert.false(isWellKnown({}), 'object');
  assert.false(isWellKnown([]), 'array');
});
