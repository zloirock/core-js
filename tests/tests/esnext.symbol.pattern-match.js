QUnit.test('Symbol.patternMatch', assert => {
  assert.ok('patternMatch' in Symbol, 'Symbol.patternMatch available');
  assert.nonEnumerable(Symbol, 'patternMatch');
  assert.ok(Object(Symbol.patternMatch) instanceof Symbol, 'Symbol.patternMatch is symbol');
  const descriptor = Object.getOwnPropertyDescriptor(Symbol, 'patternMatch');
  assert.ok(!descriptor.enumerble, 'non-enumerable');
  assert.ok(!descriptor.writable, 'non-writable');
  assert.ok(!descriptor.configurable, 'non-configurable');
});
