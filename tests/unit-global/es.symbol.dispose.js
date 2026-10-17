QUnit.test('Symbol.dispose', assert => {
  assert.true('dispose' in Symbol, 'Symbol.dispose available');
  assert.true(Object(Symbol.dispose) instanceof Symbol, 'Symbol.dispose is symbol');
  // Node 20.4.0 add `Symbol.dispose`, but with incorrect descriptor
  // https://github.com/nodejs/node/issues/48699
  const descriptor = Object.getOwnPropertyDescriptor(Symbol, 'dispose');
  assert.false(descriptor.enumerable, 'non-enumerable');
  assert.false(descriptor.writable, 'non-writable');
  assert.false(descriptor.configurable, 'non-configurable');
});
