import Symbol from 'core-js-pure/full/symbol';

QUnit.test('Symbol.isRegistered', assert => {
  const { isRegistered } = Symbol;
  assert.isFunction(isRegistered, 'Symbol.isRegistered is function');
  assert.arity(isRegistered, 1, 'Symbol.isRegistered arity is 1');
  assert.name(isRegistered, 'isRegisteredSymbol', 'Symbol.isRegistered.name is "isRegisteredSymbol"');

  assert.true(isRegistered(Symbol.for('foo')), 'registered');
  assert.true(isRegistered(Object(Symbol.for('foo'))), 'registered, boxed');
  const symbol = Symbol('Symbol.isRegistered test');
  assert.false(isRegistered(symbol), 'non-registered');
  assert.false(isRegistered(Object(symbol)), 'non-registered, boxed');
  assert.false(isRegistered(1), '1');
  assert.false(isRegistered(true), 'true');
  assert.false(isRegistered('1'), 'string');
  assert.false(isRegistered(null), 'null');
  assert.false(isRegistered(), 'undefined');
  assert.false(isRegistered({}), 'object');
  assert.false(isRegistered([]), 'array');
});
