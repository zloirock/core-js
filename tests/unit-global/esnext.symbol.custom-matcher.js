QUnit.test('Symbol.customMatcher', assert => {
  assert.true('customMatcher' in Symbol, 'Symbol.customMatcher available');
  assert.nonEnumerable(Symbol, 'customMatcher');
  assert.true(Object(Symbol.customMatcher) instanceof Symbol, 'Symbol.customMatcher is symbol');
  const descriptor = Object.getOwnPropertyDescriptor(Symbol, 'customMatcher');
  assert.false(descriptor.enumerable, 'non-enumerable');
  assert.false(descriptor.writable, 'non-writable');
  assert.false(descriptor.configurable, 'non-configurable');
});
