QUnit.test('Symbol.asyncDispose', assert => {
  assert.true('asyncDispose' in Symbol, 'Symbol.asyncDispose available');
  assert.true(Object(Symbol.asyncDispose) instanceof Symbol, 'Symbol.asyncDispose is symbol');
  // Node 20.4.0 add `Symbol.asyncDispose`, but with incorrect descriptor
  // https://github.com/nodejs/node/issues/48699
  const descriptor = Object.getOwnPropertyDescriptor(Symbol, 'asyncDispose');
  assert.false(descriptor.enumerable, 'non-enumerable');
  assert.false(descriptor.writable, 'non-writable');
  assert.false(descriptor.configurable, 'non-configurable');
});
